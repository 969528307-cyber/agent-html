#!/usr/bin/env node
/**
 * arxiv-signal-generator.mjs
 *
 * Daily arXiv crawler for agent/tool ecosystem signals.
 * Queries arXiv for recent papers, filters for relevance,
 * generates structured signal MDX via DeepSeek API.
 *
 * Usage:
 *   node scripts/arxiv-signal-generator.mjs [--days 3] [--dry-run]
 */

import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import "./load-local-env.mjs";

// ─── Config ────────────────────────────────────────────────────────────────

const ARXIV_API = "https://export.arxiv.org/api/query";
const DEEPSEEK_API = "https://api.deepseek.com/v1/chat/completions";
const DEEPSEEK_MODEL = "deepseek-chat";

const SIGNALS_DIR = path.join(process.cwd(), "src/content/signals");

// Search queries: topic-specific to catch relevant papers
const SEARCH_QUERIES = [
  // Agent ecosystem
  'all:"autonomous agent" AND (all:framework OR all:tool)',
  'all:"agent framework" AND (all:LLM OR all:language model)',
  'all:"multi-agent" AND (all:collaboration OR all:orchestration)',
  // MCP & tool use
  'all:"Model Context Protocol" OR all:"MCP protocol"',
  'all:"tool use" AND (all:LLM OR all:agent) AND all:security',
  'all:"tool calling" AND (all:training OR all:benchmark)',
  // Agent security & safety
  'all:"agent security" OR all:"LLM security" AND all:tool',
  'all:"prompt injection" AND all:agent',
  'all:"agent safety" OR all:"agent alignment"',
  // Agent evaluation
  'all:"agent benchmark" OR all:"agent evaluation"',
  'all:"code agent" OR all:"coding agent"',
  // Skills & workflows
  'all:"agent skill" OR all:"reusable agent"',
  'all:"agent workflow" OR all:"agent pipeline"',
];

// Categories that are relevant (cs.* only)
const RELEVANT_CATEGORIES = [
  "cs.AI", "cs.LG", "cs.CL", "cs.SE", "cs.CR",
  "cs.MA", "cs.HC", "cs.IR", "cs.DC", "cs.PL",
];

// Keywords in title that boost relevance
const BOOST_KEYWORDS = [
  "mcp", "model context protocol", "tool use", "tool calling",
  "agent", "autonomous", "framework", "multi-agent",
  "skill", "workflow", "orchestration", "security",
  "code generation", "software engineering",
];

// ─── arXiv API Client ──────────────────────────────────────────────────────

function parseArxivXml(xml) {
  const entries = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;
  while ((match = entryRegex.exec(xml)) !== null) {
    const entryXml = match[1];
    const id = (entryXml.match(/<id>(.*?)<\/id>/) || [])[1] || "";
    const title = (entryXml.match(/<title>(.*?)<\/title>/) || [])[1] || "";
    const summary = (entryXml.match(/<summary>([\s\S]*?)<\/summary>/) || [])[1] || "";
    const published = (entryXml.match(/<published>(.*?)<\/published>/) || [])[1] || "";
    const primaryCat = (entryXml.match(/<arxiv:primary_category term="([^"]+)"/) || [])[1] || "";
    const categories = [...entryXml.matchAll(/<category term="([^"]+)"/g)].map(m => m[1]);
    const authors = [...entryXml.matchAll(/<name>([\s\S]*?)<\/name>/g)].map(m => m[1].trim());

    // Clean HTML entities
    const clean = (s) => s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/\s+/g, " ").trim();

    entries.push({
      id: id.replace("http://arxiv.org/abs/", ""),
      title: clean(title),
      summary: clean(summary),
      published,
      primaryCategory: primaryCat,
      categories,
      authors,
      arxivUrl: id,
    });
  }
  return entries;
}

async function searchArxiv(query, maxResults = 30) {
  const url = `${ARXIV_API}?search_query=${encodeURIComponent(query)}&start=0&max_results=${maxResults}&sortBy=submittedDate&sortOrder=descending`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`arXiv API ${res.status}: ${await res.text()}`);
  const xml = await res.text();
  return parseArxivXml(xml);
}

