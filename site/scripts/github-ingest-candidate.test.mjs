import assert from "node:assert/strict";
import test from "node:test";

import {
  assertRepoMeetsStarFloor,
  buildCandidateFromRepo,
  detectToolType,
  extractRelevantWindows,
  extractInstallHints,
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
  assert.equal(MIN_GITHUB_STARS, 1000);
  assert.throws(
    () => assertRepoMeetsStarFloor({ full_name: "example/small-tool", stargazers_count: 999 }),
    /minimum is 1000/
  );
  assert.doesNotThrow(() => assertRepoMeetsStarFloor({ full_name: "example/large-tool", stargazers_count: 1000 }));
});

test("selects only high-signal evidence files from large repository trees", () => {
  const selected = selectEvidenceFiles([
    { path: "README.md", size: 90_000 },
    { path: "docs/getting-started.md", size: 12_000 },
    { path: "docs/random-brand-story.md", size: 8_000 },
    { path: "docs/mcp/configuration.md", size: 10_000 },
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
    "docs/getting-started.md",
    "docs/mcp/configuration.md",
    "examples/basic/config.json",
    "skills/review/SKILL.md",
    ".cursor/rules/agent.mdc",
    "AGENTS.md",
    "CLAUDE.md",
  ]);
});

test("extracts bounded evidence windows from long documents", () => {
  const longDocument = `${"intro ".repeat(2000)}
## Configuration
\`\`\`json
{ "mcpServers": { "docs": { "command": "npx", "args": ["-y", "@example/docs-mcp"] } } }
\`\`\`
${"filler ".repeat(2000)}
## Agent setup
Copy this instruction into AGENTS.md so Codex knows when to use the tool.
${"tail ".repeat(2000)}`;

  const windows = extractRelevantWindows(longDocument, { radius: 160, maxWindows: 3 });

  assert.ok(windows.length >= 2);
  assert.ok(windows.length <= 3);
  assert.ok(windows.every((window) => window.length <= 360));
  assert.match(windows.join("\n"), /mcpServers/);
  assert.match(windows.join("\n"), /AGENTS\.md/);
});

test("builds a candidate with GitHub metadata and extracted detail fields", () => {
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
    readme: "# Repo Review Skill\n\n## Install\n```bash\ncp SKILL.md ~/.codex/skills/repo-review/SKILL.md\n```",
    today: "2026-05-11",
  });

  assert.equal(candidate.id, "candidate-repo-review-skill-2026-05-11");
  assert.equal(candidate.proposedToolType, "skill");
  assert.equal(candidate.githubMetadata.stars, 123);
  assert.deepEqual(candidate.detectedFiles, ["README.md", "SKILL.md"]);
  assert.equal(candidate.extractedInstall[0].command, "cp SKILL.md ~/.codex/skills/repo-review/SKILL.md");
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
  assert.equal(candidate.extractedInstall[0].command, "cp skills/context/SKILL.md ~/.codex/skills/context/SKILL.md");
});

test("does not use nested skill docs as install sources for non-skill candidates", () => {
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
  assert.deepEqual(
    candidate.extractedInstall.map((hint) => hint.command || hint.code),
    ["docker compose up"]
  );
  assert.deepEqual(
    candidate.extractedInstall.map((hint) => hint.sourcePath),
    ["README.md"]
  );
});

test("does not use agent instruction files as install sources for non-skill candidates", () => {
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
  assert.deepEqual(
    candidate.extractedInstall.map((hint) => hint.command),
    ["docker compose up -d"]
  );
  assert.deepEqual(
    candidate.extractedInstall.map((hint) => hint.sourcePath),
    ["docs/install/overview.mdx"]
  );
});

test("classifies developer setup commands separately from user install commands", () => {
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
    readme: "# Activepieces\n\nA Model Context Protocol automation platform.",
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

  assert.deepEqual(
    candidate.extractedInstall.map((hint) => ({
      command: hint.command,
      sourcePath: hint.sourcePath,
      audience: hint.audience,
    })),
    [
      {
        command: "npm start",
        sourcePath: "docs/build-pieces/building-pieces/development-setup.mdx",
        audience: "developer_setup",
      },
      {
        command: "git clone --depth=1 https://github.com/YOUR_USERNAME/activepieces.git",
        sourcePath: "docs/build-pieces/building-pieces/setup-fork.mdx",
        audience: "developer_setup",
      },
      {
        command: "docker compose up -d",
        sourcePath: "docs/install/overview.mdx",
        audience: "verified_install",
      },
    ]
  );
});

test("prioritizes public install docs over agent instruction files when selecting evidence", () => {
  const selected = selectEvidenceFiles([
    { path: "README.md", size: 90_000 },
    { path: ".agents/features/agents.md", size: 3_000 },
    { path: ".agents/skills/tool/SKILL.md", size: 3_000 },
    { path: ".cursor/rules/dev.mdc", size: 3_000 },
    { path: "AGENTS.md", size: 2_000 },
    { path: "CLAUDE.md", size: 2_000 },
    { path: "docs/install/overview.mdx", size: 8_000 },
    { path: "docs/getting-started/quickstart.mdx", size: 8_000 },
    { path: "docs/mcp/configuration.mdx", size: 8_000 },
  ]);

  assert.deepEqual(selected.slice(0, 4).map((file) => file.path), [
    "README.md",
    "docs/getting-started/quickstart.mdx",
    "docs/install/overview.mdx",
    "docs/mcp/configuration.mdx",
  ]);
});

test("slugifies names for candidate ids", () => {
  assert.equal(slugify("Repo Review Skill!"), "repo-review-skill");
});
