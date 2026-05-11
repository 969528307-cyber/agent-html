import assert from "node:assert/strict";
import test from "node:test";

import {
  assertRepoMeetsStarFloor,
  buildCandidateFromRepo,
  detectToolType,
  extractInstallHints,
  MIN_GITHUB_STARS,
  parseGitHubUrl,
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

test("slugifies names for candidate ids", () => {
  assert.equal(slugify("Repo Review Skill!"), "repo-review-skill");
});
