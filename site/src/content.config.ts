import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "zod";

const statusSchema = z.enum(["draft", "published", "archived"]);

const toolTypeSchema = z.enum(["skill", "mcp", "cli", "workflow"]);

const contentStepSchema = z.object({
  title: z.string(),
  body: z.string(),
  command: z.string().optional(),
  code: z.string().optional(),
  codeLanguage: z.string().default("bash"),
});

const agentSetupSchema = z.object({
  agent: z.string(),
  summary: z.string(),
  steps: z.array(contentStepSchema).default([]),
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
    bestFor: z.array(z.string()),
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
    difficulty: z.enum(["beginner", "intermediate", "advanced"]),
    readingTime: z.string(),
    relatedTools: z.array(z.string()).default([]),
    relatedAgents: z.array(z.string()).default([]),
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
    whyItMatters: z.string(),
    relatedTools: z.array(z.string()).default([]),
    relatedAgents: z.array(z.string()).default([]),
    relatedLearn: z.array(z.string()).default([]),
    publishedAt: z.string(),
  }),
});

const downloads = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/downloads" }),
  schema: z.object({
    id: z.string(),
    title: z.string(),
    status: statusSchema.default("published"),
    type: z.enum(["cheatsheet", "comparison", "guide"]),
    summary: z.string(),
    fileUrl: z.string(),
    relatedTools: z.array(z.string()).default([]),
    relatedAgents: z.array(z.string()).default([]),
    publishedAt: z.string(),
  }),
});

const candidates = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/candidates" }),
  schema: z.object({
    id: z.string(),
    type: z.enum(["tool", "signal", "learn", "agent", "download"]),
    status: z.enum(["candidate", "reviewing", "approved", "published", "rejected", "archived"]),
    title: z.string(),
    sourceUrl: z.url(),
    sourceName: z.string().optional(),
    author: z.string().optional(),
    discoveredAt: z.string(),
    lastChecked: z.string().optional(),
    discoveredFrom: z.enum(["manual", "github", "rss", "social", "submission", "directory"]),
    summary: z.string(),
    proposedCategory: z.array(z.string()).optional(),
    proposedAgents: z.array(z.string()).optional(),
    proposedToolType: toolTypeSchema.optional(),
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
  }),
});

export const collections = {
  tools,
  agents,
  learn,
  signals,
  downloads,
  candidates,
};
