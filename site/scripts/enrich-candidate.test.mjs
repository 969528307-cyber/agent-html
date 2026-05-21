import assert from "node:assert/strict";
import test from "node:test";

import { enrichCandidate } from "./enrich-candidate.mjs";

const baseCandidate = {
  id: "candidate-example",
  type: "tool",
  status: "candidate",
  title: "Example Tool",
  sourceUrl: "https://github.com/example/tool",
  discoveredAt: "2026-05-15",
  discoveredFrom: "github",
  summary: "Example summary.",
  proposedCategory: ["automation"],
  proposedAgents: ["codex"],
  proposedToolType: "workflow",
  githubMetadata: {
    stars: 1200,
    license: "MIT",
    lastPushedAt: "2026-05-01T00:00:00Z",
    topics: [],
  },
  detectedFiles: ["README.md", "package.json"],
  extractedSignals: ["Automates repeatable agent workflows with triggers and actions."],
  reviewScore: {
    sourceTrust: 4,
    usefulness: 4,
    agentRelevance: 4,
    verifiability: 4,
    freshness: 4,
    editorialValue: 4,
    permission: 4,
  },
  reviewNotes: "Review.",
};

test("marks clear high-signal workflow platforms as ready to publish", () => {
  const result = enrichCandidate({
    ...baseCandidate,
    title: "Activepieces",
    summary: "Open source workflow automation platform for connecting apps, triggers, actions, and AI agents.",
    capabilityType: "workflow",
    scope: "platform",
    classificationConfidence: "high",
    extractedSignals: [
      "Open-source workflow automation platform with triggers and actions.",
      "Connects apps and AI agents into repeatable workflows.",
    ],
  });

  assert.equal(result.enrichmentDecision, "ready_to_publish");
  assert.equal(result.enrichment.primaryType, "workflow");
  assert.match(result.enrichment.whatIsIt, /workflow/i);
});

test("routes awesome lists and tutorials to Learn instead of the public tools directory", () => {
  const result = enrichCandidate({
    ...baseCandidate,
    title: "Awesome Claude Skills",
    summary: "A curated awesome list of Claude skill examples and tutorials.",
    capabilityType: "knowledge-resource",
    scope: "awesome-list",
    classificationConfidence: "high",
  });

  assert.equal(result.enrichmentDecision, "route_to_learn");
  assert.equal(result.enrichment.publishType, "learn");
});

test("keeps intentionally vulnerable security demos in editor review", () => {
  const result = enrichCandidate({
    ...baseCandidate,
    title: "Damn Vulnerable MCP Server",
    summary: "An intentionally vulnerable MCP server for security testing and education.",
    capabilityType: "mcp",
    scope: "tool-server",
    classificationConfidence: "high",
  });

  assert.equal(result.enrichmentDecision, "needs_editor_review");
  assert.ok(result.enrichment.riskNotes.some((note) => /vulnerable|security/i.test(note)));
});

test("rejects low-signal tool candidates", () => {
  const result = enrichCandidate({
    ...baseCandidate,
    summary: "A repo.",
    classificationConfidence: "low",
    extractedSignals: [],
    detectedFiles: [],
    reviewScore: {
      ...baseCandidate.reviewScore,
      usefulness: 2,
      verifiability: 1,
      editorialValue: 2,
    },
  });

  assert.equal(result.enrichmentDecision, "reject_low_signal");
});