// ─── Relevance Filtering ───────────────────────────────────────────────────

function isRelevantCategory(categories) {
  return categories.some(c => RELEVANT_CATEGORIES.includes(c));
}

function computeRelevanceScore(entry) {
  let score = 0;
  const title = entry.title.toLowerCase();
  const summary = entry.summary.toLowerCase();

  // Category relevance
  if (isRelevantCategory(entry.categories)) score += 10;
  if (entry.categories.includes("cs.AI") || entry.categories.includes("cs.LG")) score += 5;

  // Boost keywords in title
  for (const kw of BOOST_KEYWORDS) {
    if (title.includes(kw)) score += 15;
  }

  // Boost keywords in summary
  for (const kw of BOOST_KEYWORDS) {
    if (summary.includes(kw)) score += 5;
  }

  // Penalize unrelated
  if (summary.includes("protein") || summary.includes("medical") || summary.includes("chemistry")) score -= 20;
  if (summary.includes("biology") || summary.includes("physics") || summary.includes("material")) score -= 15;

  return score;
}

// ─── Existing Signal Check ─────────────────────────────────────────────────

async function getExistingSignalSlugs() {
  const files = await fs.readdir(SIGNALS_DIR);
  return new Set(files.filter(f => f.endsWith(".mdx")).map(f => f.replace(/\.mdx$/, "")));
}

async function isAlreadyCovered(entry) {
  const slugs = await getExistingSignalSlugs();
  // Check by arXiv ID in sourceUrl
  for (const slug of slugs) {
    try {
      const content = await fs.readFile(path.join(SIGNALS_DIR, `${slug}.mdx`), "utf8");
      if (content.includes(entry.id) || content.includes(entry.title.slice(0, 40))) {
        return true;
      }
    } catch { /* skip unreadable */ }
  }
  return false;
}

// ─── LLM Signal Generation ─────────────────────────────────────────────────

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

