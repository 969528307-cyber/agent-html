import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

const toolContentPattern = /^(?:site\/)?src\/content\/tools\/([^/]+)\.json$/;
const fullItemDeployPatterns = [
  /^\.github\/workflows\/deploy\.yml$/,
  /^(?:site\/)?scripts\/item-deploy-utils\.mjs$/,
  /^(?:site\/)?scripts\/write-item-deploy-list\.mjs$/,
  /^(?:site\/)?src\/pages\/item\//,
  /^(?:site\/)?src\/content\.config\.ts$/,
];

export const normalizeRepoPath = (filePath) => filePath.replaceAll(path.sep, "/");

export const changedItemDeployPaths = (changedFiles, allItemPaths = []) => {
  const existing = new Set(allItemPaths);
  const normalizedAll = [...existing].sort();

  if (changedFiles.some((file) => fullItemDeployPatterns.some((pattern) => pattern.test(normalizeRepoPath(file))))) {
    return normalizedAll;
  }

  const itemPaths = new Set();

  for (const file of changedFiles) {
    const match = normalizeRepoPath(file).match(toolContentPattern);
    if (!match) continue;

    const itemPath = `item/${match[1]}/index.html`;
    if (existing.size === 0 || existing.has(itemPath)) {
      itemPaths.add(itemPath);
    }
  }

  return [...itemPaths].sort();
};

export const listDistItemPaths = async (distDir) => {
  const itemDir = path.join(distDir, "item");
  const entries = await fs.readdir(itemDir, { withFileTypes: true }).catch((error) => {
    if (error.code === "ENOENT") return [];
    throw error;
  });

  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => `item/${entry.name}/index.html`)
    .sort();
};

export const runGitDiffNameOnly = (cwd, baseRef = "HEAD^", headRef = "HEAD") =>
  new Promise((resolve, reject) => {
    const child = spawn("git", ["diff", "--name-only", baseRef, headRef], {
      cwd,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve(stdout.split(/\r?\n/).filter(Boolean));
      } else {
        reject(new Error(stderr || `git diff exited with ${code}`));
      }
    });
  });
