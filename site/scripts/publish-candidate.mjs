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
  const installSteps = candidate.extractedInstall || [];
  const github = candidate.githubMetadata || {};
  const tool = {
    id: publishedId,
    name: candidate.title,
    type: candidate.proposedToolType || "workflow",
    status: "published",
    summary: candidate.summary,
    description: candidate.publishReason || candidate.summary,
    category: candidate.proposedCategory || ["uncategorized"],
    compatibleAgents: candidate.proposedAgents || [],
    installCommand: installSteps.find((step) => step.command)?.command,
    installSummary: installSteps.length > 0 ? "Extracted from the source repository. Review against official docs before publishing broadly." : undefined,
    installSteps,
    highlights: candidate.extractedSignals || [],
    configuration: installSteps.filter((step) => step.code),
    verificationSteps: [
      {
        title: "Review generated candidate",
        body: "Open the source repository and confirm the extracted install instructions match the current README or SKILL.md before treating this page as production-ready.",
      },
    ],
    securityNotes: [
      "Generated from source metadata; review commands before running them locally.",
      "Do not publish secrets found in examples or config snippets.",
    ],
    maintenanceNotes: [
      github.lastPushedAt ? `Source repository last pushed at ${github.lastPushedAt}.` : "Source repository freshness should be checked before publication.",
    ],
    requirements: [],
    sourceUrl: candidate.sourceUrl,
    repoUrl: candidate.sourceUrl.includes("github.com") ? candidate.sourceUrl : undefined,
    license: github.license,
    stars: github.stars,
    lastUpdated: github.lastPushedAt,
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
