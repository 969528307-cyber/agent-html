import assert from "node:assert/strict";
import test from "node:test";

import {
  buildDiscoveryQueries,
  dedupeSearchItems,
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

test("parses discovery CLI flags", () => {
  const args = parseDiscoverArgs(["--limit", "12", "--dry-run", "--query", "agent workflow", "--query", "mcp"]);

  assert.equal(args.limit, 12);
  assert.equal(args.dryRun, true);
  assert.deepEqual(args.queries, ["agent workflow", "mcp"]);
});
