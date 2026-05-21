import assert from "node:assert/strict";
import test from "node:test";

import { buildModuleCandidate, parseFrontmatter } from "./module-candidate-utils.mjs";

test("builds module candidates without borrowing tool-only profile fields", () => {
  const candidate = buildModuleCandidate({
    module: "agent",
    source: {
      id: "local-agents-library",
      name: "Local Agent Content Library",
      type: "local_content",
      trustLevel: "high",
      refreshInterval: "weekly",
      url: "src/content/agents",
      acceptRules: ["must_have_documentation_url"],
      rejectRules: ["missing_official_link"],
    },
    sourceId: "openclaw",
    title: "OpenClaw",
    sourceUrl: "https://openclaw.cc/en/tools/skills",
    summary: "Agent ecosystem candidate.",
    reviewNotes: "Review agent sources.",
    extra: {
      agentProfile: {
        region: "global",
        interfaceType: ["cli", "web"],
        supportsMcp: true,
        supportsSkills: true,
        supportsCli: true,
        supportsWorkflows: true,
        sourceKinds: ["docs", "github"],
        officialLinks: [],
      },
    },
  });

  assert.equal(candidate.type, "agent");
  assert.equal(candidate.status, "published");
  assert.equal(candidate.publishedAs, "openclaw");
  assert.equal(candidate.sourceRegistryId, "local-agents-library");
  assert.equal(candidate.sourceRegistry.id, "local-agents-library");
  assert.equal(candidate.agentProfile.supportsMcp, true);
  assert.equal(candidate.toolProfile, undefined);
  assert.equal(candidate.capabilityType, undefined);
});

test("uses stable ids for module candidates so scheduled crawls update instead of duplicate", () => {
  const candidate = buildModuleCandidate({
    module: "learn",
    sourceId: "how-to-choose-agent",
    title: "How to Choose an Agent",
    sourceUrl: "https://example.com/how-to-choose-agent",
    summary: "Guide candidate.",
  });

  assert.equal(candidate.id, "candidate-learn-how-to-choose-agent");
  assert.match(candidate.discoveredAt, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(candidate.lastChecked, candidate.discoveredAt);
});

test("parses block and inline frontmatter arrays for module collectors", () => {
  const data = parseFrontmatter(`---
title: "What is MCP?"
topic: "mcp"
relatedTools: ["context7", "playwright-mcp"]
relatedAgents:
  - "codex"
  - "cursor"
---
Body`);

  assert.equal(data.title, "What is MCP?");
  assert.deepEqual(data.relatedTools, ["context7", "playwright-mcp"]);
  assert.deepEqual(data.relatedAgents, ["codex", "cursor"]);
});