async function generateSignalContent(entry) {
  const arxivId = entry.id;
  const title = entry.title;
  const authors = entry.authors.join(", ");
  const summary = entry.summary;
  const published = entry.published.slice(0, 10);
  const arxivUrl = `https://arxiv.org/abs/${arxivId}`;
  const topic = inferTopic(title, summary);

  // Map to valid schema topics
  const validTopics = ["mcp", "skill", "agent", "workflow", "glossary"];

  const prompt = `You are a research analyst for To Play Claw, a directory of AI agent tools and frameworks.

Generate a structured signal article in YAML frontmatter + markdown format about this arXiv paper.

Paper details:
- Title: ${title}
- Authors: ${authors}
- Published: ${published}
- Abstract: ${summary}

The signal must be in this exact format:

---
englishTitle: "English headline (max 80 chars)"
originalTitle: "Original paper title"
subtitle: "One-line subtitle explaining significance"
status: "published"
topic: "${validTopics.includes(topic) ? topic : 'agent'}",
path: "start"
order: 1
difficulty: "intermediate"
readingTime: "3 min"
summaryBullets:
  - "Key finding 1"
  - "Key finding 2"  
  - "Key finding 3"
  - "Key finding 4"
relatedTools: []
relatedAgents: []
nextReads: []
sourceName: "arXiv"
sourceUrl: "${arxivUrl}"
author: "${authors.split(',')[0].trim()}"
permissionStatus: "open_license"
originalPublishedAt: "${published}"
executiveSummary: "2-3 sentence executive summary"
signalThesis: "One-line thesis about what this means for the AI agent ecosystem"
whyItMatters: "Why this matters for To Play Claw users and the agent tool ecosystem"
keyTakeaways:
  - "Takeaway 1"
  - "Takeaway 2"
  - "Takeaway 3"
ecosystemImpact:
  - label: "For Researchers"
    body: "Impact on research direction"
  - label: "For Developers"
    body: "Impact on development practice"
  - label: "For Users"
    body: "Impact on end users"
whatToWatchNext:
  - "Future direction to watch"
publishedAt: "${new Date().toISOString().slice(0, 10)}"
---

## Summary

Key findings and context (2-3 paragraphs of markdown).

## Key Contributions

- Bullet list of main contributions

## Implications

### For Researchers
...

### For Developers  
...

### For Users
...

## References

- ${arxivUrl}
`;

  const res = await fetch(DEEPSEEK_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2048,
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DeepSeek API ${res.status}: ${err}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty LLM response");

  return content;
}

function inferTopic(title, summary) {
  const text = (title + " " + summary).toLowerCase();
  if (text.includes("mcp") || text.includes("model context protocol")) return "mcp";
  if (text.includes("security") || text.includes("injection") || text.includes("vulnerability")) return "mcp";
  if (text.includes("benchmark") || text.includes("evaluation")) return "agent";
  if (text.includes("agent") || text.includes("autonomous")) return "agent";
  if (text.includes("skill") || text.includes("workflow")) return "workflow";
  if (text.includes("tool")) return "mcp";
  return "agent";
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const days = Number(args.find(a => a.startsWith("--days="))?.split("=")[1] || 3);
  const dryRun = args.includes("--dry-run");

  console.log(`[arxiv-signal-generator] Scanning arXiv (last ${days} days)...`);
  if (dryRun) console.log("[arxiv-signal-generator] DRY RUN — no files will be written");

  // Collect all papers from all queries
  const allPapers = new Map(); // keyed by arXiv ID
  for (const query of SEARCH_QUERIES) {
    try {
      console.log(`  Query: ${query.slice(0, 60)}...`);
      const papers = await searchArxiv(query, 15);
      for (const p of papers) {
        if (!allPapers.has(p.id)) {
          allPapers.set(p.id, p);
        }
      }
    } catch (err) {
      console.error(`  Query failed: ${err.message}`);
    }
  }

  console.log(`\n  Total unique papers found: ${allPapers.size}`);

  // Filter by relevance
  const scored = [...allPapers.values()]
    .map(p => ({ ...p, score: computeRelevanceScore(p) }))
    .filter(p => p.score >= 15) // minimum relevance threshold
    .sort((a, b) => b.score - a.score);

  console.log(`  Relevant papers (score >= 15): ${scored.length}`);

  if (scored.length === 0) {
    console.log("[arxiv-signal-generator] No relevant papers found. Done.");
    return;
  }

  // Show top candidates
  console.log("\n  Top candidates:");
  for (const p of scored.slice(0, 20)) {
    console.log(`    [${p.score}] ${p.title.slice(0, 80)}`);
  }

  // Check existing coverage and generate
  let generated = 0;
  const existingSlugs = await getExistingSignalSlugs();
  console.log(`\n  Existing signals: ${existingSlugs.size}`);

  for (const entry of scored) {
    if (generated >= 3) {
      console.log("  Reached max 3 new signals per run. Stopping.");
      break;
    }

    const covered = await isAlreadyCovered(entry);
    if (covered) {
      console.log(`  SKIP (already covered): ${entry.title.slice(0, 60)}`);
      continue;
    }

    console.log(`\n  GENERATING: ${entry.title}`);

    if (dryRun) {
      console.log(`  [DRY RUN] Would generate signal for: ${entry.id}`);
      generated++;
      continue;
    }

    try {
      const content = await generateSignalContent(entry);
      const slug = slugify(entry.title);
      const filePath = path.join(SIGNALS_DIR, `${slug}.mdx`);

      await fs.writeFile(filePath, content, "utf8");
      console.log(`  ✓ Wrote: ${slug}.mdx`);
      generated++;
    } catch (err) {
      console.error(`  ✗ Failed to generate: ${err.message}`);
    }
  }

  console.log(`\n[arxiv-signal-generator] Done. Generated ${generated} new signal(s).`);
}

main().catch(err => {
  console.error(`[arxiv-signal-generator] Fatal: ${err.message}`);
  process.exit(1);
});
