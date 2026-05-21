import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { pathToFileURL } from "node:url";

import "./load-local-env.mjs";
import { MIN_GITHUB_STARS } from "./github-ingest-candidate.mjs";
import { atomicWriteJsonFile } from "./json-file-utils.mjs";
import { parseFrontmatter } from "./module-candidate-utils.mjs";
import { buildPublishedEntry, markCandidatePublished, publishCandidate } from "./publish-candidate.mjs";

const candidatesDir = path.join(process.cwd(), "src/content/candidates");
const contentDir = path.join(process.cwd(), "src/content");
const allowedSignalPermissions = new Set(["open_license", "author_submitted", "full_translation_allowed"]);

const slugify = (value = "") =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const todayString = () => new Date().toISOString().slice(0, 10);

const averageReviewScore = (candidate) => {
  const scores = Object.values(candidate.reviewScore || {});
  if (scores.length === 0) return 0;
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
};

const hasRiskNotes = (candidate) => (candidate.enrichment?.riskNotes || []).length > 0;

const publicTargetFor = (candidate) => buildPublishedEntry(candidate).id;

export const decideAutoPublishAction = (candidate, { publishedBySourceUrl = new Map(), publishedById = new Map() } = {}) => {
  const targetId = candidate.publishedAs || slugify(candidate.title);
  const existingBySource = candidate.sourceUrl ? publishedBySourceUrl.get(candidate.sourceUrl) : null;
  const existingById = publishedById.get(`${candidate.type}:${targetId}`);

  if (candidate.status === "published") {
    return { action: "skip", reason: "already published", targetId };
  }

  if (existingBySource) {
    return { action: "mark_published", reason: "source already exists publicly", targetId: existingBySource.id, existingEntry: existingBySource };
  }

  if (existingById) {
    return { action: "mark_published", reason: "public slug already exists", targetId: existingById.id, existingEntry: existingById };
  }

  if (["rejected", "archived"].includes(candidate.status)) {
    return { action: "skip", reason: `candidate is ${candidate.status}`, targetId };
  }

  if (hasRiskNotes(candidate)) {
    return { action: "skip", reason: "risk notes require review", targetId };
  }

  if (candidate.type === "tool") {
    if (candidate.enrichmentDecision !== "ready_to_publish") {
      return { action: "skip", reason: "tool is not ready_to_publish", targetId };
    }
    if ((candidate.githubMetadata?.stars || 0) < MIN_GITHUB_STARS) {
      return { action: "skip", reason: `tool has fewer than ${MIN_GITHUB_STARS} GitHub stars`, targetId };
    }
    if (!candidate.githubMetadata?.lastPushedAt) {
      return { action: "skip", reason: "tool is missing GitHub freshness metadata", targetId };
    }
    return { action: "publish", reason: "ready tool passed automatic publishing gates", targetId: publicTargetFor(candidate) };
  }

  if (candidate.type === "signal") {
    const permission = candidate.signalProfile?.permissionStatus || candidate.permissionStatus;
    if (!allowedSignalPermissions.has(permission)) {
      return { action: "skip", reason: "signal permission is not eligible for automatic publishing", targetId };
    }
    if ((candidate.extractedSignals || []).length < 2) {
      return { action: "skip", reason: "signal has too few source-backed notes", targetId };
    }
    if (averageReviewScore(candidate) < 4) {
      return { action: "skip", reason: "signal review score is below auto-publish threshold", targetId };
    }
    return { action: "publish", reason: "signal permission and source quality passed automatic publishing gates", targetId: publicTargetFor(candidate) };
  }

  if (candidate.type === "agent") {
    if (!candidate.sourceUrl || averageReviewScore(candidate) < 4 || !candidate.agentProfile) {
      return { action: "skip", reason: "agent source or profile is not strong enough for automatic publishing", targetId };
    }
    return { action: "publish", reason: "agent source and profile passed automatic publishing gates", targetId: publicTargetFor(candidate) };
  }

  if (candidate.type === "learn") {
    const trustedSource = ["high", "official"].includes(candidate.sourceRegistry?.trustLevel);
    if (!trustedSource || averageReviewScore(candidate) < 4) {
      return { action: "skip", reason: "learn source is not trusted enough for automatic publishing", targetId };
    }
    return { action: "publish", reason: "learn source passed automatic publishing gates", targetId: publicTargetFor(candidate) };
  }

  return { action: "skip", reason: `unsupported candidate type ${candidate.type}`, targetId };
};

