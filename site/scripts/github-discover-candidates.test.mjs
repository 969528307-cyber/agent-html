import assert from "node:assert/strict";
import test from "node:test";

import {
  buildDiscoveryQueries,
  dedupeSearchItems,
  getPerQueryLimit,
  parseDiscoverArgs,
} from "./github-discover-candidates.mjs";

test("builds broad discovery queries with the 1000 star floor", () => {
  const queries = buildDiscoveryQueries(["mcp", "coding agent"]);

  assert.deepEqual(queries, [
    "mcp stars:>=1000 fork:false archived:false",
    "\"coding agent\" stars:>=1000 fork:false archived:false",
  ]);
});

test("dedupes GitHub search items by full repository name", () => {
  const items = dedupeSearchItems([
    { full_name: "owner/tool", html_url: "https://github.com/owner/tool" },
    { full_name: "owner/tool", html_url: "https://github.com/owner/tool" },
    { full_name: "other/tool", html_url: "https://github.com/other/tool" },
  ]);

  assert.deepEqual(items.map((item) => item.full_name), ["owner/tool", "other/tool"]);
});

test("splits discovery limits across queries for source diversity", () => {
  assert.equal(getPerQueryLimit({ limit: 20, queryCount: 13 }), 2);
  assert.equal(getPerQueryLimit({ limit: 20, queryCount: 2 }), 10);
});

test("parses discovery CLI flags", () => {
  const args = parseDiscoverArgs(["--limit", "12", "--dry-run", "--query", "agent workflow", "--query", "mcp"]);

  assert.equal(args.limit, 12);
  assert.equal(args.dryRun, true);
  assert.deepEqual(args.queries, ["agent workflow", "mcp"]);
});
