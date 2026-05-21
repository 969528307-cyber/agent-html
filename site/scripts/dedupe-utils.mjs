import fs from "node:fs/promises";
import path from "node:path";

import { atomicWriteJsonFile } from "./json-file-utils.mjs";
import { parseFrontmatter } from "./module-candidate-utils.mjs";

const candidatesDir = () => path.join(process.cwd(), "src/content/candidates");
const contentDir = () => path.join(process.cwd(), "src/content");

const statusRank = {
  archived: 7,
  rejected: 6,
  published: 5,
  approved: 4,
  candidate: 3,
};

const agentAliases = new Map([
  ["kimi-cli-kimi-agent", "kimi-agent"],
  ["kimi-cli", "kimi-agent"],
]);

export const slugifyDedupePart = (value = "") =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const normalizeCandidateTitle = (value = "") =>
  value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((word) => !["a", "an", "the"].includes(word))
    .join(" ");

export const normalizeSourceUrl = (value = "") =>
  value
    .trim()
    .replace(/\.git$/i, "")
    .replace(/\/+$/g, "")
    .toLowerCase();

const githubRepoFromUrl = (value = "") => {
  try {
    const url = new URL(value);
    if (url.hostname !== "github.com") return null;
    const [owner, repo] = url.pathname.split("/").filter(Boolean);
    if (!owner || !repo) return null;
    return `${owner.toLowerCase()}/${repo.replace(/\.git$/i, "").toLowerCase()}`;
  } catch {
    return null;
  }
};

const githubRepoForCandidate = (candidate) => {
  const fullName = candidate.githubMetadata?.fullName;
  if (fullName) return fullName.toLowerCase();

  const owner = candidate.githubMetadata?.owner;
  const repo = candidate.githubMetadata?.repo;
  if (owner && repo) return `${owner}/${repo}`.toLowerCase();

  return githubRepoFromUrl(candidate.sourceUrl);
};

const canonicalAgentId = (candidate) => {
  const raw =
    candidate.proposedAgents?.[0] ||
    candidate.publishedAs ||
    candidate.id?.replace(/^candidate-agent-/, "") ||
    slugifyDedupePart(candidate.title || "");
  return agentAliases.get(raw) || raw;
};

export const canonicalKeyForCandidate = (candidate) => {
  if (!candidate?.type) throw new Error("Cannot dedupe candidate without type.");

  if (candidate.type === "tool") {
    const repo = githubRepoForCandidate(candidate);
    if (repo) return `tool:github:${repo}`;
    if (candidate.sourceUrl) return `tool:url:${normalizeSourceUrl(candidate.sourceUrl)}`;
    return `tool:title:${normalizeCandidateTitle(candidate.title)}`;
  }

  if (candidate.type === "agent") {
    return `agent:${canonicalAgentId(candidate)}`;
  }

  if (candidate.type === "learn") {
    return `learn:title:${normalizeCandidateTitle(candidate.title)}`;
  }

  if (candidate.type === "signal") {
    const title = normalizeCandidateTitle(candidate.title || candidate.englishTitle || "");
    if (candidate.sourceUrl) return `signal:url:${normalizeSourceUrl(candidate.sourceUrl)}:title:${title}`;
    return `signal:title:${title}`;
  }

  if (candidate.sourceUrl) return `${candidate.type}:url:${normalizeSourceUrl(candidate.sourceUrl)}`;
  return `${candidate.type}:title:${normalizeCandidateTitle(candidate.title)}`;
};

export const stableCandidateIdForCandidate = (candidate, canonicalKey = canonicalKeyForCandidate(candidate)) => {
  if (candidate.type === "tool") {
    const repo = githubRepoForCandidate(candidate) || canonicalKey.replace(/^tool:github:/, "");
    return `candidate-tool-github-${slugifyDedupePart(repo)}`;
  }

  if (candidate.type === "agent") {
    return `candidate-agent-${slugifyDedupePart(canonicalAgentId(candidate))}`;
  }

  if (candidate.type === "learn") {
    return `candidate-learn-title-${slugifyDedupePart(normalizeCandidateTitle(candidate.title))}`;
  }

  if (candidate.type === "signal") {
    return `candidate-signal-${slugifyDedupePart(normalizeCandidateTitle(candidate.title || candidate.englishTitle))}`;
  }

  return `candidate-${slugifyDedupePart(canonicalKey)}`;
};

const compareDate = (left, right, pick) => {
  const values = [left, right].filter(Boolean).sort();
  if (values.length === 0) return undefined;
  return pick === "latest" ? values.at(-1) : values[0];
};

