import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { upsertCandidate } from "./dedupe-utils.mjs";
import { buildModuleCandidate, readJson } from "./module-candidate-utils.mjs";
import { loadSourcesByType, sourceRegistryRef } from "./source-registry.mjs";

const agentsDir = path.join(process.cwd(), "src/content/agents");

export const collectAgentCandidates = async ({ limit = 20, dryRun = false } = {}) => {
  const [source] = await loadSourcesByType("agents", "local_content");
  if (!source) throw new Error("No enabled local_content source found for agents.");
  const sourceRef = sourceRegistryRef(source);
  const files = (await fs.readdir(agentsDir)).filter((file) => file.endsWith(".json")).sort().slice(0, limit);
  const candidates = [];

  for (const file of files) {
    const agent = await readJson(path.join(agentsDir, file));
    const officialLinks = agent.sources || [];
    const source = officialLinks[0];
    const candidate = buildModuleCandidate({
      module: "agent",
      source: sourceRef,
      sourceId: agent.id,
      title: agent.name,
      sourceUrl: agent.documentationUrl,
      sourceName: source?.label || agent.vendor || agent.name,
      summary: agent.summary,
      proposedCategory: agent.bestFor || [],
      proposedAgents: [agent.id],
      reviewNotes: "Agent collector output. Review official docs, GitHub activity, extension model, and ecosystem fit before changing the public Agent page.",
      extra: {
        author: agent.vendor,
        agentProfile: {
          region: agent.region,
          vendor: agent.vendor,
          interfaceType: agent.interfaceType || [],
          supportsMcp: Boolean(agent.supportsMcp),
          supportsSkills: Boolean(agent.supportsSkills),
          supportsCli: Boolean(agent.supportsCli),
          supportsWorkflows: Boolean(agent.supportsWorkflows),
          sourceKinds: officialLinks.map((item) => item.kind),
          officialLinks,
        },
        extractedSignals: [
          ...(agent.strengths || []).slice(0, 3).map((item) => `${item.title}: ${item.body}`),
          ...(agent.extensionModel || []).slice(0, 3).map((item) => `${item.label}: ${item.status}`),
        ],
      },
    });

    candidates.push(candidate);
    if (!dryRun) {
      await upsertCandidate(candidate, { runId: `${candidate.lastChecked}-agents`, module: "agents" });
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
  const candidates = await collectAgentCandidates(args);
  console.log(JSON.stringify(candidates.map((candidate) => ({
    id: candidate.id,
    title: candidate.title,
    region: candidate.agentProfile?.region,
    interfaces: candidate.agentProfile?.interfaceType,
  })), null, 2));
  console.log(`${args.dryRun ? "Previewed" : "Created"} ${candidates.length} agent candidates.`);
};

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCli().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
