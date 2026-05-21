import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { upsertCandidate } from "./dedupe-utils.mjs";
import { buildModuleCandidate, parseFrontmatter } from "./module-candidate-utils.mjs";
import { loadSourcesByType, sourceRegistryRef } from "./source-registry.mjs";

const signalsDir = path.join(process.cwd(), "src/content/signals");

export const collectSignalCandidates = async ({ limit = 20, dryRun = false } = {}) => {
  const [source] = await loadSourcesByType("signals", "local_content");
  if (!source) throw new Error("No enabled local_content source found for signals.");
  const sourceRef = sourceRegistryRef(source);
  const files = (await fs.readdir(signalsDir)).filter((file) => /\.mdx?$/.test(file)).sort().slice(0, limit);
  const candidates = [];

  for (const file of files) {
    const slug = file.replace(/\.mdx?$/, "");
    const frontmatter = parseFrontmatter(await fs.readFile(path.join(signalsDir, file), "utf8"));
    const title = frontmatter.englishTitle || slug;
    const candidate = buildModuleCandidate({
      module: "signal",
      source: sourceRef,
      sourceId: slug,
      title,
      sourceUrl: frontmatter.sourceUrl || `https://agentk.it/signals/${slug}`,
      sourceName: frontmatter.sourceName || "Unknown source",
      summary: frontmatter.executiveSummary || frontmatter.whyItMatters || `Signal candidate for ${title}.`,
      proposedCategory: ["signal"],
      proposedAgents: Array.isArray(frontmatter.relatedAgents) ? frontmatter.relatedAgents : [],
      reviewNotes: "Signals collector output. Review source quality, translation value, ecosystem implication, and whether this belongs as a Signal rather than Learn content.",
      extra: {
        author: frontmatter.author,
        permissionStatus: frontmatter.permissionStatus || "unknown",
        signalProfile: {
          sourceName: frontmatter.sourceName,
          originalPublishedAt: frontmatter.originalPublishedAt,
          permissionStatus: frontmatter.permissionStatus || "unknown",
          translationMode: "full_english_translation",
          relatedTools: Array.isArray(frontmatter.relatedTools) ? frontmatter.relatedTools : [],
          relatedAgents: Array.isArray(frontmatter.relatedAgents) ? frontmatter.relatedAgents : [],
          relatedLearn: Array.isArray(frontmatter.relatedLearn) ? frontmatter.relatedLearn : [],
        },
        extractedSignals: [
          frontmatter.signalThesis,
          frontmatter.whyItMatters,
          ...(Array.isArray(frontmatter.keyTakeaways) ? frontmatter.keyTakeaways.slice(0, 3) : []),
        ].filter(Boolean),
      },
    });

    candidates.push(candidate);
    if (!dryRun) {
      await upsertCandidate(candidate, { runId: `${candidate.lastChecked}-signals`, module: "signals" });
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
  const candidates = await collectSignalCandidates(args);
  console.log(JSON.stringify(candidates.map((candidate) => ({
    id: candidate.id,
    title: candidate.title,
    source: candidate.signalProfile?.sourceName,
    permission: candidate.signalProfile?.permissionStatus,
  })), null, 2));
  console.log(`${args.dryRun ? "Previewed" : "Created"} ${candidates.length} signal candidates.`);
};

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCli().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
