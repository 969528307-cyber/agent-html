import assert from "node:assert/strict";
import test from "node:test";

import {
  assertRepoIsFresh,
  assertRepoMeetsStarFloor,
  buildCandidateFromRepo,
  detectToolType,
  extractCapabilitySignals,
  extractRelevantWindows,
  extractInstallHints,
  MAX_REPO_STALENESS_DAYS,
  MIN_GITHUB_STARS,
  parseGitHubUrl,
  selectEvidenceFiles,
  slugify,
} from "./github-ingest-candidate.mjs";

test("parses GitHub repository URLs", () => {
  assert.deepEqual(parseGitHubUrl("https://github.com/openai/codex/tree/main/some/path"), {
    owner: "openai",
    repo: "codex",
  });
});

test("detects skill repositories from SKILL.md and skill topics", () => {
  assert.equal(
    detectToolType({
      topics: ["agent-skill", "codex"],
      files: ["README.md", "SKILL.md"],
      readme: "# Repo Review\nA reusable skill for agent code review.",
    }),
    "skill"
  );
});

test("detects MCP repositories from package metadata and README text", () => {
  assert.equal(
    detectToolType({
      topics: ["ai", "mcp-server"],
      files: ["README.md", "package.json"],
      readme: "# Browser MCP\nA Model Context Protocol server.",
    }),
    "mcp"
  );
});

test("detects coding agents that run in the terminal as CLI tools", () => {
  assert.equal(
    detectToolType({
      topics: [],
      files: ["README.md", "package.json", ".codex/skills/code-review/SKILL.md"],
      readme: "# Codex CLI\nCodex is a coding agent that runs locally in your terminal.",
    }),
    "cli"
  );
});

test("classifies workflow automation platforms separately from MCP servers", () => {
  assert.equal(
    detectToolType({
      topics: ["mcp", "workflow-automation", "n8n-alternative", "no-code-automation"],
      files: ["README.md", "docs/install/overview.mdx"],
      readme: "# Activepieces\nAI Agents & MCPs & AI Workflow Automation platform.",
    }),
    "workflow"
  );
});

test("extracts install hints from README code fences", () => {
  const hints = extractInstallHints(`
## Install
\`\`\`bash
npx -y @example/agent-skill
\`\`\`

\`\`\`json
{ "mcpServers": { "example": { "command": "npx" } } }
\`\`\`
`);

  assert.equal(hints[0].command, "npx -y @example/agent-skill");
  assert.match(hints[1].code, /mcpServers/);
});

test("rejects GitHub repositories below the minimum star floor", () => {
  assert.equal(MIN_GITHUB_STARS, 700);
  assert.throws(
    () => assertRepoMeetsStarFloor({ full_name: "example/small-tool", stargazers_count: 699 }),
    /minimum is 700/
  );
  assert.doesNotThrow(() => assertRepoMeetsStarFloor({ full_name: "example/large-tool", stargazers_count: 700 }));
});

test("rejects GitHub repositories outside the maintenance freshness window", () => {
  assert.equal(MAX_REPO_STALENESS_DAYS, 548);
  assert.throws(
    () =>
      assertRepoIsFresh(
        { full_name: "example/stale-tool", pushed_at: "2024-04-01T00:00:00Z" },
        { today: new Date("2026-05-12T00:00:00Z") }
      ),
    /maximum allowed staleness is 548 days/
  );
  assert.doesNotThrow(() =>
    assertRepoIsFresh(
      { full_name: "example/current-tool", pushed_at: "2025-01-15T00:00:00Z" },
      { today: new Date("2026-05-12T00:00:00Z") }
    )
  );
});

test("selects only high-signal evidence files from large repository trees", () => {
  const selected = selectEvidenceFiles([
    { path: "README.md", size: 90_000 },
    { path: "docs/overview.md", size: 12_000 },
    { path: "docs/features/agent-workflows.md", size: 8_000 },
    { path: "docs/mcp/configuration.md", size: 10_000 },
    { path: "docs/install/overview.md", size: 8_000 },
    { path: "skills/review/SKILL.md", size: 6_000 },
    { path: "AGENTS.md", size: 2_000 },
    { path: "CLAUDE.md", size: 2_000 },
    { path: ".cursor/rules/agent.mdc", size: 1_000 },
    { path: "examples/basic/config.json", size: 2_000 },
    { path: "packages/noisy/package.json", size: 1_000 },
    { path: "docs/huge-api-reference.md", size: 600_000 },
  ]);

  assert.deepEqual(selected.map((file) => file.path), [
    "README.md",
    "docs/features/agent-workflows.md",
    "docs/overview.md",
    "examples/basic/config.json",
    "skills/review/SKILL.md",
    ".cursor/rules/agent.mdc",
    "AGENTS.md",
    "CLAUDE.md",
  ]);
});

