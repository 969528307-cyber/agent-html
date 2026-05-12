import { pathToFileURL } from "node:url";

import "./load-local-env.mjs";
import { fetchRepoCandidate, MIN_GITHUB_STARS, writeJson } from "./github-ingest-candidate.mjs";

const githubApiHeaders = {
  Accept: "application/vnd.github+json",
  "User-Agent": "agentk-it-discover",
  ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
};

const defaultDiscoveryTerms = [
  "mcp",
  "model context protocol",
  "ai coding",
  "coding agent",
  "developer agent",
  "llm tools",
  "cursor rules",
  "claude code",
  "codex",
  "agents.md",
  "workflow automation",
  "developer workflow",
  "openclaw",
];

const quoteTerm = (term) => (/\s/.test(term) ? `"${term}"` : term);

export const buildDiscoveryQueries = (terms = defaultDiscoveryTerms) =>
  terms.map((term) => `${quoteTerm(term)} stars:>=${MIN_GITHUB_STARS} fork:false archived:false`);

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
    }
  }

  if (!Number.isInteger(parsed.limit) || parsed.limit < 1) {
    throw new Error("--limit must be a positive integer.");
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

const runCli = async () => {
  const args = parseDiscoverArgs(process.argv.slice(2));
  const queries = buildDiscoveryQueries(args.queries.length > 0 ? args.queries : defaultDiscoveryTerms);
  const repos = await discoverRepositories({ queries, limit: args.limit });
  const candidates = [];

  for (const repo of repos) {
    try {
      const candidate = await fetchRepoCandidate(repo.html_url);
      candidates.push(candidate);

      if (!args.dryRun) {
        await writeJson(`src/content/candidates/${candidate.id}.json`, candidate);
        console.log(`Created candidate: src/content/candidates/${candidate.id}.json`);
      }
    } catch (error) {
      console.error(`Skipped ${repo.full_name}: ${error.message}`);
    }
  }

  if (args.dryRun) {
    console.log(
      JSON.stringify(
        candidates.map((candidate) => ({
          id: candidate.id,
          title: candidate.title,
          sourceUrl: candidate.sourceUrl,
          stars: candidate.githubMetadata.stars,
          proposedToolType: candidate.proposedToolType,
          proposedAgents: candidate.proposedAgents,
          detectedFiles: candidate.detectedFiles,
        })),
        null,
        2
      )
    );
  }

  console.log(`Discovered ${repos.length} repositories; generated ${candidates.length} candidates.`);
};

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCli().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
