import fs from "node:fs/promises";

const root = new URL("..", import.meta.url);
const candidateId = process.argv[2];

if (!candidateId) {
  console.error("Usage: npm run publish:candidate -- <candidate-id>");
  process.exit(1);
}

const readJson = async (relativePath) => {
  const file = new URL(relativePath, root);
  return JSON.parse(await fs.readFile(file, "utf8"));
};

const writeJson = async (relativePath, data) => {
  const file = new URL(relativePath, root);
  await fs.mkdir(new URL(".", file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(data, null, 2)}\n`);
};

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const candidate = await readJson(`src/content/candidates/${candidateId}.json`);

if (!["approved", "reviewing"].includes(candidate.status)) {
  console.error(`Candidate "${candidateId}" is ${candidate.status}; approve it before publishing.`);
  process.exit(1);
}

const publishedId = candidate.publishedAs || slugify(candidate.title);
const today = new Date().toISOString().slice(0, 10);

if (candidate.type === "tool") {
  const tool = {
    id: publishedId,
    name: candidate.title,
    type: candidate.proposedToolType || "workflow",
    status: "published",
    summary: candidate.summary,
    description: candidate.publishReason || candidate.summary,
    category: candidate.proposedCategory || ["uncategorized"],
    compatibleAgents: candidate.proposedAgents || [],
    requirements: [],
    sourceUrl: candidate.sourceUrl,
    lastChecked: candidate.lastChecked || today,
    publishedAt: today,
    featured: false,
    trendingScore: 0,
    relatedLearn: [],
    relatedSignals: [],
    relatedTools: [],
  };

  await writeJson(`src/content/tools/${publishedId}.json`, tool);
  console.log(`Published tool: src/content/tools/${publishedId}.json`);
} else if (candidate.type === "agent") {
  const agent = {
    id: publishedId,
    name: candidate.title,
    status: "published",
    region: "global",
    summary: candidate.summary,
    bestFor: candidate.proposedCategory || ["General agent workflows"],
    interfaceType: ["cli"],
    documentationUrl: candidate.sourceUrl,
    supportsMcp: false,
    supportsSkills: false,
    supportsCli: true,
    supportsWorkflows: true,
    toolTypes: { skills: 0, mcps: 0, cli: 0, workflows: 0 },
    relatedLearn: [],
    lastChecked: candidate.lastChecked || today,
  };

  await writeJson(`src/content/agents/${publishedId}.json`, agent);
  console.log(`Published agent: src/content/agents/${publishedId}.json`);
} else {
  console.error(`Publishing ${candidate.type} candidates is not automated yet.`);
  process.exit(1);
}
