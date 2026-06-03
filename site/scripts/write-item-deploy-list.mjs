import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { changedItemDeployPaths, listDistItemPaths, runGitDiffNameOnly } from "./item-deploy-utils.mjs";

const siteRoot = fileURLToPath(new URL("..", import.meta.url));
const repoRoot = path.resolve(siteRoot, "..");
const distDir = path.join(siteRoot, "dist");
const outputPath = path.join(distDir, "item-deploy-list.txt");

const allItemPaths = await listDistItemPaths(distDir);

let changedFiles;
try {
  changedFiles = await runGitDiffNameOnly(repoRoot);
} catch (error) {
  console.warn(`Could not compute git diff for item deploy list; falling back to all item pages. ${error.message}`);
  changedFiles = ["site/src/pages/item/[id].astro"];
}

const itemPaths = changedItemDeployPaths(changedFiles, allItemPaths);
await fs.writeFile(outputPath, `${itemPaths.join("\n")}${itemPaths.length > 0 ? "\n" : ""}`);

console.log(`Wrote ${itemPaths.length} item deploy path(s) to ${path.relative(siteRoot, outputPath)}.`);
