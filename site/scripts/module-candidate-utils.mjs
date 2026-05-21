import fs from "node:fs/promises";
import path from "node:path";

import { atomicWriteJsonFile } from "./json-file-utils.mjs";

export const todayString = () => new Date().toISOString().slice(0, 10);

export const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const readJson = async (filePath) => JSON.parse(await fs.readFile(filePath, "utf8"));

export const writeCandidate = async (candidate) => {
  const filePath = path.join(process.cwd(), "src/content/candidates", `${candidate.id}.json`);
  await atomicWriteJsonFile(filePath, candidate);
  return filePath;
};

export const moduleReviewScore = ({ sourceTrust = 4, usefulness = 4, agentRelevance = 4, verifiability = 4, freshness = 4, editorialValue = 4, permission = 4 } = {}) => ({
  sourceTrust,
  usefulness,
  agentRelevance,
  verifiability,
  freshness,
  editorialValue,
  permission,
});

export const buildModuleCandidate = ({
  module,
  source,
  sourceId,
  title,
  sourceUrl,
  sourceName,
  summary,
  proposedCategory = [],
  proposedAgents = [],
  discoveredFrom = "directory",
  reviewScore,
  reviewNotes,
  extra = {},
}) => {
  const checkedDate = todayString();
  const stableSlug = slugify(sourceId || title);
  const isPublishedLocalContent = source?.type === "local_content";
  return {
    id: `candidate-${module}-${stableSlug}`,
    type: module,
    status: isPublishedLocalContent ? "published" : "candidate",
    title,
    sourceUrl,
    sourceName,
    ...(source ? { sourceRegistryId: source.id } : {}),
    ...(source ? { sourceRegistry: source } : {}),
    discoveredAt: checkedDate,
    lastChecked: checkedDate,
    discoveredFrom,
    summary,
    proposedCategory,
    proposedAgents,
    extractedSignals: [],
    reviewScore: moduleReviewScore(reviewScore),
    reviewNotes,
    ...(isPublishedLocalContent ? { publishedAs: stableSlug, publishedAt: checkedDate } : {}),
    ...extra,
  };
};

export const parseFrontmatter = (content) => {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};

  const lines = match[1].split("\n");
  const data = {};
  let currentKey = null;

  for (const line of lines) {
    const listMatch = line.match(/^\s+-\s+"?([^"]+?)"?\s*$/);
    if (listMatch && currentKey) {
      data[currentKey] = [...(Array.isArray(data[currentKey]) ? data[currentKey] : []), listMatch[1]];
      continue;
    }

    const keyMatch = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!keyMatch) continue;

    currentKey = keyMatch[1];
    const rawValue = keyMatch[2].trim();
    if (!rawValue) {
      data[currentKey] = [];
    } else if (rawValue.startsWith("[") && rawValue.endsWith("]")) {
      data[currentKey] = rawValue
        .slice(1, -1)
        .split(",")
        .map((item) => item.trim().replace(/^"|"$/g, ""))
        .filter(Boolean);
    } else {
      data[currentKey] = rawValue.replace(/^"|"$/g, "");
    }
  }

  return data;
};