const uniqueArray = (values = []) => [...new Set(values.filter((value) => value !== undefined && value !== null && value !== ""))];

const mergeArrayField = (left = [], right = []) => uniqueArray([...(Array.isArray(left) ? left : []), ...(Array.isArray(right) ? right : [])]);

const preferredStatus = (existingStatus, incomingStatus) => {
  const existingRank = statusRank[existingStatus] ?? 0;
  const incomingRank = statusRank[incomingStatus] ?? 0;
  return existingRank >= incomingRank ? existingStatus : incomingStatus;
};

const mergeCrawlRuns = (existing = [], incoming = []) => {
  const byRun = new Map();
  for (const run of [...(existing || []), ...(incoming || [])]) {
    if (!run) continue;
    const key = run.runId || `${run.module || "unknown"}:${run.seenAt || run.discoveredAt || "unknown"}`;
    byRun.set(key, { ...(byRun.get(key) || {}), ...run });
  }
  return [...byRun.values()].sort((a, b) => String(a.seenAt || "").localeCompare(String(b.seenAt || "")));
};

export const crawlRunForCandidate = (candidate, { runId, module, seenAt } = {}) => {
  const date = seenAt || candidate.lastChecked || candidate.discoveredAt || new Date().toISOString().slice(0, 10);
  return {
    runId: runId || `${date}-${module || candidate.type || "candidate"}`,
    module: module || candidate.type,
    sourceRegistryId: candidate.sourceRegistryId,
    seenAt: date,
  };
};

const legacySlugCandidatesForId = (candidateId = "") => {
  const withoutPrefix = candidateId.replace(/^candidate-/, "");
  const withoutDate = withoutPrefix.replace(/-\d{4}-\d{2}(?:-\d{2})?$/, "");
  const withoutModulePrefix = withoutDate.replace(/^(tool|agent|learn|signal)-/, "");
  return uniqueArray([withoutPrefix, withoutDate, withoutModulePrefix]);
};

const candidateComparableSlugs = (candidate) => {
  const githubRepo = githubRepoForCandidate(candidate)?.split("/").at(-1);
  return uniqueArray([
    candidate.id?.replace(/^candidate-/, ""),
    candidate.id?.replace(/^candidate-(tool-github|agent|learn-title|learn|signal)-/, ""),
    slugifyDedupePart(candidate.title || ""),
    slugifyDedupePart(normalizeCandidateTitle(candidate.title || "")),
    candidate.publishedAs,
    candidate.githubMetadata?.repo,
    githubRepo,
  ].map((value) => (value ? slugifyDedupePart(value) : "")));
};

export const candidateMatchesLegacyId = (candidate, candidateId) => {
  if (!candidate || !candidateId) return false;
  if (candidate.id === candidateId) return true;

  const legacySlugs = legacySlugCandidatesForId(candidateId).map(slugifyDedupePart);
  const comparableSlugs = candidateComparableSlugs(candidate);
  return legacySlugs.some((legacySlug) => comparableSlugs.includes(legacySlug));
};

export const mergeCandidateRecords = (existing, incoming, { canonicalKey } = {}) => {
  const key = canonicalKey || existing.canonicalKey || incoming.canonicalKey || canonicalKeyForCandidate(incoming);
  const firstDiscoveredAt = compareDate(
    existing.firstDiscoveredAt || existing.discoveredAt,
    incoming.firstDiscoveredAt || incoming.discoveredAt,
    "earliest",
  );
  const lastSeenAt = compareDate(existing.lastSeenAt || existing.lastChecked, incoming.lastSeenAt || incoming.lastChecked, "latest");
  const status = preferredStatus(existing.status, incoming.status);

  return {
    ...incoming,
    ...existing,
    canonicalKey: key,
    status,
    discoveredAt: firstDiscoveredAt || existing.discoveredAt || incoming.discoveredAt,
    firstDiscoveredAt,
    lastSeenAt,
    lastChecked: compareDate(existing.lastChecked, incoming.lastChecked, "latest") || lastSeenAt,
    proposedCategory: mergeArrayField(existing.proposedCategory, incoming.proposedCategory),
    proposedAgents: mergeArrayField(existing.proposedAgents, incoming.proposedAgents),
    extractedSignals: mergeArrayField(existing.extractedSignals, incoming.extractedSignals),
    detectedFiles: mergeArrayField(existing.detectedFiles, incoming.detectedFiles),
    crawlRuns: mergeCrawlRuns(existing.crawlRuns, incoming.crawlRuns),
    duplicateOf: null,
    duplicateReason: null,
  };
};

const readJson = async (filePath) => JSON.parse(await fs.readFile(filePath, "utf8"));

