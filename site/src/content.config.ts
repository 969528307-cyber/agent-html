import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "zod";

const statusSchema = z.enum(["draft", "published", "archived"]);

const toolTypeSchema = z.enum(["skill", "mcp", "cli", "workflow", "agent-app", "agent-framework", "sdk", "knowledge-resource", "single-tool"]);
const capabilityTypeSchema = z.enum([
  "mcp",
  "skill",
  "cli",
  "workflow",
  "agent-framework",
  "agent-app",
  "sdk",
  "knowledge-resource",
  "single-tool",
]);
const scopeSchema = z.enum([
  "single-tool",
  "tool-server",
  "skill-collection",
  "framework",
  "platform",
  "app",
  "sdk-library",
  "awesome-list",
  "tutorial",
  "boilerplate",
  "template",
  "example",
]);
const useCategorySchema = z.enum([
  "search",
  "docs",
  "browser",
  "data",
  "database",
  "devops",
  "security",
  "communication",
  "productivity",
  "media",
  "coding",
  "testing",
  "monitoring",
  "automation",
  "research",
  "memory",
  "design",
  "translation",
]);
const classificationScoresSchema = z.object({
  mcp: z.number().default(0),
  skill: z.number().default(0),
  cli: z.number().default(0),
  workflow: z.number().default(0),
  "agent-framework": z.number().default(0),
  "agent-app": z.number().default(0),
  sdk: z.number().default(0),
  "knowledge-resource": z.number().default(0),
});

const contentStepSchema = z.object({
  title: z.string(),
  body: z.string(),
  command: z.string().optional(),
  code: z.string().optional(),
  codeLanguage: z.string().default("bash"),
  sourcePath: z.string().optional(),
  audience: z.enum(["verified_install", "developer_setup", "configuration", "needs_review"]).optional(),
});

const agentSetupSchema = z.object({
  agent: z.string(),
  summary: z.string(),
  steps: z.array(contentStepSchema).default([]),
});

const agentContentBlockSchema = z.object({
  title: z.string(),
  body: z.string(),
});

const agentExtensionSchema = z.object({
  label: z.string(),
  status: z.enum(["native", "supported", "partial", "not_supported", "unknown"]),
  body: z.string(),
  sourceUrl: z.url().optional(),
});

const agentStackSchema = z.object({
  title: z.string(),
  body: z.string(),
  toolIds: z.array(z.string()).default([]),
});

const agentSourceSchema = z.object({
  label: z.string(),
  url: z.url(),
  kind: z.enum(["official", "docs", "github", "quickstart", "release", "community"]).default("official"),
});

const officialLinkSchema = z.object({
  label: z.string(),
  url: z.url(),
  kind: z.enum(["website", "github", "docs", "quickstart", "releases", "source"]).default("source"),
});

const toolCandidateProfileSchema = z.object({
  capabilityType: capabilityTypeSchema,
  scope: scopeSchema,
  useCategory: z.array(useCategorySchema).default([]),
  confidence: z.enum(["high", "medium", "low"]),
  scores: classificationScoresSchema.optional(),
  notes: z.array(z.string()).default([]),
  alternatives: z.array(capabilityTypeSchema).default([]),
  routingDecision: z.enum(["auto_publish", "review_required", "auto_reject"]),
});

const enrichmentDecisionSchema = z.enum([
  "ready_to_publish",
  "needs_editor_review",
  "reject_not_tool",
  "reject_low_signal",
  "route_to_learn",
  "route_to_signal",
]);

const enrichmentSchema = z.object({
  decision: enrichmentDecisionSchema,
  confidence: z.enum(["high", "medium", "low"]),
  publishType: z.enum(["tool", "agent", "learn", "signal", "none"]),
  primaryType: z.string(),
  whatIsIt: z.string(),
  helpsWith: z.array(z.string()).default([]),
  reasons: z.array(z.string()).default([]),
  riskNotes: z.array(z.string()).default([]),
});

const agentCandidateProfileSchema = z.object({
  region: z.enum(["global", "china"]).optional(),
  vendor: z.string().optional(),
  interfaceType: z.array(z.enum(["ide", "cli", "web", "api", "enterprise"])).default([]),
  supportsMcp: z.boolean().default(false),
  supportsSkills: z.boolean().default(false),
  supportsCli: z.boolean().default(false),
  supportsWorkflows: z.boolean().default(false),
  sourceKinds: z.array(z.string()).default([]),
  officialLinks: z.array(agentSourceSchema).default([]),
});

const learnCandidateProfileSchema = z.object({
  topic: z.enum(["mcp", "skill", "agent", "workflow", "glossary"]).optional(),
  path: z.enum(["start", "use-case", "agent-deep-dive", "trust"]).optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  readingTime: z.string().optional(),
  relatedTools: z.array(z.string()).default([]),
  relatedAgents: z.array(z.string()).default([]),
});

