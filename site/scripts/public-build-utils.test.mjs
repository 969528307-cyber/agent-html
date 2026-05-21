import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { assertPublicDistSafe, cleanPublicDist } from "./public-build-utils.mjs";

const makeTempDist = async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "agentkit-public-dist-"));
  await fs.mkdir(path.join(root, "internal", "candidates"), { recursive: true });
  await fs.mkdir(path.join(root, "tools"), { recursive: true });
  await fs.writeFile(path.join(root, "internal", "index.html"), "internal");
  await fs.writeFile(path.join(root, "internal", "candidates", "index.html"), "candidates");
  await fs.writeFile(path.join(root, "tools", "index.html"), "public tools");
  return root;
};

test("cleanPublicDist removes internal pages while keeping public pages", async () => {
  const dist = await makeTempDist();

  await cleanPublicDist(dist);

  await assert.rejects(() => fs.access(path.join(dist, "internal")));
  assert.equal(await fs.readFile(path.join(dist, "tools", "index.html"), "utf8"), "public tools");
});

test("assertPublicDistSafe fails when internal pages remain", async () => {
  const dist = await makeTempDist();

  await assert.rejects(
    () => assertPublicDistSafe(dist),
    /Forbidden public build output remains/,
  );
});
