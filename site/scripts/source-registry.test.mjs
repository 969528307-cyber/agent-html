import assert from "node:assert/strict";
import test from "node:test";

import { loadEnabledSources, loadModuleSources, sourceModules } from "./source-registry.mjs";

test("loads a separate source registry for each public module", async () => {
  assert.deepEqual(sourceModules, ["tools", "agents", "learn", "signals"]);

  for (const module of sourceModules) {
    const sources = await loadModuleSources(module);
    assert.ok(sources.length > 0, `${module} should define at least one source`);
    assert.ok(sources.every((source) => source.module === module), `${module} should not borrow another module's sources`);
    assert.ok(sources.every((source) => source.refreshInterval === "weekly"), `${module} sources should refresh weekly`);
  }
});

test("returns only enabled sources for collectors", async () => {
  const tools = await loadEnabledSources("tools");
  const agents = await loadEnabledSources("agents");
  const learn = await loadEnabledSources("learn");
  const signals = await loadEnabledSources("signals");

  assert.ok(tools.some((source) => source.id === "github-tools-functional-search"));
  assert.ok(agents.some((source) => source.type === "local_content"));
  assert.ok(learn.some((source) => source.type === "local_content"));
  assert.ok(signals.some((source) => source.type === "local_content"));
  assert.ok([...tools, ...agents, ...learn, ...signals].every((source) => source.enabled));
});
