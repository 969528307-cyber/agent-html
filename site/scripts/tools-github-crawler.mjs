import { pathToFileURL } from "node:url";

import "./load-local-env.mjs";
import { buildToolProfile } from "./tool-profile.mjs";
import { upsertCandidate } from "./dedupe-utils.mjs";
import { enrichCandidate } from "./enrich-candidate.mjs";
import {
  assertRepoIsFresh,
  assertRepoMeetsStarFloor,
  fetchRepoCandidate,
  formatGitHubSearchDate,
  getRepoFreshnessCutoffDate,
  MIN_GITHUB_STARS,
} from "./github-ingest-candidate.mjs";
import { loadSourcesByType, sourceRegistryRef } from "./source-registry.mjs";

// ── Config ──────────────────────────────────────────────────────────
const MIN_STARS = MIN_GITHUB_STARS;
const MAX_ITEMS_TOTAL = 80;

const githubApiHeaders = {
  Accept: "application/vnd.github+json",
  "User-Agent": "agentk-it-tools-crawler",
  ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
};

const titleCase = (value) => value.charAt(0).toUpperCase() + value.slice(1);

const loadFunctionalCategories = async () => {
  const [source] = await loadSourcesByType("tools", "github_search");
  if (!source) throw new Error("No enabled github_search source found for tools.");
  const categories = Object.fromEntries(
    Object.entries(source.config?.categories || {}).map(([key, queries]) => [
      key,
      {
        label: titleCase(key),
        queries,
        defaultCategory: [key],
        sourceRegistry: sourceRegistryRef(source),
      },
    ])
  );

  if (Object.keys(categories).length === 0) {
    throw new Error(`Tool source ${source.id} must define config.categories.`);
  }

  return categories;
};

// ── GitHub API ──────────────────────────────────────────────────────

const fetchJson = async (url) => {
  const response = await fetch(url, { headers: githubApiHeaders });
  if (!response.ok) {
    throw new Error(`GitHub API ${response.status}: ${url}`);
  }
  return response.json();
};

const normalizeSearchQuery = (query) =>
  query
    .replace(/\s+stars:[<>]=?\d+/gi, "")
    .replace(/\s+fork:(true|false)/gi, "")
    .replace(/\s+archived:(true|false)/gi, "")
    .trim();

const searchRepositories = async (query, perPage = 10) => {
  const pushedSince = formatGitHubSearchDate(getRepoFreshnessCutoffDate());
  const safeQuery = `${normalizeSearchQuery(query)} stars:>=${MIN_STARS} pushed:>=${pushedSince} fork:false archived:false`;
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(safeQuery)}&sort=stars&order=desc&per_page=${perPage}`;
  const data = await fetchJson(url);
  return data.items || [];
};

const fetchRepoDetails = async (owner, repo) => {
  return fetchJson(`https://api.github.com/repos/${owner}/${repo}`);
};

// ── Main crawl logic ────────────────────────────────────────────────

const dedupe = (items, seen = new Set()) => {
  return items.filter(item => {
    if (!item.full_name || seen.has(item.full_name)) return false;
    seen.add(item.full_name);
    return true;
  });
};

const crawlCategory = async (functionalCategories, categoryKey, limit) => {
  const config = functionalCategories[categoryKey];
  if (!config) throw new Error(`Unknown category: ${categoryKey}`);

  const allItems = [];
  for (const query of config.queries) {
    if (allItems.length >= limit) break;
    try {
      const items = await searchRepositories(query, limit);
      allItems.push(...items);
    } catch (err) {
      console.warn(`  Query failed for "${query}": ${err.message}`);
    }
  }

  return dedupe(allItems).slice(0, limit);
};

const crawlAllCategories = async ({ functionalCategories, limit, dryRun }) => {
  const allCandidates = [];
  const seenRepos = new Set();
  const perCategoryLimit = Math.max(2, Math.ceil((limit || MAX_ITEMS_TOTAL) / Object.keys(functionalCategories).length));

  for (const [key, config] of Object.entries(functionalCategories)) {
    console.log(`\n[${config.label}] Searching...`);
    const repos = await crawlCategory(functionalCategories, key, perCategoryLimit);
    console.log(`  Found ${repos.length} repos`);

    for (const repo of repos) {
      if (seenRepos.has(repo.full_name)) continue;
      if ((repo.stargazers_count || 0) < MIN_STARS) continue;
      seenRepos.add(repo.full_name);

      try {
        const details = await fetchRepoDetails(repo.owner.login, repo.name);

        if (details.fork || details.archived) continue;
        assertRepoMeetsStarFloor(details);
        assertRepoIsFresh(details);

        const candidate = await fetchRepoCandidate(details.html_url);
        candidate.sourceName = "GitHub (tools crawl)";
        candidate.sourceRegistryId = config.sourceRegistry.id;
        candidate.sourceRegistry = config.sourceRegistry;
        candidate.proposedCategory = functionalCategories[key]?.defaultCategory || [key];
        candidate.reviewNotes = `Discovered by functional category "${key}" crawler (min ${MIN_STARS} stars, current maintenance window). Human review required.`;
        Object.assign(candidate, buildToolProfile(candidate));
        Object.assign(candidate, enrichCandidate(candidate));

        allCandidates.push(candidate);

        if (!dryRun) {
          const result = await upsertCandidate(candidate, { runId: `${candidate.lastChecked}-tools`, module: "tools" });
          console.log(
            `  ✓ ${candidate.title} (${candidate.capabilityType}/${candidate.scope}/${candidate.routingDecision}) ${candidate.githubMetadata.stars}★ → ${result.action} ${result.candidate.id}.json`
          );
        } else {
          console.log(
            `  [DRY RUN] ${candidate.title} (${candidate.capabilityType}/${candidate.scope}/${candidate.routingDecision}) ${candidate.githubMetadata.stars}★`
          );
        }
      } catch (err) {
        console.warn(`  ✗ Skipped ${repo.full_name}: ${err.message}`);
      }
    }

    if (allCandidates.length >= (limit || MAX_ITEMS_TOTAL)) break;
  }

  return allCandidates;
};

