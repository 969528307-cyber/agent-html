import { resolveCandidateRecord } from "./dedupe-utils.mjs";
import { atomicWriteJsonFile } from "./json-file-utils.mjs";

const candidateId = process.argv[2];

if (!candidateId) {
  console.error("Usage: npm run approve:candidate -- <candidate-id>");
  process.exit(1);
}

const record = await resolveCandidateRecord(candidateId);
const candidate = record.data;
const today = new Date().toISOString().slice(0, 10);

candidate.status = "approved";
candidate.reviewedAt = today;
candidate.reviewedBy = candidate.reviewedBy || "local-review";

await atomicWriteJsonFile(record.path, candidate);
console.log(`Approved candidate: src/content/candidates/${candidate.id}.json`);
if (record.resolvedFromLegacyId) {
  console.log(`Resolved legacy candidate id ${candidateId} to ${candidate.id}.`);
}
