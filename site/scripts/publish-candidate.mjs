import fs from "node:fs/promises";
import { pathToFileURL } from "node:url";

import { resolveCandidateRecord } from "./dedupe-utils.mjs";
import { getRepoFreshnessCutoffDate, MAX_REPO_STALENESS_DAYS } from "./github-ingest-candidate.mjs";
import { atomicWriteJsonFile } from "./json-file-utils.mjs";

const root = new URL("..", import.meta.url);

const writeJson = async (relativePath, data) => {
  const file = new URL(relativePath, root);
  await atomicWriteJsonFile(file, data);
};

const writeText = async (relativePath, text) => {
  const file = new URL(relativePath, root);
  await fs.mkdir(new URL(".", file), { recursive: true });
  await fs.writeFile(file, text);
};

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const isSkillDocPath = (path = "") => /(^|\/)SKILL\.md$/i.test(path) || /^\.agents\/skills\//i.test(path);

const buildOfficialLinks = (candidate) => {
  const links = [{ label: "Official source", url: candidate.sourceUrl, kind: "source" }];
  if (candidate.sourceUrl.includes("github.com")) {
    links.push(
      { label: "GitHub", url: candidate.sourceUrl, kind: "github" },
      { label: "Docs / README", url: `${candidate.sourceUrl}#readme`, kind: "docs" },
      { label: "Quick start", url: `${candidate.sourceUrl}#readme`, kind: "quickstart" },
      { label: "Releases", url: `${candidate.sourceUrl}/releases`, kind: "releases" }
    );
  }

  return links.filter((link, index, array) => array.findIndex((item) => item.url === link.url && item.label === link.label) === index);
};

export const filterPublishableInstallSteps = () => [];

export const filterPublishableConfigurationSteps = () => [];

const publicToolTypes = new Set(["mcp", "skill", "cli", "workflow", "agent-app", "agent-framework", "sdk"]);

export const publicToolTypeForCandidate = (candidate) => {
  const candidates = [
    candidate.enrichment?.primaryType,
    candidate.toolProfile?.capabilityType,
    candidate.capabilityType,
    candidate.proposedToolType,
  ];
  return candidates.find((type) => publicToolTypes.has(type)) || "workflow";
};

const quoteYaml = (value = "") => JSON.stringify(value);

const yamlArray = (values = []) => `[${values.map((value) => quoteYaml(value)).join(", ")}]`;

const frontmatterValue = (value) => {
  if (Array.isArray(value)) return yamlArray(value);
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return quoteYaml(value ?? "");
};

const serializeFrontmatter = (data) => {
  const lines = ["---"];
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;
    lines.push(`${key}: ${frontmatterValue(value)}`);
  }
  lines.push("---", "");
  return lines.join("\n");
};

export const validateGitHubFreshnessForPublish = (candidate, { today = new Date() } = {}) => {
  const isGitHubToolCandidate = candidate.type === "tool" && (candidate.discoveredFrom === "github" || candidate.githubMetadata);
  if (!isGitHubToolCandidate) return;

  const lastPushedAt = candidate.githubMetadata?.lastPushedAt;
  if (!lastPushedAt) {
    throw new Error(`Cannot publish ${candidate.id || candidate.title}: GitHub freshness metadata is missing.`);
  }

  const pushedDate = new Date(lastPushedAt);
  if (Number.isNaN(pushedDate.getTime())) {
    throw new Error(`Cannot publish ${candidate.id || candidate.title}: invalid GitHub lastPushedAt timestamp ${lastPushedAt}.`);
  }

  if (pushedDate < getRepoFreshnessCutoffDate(today)) {
    throw new Error(
      `Cannot publish ${candidate.id || candidate.title}: source repository last pushed at ${lastPushedAt}; maximum allowed staleness is ${MAX_REPO_STALENESS_DAYS} days.`
    );
  }
};

