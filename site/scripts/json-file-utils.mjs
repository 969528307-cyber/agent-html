import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const toPath = (file) => (file instanceof URL ? fileURLToPath(file) : file);

export const atomicWriteJsonFile = async (file, data) => {
  const targetPath = toPath(file);
  const tempPath = `${targetPath}.${process.pid}.${Date.now()}.${Math.random().toString(16).slice(2)}.tmp`;
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.writeFile(tempPath, `${JSON.stringify(data, null, 2)}\n`);
  await fs.rename(tempPath, targetPath);
};
