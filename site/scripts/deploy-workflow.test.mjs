import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const repoRoot = path.resolve(import.meta.dirname, "..", "..");
const workflowPath = path.join(repoRoot, ".github", "workflows", "deploy.yml");

const readDeployWorkflow = () => fs.readFile(workflowPath, "utf8");

test("Hostinger tools deploy uploads only the verified FTP path", async () => {
  const workflow = await readDeployWorkflow();

  assert.match(workflow, /tools\/index\.html/);
  assert.doesNotMatch(workflow, /public_html\/tools\/index\.html/);
  assert.doesNotMatch(workflow, /domains\/2playclaw\.com\/public_html\/tools\/index\.html/);
});

test("Hostinger tools deploy retries the full FTP upload operation", async () => {
  const workflow = await readDeployWorkflow();

  assert.match(workflow, /for upload_attempt in 1 2 3 4 5/);
  assert.match(workflow, /Hostinger tools upload attempt \$upload_attempt\/5/);
  assert.match(workflow, /upload_file tools\/index\.html tools\/index\.html/);
});
