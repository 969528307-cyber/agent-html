import { pathToFileURL } from "node:url";

import "./load-local-env.mjs";
import {
  formatGitHubSearchDate,
  getRepoFreshnessCutoffDate,
  MIN_GITHUB_STARS,
} from "./github-ingest-candidate.mjs";

const githubApiHeaders = {
  Accept: "application/vnd.github+json",
  "User-Agent": "2playclaw-discover",
  ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
};

export const discoveryProfiles = {
  mcp: ["mcp server", "model context protocol", "mcp tools", "mcp registry"],
  skill: ["agent skill", "claude skills", "codex skill", "cursor rules", "agents.md"],
  cli: ["coding agent cli", "terminal coding agent", "developer agent cli", "codex", "claude code", "aider", "opencode", "cli coding tool", "command-line agent"],
  workflow: ["workflow automation", "ai workflow automation", "developer workflow", "agent workflow", "n8n alternative"],
};

const defaultDiscoveryTerms = Object.values(discoveryProfiles).flat();

const quoteTerm = (term) => (/\s/.test(term) ? `"${term}"` : term);

export const buildDiscoveryQueries = (terms = defaultDiscoveryTerms, { pushedSince } = {}) => {
  const cutoff = pushedSince || formatGitHubSearchDate(getRepoFreshnessCutoffDate());
  return terms.map((term) => `${quoteTerm(term)} stars:>=${MIN_GITHUB_STARS} pushed:>=${cutoff} fork:false archived:false`);
};

export const dedupeSearchItems = (items) => {
  const seen = new Set();
  return items.filter((item) => {
    if (!item.full_name || seen.has(item.full_name)) return false;
    seen.add(item.full_name);
    return true;
  });
};

export const getPerQueryLimit = ({ limit, queryCount }) => Math.max(2, Math.ceil(limit / Math.max(1, queryCount)));

export const parseDiscoverArgs = (argv) => {
  const parsed = {
    dryRun: false,
    limit: 20,
    profile: "all",
    queries: [],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--dry-run") {
      parsed.dryRun = true;
    } else if (arg === "--limit") {
      parsed.limit = Number(argv[index + 1]);
      index += 1;
    } else if (arg === "--query") {
      parsed.queries.push(argv[index + 1]);
      index += 1;
    } else if (arg === "--profile") {
      parsed.profile = argv[index + 1];
      index += 1;
    }
  }

  if (!Number.isInteger(parsed.limit) || parsed.limit < 1) {
    throw new Error("--limit must be a positive integer.");
  }

  if (parsed.profile !== "all" && !discoveryProfiles[parsed.profile]) {
    throw new Error(`--profile must be one of: all, ${Object.keys(discoveryProfiles).join(", ")}.`);
  }

  return parsed;
};

const fetchJson = async (url) => {
  const response = await fetch(url, { headers: githubApiHeaders });
  if (!response.ok) {
    throw new Error(`GitHub request failed ${response.status}: ${url}`);
  }
  return response.json();
};

export const searchRepositories = async (query, { perPage = 20 } = {}) => {
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=${perPage}`;
  const data = await fetchJson(url);
  return data.items || [];
};

export const discoverRepositories = async ({ queries, limit }) => {
  const found = [];
  const perQueryLimit = getPerQueryLimit({ limit, queryCount: queries.length });

  for (const query of queries) {
    const items = await searchRepositories(query, { perPage: Math.min(50, perQueryLimit) });
    found.push(...items);
  }

  return dedupeSearchItems(found).slice(0, limit);
};

export const runCli = async () => {
  throw new Error(
    "github-discover-candidates.mjs is deprecated because it bypasses source registries. Use npm run discover:tools instead."
  );
};

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCli().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
