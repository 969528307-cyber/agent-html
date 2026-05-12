import fs from "node:fs/promises";
import { pathToFileURL } from "node:url";

import "./load-local-env.mjs";

const root = new URL("..", import.meta.url);

const githubApiHeaders = {
  Accept: "application/vnd.github+json",
  "User-Agent": "agentk-it-ingest",
  ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
};

export const MIN_GITHUB_STARS = 1000;
export const MAX_EVIDENCE_FILE_SIZE = 300_000;
export const MAX_EVIDENCE_FILES = 40;
export const MAX_EXTRA_EVIDENCE_DOCS = 8;
export const README_PREFIX_LIMIT = 12_000;

const evidenceTerms = [
  "install",
  "setup",
  "configuration",
  "config",
  "usage",
  "getting started",
  "mcp",
  "mcpservers",
  "model context protocol",
  "skill",
  "agent",
  "workflow",
  "prompt",
  "instruction",
  "rule",
  "agents.md",
  "claude.md",
  "cursor rules",
  "codex",
  "claude code",
  "qwen",
  "openclaw",
];

export const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const parseGitHubUrl = (url) => {
  const parsed = new URL(url);
  if (parsed.hostname !== "github.com") {
    throw new Error("Expected a github.com URL.");
  }

  const [owner, repo] = parsed.pathname.split("/").filter(Boolean);
  if (!owner || !repo) {
    throw new Error("GitHub URL must include owner and repo.");
  }

  return { owner, repo: repo.replace(/\.git$/, "") };
};

const includesAny = (text, terms) => terms.some((term) => text.includes(term));

const normalizeFileEntry = (entry) => (typeof entry === "string" ? { path: entry, size: 0 } : entry);

