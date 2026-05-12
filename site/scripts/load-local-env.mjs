import fs from "node:fs/promises";

const root = new URL("..", import.meta.url);
const envFiles = [".env.local", ".env"];

const stripQuotes = (value) => {
  const trimmed = value.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
};

for (const envFile of envFiles) {
  const file = new URL(envFile, root);
  try {
    const content = await fs.readFile(file, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;

      const [key, ...valueParts] = trimmed.split("=");
      if (!key || process.env[key] !== undefined) continue;
      process.env[key] = stripQuotes(valueParts.join("="));
    }
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}
