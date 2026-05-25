#!/usr/bin/env node
/**
 * tools-github-crawler.mjs
 *
 * GitHub search-based tool discovery for agentk.it.
 * Supports incremental discovery: skips repos already in candidates,
 * paginates through results to find genuinely new repos.
 *
 * Usage:
 *   node scripts/tools-github-crawler.mjs
 *   node scripts/tools-github-crawler.mjs --limit 8 --category skill
 *   node scripts/tools-github-crawler.mjs --dry-run
 */

import { pathToFileURL } from "node:url";

import "./load-local-env.mjs";
import { buildToolProfile } from "./tool-profile.mjs";
import { upsertCandidate, loadCandidateRecords } from "./dedupe-utils.mjs";
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
const PER_PAGE = 100; // GitHub max per page
const MAX_PAGES = 10; // Safety limit: don't paginate forever

const githubApiHeaders = {
  Accept: "application/vnd.github+json",
  "User-Agent": "agentk-it-tools-crawler",
  ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
};

const titleCase = (value) => value.charAt(0).toUpperCase() + value.slice(1);

// ── Source config loading ─────────────────────────────────────────────

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

// ── GitHub API helpers ──────────────────────────────────────────────

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

const searchRepositories = async (query, page = 1, perPage = PER_PAGE) => {
  const pushedSince = formatGitHubSearchDate(getRepoFreshnessCutoffDate());
  const safeQuery = `${normalizeSearchQuery(query)} stars:>=${MIN_STARS} pushed:>=${pushedSince} fork:false archived:false`;
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(safeQuery)}&sort=stars&order=desc&per_page=${perPage}&page=${page}`;
  const data = await fetchJson(url);
  return {
    items: data.items || [],
    total: data.total_count || 0,
    incomplete: data.incomplete_results || false,
  };
};

const fetchRepoDetails = async (owner, repo) => {
  return fetchJson(`https://api.github.com/repos/${owner}/${repo}`);
};

// ── Known repos loading ─────────────────────────────────────────────

let _knownRepos = null;

async function loadKnownRepos() {
  if (_knownRepos) return _knownRepos;
  const known = new Set();
  try {
    const records = await loadCandidateRecords();
    for (const r of records) {
      const fullName = r.data.githubMetadata?.fullName;
      if (fullName) known.add(fullName.toLowerCase());
    }
  } catch { /* candidates dir may not exist */ }
  _knownRepos = known;
  return known;
}

// ── Main crawl logic ────────────────────────────────────────────────

const crawlCategory = async (functionalCategories, categoryKey, limit) => {
  const config = functionalCategories[categoryKey];
  if (!config) throw new Error(`Unknown category: ${categoryKey}`);

  const knownRepos = await loadKnownRepos();
  const foundRepos = [];
  const alreadySkipped = [];

  for (const query of config.queries) {
    if (foundRepos.length >= limit) break;

    for (let page = 1; page <= MAX_PAGES; page++) {
      if (foundRepos.length >= limit) break;

      try {
        const result = await searchRepositories(query, page);
        if (result.items.length === 0) break; // No more results

        for (const item of result.items) {
          if (foundRepos.length >= limit) break;

          const fullName = (item.full_name || "").toLowerCase();
          if (knownRepos.has(fullName)) {
            alreadySkipped.push(fullName);
            continue;
          }

          foundRepos.push(item);
          knownRepos.add(fullName); // Prevent duplicates within same run
        }

        // If we got fewer items than per_page, this is the last page
        if (result.items.length < PER_PAGE) break;
      } catch (err) {
        console.warn(`  Query failed for "${query}" (page ${page}): ${err.message}`);
        break;
      }
    }
  }

  console.log(`  Found ${foundRepos.length} new + ${alreadySkipped.length} already known (limit ${limit})`);

  // Process all found repos: fetch full details and upsert as candidates
  const candidates = [];
  for (const item of foundRepos) {
    try {
      const repo = await fetchRepoDetails(item.owner?.login || item.owner, item.name);
      const candidate = buildCandidateFromRepo(repo, config);
      candidates.push(candidate);
    } catch (err) {
      console.warn(`  Skip ${item.full_name}: ${err.message}`);
    }
  }

  return candidates;
};

const crawlAllCategories = async ({ functionalCategories, limit, dryRun }) => {
  const allCandidates = [];
  const perCategoryLimit = Math.max(2, Math.ceil((limit || MAX_ITEMS_TOTAL) / Object.keys(functionalCategories).length));

  for (const [key, config] of Object.entries(functionalCategories)) {
    console.log(`\n[${config.label}] Searching...`);
    console.log(`  Queries: ${config.queries.join(", ")}`);

    const candidates = await crawlCategory(functionalCategories, key, perCategoryLimit);
    allCandidates.push(...candidates);
  }

  console.log(`\n── Done: ${allCandidates.length} new candidates across ${Object.keys(functionalCategories).length} categories ──`);
  return allCandidates;
};

// ── Candidate building ──────────────────────────────────────────────