const signalCandidateProfileSchema = z.object({
  sourceName: z.string().optional(),
  originalPublishedAt: z.string().optional(),
  permissionStatus: z.enum([
    "full_translation_allowed",
    "author_submitted",
    "open_license",
    "not_allowed",
    "unknown",
  ]).optional(),
  translationMode: z.enum(["full_english_translation", "summary_only", "source_link_only"]).default("full_english_translation"),
  relatedTools: z.array(z.string()).default([]),
  relatedAgents: z.array(z.string()).default([]),
  relatedLearn: z.array(z.string()).default([]),
});

const githubMetadataSchema = z.object({
  owner: z.string().optional(),
  repo: z.string().optional(),
  fullName: z.string().optional(),
  stars: z.number().default(0),
  license: z.string().optional(),
  topics: z.array(z.string()).default([]),
  defaultBranch: z.string().optional(),
  lastPushedAt: z.string().optional(),
});

const reviewScoreSchema = z.object({
  sourceTrust: z.number().min(1).max(5),
  usefulness: z.number().min(1).max(5),
  agentRelevance: z.number().min(1).max(5),
  verifiability: z.number().min(1).max(5),
  freshness: z.number().min(1).max(5),
  editorialValue: z.number().min(1).max(5),
  permission: z.number().min(1).max(5),
});

const sourceRegistrySchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  trustLevel: z.string(),
  refreshInterval: z.string(),
  url: z.string(),
  acceptRules: z.array(z.string()).default([]),
  rejectRules: z.array(z.string()).default([]),
});

const tools = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/tools" }),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    type: toolTypeSchema,
    status: statusSchema.default("published"),
    summary: z.string(),
    description: z.string(),
    category: z.array(z.string()),
    compatibleAgents: z.array(z.string()),
    officialLinks: z.array(officialLinkSchema).default([]),
    installCommand: z.string().optional(),
    installSummary: z.string().optional(),
    installSteps: z.array(contentStepSchema).default([]),
    agentSetups: z.array(agentSetupSchema).default([]),
    primaryUseCases: z.array(z.string()).default([]),
    highlights: z.array(z.string()).default([]),
    configuration: z.array(contentStepSchema).default([]),
    verificationSteps: z.array(contentStepSchema).default([]),
    troubleshooting: z.array(contentStepSchema).default([]),
    securityNotes: z.array(z.string()).default([]),
    limitations: z.array(z.string()).default([]),
    maintenanceNotes: z.array(z.string()).default([]),
    configNotes: z.string().optional(),
    usageExample: z.string().optional(),
    verification: z.string().optional(),
    requirements: z.array(z.string()).default([]),
    sourceUrl: z.url(),
    repoUrl: z.url().optional(),
    license: z.string().optional(),
    stars: z.number().optional(),
    lastUpdated: z.string().optional(),
    lastChecked: z.string(),
    publishedAt: z.string(),
    featured: z.boolean().default(false),
    trendingScore: z.number().default(0),
    relatedLearn: z.array(z.string()).default([]),
    relatedSignals: z.array(z.string()).default([]),
    relatedTools: z.array(z.string()).default([]),
  }),
});

const agents = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/agents" }),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    status: statusSchema.default("published"),
    region: z.enum(["global", "china"]),
    vendor: z.string().optional(),
    summary: z.string(),
    overview: z.string().optional(),
    bestFor: z.array(z.string()),
    strengths: z.array(agentContentBlockSchema).default([]),
    extensionModel: z.array(agentExtensionSchema).default([]),
    recommendedStacks: z.array(agentStackSchema).default([]),
    limitations: z.array(z.string()).default([]),
    sources: z.array(agentSourceSchema).default([]),
    interfaceType: z.array(z.enum(["ide", "cli", "web", "api", "enterprise"])),
    documentationUrl: z.url(),
    englishDocsUrl: z.url().optional(),
    supportsMcp: z.boolean().default(false),
    supportsSkills: z.boolean().default(false),
    supportsCli: z.boolean().default(false),
    supportsWorkflows: z.boolean().default(false),
    toolTypes: z.object({
      skills: z.number().default(0),
      mcps: z.number().default(0),
      cli: z.number().default(0),
      workflows: z.number().default(0),
    }),
    relatedLearn: z.array(z.string()).default([]),
    lastChecked: z.string(),
  }),
});

