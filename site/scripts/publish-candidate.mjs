import fs from "node:fs/promises";
import { pathToFileURL } from "node:url";

const root = new URL("..", import.meta.url);

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

const isSkillDocPath = (path = "") => /(^|\/)SKILL\.md$/i.test(path) || /^\.agents\/skills\//i.test(path);

export const filterPublishableInstallSteps = (installSteps = []) =>
  installSteps.filter((step) => !step.audience || step.audience === "verified_install");

export const validateCandidateForPublish = (candidate) => {
  if (candidate.type !== "tool" || candidate.proposedToolType === "skill") return;

  const installSteps = candidate.extractedInstall || [];
  const unsafeStep = installSteps.find((step) => step.sourcePath && isSkillDocPath(step.sourcePath));
  if (unsafeStep) {
    throw new Error(`Unsafe install source: ${unsafeStep.sourcePath}. Clean or re-ingest this candidate before publishing.`);
  }

  const hasUnsourcedInstall = installSteps.some((step) => !step.sourcePath);
  const hasNestedSkillDocs = (candidate.detectedFiles || []).some(isSkillDocPath);
  if (hasUnsourcedInstall && hasNestedSkillDocs) {
    throw new Error("Re-ingest candidate before publishing: install hints do not include source paths and nested skill docs were detected.");
  }
};

const loadCandidate = (candidateId) => readJson(`src/content/candidates/${candidateId}.json`);

const preflightCandidate = async (candidateId) => {
  const candidate = await loadCandidate(candidateId);
  validateCandidateForPublish(candidate);
  console.log(`Candidate is safe to publish: ${candidateId}`);
};

const publishCandidate = async (candidateId) => {
  const candidate = await loadCandidate(candidateId);

  if (!["approved", "reviewing"].includes(candidate.status)) {
    throw new Error(`Candidate "${candidateId}" is ${candidate.status}; approve it before publishing.`);
  }

  validateCandidateForPublish(candidate);

  const publishedId = candidate.publishedAs || slugify(candidate.title);
  const today = new Date().toISOString().slice(0, 10);

  if (candidate.type === "tool") {
    const installSteps = filterPublishableInstallSteps(candidate.extractedInstall || []);
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
      configuration: (candidate.extractedInstall || []).filter((step) => step.audience === "configuration" && step.code),
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
    throw new Error(`Publishing ${candidate.type} candidates is not automated yet.`);
  }
};

const runCli = async () => {
  const preflight = process.argv.includes("--preflight");
  const candidateId = process.argv.slice(2).find((arg) => arg !== "--preflight");

  if (!candidateId) {
    console.error("Usage: npm run publish:candidate -- <candidate-id> [--preflight]");
    process.exit(1);
  }

  if (preflight) {
    await preflightCandidate(candidateId);
    return;
  }

  await publishCandidate(candidateId);
};

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCli().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