test("extracts bounded evidence windows from long documents", () => {
  const longDocument = `${"intro ".repeat(2000)}
## Features
The docs MCP helps agents search current documentation and retrieve API examples during coding tasks.
${"filler ".repeat(2000)}
## Agent workflow
Codex can use the tool to answer library questions without manual copy paste.
${"tail ".repeat(2000)}`;

  const windows = extractRelevantWindows(longDocument, { radius: 160, maxWindows: 3 });

  assert.ok(windows.length >= 2);
  assert.ok(windows.length <= 3);
  assert.ok(windows.every((window) => window.length <= 360));
  assert.match(windows.join("\n"), /search current documentation/);
  assert.match(windows.join("\n"), /library questions/);
});

test("builds a candidate with GitHub metadata and capability signals", () => {
  const candidate = buildCandidateFromRepo({
    repo: {
      html_url: "https://github.com/example/repo-review-skill",
      name: "repo-review-skill",
      full_name: "example/repo-review-skill",
      description: "Review code repositories with an agent skill.",
      stargazers_count: 123,
      license: { spdx_id: "MIT" },
      topics: ["agent-skill", "code-review"],
      pushed_at: "2026-05-10T00:00:00Z",
      default_branch: "main",
      owner: { login: "example" },
    },
    files: ["README.md", "SKILL.md"],
    readme: "# Repo Review Skill\n\nReview pull requests, summarize risky files, and help agents produce code review notes.\n\n## Install\n```bash\ncp SKILL.md ~/.codex/skills/repo-review/SKILL.md\n```",
    today: "2026-05-11",
  });

  assert.equal(candidate.id, "candidate-repo-review-skill-2026-05-11");
  assert.equal(candidate.proposedToolType, "skill");
  assert.equal(candidate.githubMetadata.stars, 123);
  assert.deepEqual(candidate.detectedFiles, ["README.md", "SKILL.md"]);
  assert.deepEqual(candidate.extractedInstall, []);
  assert.ok(candidate.extractedSignals.some((signal) => /Review pull requests/i.test(signal)));
});

test("cleans HTML badges and images out of capability signals", () => {
  const signals = extractCapabilitySignals(`
<p align="center"><strong>Codex CLI</strong> is a coding agent from OpenAI that runs locally on your computer.</p>
<img src="https://github.com/openai/codex/blob/main/.github/splash.png" alt="Codex CLI splash" />
<a href="https://example.com?utm_source=github"><img width="1280" height="640" alt="banner" src="cover.png"></a>
If you want the desktop app experience, run <code>codex app</code> or visit <a href="https://chatgpt.com/codex">the Codex App page</a>.
`);

  assert.deepEqual(signals, [
    "Codex CLI is a coding agent from OpenAI that runs locally on your computer.",
    "If you want the desktop app experience, run codex app or visit the Codex App page.",
  ]);
});

test("records the discovery profile separately from detected tool type", () => {
  const candidate = buildCandidateFromRepo({
    crawlerProfile: "mcp",
    repo: {
      html_url: "https://github.com/example/workflow-platform",
      name: "workflow-platform",
      full_name: "example/workflow-platform",
      description: "Workflow automation with MCP support.",
      stargazers_count: 12_000,
      license: { spdx_id: "MIT" },
      topics: ["mcp", "workflow-automation"],
      pushed_at: "2026-05-10T00:00:00Z",
      default_branch: "main",
      owner: { login: "example" },
    },
    files: ["README.md"],
    readme: "# Workflow Platform\n\nBuild agents, automate workflows, and connect apps through MCP support.",
    today: "2026-05-11",
  });

  assert.equal(candidate.proposedToolType, "workflow");
  assert.equal(candidate.crawlerProfile, "mcp");
});

test("keeps OpenClaw style coding agents in CLI classification even when MCP is mentioned", () => {
  assert.equal(
    detectToolType({
      topics: ["mcp", "coding-agent"],
      files: ["README.md", "package.json"],
      readme: "# OpenClaw\nOpenClaw is a coding agent CLI for terminal workflows with MCP integrations.",
    }),
    "cli"
  );
});

