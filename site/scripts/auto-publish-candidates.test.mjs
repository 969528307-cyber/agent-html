import assert from "node:assert/strict";
import test from "node:test";

import { decideAutoPublishAction } from "./auto-publish-candidates.mjs";

const reviewScore = {
  sourceTrust: 4,
  usefulness: 4,
  agentRelevance: 4,
  verifiability: 4,
  freshness: 4,
  editorialValue: 4,
  permission: 4,
};

const readyTool = {
  id: "candidate-tool-ready",
  type: "tool",
  status: "candidate",
  title: "Ready MCP Tool",
  sourceUrl: "https://github.com/example/ready-mcp-tool",
  discoveredFrom: "github",
  proposedToolType: "mcp",
  enrichmentDecision: "ready_to_publish",
  enrichment: { riskNotes: [] },
  githubMetadata: {
    stars: 1200,
    lastPushedAt: "2026-05-01T00:00:00Z",
  },
  extractedSignals: ["Exposes a useful MCP server capability."],
  reviewScore,
};

test("auto publishes ready tool candidates that pass quality gates", () => {
  const action = decideAutoPublishAction(readyTool, { publishedBySourceUrl: new Map(), publishedById: new Map() });

  assert.equal(action.action, "publish");
  assert.equal(action.targetId, "ready-mcp-tool");
});

test("marks candidates as published when the same source already exists publicly", () => {
  const action = decideAutoPublishAction(readyTool, {
    publishedBySourceUrl: new Map([
      ["https://github.com/example/ready-mcp-tool", { collection: "tools", id: "ready-mcp-tool", sourceUrl: readyTool.sourceUrl }],
    ]),
    publishedById: new Map(),
  });

  assert.equal(action.action, "mark_published");
  assert.equal(action.existingEntry.id, "ready-mcp-tool");
});

test("keeps review-required tool candidates out of automatic publishing", () => {
  const action = decideAutoPublishAction(
    {
      ...readyTool,
      id: "candidate-tool-review",
      enrichmentDecision: "needs_editor_review",
    },
    { publishedBySourceUrl: new Map(), publishedById: new Map() }
  );

  assert.equal(action.action, "skip");
  assert.match(action.reason, /not ready_to_publish/);
});

test("auto publishes high-trust signal candidates with allowed translation permission", () => {
  const action = decideAutoPublishAction(
    {
      id: "candidate-signal-open",
      type: "signal",
      status: "candidate",
      title: "Open Signal",
      sourceUrl: "https://example.com/open-signal",
      discoveredFrom: "rss",
      permissionStatus: "open_license",
      extractedSignals: ["Signal thesis.", "Why it matters."],
      reviewScore,
    },
    { publishedBySourceUrl: new Map(), publishedById: new Map() }
  );

  assert.equal(action.action, "publish");
  assert.equal(action.targetId, "open-signal");
});

test("keeps unknown-permission signals in the candidate pool", () => {
  const action = decideAutoPublishAction(
    {
      id: "candidate-signal-unknown",
      type: "signal",
      status: "candidate",
      title: "Unknown Signal",
      sourceUrl: "https://example.com/unknown-signal",
      discoveredFrom: "rss",
      permissionStatus: "unknown",
      extractedSignals: ["Signal thesis.", "Why it matters."],
      reviewScore,
    },
    { publishedBySourceUrl: new Map(), publishedById: new Map() }
  );

  assert.equal(action.action, "skip");
  assert.match(action.reason, /permission/);
});
