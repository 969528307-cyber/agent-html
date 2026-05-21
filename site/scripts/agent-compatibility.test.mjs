import assert from "node:assert/strict";
import test from "node:test";

import { agentMatchesTool } from "../src/lib/agent-compatibility.mjs";

test("matches tools that store compatible agents as ids or display names", () => {
  const agent = { id: "codex", name: "Codex" };

  assert.equal(agentMatchesTool(agent, { compatibleAgents: ["codex"] }), true);
  assert.equal(agentMatchesTool(agent, { compatibleAgents: ["Codex"] }), true);
  assert.equal(agentMatchesTool(agent, { compatibleAgents: ["claude-code"] }), false);
});
