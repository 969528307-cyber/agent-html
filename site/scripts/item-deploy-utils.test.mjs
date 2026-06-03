import assert from "node:assert/strict";
import test from "node:test";
import { changedItemDeployPaths } from "./item-deploy-utils.mjs";

const allItemPaths = [
  "item/alpha/index.html",
  "item/beta/index.html",
  "item/camel/index.html",
];

test("maps changed published tool content files to item pages", () => {
  assert.deepEqual(
    changedItemDeployPaths(
      [
        "site/src/content/tools/camel.json",
        "site/src/content/tools/beta.json",
        "site/src/content/tools/camel.json",
      ],
      allItemPaths,
    ),
    ["item/beta/index.html", "item/camel/index.html"],
  );
});

test("ignores non-tool content changes for item deploys", () => {
  assert.deepEqual(
    changedItemDeployPaths(
      [
        "site/src/content/candidates/candidate-tool-github-example.json",
        "site/src/content/learn/what-is-mcp.mdx",
        "docs/superpowers/plans/example.md",
      ],
      allItemPaths,
    ),
    [],
  );
});

test("falls back to all item pages when item rendering code changes", () => {
  assert.deepEqual(
    changedItemDeployPaths(["site/src/pages/item/[id].astro"], allItemPaths),
    allItemPaths,
  );
});
