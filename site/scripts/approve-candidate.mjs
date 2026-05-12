import fs from "node:fs/promises";

const root = new URL("..", import.meta.url);
const candidateId = process.argv[2];

if (!candidateId) {
  console.error("Usage: npm run approve:candidate -- <candidate-id>");
  process.exit(1);
}

const file = new URL(`src/content/candidates/${candidateId}.json`, root);
const candidate = JSON.parse(await fs.readFile(file, "utf8"));
const today = new Date().toISOString().slice(0, 10);

candidate.status = "approved";
candidate.reviewedAt = today;
candidate.reviewedBy = candidate.reviewedBy || "local-review";

await fs.writeFile(file, `${JSON.stringify(candidate, null, 2)}\n`);
console.log(`Approved candidate: src/content/candidates/${candidateId}.json`);
