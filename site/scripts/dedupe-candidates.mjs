import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import {
  canonicalKeyForCandidate,
  loadCandidateRecords,
  mergeCandidateRecords,
  stableCandidateIdForCandidate,
} from "./dedupe-utils.mjs";
import { atomicWriteJsonFile } from "./json-file-utils.mjs";

const candidatesDir = path.join(process.cwd(), "src/content/candidates");

const statusRank = {
  archived: 7,
  rejected: 6,
  published: 5,
  approved: 4,
  candidate: 3,
};

const evidenceCount = (candidate) =>
  [
    ...(candidate.extractedSignals || []),
    ...(candidate.detectedFiles || []),
    ...(candidate.skillExtracts || []),
    ...(candidate.extractedInstall || []),
  ].length;

const dateValue = (candidate) => candidate.firstDiscoveredAt || candidate.discoveredAt || candidate.lastChecked || "";

const choosePrimaryRecord = (records) =>
  [...records].sort((left, right) => {
    const statusDelta = (statusRank[right.data.status] ?? 0) - (statusRank[left.data.status] ?? 0);
    if (statusDelta !== 0) return statusDelta;

    const evidenceDelta = evidenceCount(right.data) - evidenceCount(left.data);
    if (evidenceDelta !== 0) return evidenceDelta;

    return String(dateValue(left.data)).localeCompare(String(dateValue(right.data)));
  })[0];

const groupRecords = (records) => {
  const groups = new Map();
  for (const record of records) {
    const key = record.data.canonicalKey || canonicalKeyForCandidate(record.data);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(record);
  }
  return groups;
};

export const dedupeCandidates = async ({ dryRun = false } = {}) => {
  const records = await loadCandidateRecords(candidatesDir);
  const groups = groupRecords(records);
  const summary = { scanned: records.length, groups: groups.size, merged: [], unchanged: 0 };

  for (const [canonicalKey, group] of groups) {
    if (group.length <= 1) {
      summary.unchanged += 1;
      continue;
    }

    const primary = choosePrimaryRecord(group);
    const duplicateRecords = group.filter((record) => record !== primary);
    const merged = duplicateRecords.reduce(
      (current, record) => mergeCandidateRecords(current, record.data, { canonicalKey }),
      { ...primary.data, canonicalKey },
    );
    const stableId = stableCandidateIdForCandidate(merged, canonicalKey);
    const mergedCandidate = {
      ...merged,
      id: stableId,
      canonicalKey,
      duplicateOf: null,
      duplicateReason: null,
    };
    const targetPath = path.join(candidatesDir, `${stableId}.json`);
    const obsoletePaths = group.map((record) => record.path).filter((filePath) => filePath !== targetPath);

    summary.merged.push({
      canonicalKey,
      target: path.basename(targetPath),
      sources: group.map((record) => record.file),
      removed: obsoletePaths.map((filePath) => path.basename(filePath)),
    });

    if (dryRun) continue;

    await atomicWriteJsonFile(targetPath, mergedCandidate);
    for (const filePath of obsoletePaths) {
      await fs.unlink(filePath).catch((error) => {
        if (error.code !== "ENOENT") throw error;
      });
    }
  }

  return summary;
};

const runCli = async () => {
  const dryRun = process.argv.includes("--dry-run");
  const summary = await dedupeCandidates({ dryRun });
  console.log(JSON.stringify(summary, null, 2));
  console.log(
    `${dryRun ? "Previewed" : "Merged"} ${summary.merged.length} duplicate groups across ${summary.scanned} candidate files.`
  );
};

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCli().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
