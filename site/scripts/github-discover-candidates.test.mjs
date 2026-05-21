import assert from "node:assert/strict";
import test from "node:test";

import {
  buildDiscoveryQueries,
  dedupeSearchItems,
  discoveryProfiles,
  getPerQueryLimit,
  parseDiscoverArgs,
  runCli,
} from "./github-discover-candidates.mjs";

test("builds broad discovery queries with the 700 star floor", () => {
  const queries = buildDiscoveryQueries(["mcp", "coding agent"], { pushedSince: "2024-11-12" });

  assert.deepEqual(queries, [
    "mcp stars:>=700 pushed:>=2024-11-12 fork:false archived:false",
    "\"coding agent\" stars:>=700 pushed:>=2024-11-12 fork:false archived:false",
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
  const args = parseDiscoverArgs(["--limit", "12", "--dry-run", "--profile", "mcp", "--query", "agent workflow", "--query", "mcp"]);

  assert.equal(args.limit, 12);
  assert.equal(args.dryRun, true);
  assert.equal(args.profile, "mcp");
  assert.deepEqual(args.queries, ["agent workflow", "mcp"]);
});

test("defines separate discovery profiles by public site category", () => {
  assert.deepEqual(Object.keys(discoveryProfiles), ["mcp", "skill", "cli", "workflow"]);
  assert.ok(discoveryProfiles.mcp.every((term) => /mcp|model context protocol/i.test(term)));
  assert.ok(discoveryProfiles.cli.some((term) => /cli|terminal/i.test(term)));
});

test("rejects unknown discovery profiles", () => {
  assert.throws(() => parseDiscoverArgs(["--profile", "unknown"]), /--profile must be one of/);
});

test("disables the legacy broad GitHub discovery CLI", async () => {
  await assert.rejects(
    () => runCli(),
    /deprecated.*discover:tools/i
  );
});
