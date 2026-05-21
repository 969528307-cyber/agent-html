import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { assertPublicDistSafe, cleanPublicDist } from "./public-build-utils.mjs";

const siteRoot = fileURLToPath(new URL("..", import.meta.url));
const distDir = path.join(siteRoot, "dist");

const run = (command, args) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: siteRoot,
      env: process.env,
      stdio: "inherit",
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} ${args.join(" ")} failed with exit code ${code}`));
      }
    });
  });

await run("npm", ["run", "build"]);
await cleanPublicDist(distDir);
await assertPublicDistSafe(distDir);

console.log("Public build ready: dist/ excludes internal review and publishing pages.");