const buildCandidateFromRepo = (repo, config) => {
  const rawTopics = (repo.topics || []).filter(Boolean);
  const category = [...(config.defaultCategory || [])];

  return {
    type: "tool",
    title: repo.name || repo.full_name,
    summary: (repo.description || "").slice(0, 300),
    sourceUrl: repo.html_url,
    discoveredFrom: "github",
    proposedCategory: category,
    githubMetadata: {
      owner: repo.owner?.login || "",
      repo: repo.name || "",
      fullName: repo.full_name || "",
      stars: repo.stargazers_count || 0,
      license: repo.license?.spdx_id || repo.license?.key || "",
      topics: rawTopics,
      defaultBranch: repo.default_branch || "main",
      lastPushedAt: repo.pushed_at || "",
    },
    // These will be filled by classify/enrich steps
    proposedAgents: [],
    discoveredAt: new Date().toISOString().slice(0, 10),
    lastChecked: new Date().toISOString().slice(0, 10),
    sourceRegistry: config.sourceRegistry,
    sourceRegistryId: config.sourceRegistry?.id,
    classificationConfidence: "medium",
    status: "candidate",
    discoveredAt: new Date().toISOString().slice(0, 10),
    lastChecked: new Date().toISOString().slice(0, 10),
    reviewScore: {
      sourceTrust: 4,
      usefulness: 3,
      agentRelevance: 4,
      verifiability: 4,
      freshness: 3,
      editorialValue: 3,
      permission: 3,
    },
    reviewNotes: "Auto-discovered by GitHub topic crawler. Awaiting classification and enrichment.",
    extractedSignals: [
      repo.description?.slice(0, 200),
      `Topics: ${rawTopics.slice(0, 5).join(", ")}`,
      `GitHub stars: ${repo.stargazers_count || 0}`,
      `Last pushed: ${repo.pushed_at?.slice(0, 10) || "unknown"}`,
    ].filter(Boolean),
  };
};

// ── CLI Entry ───────────────────────────────────────────────────────

const parseArgs = () => {
  const argv = process.argv.slice(2);
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

export const runToolsCrawl = async ({ limit = MAX_ITEMS_TOTAL, dryRun = false, category = null } = {}) => {
  console.log(`Tools GitHub Crawler (min ${MIN_STARS} stars, ${limit} item limit)`);
  console.log(`Mode: ${dryRun ? "DRY RUN" : "WRITE"}`);

  const functionalCategories = await loadFunctionalCategories();
  const categories = category
    ? { [category]: functionalCategories[category] }
    : functionalCategories;

  for (const [key, config] of Object.entries(categories)) {
    if (!config) {
      console.warn(`  Unknown category "${key}", skipping.`);
      continue;
    }

    const candidates = await crawlCategory({ [key]: config }, key, limit);
    if (dryRun) {
      for (const c of candidates) {
        console.log(`  [DRY] Would create candidate for ${c.githubMetadata?.fullName || c.title}`);
      }
    } else {
      for (const c of candidates) {
        try {
          const result = await upsertCandidate(c, { runId: `${c.lastChecked}-${key}`, module: key });
          console.log(`  ${result.action === "created" ? "✓" : "~"} ${c.githubMetadata?.fullName} (${c.githubMetadata?.stars}★) → ${result.action}`);
        } catch (err) {
          console.warn(`  ✗ Failed to save ${c.githubMetadata?.fullName}: ${err.message}`);
        }
      }
    }
  }
};

const main = async () => {
  const args = parseArgs();

  console.log(`Tools GitHub Crawler (min ${MIN_STARS} stars, ${args.limit} item limit)`);
  console.log(`Mode: ${args.dryRun ? "DRY RUN" : "WRITE"}`);

  const functionalCategories = await loadFunctionalCategories();

  if (args.category) {
    const config = functionalCategories[args.category];
    if (!config) {
      console.error(`Unknown category: ${args.category}. Available: ${Object.keys(functionalCategories).join(", ")}`);
      process.exit(1);
    }
    console.log(`\n[${config.label}] Searching...`);

    const candidates = await crawlCategory({ [args.category]: config }, args.category, args.limit);

    if (args.dryRun) {
      for (const c of candidates) {
        console.log(`  [DRY] ${c.githubMetadata?.fullName} (${c.githubMetadata?.stars}★)`);
      }
    } else {
      let created = 0, updated = 0;
      for (const c of candidates) {
        try {
          const result = await upsertCandidate(c, { runId: `${c.lastChecked}-${args.category}`, module: args.category });
          console.log(`  ${result.action === "created" ? "✓" : "~"} ${c.githubMetadata?.fullName} (${c.githubMetadata?.stars}★) → ${result.action}`);
          if (result.action === "created") created++;
          else updated++;
        } catch (err) {
          console.warn(`  ✗ ${c.githubMetadata?.fullName}: ${err.message}`);
        }
      }
      console.log(`\n── Done: ${candidates.length} repos (${created} new, ${updated} already known) in "${config.label}" ──`);
    }

  } else {
    const allCandidates = await crawlAllCategories({ functionalCategories, limit: args.limit, dryRun: args.dryRun });

    if (args.dryRun) {
      for (const c of allCandidates) {
        console.log(`  [DRY] ${c.githubMetadata?.fullName} (${c.githubMetadata?.stars}★)`);
      }
    } else {
      let created = 0, updated = 0;
      for (const c of allCandidates) {
        try {
          const result = await upsertCandidate(c, { runId: `${c.lastChecked}-${c.proposedCategory?.[0] || "tool"}`, module: c.proposedCategory?.[0] || "tool" });
          if (result.action === "created") created++;
          else updated++;
        } catch (err) {
          console.warn(`  ✗ ${c.githubMetadata?.fullName}: ${err.message}`);
        }
      }
      console.log(`\n── Done: ${allCandidates.length} repos (${created} new, ${updated} already known) in all categories ──`);
    }
  }
};

main().catch((err) => {
  console.error(`Fatal: ${err.message}`);
  process.exit(1);
});
