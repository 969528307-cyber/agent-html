import assert from "node:assert/strict";
import test from "node:test";

import {
  canonicalKeyForCandidate,
  candidateMatchesLegacyId,
  mergeCandidateRecords,
  normalizeCandidateTitle,
  stableCandidateIdForCandidate,
} from "./dedupe-utils.mjs";

test("uses GitHub owner and repo as the canonical key for tool candidates across crawl dates", () => {
  const older = {
    id: "candidate-firecrawl-mcp-server-2026-05-13",
    type: "tool",
    title: "Firecrawl Mcp Server",
    sourceUrl: "https://github.com/firecrawl/firecrawl-mcp-server",
    githubMetadata: { fullName: "firecrawl/firecrawl-mcp-server" },
  };
  const newer = {
    ...older,
    id: "candidate-firecrawl-mcp-server-2026-05-16",
  };

  assert.equal(canonicalKeyForCandidate(older), "tool:github:firecrawl/firecrawl-mcp-server");
  assert.equal(canonicalKeyForCandidate(newer), canonicalKeyForCandidate(older));
});

test("collapses known agent aliases into one canonical key", () => {
  const kimiAgent = {
    type: "agent",
    title: "Kimi CLI / Kimi Agent",
    proposedAgents: ["kimi-agent"],
  };
  const kimiCliAgent = {
    type: "agent",
    title: "Kimi CLI / Kimi Agent",
    proposedAgents: ["kimi-cli-kimi-agent"],
  };

  assert.equal(canonicalKeyForCandidate(kimiAgent), "agent:kimi-agent");
  assert.equal(canonicalKeyForCandidate(kimiCliAgent), "agent:kimi-agent");
});

test("normalizes learn titles enough to catch article-only duplicates", () => {
  assert.equal(normalizeCandidateTitle("What is an AI Agent?"), "what is ai agent");
  assert.equal(normalizeCandidateTitle("What is AI Agent?"), "what is ai agent");

  const learnA = {
    type: "learn",
    title: "How to Judge an Agent Skill",
    sourceUrl: "https://2playclaw.com/learn/how-to-judge-an-agent-skill",
  };
  const learnB = {
    type: "learn",
    title: "How to Judge Agent Skill",
    sourceUrl: "https://2playclaw.com/learn/how-to-judge-agent-skill",
  };

  assert.equal(canonicalKeyForCandidate(learnA), "learn:title:how to judge agent skill");
  assert.equal(canonicalKeyForCandidate(learnB), canonicalKeyForCandidate(learnA));
});

test("uses source URL and normalized title to dedupe signal candidates", () => {
  const sourceUrl = "https://github.com/agentscope-ai/QwenPaw/blob/main/README_zh.md";
  const signalA = {
    type: "signal",
    title: "QwenPaw packages personal agents around skills, channels, memory, and safety",
    sourceUrl,
  };
  const signalB = {
    type: "signal",
    title: "QwenPaw packages personal agents around skills, channels, memory, and safety",
    sourceUrl,
  };

  assert.equal(
    canonicalKeyForCandidate(signalA),
    "signal:url:https://github.com/agentscope-ai/qwenpaw/blob/main/readme_zh.md:title:qwenpaw packages personal agents around skills channels memory and safety",
  );
  assert.equal(canonicalKeyForCandidate(signalB), canonicalKeyForCandidate(signalA));
  assert.equal(stableCandidateIdForCandidate(signalA), "candidate-signal-qwenpaw-packages-personal-agents-around-skills-channels-memory-and-safety");
});

test("merges duplicate candidate records without losing review state or evidence", () => {
  const existing = {
    id: "candidate-firecrawl-mcp-server-2026-05-13",
    type: "tool",
    status: "published",
    title: "Firecrawl Mcp Server",
    discoveredAt: "2026-05-13",
    lastChecked: "2026-05-13",
    extractedSignals: ["Old signal"],
    crawlRuns: [{ runId: "2026-05-13-tools", seenAt: "2026-05-13" }],
  };
  const incoming = {
    id: "candidate-firecrawl-mcp-server-2026-05-16",
    type: "tool",
    status: "candidate",
    title: "Firecrawl Mcp Server",
    discoveredAt: "2026-05-16",
    lastChecked: "2026-05-16",
    extractedSignals: ["Old signal", "New signal"],
    crawlRuns: [{ runId: "2026-05-16-tools", seenAt: "2026-05-16" }],
  };

  const merged = mergeCandidateRecords(existing, incoming, {
    canonicalKey: "tool:github:firecrawl/firecrawl-mcp-server",
  });

  assert.equal(merged.id, existing.id);
  assert.equal(merged.status, "published");
  assert.equal(merged.firstDiscoveredAt, "2026-05-13");
  assert.equal(merged.lastSeenAt, "2026-05-16");
  assert.deepEqual(merged.extractedSignals, ["Old signal", "New signal"]);
  assert.equal(merged.crawlRuns.length, 2);
  assert.equal(merged.canonicalKey, "tool:github:firecrawl/firecrawl-mcp-server");
});

test("matches legacy date-suffixed candidate ids after dedupe migration", () => {
  const candidate = {
    id: "candidate-tool-github-activepieces-activepieces",
    type: "tool",
    title: "Activepieces",
    githubMetadata: {
      repo: "activepieces",
      fullName: "activepieces/activepieces",
    },
  };

  assert.equal(candidateMatchesLegacyId(candidate, "candidate-activepieces-2026-05-16"), true);
  assert.equal(candidateMatchesLegacyId(candidate, "candidate-unrelated-2026-05-16"), false);
});

test("matches legacy learn ids against normalized titles", () => {
  const candidate = {
    id: "candidate-learn-title-what-is-ai-agent",
    type: "learn",
    title: "What is an AI Agent?",
  };

  assert.equal(candidateMatchesLegacyId(candidate, "candidate-learn-what-is-ai-agent"), true);
  assert.equal(candidateMatchesLegacyId(candidate, "candidate-learn-what-is-mcp"), false);
});
