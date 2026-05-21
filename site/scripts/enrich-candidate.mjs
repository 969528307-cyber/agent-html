export const enrichmentDecisions = [
  "ready_to_publish",
  "needs_editor_review",
  "reject_not_tool",
  "reject_low_signal",
  "route_to_learn",
  "route_to_signal",
];

const unique = (items) => [...new Set(items.filter(Boolean))];

const textFor = (candidate) =>
  [
    candidate.title,
    candidate.summary,
    candidate.publishReason,
    candidate.readmeExtract,
    ...(candidate.extractedSignals || []),
    ...(candidate.classificationNotes || []),
    ...(candidate.toolProfile?.notes || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

const averageReviewScore = (candidate) => {
  const values = Object.values(candidate.reviewScore || {});
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const inferPrimaryType = (candidate) =>
  candidate.capabilityType ||
  candidate.toolProfile?.capabilityType ||
  candidate.proposedToolType ||
  (candidate.type === "tool" ? "workflow" : candidate.type);

const inferWhatIsIt = ({ candidate, primaryType, scope }) => {
  const scopeLabel = scope && scope !== "single-tool" ? `${scope} ` : "";
  if (primaryType === "workflow") return `${candidate.title} is a ${scopeLabel}workflow automation tool for connecting repeatable agent or app actions.`;
  if (primaryType === "mcp") return `${candidate.title} is an MCP-related ${scopeLabel}tool that exposes external capabilities to agents.`;
  if (primaryType === "skill") return `${candidate.title} is a skill-oriented ${scopeLabel}resource for teaching or extending agent behavior.`;
  if (primaryType === "cli") return `${candidate.title} is a CLI-oriented ${scopeLabel}tool for local developer or agent workflows.`;
  if (primaryType === "agent-framework") return `${candidate.title} is an agent framework for building agentic applications.`;
  if (primaryType === "agent-app") return `${candidate.title} is an agent application or platform for building AI workflows.`;
  if (primaryType === "sdk") return `${candidate.title} is an SDK or library for developers building agent tooling.`;
  return `${candidate.title} is a knowledge resource rather than a single installable tool.`;
};

const inferHelpsWith = (candidate) =>
  unique([
    ...(candidate.useCategory || []).map((category) => `Helps with ${category} workflows.`),
    ...(candidate.proposedCategory || []).map((category) => `Relevant to ${category}.`),
    ...(candidate.extractedSignals || []).slice(0, 3),
  ]).slice(0, 5);

export const enrichCandidate = (candidate) => {
  const primaryType = inferPrimaryType(candidate);
  const scope = candidate.scope || candidate.toolProfile?.scope || "single-tool";
  const confidence = candidate.classificationConfidence || candidate.toolProfile?.confidence || "low";
  const text = textFor(candidate);
  const stars = candidate.githubMetadata?.stars || 0;
  const hasOfficialSource = Boolean(candidate.sourceUrl || candidate.repoUrl);
  const signalCount = candidate.extractedSignals?.length || 0;
  const averageScore = averageReviewScore(candidate);
  const reasons = [];
  const riskNotes = [];
  let decision = "needs_editor_review";
  let publishType = candidate.type;

  if (["tutorial", "awesome-list"].includes(scope) || primaryType === "knowledge-resource") {
    decision = "route_to_learn";
    publishType = "learn";
    reasons.push("This candidate is primarily educational or directory-style content, not a single public tool page.");
  } else if (["boilerplate", "template", "example"].includes(scope)) {
    decision = "reject_not_tool";
    publishType = "none";
    reasons.push("This candidate is a starter, template, or example rather than a durable tool listing.");
  } else if (
    signalCount === 0 &&
    confidence === "low" &&
    (averageScore < 3.2 || (candidate.reviewScore?.verifiability || 0) <= 1 || (candidate.reviewScore?.usefulness || 0) <= 2)
  ) {
    decision = "reject_low_signal";
    publishType = "none";
    reasons.push("The candidate does not expose enough capability evidence for a useful public page.");
  }

  if (/vulnerable|damn vulnerable|exploit|pentest|red team|security lab/.test(text)) {
    decision = "needs_editor_review";
    publishType = candidate.type;
    riskNotes.push("Security or intentionally vulnerable tooling needs explicit editorial review before publication.");
  }

  if (decision === "needs_editor_review") {
    const hasEnoughEvidence = hasOfficialSource && stars >= 700 && signalCount >= 1 && averageScore >= 3.2;
    const clearEnough = ["high", "medium"].includes(confidence);
    const isPublishablePlatform = ["workflow", "mcp", "skill", "cli", "agent-framework", "agent-app", "sdk"].includes(primaryType);

    if (hasEnoughEvidence && clearEnough && isPublishablePlatform && riskNotes.length === 0) {
      decision = "ready_to_publish";
      reasons.push("Source, stars, maintenance, capability evidence, and classification are strong enough for a public page.");
    } else {
      if (!hasOfficialSource) reasons.push("Official source link is missing or unclear.");
      if (stars < 700) reasons.push("GitHub stars are below the configured discovery threshold.");
      if (signalCount < 1) reasons.push("Capability signals are too thin.");
      if (!clearEnough) reasons.push("Classification confidence is not strong enough.");
    }
  }

  if (candidate.type !== "tool" && decision === "ready_to_publish") {
    publishType = candidate.type;
  }

  const enrichment = {
    decision,
    confidence,
    publishType,
    primaryType,
    whatIsIt: inferWhatIsIt({ candidate, primaryType, scope }),
    helpsWith: inferHelpsWith(candidate),
    reasons: unique(reasons),
    riskNotes: unique(riskNotes),
  };

  return {
    enrichmentDecision: decision,
    enrichment,
  };
};
