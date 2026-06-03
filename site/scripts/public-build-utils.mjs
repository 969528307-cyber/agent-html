import fs from "node:fs/promises";
import path from "node:path";

export const forbiddenPublicOutputPaths = ["internal", "internal-auth", "internal-api", "prototype"];

export const cleanPublicDist = async (distDir) => {
  await Promise.all(
    forbiddenPublicOutputPaths.map((relativePath) =>
      fs.rm(path.join(distDir, relativePath), { recursive: true, force: true }),
    ),
  );
};

export const assertPublicDistSafe = async (distDir) => {
  const remaining = [];

  for (const relativePath of forbiddenPublicOutputPaths) {
    try {
      await fs.access(path.join(distDir, relativePath));
      remaining.push(relativePath);
    } catch {
      // Missing is the safe state for public builds.
    }
  }

  if (remaining.length > 0) {
    throw new Error(`Forbidden public build output remains: ${remaining.join(", ")}`);
  }
};
