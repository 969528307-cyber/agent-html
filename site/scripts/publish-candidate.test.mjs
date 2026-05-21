import assert from "node:assert/strict";
import test from "node:test";

import {
  buildPublishedEntry,
  filterPublishableConfigurationSteps,
  filterPublishableInstallSteps,
  markCandidatePublished,
  validateCandidateForPublish,
} from "./publish-candidate.mjs";

test("blocks non-skill candidates with install hints from nested skill docs", () => {
  assert.throws(
    () =>
      validateCandidateForPublish({
        id: "candidate-activepieces-2026-05-12",
        type: "tool",
        title: "Activepieces",
        proposedToolType: "mcp",
        status: "approved",
        extractedInstall: [
          {
            title: "Install command",
            command: "npm run lint-dev",
            sourcePath: ".agents/skills/agent-browser/SKILL.md",
          },
        ],
      }),
    /Unsafe install source/
  );
});

test("blocks old generated non-skill candidates with unsourced install hints and nested skill docs", () => {
  assert.throws(
    () =>
      validateCandidateForPublish({
        id: "candidate-activepieces-2026-05-12",
        type: "tool",
        title: "Activepieces",
        proposedToolType: "mcp",
        status: "approved",
        detectedFiles: [".agents/skills/agent-browser/SKILL.md"],
        extractedInstall: [
          {
            title: "Install command",
            command: "npm run lint-dev",
          },
        ],
      }),
    /Re-ingest candidate/
  );
});

test("allows skill candidates to publish install hints from SKILL.md", () => {
  assert.doesNotThrow(() =>
    validateCandidateForPublish({
      id: "candidate-context-skill-2026-05-12",
      type: "tool",
      title: "Context Skill",
      proposedToolType: "skill",
      status: "approved",
      extractedInstall: [
        {
          title: "Install command",
          command: "cp skills/context/SKILL.md ~/.codex/skills/context/SKILL.md",
          sourcePath: "skills/context/SKILL.md",
        },
      ],
    })
  );
});

test("blocks stale GitHub candidates before public publishing", () => {
  assert.throws(
    () =>
      validateCandidateForPublish({
        id: "candidate-stale-tool-2026-05-12",
        type: "tool",
        title: "Stale Tool",
        proposedToolType: "skill",
        status: "approved",
        discoveredFrom: "github",
        sourceUrl: "https://github.com/example/stale-tool",
        githubMetadata: {
          fullName: "example/stale-tool",
          lastPushedAt: "2024-04-01T00:00:00Z",
        },
      }),
    /maximum allowed staleness is 548 days/
  );
});

test("blocks GitHub tool candidates without freshness metadata before public publishing", () => {
  assert.throws(
    () =>
      validateCandidateForPublish({
        id: "candidate-tool-missing-freshness",
        type: "tool",
        title: "Tool Missing Freshness",
        proposedToolType: "mcp",
        status: "approved",
        discoveredFrom: "github",
        sourceUrl: "https://github.com/example/tool-missing-freshness",
      }),
    /GitHub freshness metadata is missing/
  );
});

test("allows signal candidates to cite GitHub sources without tool freshness metadata", () => {
  assert.doesNotThrow(() =>
    validateCandidateForPublish({
      id: "candidate-signal-mcp-trust-signal",
      type: "signal",
      title: "Qwen-Agent turns MCP into a first-class agent framework capability",
      status: "approved",
      discoveredFrom: "directory",
      sourceUrl: "https://github.com/QwenLM/Qwen-Agent",
      summary: "Qwen-Agent presents MCP as part of a broader agent framework.",
    })
  );
});

test("blocks already published candidates from publishing again", () => {
  assert.throws(
    () =>
      validateCandidateForPublish({
        id: "candidate-signal-mcp-trust-signal",
        type: "signal",
        title: "Qwen-Agent turns MCP into a first-class agent framework capability",
        status: "published",
        publishedAs: "mcp-trust-signal",
        discoveredFrom: "directory",
        sourceUrl: "https://github.com/QwenLM/Qwen-Agent",
        summary: "Qwen-Agent presents MCP as part of a broader agent framework.",
      }),
    /already published/
  );
});

test("does not publish generated install or configuration snippets as public setup steps", () => {
  const installSteps = [
    {
      title: "Install command",
      command: "npm start",
      sourcePath: "docs/build-pieces/building-pieces/development-setup.mdx",
      audience: "developer_setup",
    },
    {
      title: "Install command",
      command: "docker compose up -d",
      sourcePath: "docs/install/overview.mdx",
      audience: "verified_install",
    },
    {
      title: "Configuration snippet",
      code: "{ \"mcpServers\": {} }",
      sourcePath: "docs/install/overview.mdx",
      audience: "configuration",
    },
  ];

  assert.deepEqual(
    filterPublishableInstallSteps(installSteps).map((step) => step.command || step.code),
    []
  );
  assert.deepEqual(
    filterPublishableConfigurationSteps(installSteps).map((step) => step.command || step.code),
    []
  );
});

