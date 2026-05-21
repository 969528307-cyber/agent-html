import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { enrichCandidate } from "./enrich-candidate.mjs";
import { atomicWriteJsonFile } from "./json-file-utils.mjs";

const candidatesDir = path.join(process.cwd(), "src/content/candidates");

const increment = (map, key) => {
  map.set(key, (map.get(key) || 0) + 1);
};

export const enrichCandidates = async ({ onlyReviewRequired = false } = {}) => {
  const files = (await fs.readdir(candidatesDir)).filter((file) => file.endsWith(".json")).sort();
  const byDecision = new Map();
  let updated = 0;

  for (const file of files) {
    const filePath = path.join(candidatesDir, file);
    const candidate = JSON.parse(await fs.readFile(filePath, "utf8"));
    if (onlyReviewRequired && candidate.routingDecision !== "review_required") continue;

    const enrichment = enrichCandidate(candidate);
    const nextCandidate = { ...candidate, ...enrichment };
    await atomicWriteJsonFile(filePath, nextCandidate);
    updated += 1;
    increment(byDecision, enrichment.enrichmentDecision);
  }

  return {
    updated,
    byDecision: Object.fromEntries([...byDecision.entries()].sort()),
  };
};

const runCli = async () => {
  const result = await enrichCandidates({ onlyReviewRequired: process.argv.includes("--review-required-only") });
  console.log(`Enriched ${result.updated} candidates.`);
  console.log(`Decision: ${JSON.stringify(result.byDecision)}`);
};

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCli().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
