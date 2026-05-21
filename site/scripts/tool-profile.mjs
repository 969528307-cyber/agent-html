/**
 * Minimal tool profile builder. Replaces classify-candidate.mjs.
 * Topic determines type. Scope detects non-publishable repos.
 * useCategory for frontend filtering. Routing is stars + scope.
 */

const capabilityTypeNames = new Set([
  "mcp", "skill", "cli", "workflow",
  "agent-app", "agent-framework", "sdk",
  "knowledge-resource", "single-tool",
]);

const rejectScopes = new Set(["tutorial", "boilerplate", "template", "example", "awesome-list"]);

const validUseCategories = new Set([
  "search", "docs", "browser", "data", "database",
  "devops", "security", "communication", "productivity",
  "media", "coding", "testing", "monitoring", "automation",
  "research", "memory", "design", "translation",
]);

const unique = (items) => [...new Set(items.filter(Boolean))];

const detectScope = ({ text, repoName }) => {
  const t = text.toLowerCase();
  const r = repoName.toLowerCase();
  if (/\bawesome\b/.test(r) || /\bawesome list|curated list|collection of awesome\b/.test(t)) return "awesome-list";
  if (/\btutorial|course|learn\b/.test(r) || /\btutorial|course|learning path|for beginners\b/.test(t)) return "tutorial";
  if (/\bboilerplate|starter\b/.test(r) || /\bboilerplate|starter kit\b/.test(t)) return "boilerplate";
  if (/\btemplate\b/.test(r) || /\btemplate\b/.test(t)) return "template";
  if (/\bexample|sample\b/.test(r) || /\bexample project|sample project\b/.test(t)) return "example";
  return "single-tool";
};

const detectUseCategories = ({ text, topics, proposedCategory }) => {
  const combined = `${topics.join(" ")} ${proposedCategory.join(" ")} ${text}`;
  const checks = [
    ["search", /\b(search|web search|crawler|scrap|crawl|retrieval)\b/i],
    ["docs", /\b(docs|documentation|readme|knowledge base)\b/i],
    ["browser", /\b(browser|playwright|web automation|screenshot)\b/i],
    ["data", /\b(data|dataset|analytics|storage|warehouse)\b/i],
    ["database", /\b(database|postgres|mysql|mongodb|sql|sqlite|bigquery)\b/i],
    ["devops", /\b(kubernetes|docker|deployment|infrastructure|cloud|ci\/cd|devops)\b/i],
    ["security", /\b(security|vulnerability|auth|compliance|guard|pentest)\b/i],
    ["communication", /\b(slack|telegram|email|messaging|notification|linkedin|workspace)\b/i],
    ["productivity", /\b(todo|calendar|task|notes|project management)\b/i],
    ["media", /\b(image|video|audio|media|generation)\b/i],
    ["coding", /\b(code|coding|developer|programming|repository|review)\b/i],
    ["testing", /\b(test|testing|qa|e2e|playwright)\b/i],
    ["monitoring", /\b(monitoring|observability|logs|metrics|alert)\b/i],
    ["automation", /\b(automation|workflow|orchestration|trigger|pipeline)\b/i],
    ["research", /\b(research|rag|paper|benchmark|deep research)\b/i],
    ["memory", /\b(memory|remember|personalization)\b/i],
    ["design", /\b(design|ui|figma|component)\b/i],
    ["translation", /\b(translation|translate|localization)\b/i],
  ];

  return unique([...proposedCategory, ...checks.filter(([, pattern]) => pattern.test(combined)).map(([category]) => category)])
    .filter((cat) => validUseCategories.has(cat));
};

export const buildToolProfile = (candidate) => {
  const github = candidate.githubMetadata || {};
  const repoName = `${github.repo || candidate.title || ""}`.toLowerCase();
  const topics = github.topics || [];
  const proposedCategory = candidate.proposedCategory || [];
  const stars = github.stars || 0;

  // Type = topic category (or keep existing for non-topic candidates)
  const capabilityType = (proposedCategory.length > 0 && capabilityTypeNames.has(proposedCategory[0]))
    ? proposedCategory[0]
    : (candidate.capabilityType || candidate.toolProfile?.capabilityType || "single-tool");

  const text = [candidate.title, candidate.summary, candidate.readmeExtract]
    .filter(Boolean).join(" ").toLowerCase();

  const scope = detectScope({ text, repoName });
  const useCategory = detectUseCategories({ text, topics, proposedCategory });
  const confidence = stars >= 1000 ? "high" : stars >= 700 ? "medium" : "low";

  // Routing
  let routingDecision = "review_required";
  if (rejectScopes.has(scope)) routingDecision = "auto_reject";
  else if (stars >= 700 && confidence !== "low") routingDecision = "auto_publish";

  const toolProfile = { capabilityType, scope, useCategory, confidence, routingDecision, scores: {}, notes: [] };

  return { toolProfile, capabilityType, scope, useCategory, classificationConfidence: confidence, routingDecision };
};