test("publishes tools with the final classifier type instead of the initial crawl guess", () => {
  const entry = buildPublishedEntry({
    id: "candidate-activepieces",
    type: "tool",
    status: "approved",
    title: "Activepieces",
    sourceUrl: "https://github.com/activepieces/activepieces",
    sourceName: "GitHub",
    discoveredAt: "2026-05-16",
    discoveredFrom: "github",
    summary: "Workflow automation with MCP support.",
    proposedToolType: "workflow",
    capabilityType: "mcp",
    toolProfile: {
      capabilityType: "mcp",
      scope: "tool-server",
      useCategory: ["automation"],
    },
    enrichment: {
      primaryType: "mcp",
    },
    proposedCategory: ["automation"],
    proposedAgents: ["Cursor"],
    githubMetadata: {
      stars: 1200,
      license: "MIT",
      lastPushedAt: "2026-05-16T00:00:00Z",
    },
  }, { today: "2026-05-16" });

  assert.equal(entry.data.type, "mcp");
});

test("keeps unsupported classifier types out of the public tool type field", () => {
  const entry = buildPublishedEntry({
    id: "candidate-langchain4j",
    type: "tool",
    status: "approved",
    title: "LangChain4j",
    sourceUrl: "https://github.com/langchain4j/langchain4j",
    sourceName: "GitHub",
    discoveredAt: "2026-05-16",
    discoveredFrom: "github",
    summary: "SDK for agentic apps.",
    proposedToolType: "workflow",
    capabilityType: "sdk",
    toolProfile: {
      capabilityType: "sdk",
      scope: "sdk-library",
      useCategory: ["coding"],
    },
    enrichment: {
      primaryType: "sdk",
    },
    proposedCategory: ["coding"],
    proposedAgents: ["Generic"],
    githubMetadata: {
      stars: 1200,
      license: "MIT",
      lastPushedAt: "2026-05-16T00:00:00Z",
    },
  }, { today: "2026-05-16" });

  assert.equal(entry.data.type, "workflow");
});

test("builds published learn and signal entries from candidates", () => {
  const learn = buildPublishedEntry({
    id: "candidate-learn-skill-vs-mcp",
    type: "learn",
    status: "approved",
    title: "Skill vs MCP",
    sourceUrl: "https://agentk.it/learn/skill-vs-mcp",
    sourceName: "agentk.it Learn library",
    discoveredAt: "2026-05-14",
    discoveredFrom: "directory",
    summary: "A practical comparison.",
    proposedCategory: ["skill"],
    proposedAgents: ["codex"],
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
    learnProfile: {
      topic: "skill",
      path: "start",
      difficulty: "beginner",
      readingTime: "6 min",
      relatedTools: [],
      relatedAgents: ["codex"],
    },
  }, { today: "2026-05-14" });

  const signal = buildPublishedEntry({
    id: "candidate-signal-qwen-agent",
    type: "signal",
    status: "approved",
    title: "Qwen-Agent signal",
    sourceUrl: "https://github.com/QwenLM/Qwen-Agent",
    sourceName: "QwenLM / Qwen-Agent GitHub",
    author: "QwenLM",
    discoveredAt: "2026-05-14",
    discoveredFrom: "directory",
    summary: "Qwen-Agent treats MCP as a first-class capability.",
    proposedCategory: ["signal"],
    proposedAgents: ["qwen-code"],
    permissionStatus: "open_license",
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
    signalProfile: {
      sourceName: "QwenLM / Qwen-Agent GitHub",
      permissionStatus: "open_license",
      translationMode: "full_english_translation",
      relatedTools: [],
      relatedAgents: ["qwen-code"],
      relatedLearn: [],
    },
  }, { today: "2026-05-14" });

  assert.equal(learn.collection, "learn");
  assert.equal(learn.id, "skill-vs-mcp");
  assert.equal(learn.data.status, "published");
  assert.equal(signal.collection, "signals");
  assert.equal(signal.id, "qwen-agent-signal");
  assert.equal(signal.data.englishTitle, "Qwen-Agent signal");
});

test("marks candidates as published after creating the public entry", () => {
  const updated = markCandidatePublished(
    {
      id: "candidate-signal-mcp-trust-signal",
      type: "signal",
      status: "approved",
      title: "Qwen-Agent turns MCP into a first-class agent framework capability",
      sourceUrl: "https://github.com/QwenLM/Qwen-Agent",
      discoveredFrom: "directory",
      summary: "Qwen-Agent presents MCP as part of a broader agent framework.",
    },
    {
      collection: "signals",
      id: "mcp-trust-signal",
      extension: "mdx",
      data: {},
      body: "",
    },
    { today: "2026-05-15" }
  );

  assert.equal(updated.status, "published");
  assert.equal(updated.publishedAs, "mcp-trust-signal");
  assert.equal(updated.publishedAt, "2026-05-15");
});