const runCommand = (command, args) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: process.cwd(),
      env: process.env,
      stdio: "inherit",
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} failed with exit code ${code}`));
    });
  });

const runDiscovery = async ({ toolsLimit = 80, agentsLimit = 20, learnLimit = 40, signalsLimit = 20 }) => {
  await runCommand("npm", ["run", "discover:tools", "--", "--limit", String(toolsLimit)]);
  await runCommand("npm", ["run", "discover:agents", "--", "--limit", String(agentsLimit)]);
  await runCommand("npm", ["run", "discover:learn", "--", "--limit", String(learnLimit)]);
  await runCommand("npm", ["run", "discover:signals", "--", "--limit", String(signalsLimit)]);
  await runCommand("npm", ["run", "enrich:candidates"]);
};

const readJson = async (filePath) => JSON.parse(await fs.readFile(filePath, "utf8"));

const addPublishedEntry = (indexes, entry) => {
  indexes.publishedById.set(`${entry.type}:${entry.id}`, entry);
  if (entry.sourceUrl) indexes.publishedBySourceUrl.set(entry.sourceUrl, entry);
};

const readMdxEntry = async (collection, file) => {
  const filePath = path.join(contentDir, collection, file);
  const frontmatter = parseFrontmatter(await fs.readFile(filePath, "utf8"));
  return {
    collection,
    type: collection === "signals" ? "signal" : "learn",
    id: file.replace(/\.mdx?$/, ""),
    sourceUrl: frontmatter.sourceUrl,
  };
};

const loadPublishedIndexes = async () => {
  const indexes = { publishedBySourceUrl: new Map(), publishedById: new Map() };

  for (const collection of ["tools", "agents"]) {
    const dir = path.join(contentDir, collection);
    const files = (await fs.readdir(dir)).filter((file) => file.endsWith(".json"));
    for (const file of files) {
      const data = await readJson(path.join(dir, file));
      addPublishedEntry(indexes, {
        collection,
        type: collection === "tools" ? "tool" : "agent",
        id: data.id || file.replace(/\.json$/, ""),
        sourceUrl: data.sourceUrl || data.documentationUrl || data.sources?.find((source) => source.sourceUrl)?.sourceUrl,
      });
    }
  }

  for (const collection of ["learn", "signals"]) {
    const dir = path.join(contentDir, collection);
    const files = (await fs.readdir(dir)).filter((file) => /\.mdx?$/.test(file));
    for (const file of files) {
      addPublishedEntry(indexes, await readMdxEntry(collection, file));
    }
  }

  return indexes;
};

const loadCandidates = async () => {
  const files = (await fs.readdir(candidatesDir)).filter((file) => file.endsWith(".json")).sort();
  const candidates = [];
  for (const file of files) {
    candidates.push({ file, data: await readJson(path.join(candidatesDir, file)) });
  }
  return candidates;
};

const writeCandidate = async (candidate) => {
  await atomicWriteJsonFile(path.join(candidatesDir, `${candidate.id}.json`), candidate);
};

export const autoPublishCandidates = async ({ dryRun = false, discover = false, limits = {} } = {}) => {
  if (discover) {
    await runDiscovery(limits);
  }

  const publishedIndexes = await loadPublishedIndexes();
  const candidates = await loadCandidates();
  const summary = { published: [], markedPublished: [], skipped: [], failed: [] };
  const today = todayString();

  for (const { data: candidate } of candidates) {
    const action = decideAutoPublishAction(candidate, publishedIndexes);

    if (action.action === "mark_published") {
      summary.markedPublished.push({ id: candidate.id, reason: action.reason, targetId: action.targetId });
      if (!dryRun) {
        await writeCandidate(markCandidatePublished(candidate, action.existingEntry, { today }));
      }
      continue;
    }

    if (action.action !== "publish") {
      summary.skipped.push({ id: candidate.id, reason: action.reason });
      continue;
    }

    summary.published.push({ id: candidate.id, reason: action.reason, targetId: action.targetId });
    if (dryRun) continue;

    try {
      await writeCandidate({
        ...candidate,
        status: "approved",
        reviewedAt: candidate.reviewedAt || today,
        reviewedBy: candidate.reviewedBy || "auto-publisher",
      });
      await publishCandidate(candidate.id);
    } catch (error) {
      summary.failed.push({ id: candidate.id, error: error instanceof Error ? error.message : String(error) });
    }
  }

  return summary;
};

const parseArgs = (argv) => ({
  dryRun: argv.includes("--dry-run"),
  discover: argv.includes("--discover"),
});

const runCli = async () => {
  const args = parseArgs(process.argv.slice(2));
  const summary = await autoPublishCandidates(args);
  console.log(JSON.stringify(summary, null, 2));

  if (summary.failed.length > 0) {
    process.exitCode = 1;
  }
};

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCli().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