export const validateCandidateForPublish = (candidate) => {
  if (candidate.status === "published") {
    throw new Error(`Candidate "${candidate.id || candidate.title}" is already published as ${candidate.publishedAs || slugify(candidate.title)}.`);
  }

  validateGitHubFreshnessForPublish(candidate);

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

const loadCandidateRecord = (candidateId) => resolveCandidateRecord(candidateId);

export const markCandidatePublished = (candidate, entry, { today = new Date().toISOString().slice(0, 10) } = {}) => ({
  ...candidate,
  status: "published",
  publishedAs: entry.id,
  publishedAt: today,
  reviewedAt: candidate.reviewedAt || today,
  reviewedBy: candidate.reviewedBy || "local-review",
});

export const buildPublishedEntry = (candidate, { today = new Date().toISOString().slice(0, 10) } = {}) => {
  const publishedId = candidate.publishedAs || slugify(candidate.title);

  if (candidate.type === "tool") {
    const installSteps = filterPublishableInstallSteps(candidate.extractedInstall || []);
    const configurationSteps = filterPublishableConfigurationSteps(candidate.extractedInstall || []);
    const github = candidate.githubMetadata || {};
    return {
      collection: "tools",
      id: publishedId,
      extension: "json",
      data: {
        id: publishedId,
        name: candidate.title,
        type: publicToolTypeForCandidate(candidate),
        status: "published",
        summary: candidate.summary,
        description: candidate.publishReason || candidate.summary,
        category: candidate.proposedCategory || ["uncategorized"],
        compatibleAgents: candidate.proposedAgents || [],
        officialLinks: buildOfficialLinks(candidate),
        installCommand: installSteps.find((step) => step.command)?.command,
        installSummary: "Use the official project links for current install and setup instructions. Generated pages do not mirror commands automatically.",
        installSteps,
        highlights: candidate.extractedSignals || [],
        configuration: configurationSteps,
        verificationSteps: [],
        securityNotes: [
          "Generated from source metadata; confirm operational details in the official project before adopting it.",
          "Review the upstream license, maintenance activity, and issue history before using it in production.",
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
      },
    };
  }

  if (candidate.type === "agent") {
    return {
      collection: "agents",
      id: publishedId,
      extension: "json",
      data: {
        id: publishedId,
        name: candidate.title,
        status: "published",
        region: candidate.agentProfile?.region || "global",
        vendor: candidate.agentProfile?.vendor,
        summary: candidate.summary,
        overview: candidate.summary,
        bestFor: candidate.proposedCategory || ["General agent workflows"],
        strengths: [],
        extensionModel: [],
        recommendedStacks: [],
        limitations: [],
        sources: candidate.agentProfile?.officialLinks || [{ label: "Official source", url: candidate.sourceUrl, kind: "official" }],
        interfaceType: candidate.agentProfile?.interfaceType || ["cli"],
        documentationUrl: candidate.sourceUrl,
        supportsMcp: Boolean(candidate.agentProfile?.supportsMcp),
        supportsSkills: Boolean(candidate.agentProfile?.supportsSkills),
        supportsCli: Boolean(candidate.agentProfile?.supportsCli ?? true),
        supportsWorkflows: Boolean(candidate.agentProfile?.supportsWorkflows ?? true),
        toolTypes: { skills: 0, mcps: 0, cli: 0, workflows: 0 },
        relatedLearn: [],
        lastChecked: candidate.lastChecked || today,
      },
    };
  }

  if (candidate.type === "learn") {
    const profile = candidate.learnProfile || {};
    return {
      collection: "learn",
      id: publishedId,
      extension: "mdx",
      body: `${candidate.summary}\n`,
      data: {
        title: candidate.title,
        subtitle: candidate.summary,
        status: "published",
        topic: profile.topic || candidate.proposedCategory?.[0] || "glossary",
        path: profile.path || "start",
        order: 100,
        difficulty: profile.difficulty || "beginner",
        readingTime: profile.readingTime || "6 min",
        summaryBullets: candidate.extractedSignals || [],
        coreIdea: candidate.summary,
        useWhen: [],
        avoidWhen: [],
        checklist: [],
        examples: [],
        mistakes: [],
        nextStep: "Review the official source links and related tools before applying this guidance.",
        relatedTools: profile.relatedTools || [],
        relatedAgents: profile.relatedAgents || candidate.proposedAgents || [],
        nextReads: [],
        publishedAt: today,
      },
    };
  }

  if (candidate.type === "signal") {
    const profile = candidate.signalProfile || {};
    return {
      collection: "signals",
      id: publishedId,
      extension: "mdx",
      body: `## Full English Translation\n\n${candidate.summary}\n`,
      data: {
        englishTitle: candidate.title,
        originalTitle: candidate.title,
        status: "published",
        sourceName: profile.sourceName || candidate.sourceName || "Unknown source",
        sourceUrl: candidate.sourceUrl,
        author: candidate.author,
        originalPublishedAt: profile.originalPublishedAt,
        permissionStatus: profile.permissionStatus || candidate.permissionStatus || "unknown",
        executiveSummary: candidate.summary,
        signalThesis: candidate.extractedSignals?.[0] || candidate.summary,
        whyItMatters: candidate.publishReason || candidate.summary,
        keyTakeaways: candidate.extractedSignals || [],
        ecosystemImpact: [],
        whatToWatchNext: [],
        relatedTools: profile.relatedTools || [],
        relatedAgents: profile.relatedAgents || candidate.proposedAgents || [],
        relatedLearn: profile.relatedLearn || [],
        publishedAt: today,
      },
    };
  }

  throw new Error(`Publishing ${candidate.type} candidates is not automated yet.`);
};

const preflightCandidate = async (candidateId) => {
  const { data: candidate } = await loadCandidateRecord(candidateId);
  validateCandidateForPublish(candidate);
  console.log(`Candidate is safe to publish: ${candidate.id}`);
};

export const publishCandidate = async (candidateId) => {
  const record = await loadCandidateRecord(candidateId);
  const candidate = record.data;

  if (!["approved", "reviewing"].includes(candidate.status)) {
    throw new Error(`Candidate "${candidateId}" is ${candidate.status}; approve it before publishing.`);
  }

  validateCandidateForPublish(candidate);

  const today = new Date().toISOString().slice(0, 10);
  const entry = buildPublishedEntry(candidate, { today });

  if (entry.extension === "json") {
    await writeJson(`src/content/${entry.collection}/${entry.id}.json`, entry.data);
    console.log(`Published ${candidate.type}: src/content/${entry.collection}/${entry.id}.json`);
  } else if (entry.extension === "mdx") {
    await writeText(`src/content/${entry.collection}/${entry.id}.mdx`, `${serializeFrontmatter(entry.data)}${entry.body}`);
    console.log(`Published ${candidate.type}: src/content/${entry.collection}/${entry.id}.mdx`);
  } else {
    throw new Error(`Unsupported publish extension: ${entry.extension}`);
  }

  await atomicWriteJsonFile(record.path, markCandidatePublished(candidate, entry, { today }));
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
