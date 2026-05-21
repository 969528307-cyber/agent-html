import fs from "node:fs/promises";
import path from "node:path";

export const sourceModules = ["tools", "agents", "learn", "signals"];

const sourceDir = path.join(process.cwd(), "src/data/sources");

const assertSource = (source, module) => {
  const required = ["id", "module", "name", "type", "url", "trustLevel", "refreshInterval", "enabled"];
  for (const key of required) {
    if (source[key] === undefined || source[key] === "") {
      throw new Error(`Source ${source.id || "unknown"} in ${module}.sources.json is missing ${key}.`);
    }
  }

  if (source.module !== module) {
    throw new Error(`Source ${source.id} belongs to ${source.module}, but was loaded from ${module}.sources.json.`);
  }

  if (source.refreshInterval !== "weekly") {
    throw new Error(`Source ${source.id} must use weekly refresh in v1.`);
  }

  if (!Array.isArray(source.acceptRules) || !Array.isArray(source.rejectRules)) {
    throw new Error(`Source ${source.id} must define acceptRules and rejectRules arrays.`);
  }
};

export const loadModuleSources = async (module) => {
  if (!sourceModules.includes(module)) {
    throw new Error(`Unknown source module "${module}". Expected one of: ${sourceModules.join(", ")}.`);
  }

  const filePath = path.join(sourceDir, `${module}.sources.json`);
  const sources = JSON.parse(await fs.readFile(filePath, "utf8"));
  if (!Array.isArray(sources)) {
    throw new Error(`${module}.sources.json must contain an array.`);
  }

  for (const source of sources) {
    assertSource(source, module);
  }

  return sources;
};

export const loadEnabledSources = async (module) => {
  const sources = await loadModuleSources(module);
  return sources.filter((source) => source.enabled);
};

export const loadSourcesByType = async (module, type) => {
  const sources = await loadEnabledSources(module);
  return sources.filter((source) => source.type === type);
};

export const sourceRegistryRef = (source) => ({
  id: source.id,
  name: source.name,
  type: source.type,
  trustLevel: source.trustLevel,
  refreshInterval: source.refreshInterval,
  url: source.url,
  acceptRules: source.acceptRules || [],
  rejectRules: source.rejectRules || [],
});
