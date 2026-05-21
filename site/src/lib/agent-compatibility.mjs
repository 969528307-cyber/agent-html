const normalizeAgentKey = (value = "") =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const agentKeys = (agent) =>
  new Set([agent.id, agent.name, normalizeAgentKey(agent.id), normalizeAgentKey(agent.name)].filter(Boolean));

const typeSupport = {
  mcp: "supportsMcp",
  skill: "supportsSkills",
  cli: "supportsCli",
  workflow: "supportsWorkflows",
};

export const agentMatchesTool = (agent, tool) => {
  // Keyword match: tool's compatibleAgents mentions this agent
  const keys = agentKeys(agent);
  if ((tool.compatibleAgents || []).some((value) => keys.has(value) || keys.has(normalizeAgentKey(value)))) {
    return true;
  }

  // Type match: agent supports the tool's type natively
  const supportFlag = typeSupport[tool.type];
  if (supportFlag && agent[supportFlag] === true) {
    return true;
  }

  return false;
};
