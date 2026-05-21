import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { buildToolProfile } from "./tool-profile.mjs";
import { enrichCandidate } from "./enrich-candidate.mjs";
import { atomicWriteJsonFile } from "./json-file-utils.mjs";
import { loadSourcesByType, sourceRegistryRef } from "./source-registry.mjs";

const candidatesDir = path.join(process.cwd(), "src/content/candidates");

const readCandidateFiles = async () => {
  const files = await fs.readdir(candidatesDir);
  return files.filter((file) => file.endsWith(".json")).sort();
};

const increment = (map, key) => {
  map.set(key, (map.get(key) || 0) + 1);
};

export const classifyCandidates = async () => {
  const files = await readCandidateFiles();
  const [source] = await loadSourcesByType("tools", "github_search");
  const sourceRef = source ? sourceRegistryRef(source) : undefined;
  const byCapability = new Map();
  const byRoute = new Map();
  let updated = 0;

  for (const file of files) {
    const filePath = path.join(candidatesDir, file);
    const candidate = JSON.parse(await fs.readFile(filePath, "utf8"));

    if (candidate.type !== "tool") continue;

    const classification = buildToolProfile(candidate);

    const classifiedCandidate = {
      ...candidate,
      ...(sourceRef ? { sourceRegistryId: sourceRef.id, sourceRegistry: sourceRef } : {}),
      ...classification,
    };
    const nextCandidate = { ...classifiedCandidate, ...enrichCandidate(classifiedCandidate) };
    await atomicWriteJsonFile(filePath, nextCandidate);

    updated += 1;
    increment(byCapability, classification.capabilityType);
    increment(byRoute, classification.routingDecision);
  }

  return {
    updated,
    byCapability: Object.fromEntries([...byCapability.entries()].sort()),
    byRoute: Object.fromEntries([...byRoute.entries()].sort()),
  };
};

const runCli = async () => {
  const result = await classifyCandidates();
  console.log(`Classified ${result.updated} tool candidates (topic-driven).`);
  console.log(`Capability: ${JSON.stringify(result.byCapability)}`);
  console.log(`Routing: ${JSON.stringify(result.byRoute)}`);
};

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCli().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