// ── CLI ─────────────────────────────────────────────────────────────

const parseArgs = (argv) => {
  const parsed = { dryRun: false, limit: MAX_ITEMS_TOTAL, category: null };

  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--dry-run") {
      parsed.dryRun = true;
    } else if (argv[i] === "--limit" && argv[i + 1]) {
      parsed.limit = Number(argv[i + 1]);
      i++;
    } else if (argv[i] === "--category" && argv[i + 1]) {
      parsed.category = argv[i + 1];
      i++;
    }
  }

  return parsed;
};

const crawlSingleCategory = async ({ functionalCategories, categoryKey, limit, dryRun }) => {
  const config = functionalCategories[categoryKey];
  console.log(`\n[${config.label}] Searching...`);
  const repos = await crawlCategory(functionalCategories, categoryKey, limit);
  console.log(`  Found ${repos.length} repos`);

  const candidates = [];
  for (const repo of repos) {
    if ((repo.stargazers_count || 0) < MIN_STARS) continue;

    try {
      const details = await fetchRepoDetails(repo.owner.login, repo.name);

      if (details.fork || details.archived) continue;
      assertRepoMeetsStarFloor(details);
      assertRepoIsFresh(details);

      const candidate = await fetchRepoCandidate(details.html_url);
      candidate.sourceName = "GitHub (tools crawl)";
      candidate.sourceRegistryId = config.sourceRegistry.id;
      candidate.sourceRegistry = config.sourceRegistry;
      candidate.proposedCategory = functionalCategories[categoryKey]?.defaultCategory || [categoryKey];
      candidate.reviewNotes = `Discovered by functional category "${categoryKey}" crawler (min ${MIN_STARS} stars, current maintenance window). Human review required.`;
      Object.assign(candidate, buildToolProfile(candidate));
      Object.assign(candidate, enrichCandidate(candidate));

      candidates.push(candidate);

      if (!dryRun) {
        const result = await upsertCandidate(candidate, { runId: `${candidate.lastChecked}-tools`, module: "tools" });
        console.log(
          `  ✓ ${candidate.title} (${candidate.capabilityType}/${candidate.scope}/${candidate.routingDecision}) ${candidate.githubMetadata.stars}★ → ${result.action} ${result.candidate.id}.json`
        );
      } else {
        const catLabel = config.label;
        console.log(
          `  [DRY RUN] ${candidate.title} (${candidate.capabilityType}/${candidate.scope}/${candidate.routingDecision}) ${candidate.githubMetadata.stars}★ [${catLabel}]`
        );
      }
    } catch (err) {
      console.warn(`  ✗ Skipped ${repo.full_name}: ${err.message}`);
    }
  }

  return candidates;
};

const runCli = async () => {
  const args = parseArgs(process.argv.slice(2));
  const functionalCategories = await loadFunctionalCategories();

  if (args.category && !functionalCategories[args.category]) {
    throw new Error(`Unknown category "${args.category}". Available: ${Object.keys(functionalCategories).join(", ")}`);
  }

  console.log(`Tools GitHub Crawler (min ${MIN_STARS} stars, ${args.limit} item limit)`);
  console.log(`Mode: ${args.dryRun ? "DRY RUN" : "WRITE"}`);

  if (args.category) {
    const candidates = await crawlSingleCategory({ functionalCategories, categoryKey: args.category, limit: args.limit, dryRun: args.dryRun });
    console.log(`\n── Done: ${candidates.length} candidates in "${functionalCategories[args.category].label}" ──`);
  } else {
    const candidates = await crawlAllCategories({ functionalCategories, limit: args.limit, dryRun: args.dryRun });
    console.log(`\n── Done: ${candidates.length} candidates across ${Object.keys(functionalCategories).length} categories ──`);
  }
};

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCli().catch(err => {
    console.error(err.message);
    process.exit(1);
  });
}