test("classifies agentic skill libraries as skills even when workflows are mentioned", () => {
  assert.equal(
    detectToolType({
      topics: ["awesome-list", "skills"],
      files: ["README.md", "skills/review/SKILL.md"],
      readme:
        "Installable GitHub library of agentic skills for Claude Code, Cursor, Codex CLI, Gemini CLI, and reusable SKILL.md playbooks for workflow planning.",
    }),
    "skill"
  );
});

test("uses SKILL.md documents when generating skill candidates", () => {
  const candidate = buildCandidateFromRepo({
    repo: {
      html_url: "https://github.com/example/context-skill",
      name: "context-skill",
      full_name: "example/context-skill",
      description: "",
      stargazers_count: 8,
      license: { spdx_id: "Apache-2.0" },
      topics: [],
      pushed_at: "2026-05-10T00:00:00Z",
      default_branch: "main",
      owner: { login: "example" },
    },
    files: ["README.md", "skills/context/SKILL.md"],
    readme: "# Context helper\nSmall repo.",
    skillDocs: [
      {
        path: "skills/context/SKILL.md",
        content: "# Context Skill\n\n## Install\n```bash\ncp skills/context/SKILL.md ~/.codex/skills/context/SKILL.md\n```\n\nUse this agent skill when reviewing docs.",
      },
    ],
    today: "2026-05-11",
  });

  assert.equal(candidate.proposedToolType, "skill");
  assert.equal(candidate.skillExtracts[0].path, "skills/context/SKILL.md");
  assert.deepEqual(candidate.extractedInstall, []);
  assert.ok(candidate.extractedSignals.some((signal) => /Use this agent skill/i.test(signal)));
});

test("does not surface install sources for non-skill candidates", () => {
  const candidate = buildCandidateFromRepo({
    repo: {
      html_url: "https://github.com/example/activepieces",
      name: "activepieces",
      full_name: "example/activepieces",
      description: "AI workflow automation with MCP support.",
      stargazers_count: 22_000,
      license: { spdx_id: "MIT" },
      topics: ["mcp", "workflow-automation"],
      pushed_at: "2026-05-10T00:00:00Z",
      default_branch: "main",
      owner: { login: "example" },
    },
    files: ["README.md", ".agents/skills/agent-browser/SKILL.md"],
    readme: "# Activepieces\n\n## Install\n```bash\ndocker compose up\n```\n\nA Model Context Protocol automation platform.",
    skillDocs: [
      {
        path: ".agents/skills/agent-browser/SKILL.md",
        content:
          "# Agent Browser\n\n## Install\n```bash\nnpm run lint-dev\n```\n\nConfigure `~/.agent-browser/config.json` and `AGENT_BROWSER_CONFIG`.",
      },
    ],
    today: "2026-05-11",
  });

  assert.equal(candidate.proposedToolType, "workflow");
  assert.deepEqual(candidate.extractedInstall, []);
  assert.ok(candidate.extractedSignals.some((signal) => /Model Context Protocol automation platform/i.test(signal)));
});

test("does not use agent instruction files as public candidate setup evidence", () => {
  const candidate = buildCandidateFromRepo({
    repo: {
      html_url: "https://github.com/example/workflow-platform",
      name: "workflow-platform",
      full_name: "example/workflow-platform",
      description: "Workflow automation with MCP support.",
      stargazers_count: 12_000,
      license: { spdx_id: "MIT" },
      topics: ["mcp", "workflow"],
      pushed_at: "2026-05-10T00:00:00Z",
      default_branch: "main",
      owner: { login: "example" },
    },
    files: ["README.md", "AGENTS.md", "CLAUDE.md", ".cursor/rules/dev.mdc", "docs/install/overview.mdx"],
    readme: "# Workflow Platform\n\nA Model Context Protocol automation platform.",
    evidenceDocs: [
      {
        path: "AGENTS.md",
        content: "## Install\n```bash\nnpm start # internal dev setup\n```",
      },
      {
        path: "CLAUDE.md",
        content: "## Setup\n```bash\nnpm run lint-dev\n```",
      },
      {
        path: ".cursor/rules/dev.mdc",
        content: "## Configuration\n```bash\nbrew install node\n```",
      },
      {
        path: "docs/install/overview.mdx",
        content: "## Install\n```bash\ndocker compose up -d\n```",
      },
    ],
    today: "2026-05-11",
  });

  assert.equal(candidate.proposedToolType, "workflow");
  assert.deepEqual(candidate.extractedInstall, []);
  assert.ok(candidate.extractedSignals.some((signal) => /Model Context Protocol automation platform/i.test(signal)));
});

