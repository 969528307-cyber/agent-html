import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const repoRoot = path.resolve(import.meta.dirname, "..", "..");
const workflowPath = path.join(repoRoot, ".github", "workflows", "daily-update.yml");

const readDailyWorkflow = () => fs.readFile(workflowPath, "utf8");

test("daily update workflow runs every day at 03:30 Asia/Shanghai", async () => {
  const workflow = await readDailyWorkflow();

  assert.match(workflow, /schedule:/);
  assert.match(workflow, /cron: "30 19 \* \* \*"/);
  assert.match(workflow, /workflow_dispatch:/);
});

test("daily update workflow publishes and pushes only when content changes", async () => {
  const workflow = await readDailyWorkflow();

  assert.match(workflow, /contents: write/);
  assert.match(workflow, /npm run auto:publish/);
  assert.match(workflow, /git diff --quiet/);
  assert.match(workflow, /git commit -m "daily build \$\(TZ=Asia\/Shanghai date \+%F\)"/);
  assert.match(workflow, /git push/);
});

test("daily update workflow dispatches production deploy after committing", async () => {
  const workflow = await readDailyWorkflow();

  assert.match(workflow, /actions: write/);
  assert.match(workflow, /actions\/workflows\/deploy\.yml\/dispatches/);
  assert.match(workflow, /"ref": "main"/);
});
