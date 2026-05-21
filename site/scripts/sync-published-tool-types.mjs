import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { publicToolTypeForCandidate } from "./publish-candidate.mjs";
import { atomicWriteJsonFile } from "./json-file-utils.mjs";

const toolsDir = path.join(process.cwd(), "src/content/tools");
const candidatesDir = path.join(process.cwd(), "src/content/candidates");

const readJson = async (filePath) => JSON.parse(await fs.readFile(filePath, "utf8"));

const loadJsonFiles = async (dir) => {
  const files = (await fs.readdir(dir)).filter((file) => file.endsWith(".json")).sort();
  return Promise.all(files.map(async (file) => ({ file, path: path.join(dir, file), data: await readJson(path.join(dir, file)) })));
};

const candidateMatchesTool = (candidate, tool) =>
  candidate.type === "tool" &&
  (candidate.publishedAs === tool.id ||
    candidate.sourceUrl === tool.sourceUrl ||
    candidate.sourceUrl === tool.repoUrl ||
    candidate.githubMetadata?.fullName?.toLowerCase() === tool.repoUrl?.replace(/^https:\/\/github\.com\//, "").toLowerCase());

export const syncPublishedToolTypes = async ({ dryRun = false } = {}) => {
  const [tools, candidates] = await Promise.all([loadJsonFiles(toolsDir), loadJsonFiles(candidatesDir)]);
  const summary = { scanned: tools.length, updated: [], unchanged: 0, missingCandidate: [] };

  for (const toolRecord of tools) {
    const tool = toolRecord.data;
    const candidate = candidates.find((record) => candidateMatchesTool(record.data, tool))?.data;
    if (!candidate) {
      summary.missingCandidate.push(tool.id);
      continue;
    }

    const nextType = publicToolTypeForCandidate(candidate);
    if (tool.type === nextType) {
      summary.unchanged += 1;
      continue;
    }

    summary.updated.push({ id: tool.id, from: tool.type, to: nextType, candidateId: candidate.id });
    if (!dryRun) {
      await atomicWriteJsonFile(toolRecord.path, { ...tool, type: nextType });
    }
  }

  return summary;
};

const runCli = async () => {
  const dryRun = process.argv.includes("--dry-run");
  const summary = await syncPublishedToolTypes({ dryRun });
  console.log(JSON.stringify(summary, null, 2));
  console.log(`${dryRun ? "Previewed" : "Updated"} ${summary.updated.length} published tool type corrections.`);
};

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCli().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