test("candidate filter ignores developer setup commands and keeps capability evidence", () => {
  const candidate = buildCandidateFromRepo({
    repo: {
      html_url: "https://github.com/example/activepieces",
      name: "activepieces",
      full_name: "example/activepieces",
      description: "Workflow automation with MCP support.",
      stargazers_count: 22_000,
      license: { spdx_id: "MIT" },
      topics: ["mcp", "workflow"],
      pushed_at: "2026-05-10T00:00:00Z",
      default_branch: "main",
      owner: { login: "example" },
    },
    files: ["README.md", "docs/build-pieces/building-pieces/development-setup.mdx", "docs/install/overview.mdx"],
    readme: "# Activepieces\n\nBuild AI agents, automate workflows, and connect apps through MCP support.",
    evidenceDocs: [
      {
        path: "docs/build-pieces/building-pieces/development-setup.mdx",
        content: "## Install\n```bash\nnpm start\n```",
      },
      {
        path: "docs/build-pieces/building-pieces/setup-fork.mdx",
        content: "## Setup fork\n```bash\ngit clone --depth=1 https://github.com/YOUR_USERNAME/activepieces.git\n```",
      },
      {
        path: "docs/install/overview.mdx",
        content: "## Quickstart\n```bash\ndocker compose up -d\n```",
      },
    ],
    today: "2026-05-11",
  });

  assert.deepEqual(candidate.extractedInstall, []);
  assert.ok(candidate.extractedSignals.some((signal) => /automate workflows/i.test(signal)));
});

test("candidate filter ignores product install commands and keeps feature evidence", () => {
  const candidate = buildCandidateFromRepo({
    repo: {
      html_url: "https://github.com/example/cc-switch",
      name: "cc-switch",
      full_name: "example/cc-switch",
      description: "All-in-One assistant manager for Claude Code and Codex.",
      stargazers_count: 2_000,
      license: { spdx_id: "MIT" },
      topics: ["desktop-app", "claude-code"],
      pushed_at: "2026-05-10T00:00:00Z",
      default_branch: "main",
      owner: { login: "example" },
    },
    files: ["README.md", "docs/user-manual/en/1-getting-started/1.2-installation.md"],
    readme: "# CC Switch\n\nAll-in-One assistant manager for switching Claude Code, Codex, OpenCode, Gemini CLI, and Hermes Agent.",
    evidenceDocs: [
      {
        path: "docs/user-manual/en/1-getting-started/1.2-installation.md",
        content: `# Installation Guide

## Prerequisites

### Install Node.js
\`\`\`bash
# Install with Homebrew
brew install node

# Or use nvm
nvm install --lts
\`\`\`

### Install CLI Tools
\`\`\`bash
brew install claude-code
\`\`\`

## macOS

### Option 1: Homebrew (Recommended)
\`\`\`bash
# Add tap
brew tap farion1231/ccswitch
# Install
brew install --cask cc-switch
\`\`\`

Update to the latest version:
\`\`\`bash
brew upgrade --cask cc-switch
\`\`\`

## Verify Installation
\`\`\`bash
claude
\`\`\`
`,
      },
    ],
    today: "2026-05-11",
  });

  assert.deepEqual(candidate.extractedInstall, []);
  assert.ok(candidate.extractedSignals.some((signal) => /switching Claude Code/i.test(signal)));
});

test("prioritizes public capability docs over setup and agent instruction files", () => {
  const selected = selectEvidenceFiles([
    { path: "README.md", size: 90_000 },
    { path: ".agents/features/agents.md", size: 3_000 },
    { path: ".agents/skills/tool/SKILL.md", size: 3_000 },
    { path: ".cursor/rules/dev.mdc", size: 3_000 },
    { path: "AGENTS.md", size: 2_000 },
    { path: "CLAUDE.md", size: 2_000 },
    { path: "docs/install/overview.mdx", size: 8_000 },
    { path: "docs/features/agent-workflows.mdx", size: 8_000 },
    { path: "docs/usage/model-context-protocol.mdx", size: 8_000 },
    { path: "docs/mcp/configuration.mdx", size: 8_000 },
  ]);

  assert.deepEqual(selected.slice(0, 4).map((file) => file.path), [
    "README.md",
    "docs/features/agent-workflows.mdx",
    "docs/usage/model-context-protocol.mdx",
    ".agents/skills/tool/SKILL.md",
  ]);
});

test("slugifies names for candidate ids", () => {
  assert.equal(slugify("Repo Review Skill!"), "repo-review-skill");
});
