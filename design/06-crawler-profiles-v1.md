# Crawler Profiles v1

## Why this exists

The crawler should not extract every install-looking command from a repository. GitHub repositories contain multiple audiences: end users, package consumers, contributors, internal agents, examples, CI, and release maintainers. The candidate pool must classify the page lane first, then read only the documents that make sense for that lane.

## GitHub documentation baseline

- README is the first public explanation surface for a repository. It should explain what the project does, why it is useful, and how visitors can get started.
- Releases are the user-facing surface for shipping versions, source archives, release notes, and downloadable assets.
- GitHub Packages package pages are expected to include package description, installation, usage, and version information.

Sources:

- https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes
- https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases
- https://docs.github.com/en/packages/learn-github-packages/introduction-to-github-packages

## Page lanes

### MCP

Purpose: Publish MCP servers and MCP-compatible adapters.

Read:

- `README*`
- `docs/**/mcp*`
- `docs/**/model-context-protocol*`
- `docs/**/configuration*`
- `docs/**/install*`
- `examples/**/mcp*.{json,toml,yaml,yml,md,mdx}`
- `package.json` or `pyproject.toml` for package names and CLI entrypoints

Extract:

- MCP server command
- MCP client JSON such as `mcpServers`
- supported clients and agents
- required environment variables
- verification command or smoke test

Do not extract:

- contributor setup
- repo dev server commands
- `AGENTS.md`, `CLAUDE.md`, `.cursor/rules`
- nested `SKILL.md` unless the lane is Skill

### Skill

Purpose: Publish reusable agent skills, rules, prompts, and instruction packs.

Read:

- root or nested `SKILL.md`
- `.claude/skills/**`
- `.codex/skills/**`
- `.agents/skills/**`
- README sections that explicitly mention agent skills

Extract:

- skill purpose and trigger conditions
- supported agents
- install path or copy command
- required companion scripts or assets

Do not extract:

- product deployment commands unless the skill itself requires them

### Workflow

Purpose: Publish automation platforms, templates, repeatable operational flows, and content workflows.

Read:

- `README*`
- `docs/**/quickstart*`
- `docs/**/getting-started*`
- `docs/**/install*`
- `docs/**/configuration*`
- workflow/template docs

Extract:

- workflow purpose
- supported integrations
- deployment or setup if it is for users running the platform
- example automation flow

Label carefully:

- user platform install goes to `verified_install`
- contributor setup, local dev, fork, build-piece, build-plugin, benchmark, and test docs go to `developer_setup`

### CLI

Purpose: Publish command-line tools.

Read:

- `README*`
- package manager metadata
- `docs/**/install*`
- `docs/**/usage*`
- GitHub Releases assets when binaries are distributed through releases

Extract:

- package manager install command
- binary download or release asset hint
- basic usage command
- version check

### Signals

Purpose: Publish translated or editorial content.

Read:

- source article
- author/license/permission metadata
- source date

Extract:

- original title and source
- permission status
- full English translation or commentary summary
- related tools and agents

Do not extract install commands.

## Install hint audience labels

Every extracted install-like block must have an `audience`:

- `verified_install`: A likely end-user install/setup command from README, official install docs, package docs, MCP docs, or release/package metadata.
- `developer_setup`: Contributor, local development, fork, test, benchmark, build-piece, build-plugin, or internal repo setup.
- `configuration`: MCP JSON, agent config, environment variables, or client wiring.
- `needs_review`: Official-looking source but unclear audience.

Only `verified_install` can become public `installSteps`. Other labels stay visible in the candidate pool as evidence, not public install instructions.

## Candidate publish gate

Before one-click publish:

- Reject install hints without `sourcePath` when the candidate has nested skill or agent instruction files.
- Reject non-Skill candidates whose install hint source is `SKILL.md`, `.agents/skills/**`, `AGENTS.md`, `CLAUDE.md`, or `.cursor/**`.
- Publish only `verified_install` into the public page.
- Keep `developer_setup`, `configuration`, and `needs_review` in candidate evidence for human review.

