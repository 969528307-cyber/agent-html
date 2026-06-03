#!/usr/bin/env node
/**
 * ecosystem-learn-generator.mjs
 *
 * Generates data-driven Learn articles from published tool/agent data.
 * Pure template-based — no LLM calls.
 *
 * Usage:
 *   node scripts/ecosystem-learn-generator.mjs [--dry-run]
 */

import fs from "node:fs/promises";
import path from "node:path";

// ─── Config ────────────────────────────────────────────────────────────────

const TOOLS_DIR = path.join(process.cwd(), "src/content/tools");
const AGENTS_DIR = path.join(process.cwd(), "src/content/agents");
const LEARN_DIR = path.join(process.cwd(), "src/content/learn");
const SIGNALS_DIR = path.join(process.cwd(), "src/content/signals");
const CANDIDATES_DIR = path.join(process.cwd(), "src/content/candidates");

const LEARN_SLUGS = {
  ecosystemDigest: "agent-tool-ecosystem-digest",
  agentCompat: "tool-agent-compatibility-matrix",
};

// ─── Data Loading ──────────────────────────────────────────────────────────

async function loadJsonDir(dir) {
  const results = [];
  try {
    const files = await fs.readdir(dir);
    for (const file of files) {
      if (!file.endsWith(".json")) continue;
      try {
        const data = JSON.parse(await fs.readFile(path.join(dir, file), "utf8"));
        results.push(data);
      } catch { /* skip corrupt files */ }
    }
  } catch { /* dir may not exist */ }
  return results;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

// ─── Agent Compatibility Matrix ────────────────────────────────────────────
// Shows which tools work with which agents, broken down by tool type.

function generateAgentCompatMatrix(tools, agents) {
  const agentNames = agents.map(a => a.name);
  const toolTypes = [...new Set(tools.map(t => t.type))].sort();

  // Per-type counts
  const counts = {};
  for (const type of toolTypes) {
    counts[type] = tools.filter(t => t.type === type).length;
  }

  // Agent × tool-type matrix
  const matrix = {};
  for (const agent of agents) {
    const agentId = agent.id || agent.name?.toLowerCase().replace(/\s+/g, "-");
    matrix[agent.name] = {};
    for (const type of toolTypes) {
      const compatible = tools.filter(t =>
        t.type === type &&
        Array.isArray(t.compatibleAgents) &&
        t.compatibleAgents.some(a => {
          const aStr = String(a).toLowerCase();
          return aStr === agentId || aStr === agent.name.toLowerCase();
        })
      );
      matrix[agent.name][type] = compatible.length;
    }
  }

  // Total compatible count per agent
  const agentCompatTotals = agents.map(a => {
    const agentId = a.id || a.name?.toLowerCase().replace(/\s+/g, "-");
    const total = tools.filter(t =>
      Array.isArray(t.compatibleAgents) &&
      t.compatibleAgents.some(c => {
        const cStr = String(c).toLowerCase();
        return cStr === agentId || cStr === a.name.toLowerCase();
      })
    ).length;
    return { name: a.name, total };
  }).sort((a, b) => b.total - a.total);

  return { agentNames, toolTypes, counts, matrix, agentCompatTotals };
}

// ─── Ecosystem Digest ──────────────────────────────────────────────────────
// Stats about the tool ecosystem.

function generateEcosystemDigest(tools, agents) {
  const total = tools.length;
  const byType = {};
  const byLicense = {};
  const byStars = { "0-1k": 0, "1k-5k": 0, "5k-10k": 0, "10k-50k": 0, "50k+": 0 };
  const byCategory = {};

  for (const t of tools) {
    // By type
    byType[t.type] = (byType[t.type] || 0) + 1;

    // By license
    const lic = t.license || "unknown";
    byLicense[lic] = (byLicense[lic] || 0) + 1;

    // By stars
    const stars = t.stars || 0;
    if (stars < 1000) byStars["0-1k"]++;
    else if (stars < 5000) byStars["1k-5k"]++;
    else if (stars < 10000) byStars["5k-10k"]++;
    else if (stars < 50000) byStars["10k-50k"]++;
    else byStars["50k+"]++;

    // By category
    if (Array.isArray(t.category)) {
      for (const cat of t.category) {
        byCategory[cat] = (byCategory[cat] || 0) + 1;
      }
    }
  }

  // Top 25 most-starred tools
  const topTools = [...tools]
    .sort((a, b) => (b.stars || 0) - (a.stars || 0))
    .slice(0, 25);

  // Recently updated tools (last 7 days)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const recentStr = weekAgo.toISOString().slice(0, 10);
  const recentlyUpdated = tools.filter(t => {
    const lu = t.lastUpdated || "";
    return lu >= recentStr;
  }).sort((a, b) => (b.stars || 0) - (a.stars || 0));

  return {
    total,
    byType: Object.fromEntries(Object.entries(byType).sort((a, b) => b[1] - a[1])),
    byLicense: Object.fromEntries(Object.entries(byLicense).sort((a, b) => b[1] - a[1])),
    byStars,
    byCategory: Object.fromEntries(Object.entries(byCategory).sort((a, b) => b[1] - a[1]).slice(0, 15)),
    topTools,
    recentlyUpdated,
    agentCount: agents.length,
    agentNames: agents.map(a => a.name),
  };
}

// ─── MDX Rendering ─────────────────────────────────────────────────────────

function renderEcosystemDigestMDX(digest, date) {
  const topToolsRows = digest.topTools.map((t, i) =>
    `| ${i + 1} | ${t.name || "?"} | ${t.stars || 0} | ${t.type || "?"} | ${t.license || "?"} |`
  ).join("\n");

  const recentRows = digest.recentlyUpdated.slice(0, 20).map((t, i) =>
    `| ${i + 1} | ${t.name || "?"} | ${t.stars || 0} | ${t.type || "?"} | ${t.lastUpdated || "?"} |`
  ).join("\n");

  const typeRows = Object.entries(digest.byType).map(([k, v]) => `| ${k} | ${v} | ${(v / digest.total * 100).toFixed(1)}% |`).join("\n");
  const licenseRows = Object.entries(digest.byLicense).slice(0, 10).map(([k, v]) => `| ${k} | ${v} | ${(v / digest.total * 100).toFixed(1)}% |`).join("\n");
  const starRows = Object.entries(digest.byStars).map(([k, v]) => `| ${k} | ${v} | ${(v / digest.total * 100).toFixed(1)}% |`).join("\n");
  const catRows = Object.entries(digest.byCategory).slice(0, 15).map(([k, v]) => `| ${k} | ${v} |`).join("\n");

  return `---
title: "Agent Tool Ecosystem Digest (${date})"
subtitle: "Published tools, stars distribution, license breakdown, and recent activity — data from 2playclaw.com"
status: "published"
topic: "agent"
path: "start"
order: 2
difficulty: "beginner"
readingTime: "5 min"
summaryBullets:
  - "${digest.total} published tools across ${Object.keys(digest.byType).length} types"
  - "${digest.agentCount} agent platforms with ${digest.agentCompatTotals?.[0]?.total || 'varying'} compatible tools"
  - "${digest.recentlyUpdated.length} tools updated in the past 7 days"
  - "Top ecosystem: ${Object.keys(digest.byType)[0] || 'tools'} (${Object.values(digest.byType)[0] || 0})"
relatedTools: ${JSON.stringify(digest.topTools.slice(0, 5).map(t => t.id || t.name))}
relatedAgents: ${JSON.stringify(digest.agentNames.map(n => n.toLowerCase().replace(/\\s+/g, "-")))}
nextReads: ["tool-agent-compatibility-matrix"]
publishedAt: "${date}"
---

## Snapshot (${date})

| Metric | Value |
|---|---|
| Total Published Tools | ${digest.total} |
| Agent Platforms | ${digest.agentCount} |
| Tool Types | ${Object.keys(digest.byType).length} |
| Tools Updated (7d) | ${digest.recentlyUpdated.length} |

## Distribution by Tool Type

| Type | Count | Share |
|---|---|---|
${typeRows}

## Star Distribution

| Range | Count | Share |
|---|---|---|
${starRows}

## License Distribution

| License | Count | Share |
|---|---|---|
${licenseRows}

## Top Categories

| Category | Tools |
|---|---|
${catRows}

## Top 25 by GitHub Stars

| # | Tool | Stars | Type | License |
|---|---|---|---|---|
${topToolsRows}

## Recently Updated (7 days)

| # | Tool | Stars | Type | Last Updated |
|---|---|---|---|---|
${recentRows}

---

*Data refreshed ${date}. Source: [2playclaw.com](https://2playclaw.com) published tool directory.*
`;
}

function renderAgentCompatMDX(compat, date) {
  // Summary stats
  const totalCompat = Object.values(compat.agentCompatTotals).reduce((s, a) => s + a.total, 0);
  const avgCompat = (totalCompat / compat.agentCompatTotals.length).toFixed(1);

  // Matrix header row
  const header = `| Agent | Total | ${compat.toolTypes.join(" | ")} |`;
  const separator = `| --- | --- | ${compat.toolTypes.map(() => "---").join(" | ")} |`;

  const rows = compat.agentCompatTotals.map(a => {
    const name = a.name;
    const agentData = compat.matrix[name] || {};
    const cells = compat.toolTypes.map(t => agentData[t] || 0).join(" | ");
    return `| ${name} | ${a.total} | ${cells} |`;
  }).join("\n");

  return `---
title: "Tool-Agent Compatibility Matrix (${date})"
subtitle: "Which tools work with which agent platforms — compatibility data from 2playclaw.com"
status: "published"
topic: "agent"
path: "start"
order: 3
difficulty: "beginner"
readingTime: "4 min"
summaryBullets:
  - "${compat.agentCompatTotals.length} agent platforms tracked"
  - "Average ${avgCompat} compatible tools per agent"
  - "${compat.toolTypes.length} tool types analyzed"
  - "${compat.agentCompatTotals[0]?.name || 'Top agent'} has ${compat.agentCompatTotals[0]?.total || 0} compatible tools"
relatedTools: []
relatedAgents: ${JSON.stringify(compat.agentCompatTotals.map(a => a.name.toLowerCase().replace(/\\s+/g, "-")))}
nextReads: ["agent-tool-ecosystem-digest"]
publishedAt: "${date}"
---

## Compatibility Matrix

${header}
${separator}
${rows}

## Key Observations

- **${compat.agentCompatTotals[0]?.name || "N/A"}** has the most compatible tools (${compat.agentCompatTotals[0]?.total || 0})
- **${compat.agentCompatTotals[compat.agentCompatTotals.length - 1]?.name || "N/A"}** has the fewest (${compat.agentCompatTotals[compat.agentCompatTotals.length - 1]?.total || 0})
- Most popular tool type: **${compat.toolTypes[0] || "N/A"}** (${compat.counts[compat.toolTypes[0]] || 0} published)

## Tool Types Breakdown

| Type | Total Published |
|---|---|
${compat.toolTypes.map(t => `| ${t} | ${compat.counts[t] || 0} |`).join("\n")}

---

*Data refreshed ${date}. Agent compatibility based on published tool configurations in [2playclaw.com](https://2playclaw.com).*
`;
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const date = today();

  console.log(`[ecosystem-learn-generator] Loading data (${date})...`);
  if (dryRun) console.log("[ecosystem-learn-generator] DRY RUN — no files will be written");

  const tools = await loadJsonDir(TOOLS_DIR);
  const agents = await loadJsonDir(AGENTS_DIR);
  console.log(`  Tools: ${tools.length}, Agents: ${agents.length}`);

  if (tools.length === 0) {
    console.log("[ecosystem-learn-generator] No tool data found. Run tools crawler first.");
    return;
  }

  // Generate Ecosystem Digest (skip compatibility matrix - data not reliable)
  console.log("\n  Generating Ecosystem Digest...");
  const digest = generateEcosystemDigest(tools, agents);
  const digestMDX = renderEcosystemDigestMDX(digest, date);
  const digestPath = path.join(LEARN_DIR, `${LEARN_SLUGS.ecosystemDigest}.mdx`);

  if (!dryRun) {
    await fs.mkdir(LEARN_DIR, { recursive: true });
    await fs.writeFile(digestPath, digestMDX, "utf8");
    console.log(`  ✓ ${LEARN_SLUGS.ecosystemDigest}.mdx`);
  } else {
    console.log(`  [DRY RUN] Would write: ${LEARN_SLUGS.ecosystemDigest}.mdx`);
  }

  console.log(`\n[ecosystem-learn-generator] Done.`);
}

main().catch(err => {
  console.error(`[ecosystem-learn-generator] Fatal: ${err.message}`);
  process.exit(1);
});
