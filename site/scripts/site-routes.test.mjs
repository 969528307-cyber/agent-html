import assert from "node:assert/strict";
import fs from "node:fs/promises";
import test from "node:test";

const exists = async (path) => {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
};

test("defines public routes linked from the homepage and search hero", async () => {
  const requiredRoutes = [
    "src/pages/search.astro",
    "src/pages/category/[category].astro",
    "src/pages/upgrade/index.astro",
    "src/pages/rss.xml.ts",
    "src/pages/sitemap.xml.ts",
  ];

  for (const route of requiredRoutes) {
    assert.equal(await exists(route), true, `${route} should exist`);
  }
});