const isEvidenceFilePath = (path) => {
  if (/^readme(\.[\w-]+)?$/i.test(path) || /^readme\./i.test(path)) return true;
  if (/(^|\/)skill\.md$/i.test(path)) return true;
  if (/(^|\/)(agents|claude)\.md$/i.test(path)) return true;
  if (/^\.cursor\//i.test(path)) return true;
  if (/^(package\.json|pyproject\.toml)$/i.test(path)) return true;
  if (/^docs\//i.test(path) && /(getting-started|quickstart|install|setup|config|configuration|usage|mcp|agent|cursor|claude|codex|qwen|workflow|skill)/i.test(path)) {
    return true;
  }
  if (/^examples\//i.test(path) && /(config|mcp|agent|skill|workflow|cursor|claude|codex|qwen).*\.(md|mdx|json|toml|yaml|yml)$/i.test(path)) {
    return true;
  }
  return false;
};

export const selectEvidenceFiles = (entries) =>
  entries
    .map(normalizeFileEntry)
    .filter((entry) => entry.path && entry.size <= MAX_EVIDENCE_FILE_SIZE && isEvidenceFilePath(entry.path))
    .slice(0, MAX_EVIDENCE_FILES);

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const extractRelevantWindows = (content, { radius = 1200, maxWindows = 8 } = {}) => {
  if (!content) return [];

  const lower = content.toLowerCase();
  const matches = [];
  for (const term of evidenceTerms) {
    const pattern = new RegExp(escapeRegex(term), "gi");
    for (const match of lower.matchAll(pattern)) {
      matches.push(match.index ?? 0);
    }
  }

  const windows = [];
  const seenStarts = [];
  for (const index of matches.sort((a, b) => a - b)) {
    const start = Math.max(0, index - radius);
    if (seenStarts.some((seen) => Math.abs(seen - start) < radius)) continue;
    const end = Math.min(content.length, index + radius);
    const prefix = start > 0 ? "..." : "";
    const suffix = end < content.length ? "..." : "";
    windows.push(`${prefix}${content.slice(start, end).trim()}${suffix}`);
    seenStarts.push(start);
    if (windows.length >= maxWindows) break;
  }

  return windows;
};

export const assertRepoMeetsStarFloor = (repo) => {
  const stars = repo.stargazers_count || 0;
  if (stars < MIN_GITHUB_STARS) {
    throw new Error(
      `Repository ${repo.full_name || repo.html_url || repo.name || "unknown"} has ${stars} GitHub stars; minimum is ${MIN_GITHUB_STARS}.`
    );
  }
};

export const detectToolType = ({ topics = [], files = [], readme = "" }) => {
  const topicText = topics.join(" ").toLowerCase();
  const fileText = files.join(" ").toLowerCase();
  const readmeText = readme.toLowerCase();

  if (
    includesAny(topicText, ["mcp", "mcp-server", "model-context-protocol"]) ||
    includesAny(readmeText, ["model context protocol", "mcp server", "\"mcpservers\"", "mcpservers"])
  ) {
    return "mcp";
  }

  if (
    includesAny(topicText, ["agent-skill", "skill", "codex-skill", "claude-skill"]) ||
    includesAny(fileText, ["skill.md", "skills/"]) ||
    includesAny(readmeText, ["agent skill", "codex skill", "claude skill", "skill.md"])
  ) {
    return "skill";
  }

  if (includesAny(fileText, ["package.json", "pyproject.toml", "bin/"]) && includesAny(readmeText, [" cli", "command line", "terminal"])) {
    return "cli";
  }

  return "workflow";
};

const codeFencePattern = /```(\w+)?\n([\s\S]*?)```/g;

export const extractInstallHints = (readme) => {
  const hints = [];
  const installWindowPattern = /(install|setup|configuration|usage|mcp|skill)[\s\S]{0,1800}/gi;
  const windows = [...readme.matchAll(installWindowPattern)].map((match) => match[0]);
  const searchText = windows.length > 0 ? windows.join("\n\n") : readme.slice(0, 5000);

  for (const match of searchText.matchAll(codeFencePattern)) {
    const language = match[1] || "text";
    const code = match[2].trim();
    if (!code) continue;

    const firstLine = code.split("\n").find((line) => line.trim() && !line.trim().startsWith("#"))?.trim();
    const looksCommand = /^(npx|npm|pnpm|yarn|pip|uv|brew|cargo|go install|git clone|cp|mkdir|claude|codex|qwen|code)\b/.test(firstLine || "");
    const looksConfig = /mcpServers|servers|command|args|SKILL\.md|CLAUDE\.md|AGENTS\.md|Cursor Rules/i.test(code);

    if (!looksCommand && !looksConfig) continue;

    hints.push({
      title: looksCommand ? "Install command" : "Configuration snippet",
      body: "Extracted from the repository README. Review before publishing.",
      ...(looksCommand ? { command: firstLine } : { code, codeLanguage: language }),
    });
  }

  return hints.slice(0, 6);
};

const detectAgents = ({ readme = "", files = [] }) => {
  const text = `${readme}\n${files.join("\n")}`.toLowerCase();
  const agents = [];
  const checks = [
    ["Codex", ["codex", "agents.md", ".codex"]],
    ["Claude Code", ["claude code", "claude.md", ".claude"]],
    ["Cursor", ["cursor", ".cursor", "cursor rules"]],
    ["Qwen Code", ["qwen", ".qwen"]],
    ["Hermes Agent", ["hermes"]],
    ["Generic", ["skill.md", "mcpservers", "model context protocol"]],
  ];

  for (const [agent, terms] of checks) {
    if (terms.some((term) => text.includes(term))) agents.push(agent);
  }

  return [...new Set(agents)];
};

const categorize = ({ type, topics = [], readme = "" }) => {
  const text = `${topics.join(" ")} ${readme}`.toLowerCase();
  const categories = new Set([type]);

  if (/\b(code review|pull request|pr review|code quality)\b/.test(text)) categories.add("code-review");
  if (/\b(browser automation|playwright|screenshot|ui verification)\b/.test(text)) categories.add("browser");
  if (/\b(docs|documentation|api reference|code documentation)\b/.test(text)) categories.add("docs");
  if (/\b(search api|web search|search tool)\b/.test(text)) categories.add("search");
  if (/\b(workflow|automation)\b/.test(text)) categories.add("workflow");
  if (/\b(test automation|testing tool|qa)\b/.test(text)) categories.add("testing");
  if (categories.size === 1) categories.add("developer-tools");

  return [...categories];
};

const scoreRepo = ({ repo, readme, files, type }) => ({
  sourceTrust: repo.full_name ? 4 : 3,
  usefulness: readme.length > 1000 ? 4 : 3,
  agentRelevance: type === "skill" || type === "mcp" ? 5 : 3,
  verifiability: extractInstallHints(readme).length > 0 || files.includes("SKILL.md") ? 4 : 2,
  freshness: repo.pushed_at ? 4 : 3,
  editorialValue: repo.stargazers_count >= 100 ? 4 : 3,
  permission: repo.license?.spdx_id ? 4 : 2,
});

const summarizeReadme = (readme) =>
  readme
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#*_>`-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 420);

const summarizeSource = (content) => summarizeReadme(content).slice(0, 520);

export const buildCandidateFromRepo = ({ repo, files = [], readme = "", skillDocs = [], evidenceDocs = [], today }) => {
  const skillText = skillDocs.map((doc) => doc.content).join("\n\n");
  const evidenceText = evidenceDocs.map((doc) => doc.content).join("\n\n");
  const combinedText = `${readme}\n\n${skillText}\n\n${evidenceText}`;
  const type = detectToolType({ topics: repo.topics || [], files, readme: combinedText });
  const title = repo.name
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
  const extractedInstall = extractInstallHints(combinedText);
  const proposedAgents = detectAgents({ readme: combinedText, files });
  const proposedCategory = categorize({ type, topics: repo.topics || [], readme: combinedText });
  const summary = repo.description || summarizeReadme(combinedText) || `GitHub ${type} candidate from ${repo.full_name}.`;

  return {
    id: `candidate-${slugify(repo.name)}-${today}`,
    type: "tool",
    status: "candidate",
    title,
    sourceUrl: repo.html_url,
    sourceName: "GitHub",
    author: repo.owner?.login,
    discoveredAt: today,
    lastChecked: today,
    discoveredFrom: "github",
    summary,
    proposedCategory,
    proposedAgents,
    proposedToolType: type,
    githubMetadata: {
      owner: repo.owner?.login,
      repo: repo.name,
      fullName: repo.full_name,
      stars: repo.stargazers_count || 0,
      license: repo.license?.spdx_id,
      topics: repo.topics || [],
      defaultBranch: repo.default_branch,
      lastPushedAt: repo.pushed_at,
    },
    detectedFiles: files,
    readmeExtract: summarizeReadme(readme),
    skillExtracts: skillDocs.map((doc) => ({
      path: doc.path,
      extract: summarizeSource(doc.content),
    })),
    extractedInstall,
    extractedSignals: [
      ...(files.includes("SKILL.md") ? ["Found root SKILL.md"] : []),
      ...(files.some((file) => file.toLowerCase().includes("skill")) ? ["Repository includes skill-related files"] : []),
      ...(readme.toLowerCase().includes("model context protocol") ? ["README mentions Model Context Protocol"] : []),
    ],
    reviewScore: scoreRepo({ repo, readme: combinedText, files, type }),
    reviewNotes: "Generated from GitHub metadata and README. Human review required before publishing.",
    publishReason: summary,
  };
};

const fetchJson = async (url) => {
  const response = await fetch(url, { headers: githubApiHeaders });
  if (!response.ok) {
    throw new Error(`GitHub request failed ${response.status}: ${url}`);
  }
  return response.json();
};

const decodeBase64 = (value) => Buffer.from(value.replace(/\n/g, ""), "base64").toString("utf8");

const fetchReadme = async ({ owner, repo }) => {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, { headers: githubApiHeaders });
  if (!response.ok) return "";
  const data = await response.json();
  return data.encoding === "base64" && data.content ? decodeBase64(data.content) : "";
};

