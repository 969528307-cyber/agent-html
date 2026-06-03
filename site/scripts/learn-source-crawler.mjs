import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { upsertCandidate } from "./dedupe-utils.mjs";
import { buildModuleCandidate, parseFrontmatter } from "./module-candidate-utils.mjs";
import { loadSourcesByType, sourceRegistryRef } from "./source-registry.mjs";

const learnDir = path.join(process.cwd(), "src/content/learn");

export const collectLearnCandidates = async ({ limit = 20, dryRun = false } = {}) => {
  const [source] = await loadSourcesByType("learn", "local_content");
  if (!source) throw new Error("No enabled local_content source found for learn.");
  const sourceRef = sourceRegistryRef(source);
  const files = (await fs.readdir(learnDir)).filter((file) => /\.mdx?$/.test(file)).sort().slice(0, limit);
  const candidates = [];

  for (const file of files) {
    const slug = file.replace(/\.mdx?$/, "");
    const frontmatter = parseFrontmatter(await fs.readFile(path.join(learnDir, file), "utf8"));
    const title = frontmatter.title || slug;
    const candidate = buildModuleCandidate({
      module: "learn",
      source: sourceRef,
      sourceId: slug,
      title,
      sourceUrl: `https://2playclaw.com/learn/${slug}`,
      sourceName: "To Play Claw Learn library",
      summary: frontmatter.subtitle || frontmatter.coreIdea || `Learning candidate for ${title}.`,
      proposedCategory: [frontmatter.topic, frontmatter.path].filter(Boolean),
      proposedAgents: Array.isArray(frontmatter.relatedAgents) ? frontmatter.relatedAgents : [],
      reviewNotes: "Learn collector output. Review teaching angle, examples, related tools, and whether this should remain Learn content rather than a Tool or Signal.",
      extra: {
        learnProfile: {
          topic: frontmatter.topic,
          path: frontmatter.path,
          difficulty: frontmatter.difficulty,
          readingTime: frontmatter.readingTime,
          relatedTools: Array.isArray(frontmatter.relatedTools) ? frontmatter.relatedTools : [],
          relatedAgents: Array.isArray(frontmatter.relatedAgents) ? frontmatter.relatedAgents : [],
        },
        extractedSignals: [
          frontmatter.coreIdea,
          ...(Array.isArray(frontmatter.summaryBullets) ? frontmatter.summaryBullets.slice(0, 3) : []),
        ].filter(Boolean),
      },
    });

    candidates.push(candidate);
    if (!dryRun) {
      await upsertCandidate(candidate, { runId: `${candidate.lastChecked}-learn`, module: "learn" });
    }
  }

  return candidates;
};

const parseArgs = (argv) => ({
  dryRun: argv.includes("--dry-run"),
  limit: Number(argv[argv.indexOf("--limit") + 1]) || 20,
});

const runCli = async () => {
  const args = parseArgs(process.argv.slice(2));
  const candidates = await collectLearnCandidates(args);
  console.log(JSON.stringify(candidates.map((candidate) => ({
    id: candidate.id,
    title: candidate.title,
    topic: candidate.learnProfile?.topic,
    difficulty: candidate.learnProfile?.difficulty,
  })), null, 2));
  console.log(`${args.dryRun ? "Previewed" : "Created"} ${candidates.length} learn candidates.`);
};

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCli().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