const learn = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/learn" }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    status: statusSchema.default("published"),
    topic: z.enum(["mcp", "skill", "agent", "workflow", "glossary"]),
    path: z.enum(["start", "use-case", "agent-deep-dive", "trust"]).default("start"),
    order: z.number().default(100),
    difficulty: z.enum(["beginner", "intermediate", "advanced"]),
    readingTime: z.string(),
    summaryBullets: z.array(z.string()).default([]),
    coreIdea: z.string().optional(),
    useWhen: z.array(z.string()).default([]),
    avoidWhen: z.array(z.string()).default([]),
    checklist: z.array(z.object({ label: z.string(), body: z.string() })).default([]),
    examples: z
      .array(
        z.object({
          title: z.string(),
          body: z.string(),
          toolIds: z.array(z.string()).default([]),
          agentIds: z.array(z.string()).default([]),
        }),
      )
      .default([]),
    mistakes: z.array(z.string()).default([]),
    nextStep: z.string().optional(),
    relatedTools: z.array(z.string()).default([]),
    relatedAgents: z.array(z.string()).default([]),
    nextReads: z.array(z.string()).default([]),
    publishedAt: z.string(),
  }),
});

const signals = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/signals" }),
  schema: z.object({
    englishTitle: z.string(),
    originalTitle: z.string(),
    status: statusSchema.default("published"),
    sourceName: z.string(),
    sourceUrl: z.url(),
    author: z.string().optional(),
    originalPublishedAt: z.string().optional(),
    permissionStatus: z.enum([
      "full_translation_allowed",
      "author_submitted",
      "open_license",
      "not_allowed",
      "unknown",
    ]),
    executiveSummary: z.string(),
    signalThesis: z.string().optional(),
    whyItMatters: z.string(),
    keyTakeaways: z.array(z.string()).default([]),
    ecosystemImpact: z.array(z.object({ label: z.string(), body: z.string() })).default([]),
    whatToWatchNext: z.array(z.string()).default([]),
    relatedTools: z.array(z.string()).default([]),
    relatedAgents: z.array(z.string()).default([]),
    relatedLearn: z.array(z.string()).default([]),
    publishedAt: z.string(),
  }),
});

const candidates = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/candidates" }),
  schema: z.object({
    id: z.string(),
    type: z.enum(["tool", "signal", "learn", "agent"]),
    status: z.enum(["candidate", "reviewing", "approved", "published", "rejected", "archived"]),
    title: z.string(),
    sourceUrl: z.url(),
    sourceName: z.string().optional(),
    sourceRegistryId: z.string().optional(),
    sourceRegistry: sourceRegistrySchema.optional(),
    author: z.string().optional(),
    discoveredAt: z.string(),
    lastChecked: z.string().optional(),
    discoveredFrom: z.enum(["manual", "github", "rss", "social", "submission", "directory"]),
    summary: z.string(),
    proposedCategory: z.array(z.string()).optional(),
    proposedAgents: z.array(z.string()).optional(),
    proposedToolType: toolTypeSchema.optional(),
    crawlerProfile: z.enum(["mcp", "skill", "cli", "workflow"]).optional(),
    toolProfile: toolCandidateProfileSchema.optional(),
    agentProfile: agentCandidateProfileSchema.optional(),
    learnProfile: learnCandidateProfileSchema.optional(),
    signalProfile: signalCandidateProfileSchema.optional(),
    capabilityType: capabilityTypeSchema.optional(),
    scope: scopeSchema.optional(),
    useCategory: z.array(useCategorySchema).default([]),
    classificationConfidence: z.enum(["high", "medium", "low"]).optional(),
    classificationScores: classificationScoresSchema.optional(),
    classificationNotes: z.array(z.string()).default([]),
    classificationAlternatives: z.array(capabilityTypeSchema).default([]),
    routingDecision: z.enum(["auto_publish", "review_required", "auto_reject"]).optional(),
    enrichmentDecision: enrichmentDecisionSchema.optional(),
    enrichment: enrichmentSchema.optional(),
    githubMetadata: githubMetadataSchema.optional(),
    detectedFiles: z.array(z.string()).default([]),
    readmeExtract: z.string().optional(),
    skillExtracts: z.array(z.object({ path: z.string(), extract: z.string() })).default([]),
    extractedInstall: z.array(contentStepSchema).default([]),
    extractedSignals: z.array(z.string()).default([]),
    permissionStatus: z
      .enum(["full_translation_allowed", "author_submitted", "open_license", "not_allowed", "unknown"])
      .optional(),
    reviewScore: reviewScoreSchema,
    reviewNotes: z.string(),
    publishReason: z.string().optional(),
    reviewedBy: z.string().optional(),
    reviewedAt: z.string().optional(),
    publishedAs: z.string().optional(),
    publishedAt: z.string().optional(),
  }),
});

export const collections = {
  tools,
  agents,
  learn,
  signals,
  candidates,
};