const fetchRepoFile = async ({ owner, repo, path }) => {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path).replaceAll("%2F", "/")}`, {
    headers: githubApiHeaders,
  });
  if (!response.ok) return "";
  const data = await response.json();
  return data.encoding === "base64" && data.content ? decodeBase64(data.content) : "";
};

export const fetchRepoCandidate = async (githubUrl) => {
  const { owner, repo } = parseGitHubUrl(githubUrl);
  const repoData = await fetchJson(`https://api.github.com/repos/${owner}/${repo}`);
  assertRepoMeetsStarFloor(repoData);

  const tree = await fetchJson(`https://api.github.com/repos/${owner}/${repo}/git/trees/${repoData.default_branch}?recursive=1`);
  const evidenceFiles = selectEvidenceFiles(
    tree.tree
    .filter((entry) => entry.type === "blob")
      .map((entry) => ({ path: entry.path, size: entry.size || 0 }))
  );
  const files = evidenceFiles.map((file) => file.path);

  const readme = await fetchReadme({ owner, repo });
  const skillDocs = [];
  const skillFiles = files.filter((file) => /(^|\/)SKILL\.md$/i.test(file)).slice(0, 6);
  const evidenceDocs = [];
  const extraEvidenceFiles = files
    .filter((file) => !/(^README|(^|\/)SKILL\.md$)/i.test(file))
    .slice(0, MAX_EXTRA_EVIDENCE_DOCS);

  for (const file of skillFiles) {
    const content = await fetchRepoFile({ owner, repo, path: file });
    if (content) skillDocs.push({ path: file, content });
  }

  for (const file of extraEvidenceFiles) {
    const content = await fetchRepoFile({ owner, repo, path: file });
    const windows = extractRelevantWindows(content, { radius: 1200, maxWindows: 4 });
    if (windows.length > 0) evidenceDocs.push({ path: file, content: windows.join("\n\n") });
  }

  const readmeEvidence = [
    readme.slice(0, README_PREFIX_LIMIT),
    ...extractRelevantWindows(readme, { radius: 1200, maxWindows: 8 }),
  ].join("\n\n");
  const today = new Date().toISOString().slice(0, 10);

  return buildCandidateFromRepo({ repo: repoData, files, readme: readmeEvidence, skillDocs, evidenceDocs, today });
};

export const writeJson = async (relativePath, data) => {
  const file = new URL(relativePath, root);
  await fs.mkdir(new URL(".", file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(data, null, 2)}\n`);
};

const runCli = async () => {
  const githubUrl = process.argv[2];
  if (!githubUrl) {
    console.error("Usage: npm run ingest:github -- <github-repo-url> [--dry-run]");
    process.exit(1);
  }

  const dryRun = process.argv.includes("--dry-run");
  const candidate = await fetchRepoCandidate(githubUrl);

  if (dryRun) {
    console.log(JSON.stringify(candidate, null, 2));
    return;
  }

  await writeJson(`src/content/candidates/${candidate.id}.json`, candidate);
  console.log(`Created candidate: src/content/candidates/${candidate.id}.json`);
};

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCli().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