export const loadCandidateRecords = async (dir = candidatesDir()) => {
  const files = (await fs.readdir(dir)).filter((file) => file.endsWith(".json")).sort();
  const records = [];
  for (const file of files) {
    records.push({ file, path: path.join(dir, file), data: await readJson(path.join(dir, file)) });
  }
  return records;
};

export const resolveCandidateRecord = async (candidateId, dir = candidatesDir()) => {
  const exactPath = path.join(dir, `${candidateId}.json`);
  try {
    return {
      file: `${candidateId}.json`,
      path: exactPath,
      data: await readJson(exactPath),
      requestedId: candidateId,
      resolvedFromLegacyId: false,
    };
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }

  const records = await loadCandidateRecords(dir);
  const match = records.find((record) => candidateMatchesLegacyId(record.data, candidateId));
  if (!match) {
    throw new Error(`Candidate "${candidateId}" was not found. It may have been removed by dedupe migration.`);
  }

  return {
    ...match,
    requestedId: candidateId,
    resolvedFromLegacyId: true,
  };
};

const loadJsonContentIndex = async (collection, type) => {
  const dir = path.join(contentDir(), collection);
  const files = (await fs.readdir(dir).catch(() => [])).filter((file) => file.endsWith(".json"));
  const records = [];
  for (const file of files) {
    const data = await readJson(path.join(dir, file));
    records.push({
      id: data.id || file.replace(/\.json$/, ""),
      type,
      sourceUrl: data.sourceUrl || data.documentationUrl,
      title: data.name || data.title,
    });
  }
  return records;
};

const loadMdxContentIndex = async (collection, type) => {
  const dir = path.join(contentDir(), collection);
  const files = (await fs.readdir(dir).catch(() => [])).filter((file) => /\.mdx?$/.test(file));
  const records = [];
  for (const file of files) {
    const frontmatter = parseFrontmatter(await fs.readFile(path.join(dir, file), "utf8"));
    records.push({
      id: file.replace(/\.mdx?$/, ""),
      type,
      sourceUrl: frontmatter.sourceUrl,
      title: frontmatter.title || frontmatter.englishTitle || frontmatter.originalTitle || file.replace(/\.mdx?$/, ""),
    });
  }
  return records;
};

export const loadPublishedCanonicalIndex = async () => {
  const entries = [
    ...(await loadJsonContentIndex("tools", "tool")),
    ...(await loadJsonContentIndex("agents", "agent")),
    ...(await loadMdxContentIndex("learn", "learn")),
    ...(await loadMdxContentIndex("signals", "signal")),
  ];
  const index = new Map();
  for (const entry of entries) {
    index.set(canonicalKeyForCandidate(entry), entry);
  }
  return index;
};

export const upsertCandidate = async (candidate, { runId, module, dir = candidatesDir() } = {}) => {
  const canonicalKey = candidate.canonicalKey || canonicalKeyForCandidate(candidate);
  const incoming = {
    ...candidate,
    id: candidate.id || stableCandidateIdForCandidate(candidate, canonicalKey),
    canonicalKey,
    firstDiscoveredAt: candidate.firstDiscoveredAt || candidate.discoveredAt,
    lastSeenAt: candidate.lastSeenAt || candidate.lastChecked || candidate.discoveredAt,
    crawlRuns: mergeCrawlRuns(candidate.crawlRuns, [crawlRunForCandidate(candidate, { runId, module })]),
  };

  const records = await loadCandidateRecords(dir);
  const existing = records.find((record) => {
    try {
      return (record.data.canonicalKey || canonicalKeyForCandidate(record.data)) === canonicalKey;
    } catch {
      return false;
    }
  });

  const publishedIndex = await loadPublishedCanonicalIndex();
  const publishedEntry = publishedIndex.get(canonicalKey);

  if (existing) {
    const merged = mergeCandidateRecords(existing.data, incoming, { canonicalKey });
    await atomicWriteJsonFile(existing.path, merged);
    return { action: "updated", filePath: existing.path, candidate: merged };
  }

  const candidateId = stableCandidateIdForCandidate(incoming, canonicalKey);
  const nextCandidate = {
    ...incoming,
    id: candidateId,
    ...(publishedEntry
      ? {
          status: "published",
          publishedAs: publishedEntry.id,
          publishedAt: incoming.publishedAt || incoming.lastChecked || incoming.discoveredAt,
          duplicateReason: "source already published",
        }
      : {}),
  };
  const filePath = path.join(dir, `${candidateId}.json`);
  await atomicWriteJsonFile(filePath, nextCandidate);
  return { action: publishedEntry ? "marked_published" : "created", filePath, candidate: nextCandidate };
};
