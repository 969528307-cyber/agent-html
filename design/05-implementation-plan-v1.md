# agentk.it v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build agentk.it v1 as a tool-first AI Agent directory with supporting Learn, Signals, Free downloads, and Agent compatibility pages.

**Architecture:** Use a static-first content architecture. Tools are the core structured data layer; Learn, Signals, Downloads, Agents, and Categories are supporting collections that link back to tools. The current demo in `demo/sitemap-v1-demo.html` defines the approved visual direction: restrained dark theme, clear typography hierarchy, low information density, and tool directory first.

**Tech Stack:** Astro, TypeScript, Astro Content Collections, MDX for long-form content, CSS variables/design tokens, static search index JSON for v1.

---

## 1. 已定方向

### 产品定位

agentk.it 是一个 **AI Agent 工具聚合站**，不是媒体站，也不是单纯 Agent 学习站。

核心内容优先级：

1. `Tools`：核心产品，包含 `Skill`、`MCP`、`CLI`、`Workflow`。
2. `Learn`：解释、教程、对比、决策辅助内容。
3. `Signals`：国内高质量 AI / Agent 内容的英文翻译与编辑化摘要。
4. `Agents`：不是主内容类型，只作为工具兼容性浏览维度和学习专题。
5. `Free / Upgrade`：cheatsheet、comparison、guide 等可下载资源。

### Agent 覆盖范围

v1 的 Agent 兼容页不只覆盖海外主流 Agent，也要覆盖国产 Agent。Agent 仍然不是主内容类型，它们只是工具兼容性维度和学习专题入口。

首批建议覆盖：

- Overseas: `Codex`、`Claude Code`、`Cursor`、`Hermes Agent`、`OpenClaw`、`Generic`
- China: `Qwen Code`、`Kimi CLI / Kimi Agent`、`CodeGeeX`、`Trae`
- Open ecosystem: `OpenClaw`

国产 Agent 页面要额外标注：

- 官方文档来源。
- 是否支持 MCP / Skill / CLI / Workflow。
- 是否偏 IDE、CLI、Web Agent、还是企业研发助手。
- 是否有英文文档，方便国际用户理解。

### 视觉方向

采用当前 demo 的方向：

- 暗色系。
- 简洁、克制、低密度。
- 不做赛博终端风，不做荧光色堆叠。
- 字体层级要明显：Hero 是主标题，Tools 是核心内容，Learn / Signals / Free 是辅助入口。
- 首页不展示过多数据，不做密集 dashboard。

参考风格：

- Loadout：工具目录结构。
- SkillShelf：清爽目录密度。
- Artificial Analysis：研究感和可信度，但不照搬密集数据展示。

---

## 2. v1 路由范围

### MVP 必做

```text
/
/tools
/type/skill
/type/mcp
/item/[id]
/for/[agent]
/learn
/signals
/upgrade
```

### v1.1 补全

```text
/type/cli
/type/workflow
/category/[category]
/search
/learn/what-is-mcp
/learn/what-is-agent-skill
/learn/agent-comparison
/learn/how-to-choose-agent
/learn/glossary
/learn/guide/[slug]
/learn/agent/[agent]
/signals/[slug]
/upgrade/mcp-cheatsheet
/upgrade/hermes-commands
/upgrade/agent-comparison
/changelog
/about
/rss.xml
/sitemap.xml
```

### 内部管理路由

内部路由不进入公开导航，不应该被 `sitemap.xml` 和 RSS 收录。

```text
/internal
/internal/candidates
/internal/candidates/[id]
```

入口规则：

- 公开顶部导航不显示 `Internal`。
- 本地开发时可以直接访问 `/internal`。
- `/internal` 是内部管理首页，提供 `Candidate Pool` 入口。
- `/internal/candidates` 是候选池一级页面。
- 未来如果加登录，`Internal` 只对管理员显示。
- 上线前应通过 `noindex`、robots 或 auth 保护内部页面。

---

## 3. 推荐文件结构

```text
agent-toolkit-site/
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── public/
│   └── favicon.svg
├── src/
│   ├── content/
│   │   ├── config.ts
│   │   ├── candidates/
│   │   │   └── 2026-05-context7.json
│   │   ├── tools/
│   │   │   └── context7.json
│   │   ├── agents/
│   │   │   └── codex.json
│   │   │   └── qwen-code.json
│   │   │   └── kimi-agent.json
│   │   │   └── codegeex.json
│   │   │   └── openclaw.json
│   │   │   └── trae.json
│   │   ├── learn/
│   │   │   └── what-is-mcp.mdx
│   │   ├── signals/
│   │   │   └── example-signal.mdx
│   │   └── downloads/
│   │       └── mcp-cheatsheet.json
│   ├── components/
│   │   ├── SiteHeader.astro
│   │   ├── SiteFooter.astro
│   │   ├── SearchHero.astro
│   │   ├── ToolCard.astro
│   │   ├── ToolListItem.astro
│   │   ├── FilterSidebar.astro
│   │   ├── RouteCard.astro
│   │   ├── ArticleCard.astro
│   │   ├── AgentSummary.astro
│   │   └── DownloadCard.astro
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   └── ArticleLayout.astro
│   ├── lib/
│   │   ├── filters.ts
│   │   ├── search.ts
│   │   ├── slug.ts
│   │   └── tool-relations.ts
│   ├── pages/
│   │   ├── index.astro
│   │   ├── internal/
│   │   │   ├── index.astro
│   │   │   └── candidates/
│   │   │       ├── index.astro
│   │   │       └── [id].astro
│   │   ├── tools/
│   │   │   └── index.astro
│   │   ├── type/
│   │   │   └── [type].astro
│   │   ├── category/
│   │   │   └── [category].astro
│   │   ├── for/
│   │   │   └── [agent].astro
│   │   ├── item/
│   │   │   └── [id].astro
│   │   ├── search.astro
│   │   ├── learn/
│   │   │   ├── index.astro
│   │   │   └── [...slug].astro
│   │   ├── signals/
│   │   │   ├── index.astro
│   │   │   └── [slug].astro
│   │   ├── upgrade/
│   │   │   └── index.astro
│   │   ├── changelog.astro
│   │   └── about.astro
│   └── styles/
│       ├── tokens.css
│       └── global.css
└── design/
    ├── 04-sitemap-v1.md
    └── 05-implementation-plan-v1.md
```

---

## 4. 数据模型

### Tool

```ts
type ToolType = "skill" | "mcp" | "cli" | "workflow";

interface Tool {
  id: string;
  name: string;
  type: ToolType;
  summary: string;
  description: string;
  category: string[];
  compatibleAgents: string[];
  installCommand?: string;
  configNotes?: string;
  usageExample?: string;
  verification?: string;
  requirements: string[];
  sourceUrl: string;
  repoUrl?: string;
  license?: string;
  stars?: number;
  lastUpdated?: string;
  publishedAt: string;
  featured?: boolean;
  trendingScore?: number;
  relatedLearn: string[];
  relatedSignals: string[];
  relatedTools: string[];
}
```

### Agent

```ts
interface AgentProfile {
  id: string;
  name: string;
  region: "global" | "china";
  vendor?: string;
  summary: string;
  bestFor: string[];
  interfaceType: ("ide" | "cli" | "web" | "api" | "enterprise")[];
  documentationUrl: string;
  englishDocsUrl?: string;
  supportsMcp?: boolean;
  supportsSkills?: boolean;
  supportsCli?: boolean;
  supportsWorkflows?: boolean;
  toolTypes: {
    skills: number;
    mcps: number;
    cli: number;
    workflows: number;
  };
  relatedLearn: string[];
}
```

### Learn Article

```ts
interface LearnArticle {
  slug: string;
  title: string;
  subtitle: string;
  topic: "mcp" | "skill" | "agent" | "workflow" | "glossary";
  difficulty: "beginner" | "intermediate" | "advanced";
  readingTime: string;
  relatedTools: string[];
  relatedAgents: string[];
}
```

### Signal

```ts
interface Signal {
  slug: string;
  englishTitle: string;
  originalTitle: string;
  sourceName: string;
  sourceUrl: string;
  author?: string;
  originalPublishedAt?: string;
  permissionStatus: "full_translation_allowed" | "summary_only" | "unknown";
  executiveSummary: string;
  whyItMatters: string;
  relatedTools: string[];
  relatedAgents: string[];
  relatedLearn: string[];
}
```

### Candidate

候选池用于保存“可能值得收录，但还没有审核完成”的资料。正式网页不直接读取 candidate，只有当候选被审核并转换成 `tools`、`signals`、`learn` 或 `downloads` 内容后才会公开显示。

```ts
interface ContentStep {
  title: string;
  body: string;
  command?: string;
  code?: string;
  codeLanguage?: string;
}

type CandidateType = "tool" | "signal" | "learn" | "agent" | "download";

type CandidateStatus =
  | "candidate"
  | "reviewing"
  | "approved"
  | "published"
  | "rejected"
  | "archived";

interface Candidate {
  id: string;
  type: CandidateType;
  status: CandidateStatus;
  title: string;
  sourceUrl: string;
  sourceName?: string;
  author?: string;
  discoveredAt: string;
  lastChecked?: string;
  discoveredFrom: "manual" | "github" | "rss" | "social" | "submission" | "directory";
  summary: string;
  proposedCategory?: string[];
  proposedAgents?: string[];
  proposedToolType?: "skill" | "mcp" | "cli" | "workflow";
  githubMetadata?: {
    owner?: string;
    repo?: string;
    fullName?: string;
    stars: number;
    license?: string;
    topics: string[];
    defaultBranch?: string;
    lastPushedAt?: string;
  };
  detectedFiles?: string[];
  readmeExtract?: string;
  skillExtracts?: { path: string; extract: string }[];
  extractedInstall?: ContentStep[];
  extractedSignals?: string[];
  permissionStatus?: "full_translation_allowed" | "author_submitted" | "open_license" | "not_allowed" | "unknown";
  reviewScore: {
    sourceTrust: number;
    usefulness: number;
    agentRelevance: number;
    verifiability: number;
    freshness: number;
    editorialValue: number;
    permission: number;
  };
  reviewNotes: string;
  publishReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  publishedAs?: string;
}
```

---

## 5. 内容获取流程

### 候选池工作流

所有新资料先进入 `src/content/candidates/`，不直接进入正式内容集合。

实际使用方式：

```text
打开 /internal/candidates
  -> 看到 Tools / Signals / Learn / Agents / Downloads 五个候选列表
  -> 点击某条候选进入详情页
  -> 查看来源、摘要、评分、授权状态、发布预览
  -> 觉得 OK：点击 Approve
  -> 返回 /internal/candidates
  -> 点击这条候选的 Publish
  -> 系统自动生成正式内容文件
  -> 正式网页出现该内容
```

```text
发现资料
  -> 创建 Candidate
  -> status = candidate
  -> 初步去重
  -> status = reviewing
  -> 评分与审核
  -> 是否通过？
      -> 否：status = rejected / archived
      -> 是：status = approved
  -> 转换成正式内容：tools / signals / learn / downloads / agents
  -> status = published
```

正式网页读取规则：

```ts
// 前台页面只读取正式集合，不读取 candidates
tools where status === "published"
signals where status === "published"
learn where status === "published"
downloads where status === "published"
agents where status === "published"
```

候选池文件示例：

```json
{
  "id": "candidate-context7-2026-05",
  "type": "tool",
  "status": "reviewing",
  "title": "Context7",
  "sourceUrl": "https://github.com/upstash/context7",
  "sourceName": "GitHub",
  "discoveredAt": "2026-05-11",
  "lastChecked": "2026-05-11",
  "discoveredFrom": "github",
  "summary": "MCP server for fetching current library documentation.",
  "proposedCategory": ["docs", "developer-tools"],
  "proposedAgents": ["Codex", "Claude Code", "Cursor"],
  "proposedToolType": "mcp",
  "reviewScore": {
    "sourceTrust": 5,
    "usefulness": 5,
    "agentRelevance": 5,
    "verifiability": 4,
    "freshness": 5,
    "editorialValue": 4,
    "permission": 5
  },
  "reviewNotes": "Official repo found. Install command still needs verification.",
  "publishReason": "Useful MCP for grounding coding agents with current docs."
}
```

发布判断：

```text
总分 >= 24 且没有红线问题 -> approved
总分 18-23 -> reviewing，补充资料后再判断
总分 < 18 -> rejected
存在版权、来源不明、安装不可验证、明显营销稿等红线 -> rejected / archived
```

红线问题：

- 找不到原始来源。
- 工具安装方式无法验证。
- Signals 没有完整翻译授权。
- 内容只是营销稿，没有实际 builder value。
- 和 AI Agent / Skill / MCP / CLI / Workflow 弱相关。
- 没法关联到 Tools、Agents、Learn、Signals 中至少一个正式内容对象。

### Tools 获取流程

```text
GitHub / 官方文档 / 包管理器 / 用户提交
  -> Candidate
  -> 去重
  -> 元数据标准化
  -> 类型归类：Skill / MCP / CLI / Workflow
  -> 兼容 Agent 映射
  -> 安装命令验证
  -> 编辑审核
  -> 发布为 Tool 内容集合
```

Skill 和 MCP 应使用同一套 GitHub ingestion，而不是 Skill 只靠手写模板。

GitHub discovery 的原则：

- 关键词只用于发现候选 repo，不用于最终分类。
- 最低门槛是 `1000+ stars`；低于该门槛不读取 README、不进入候选池。
- 发现关键词应保持宽泛，例如 `mcp`、`model context protocol`、`coding agent`、`developer agent`、`llm tools`、`cursor rules`、`claude code`、`codex`、`agents.md`、`workflow automation`、`openclaw`。
- Skill 不按 `claude skill`、`codex skill`、`agent skill` 这类名字细分；是否适配某个 Agent 必须从文档证据判断。
- 批量发现只生成 Candidate，不能直接发布正式页面。

GitHub ingestion 的最小流程：

```text
GitHub Search 或 GitHub repo URL
  -> 宽关键词发现候选 repo
      - 关键词只负责发现，不负责分类
      - Search query 必须包含 stars:>=1000 fork:false archived:false
  -> 读取 repo metadata
      - owner / repo / stars / license / topics / default branch / last pushed
  -> GitHub stars 硬门槛
      - 低于 1000 stars：停止抓取，不进入 Candidate
      - 1000 stars 及以上：继续读取文件树和证据文档
  -> 读取文件树
      - README.md
      - SKILL.md
      - skills/**
      - package.json
      - pyproject.toml
      - .cursor/**
      - CLAUDE.md / AGENTS.md
      - docs/** 中 install / setup / config / usage / mcp / agent / cursor / claude / codex / qwen / workflow 相关文件
      - examples/** 中 config / mcp / agent / skill / workflow 相关文件
  -> 分层读取文档
      - README 只读取开头摘要和关键词附近窗口
      - 长 docs 不整篇进入候选，只抽 install / setup / config / usage / MCP / Agent / Rule 附近窗口
      - SKILL.md / AGENTS.md / CLAUDE.md / .cursor rules 作为高优先级证据
  -> 类型判断
      - 存在可复用 instruction / rule / prompt / workflow package，且用于安装到 Agent 上下文 -> Skill
      - 存在 Model Context Protocol / mcpServers / mcp-server topic -> MCP
      - 有 package bin / CLI 文案 -> CLI
      - 其他 agent 操作流程 -> Workflow
  -> 抽取 install / setup / config / usage code blocks
  -> 识别兼容 Agent
      - Codex: AGENTS.md / .codex / Codex 文案
      - Claude Code: CLAUDE.md / .claude / Claude Code 文案
      - Cursor: .cursor / Cursor Rules / Cursor 文案
      - Qwen Code: .qwen / Qwen 文案
      - Generic: SKILL.md / MCP config / 通用说明
      - Generic 不自动等于适配所有 Agent，需要候选池人工确认
  -> 生成 Candidate
  -> 内部候选池展示 GitHub evidence、README extract、extracted install hints、detected files
  -> 人工审核后发布
```

Skill 需要额外提取：

- `SKILL.md` 正文或 `skills/**/SKILL.md`。
- README 中的 install / setup / usage / trigger section。
- 支持的 Agent 和安装位置：Codex skills、Claude skills、Cursor Rules、AGENTS.md、CLAUDE.md、Hermes/OpenClaw 目录。
- 触发方式：用户如何让 Agent 使用这个 Skill。
- 验证方式：安装后如何确认 Agent 真的调用了这个 Skill。
- 安全边界：这个 Skill 是否会运行 shell、读写文件、调用外部 API。

MCP 需要额外提取：

- `mcpServers` 配置块。
- stdio / HTTP / OAuth / API key 方式。
- Claude Code / Codex / Cursor / Qwen Code 等客户端的差异配置。
- MCP tools 列表和权限风险。

v1 推荐先用脚本半自动维护 30-50 个高质量工具，不急着自动爬全网。脚本负责生成 candidate，人负责审核和发布。

优先来源：

- 官方 MCP server 列表。
- 主流 Agent 官方文档。
- GitHub 1000 stars 以上项目。
- 社区中被反复推荐的工具。
- 自己验证过安装命令的工具。

本地命令：

```bash
cd site
npm run discover:github -- --limit 20 --dry-run
npm run discover:github -- --limit 20
npm run discover:github -- --query "developer agent" --query "mcp" --limit 10 --dry-run
npm run ingest:github -- https://github.com/owner/repo
npm run ingest:github -- https://github.com/owner/repo -- --dry-run
npm run test:ingest
```

### Signals 获取流程

```text
中文白名单来源 / 人工精选 / 投稿
  -> Candidate
  -> 质量评分
  -> 来源与授权检查
  -> 是否允许全文翻译？
      -> 是：发布摘要 + 全文英文翻译
      -> 否：只发布摘要、评论、原文链接，不发布全文翻译
  -> 编辑审核
  -> 发布到 /signals
```

Signals 的原则：

- 不做未经许可的全文翻译发布。
- 可以做英文摘要、评论、引用少量合规片段、链接原文。
- 每篇内容必须说明 `why it matters for builders`。
- 每篇内容必须关联工具、Agent 或 Learn 内容，否则不发布。

---

## 6. 组件分工

### `BaseLayout.astro`

负责全站 HTML 框架、SEO 默认值、全局 header/footer、CSS 引入。

### `SearchHero.astro`

首页 Hero、全局搜索框、类型 tabs。只在首页出现。

### `ToolCard.astro`

首页和推荐区使用的工具卡片。显示：

- 名称
- 类型
- 一句话说明
- 安装命令片段
- Agent 标签

### `ToolListItem.astro`

列表页使用的横向工具结果。显示更多结构化信息，适合 `/tools`、`/type/[type]`、`/for/[agent]`。

### `FilterSidebar.astro`

承载类型、分类、Agent、排序筛选。v1 可以先做静态链接，v1.1 再做客户端交互。

### `ArticleCard.astro`

Learn 和 Signals 的统一内容卡片。

### `AgentSummary.astro`

Agent 页面头部模块，显示 agent 简介、适合人群、工具数量。

---

## 7. 实施任务

### Task 1: 初始化 Astro 项目骨架

**Files:**

- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/styles/tokens.css`
- Create: `src/styles/global.css`

- [ ] Step 1: 初始化 Astro 依赖。

Run:

```bash
npm create astro@latest . -- --template minimal --typescript strict
```

Expected:

```text
Astro project created with package.json, src/, astro.config.mjs
```

- [ ] Step 2: 安装 MDX 支持。

Run:

```bash
npm install @astrojs/mdx
```

- [ ] Step 3: 把当前 demo 的暗色 tokens 迁移到 `src/styles/tokens.css`。

- [ ] Step 4: 在 `BaseLayout.astro` 中接入全局样式、header/footer 插槽。

- [ ] Step 5: 验证项目能启动。

Run:

```bash
npm run dev
```

Expected:

```text
Local server starts without errors
```

---

### Task 2: 建立内容集合与种子数据

**Files:**

- Create: `src/content/config.ts`
- Create: `src/content/candidates/candidate-context7-2026-05.json`
- Create: `src/content/tools/context7.json`
- Create: `src/content/tools/playwright-mcp.json`
- Create: `src/content/tools/repo-review-skill.json`
- Create: `src/content/agents/codex.json`
- Create: `src/content/agents/claude-code.json`
- Create: `src/content/learn/what-is-mcp.mdx`
- Create: `src/content/signals/example-signal.mdx`
- Create: `src/content/downloads/mcp-cheatsheet.json`

- [ ] Step 1: 定义 content collections schema。

- [ ] Step 2: 添加 Candidate collection schema。

- [ ] Step 3: 添加 3-5 个候选池示例，覆盖 tool、signal、agent。

- [ ] Step 4: 添加 6 个工具种子数据，对齐当前 demo。

- [ ] Step 5: 添加 4 个海外 Agent 种子数据。

- [ ] Step 5a: 添加首批国产 Agent 种子数据：Qwen Code、Kimi Agent、CodeGeeX、Trae，并加入 OpenClaw。

- [ ] Step 6: 添加 2 篇 Learn 占位内容。

- [ ] Step 7: 添加 2 篇 Signals 占位内容，并标记 permission status。

- [ ] Step 8: 运行内容类型检查。

Run:

```bash
npm run astro check
```

Expected:

```text
No schema validation errors
```

---

### Task 2.5: 候选池审核与发布机制

**Files:**

- Create: `src/lib/candidate-review.ts`
- Create: `src/lib/candidate-publish.ts`
- Create: `src/pages/api/internal/publish-candidate.ts`
- Create: `src/pages/internal/index.astro`
- Create: `src/pages/internal/candidates.astro`
- Create: `src/pages/internal/candidates/[id].astro`
- Modify: `src/content/config.ts`
- Modify: `src/content/candidates/*.json`

- [ ] Step 1: 创建 `candidate-review.ts`，实现候选评分汇总。

```ts
export function getCandidateTotalScore(candidate: Candidate) {
  const score = candidate.reviewScore;
  return (
    score.sourceTrust +
    score.usefulness +
    score.agentRelevance +
    score.verifiability +
    score.freshness +
    score.editorialValue +
    score.permission
  );
}
```

- [ ] Step 2: 实现候选状态判断。

```ts
export function getCandidateRecommendation(candidate: Candidate) {
  const total = getCandidateTotalScore(candidate);
  if (candidate.status === "rejected" || candidate.status === "archived") return "do_not_publish";
  if (total >= 24) return "ready_for_approval";
  if (total >= 18) return "needs_more_review";
  return "reject";
}
```

- [ ] Step 3: 创建内部管理首页 `/internal`。

页面结构：

- 标题：Internal Workspace。
- 主入口卡片：Candidate Pool。
- 辅助说明：内部页面不进入公开导航，不收录进 sitemap。
- CTA：进入 `/internal/candidates`。

- [ ] Step 4: 创建内部候选池一级页面 `/internal/candidates`。

页面结构：

- 顶部统计：All / Tools / Signals / Learn / Agents / Downloads。
- 每个模块一个列表区块。
- 每个候选显示 title、type、status、score、lastChecked、source。
- 每个候选有两个操作：
  - `Review`：进入详情页。
  - `Publish`：当 status 为 `approved` 且无红线问题时显示。

显示字段：

- title
- type
- status
- sourceUrl
- totalScore
- recommendation
- lastChecked

- [ ] Step 5: 创建候选详情页 `/internal/candidates/[id]`。

显示字段：

- 原始来源
- 评分明细
- reviewNotes
- proposedCategory
- proposedAgents
- permissionStatus
- publishReason
- publish preview

- [ ] Step 6: 创建 `candidate-publish.ts`，把 Candidate 转换成正式内容对象。

发布转换规则：

```text
candidate.type = tool
  -> src/content/tools/[slug].json

candidate.type = signal
  -> src/content/signals/[slug].mdx

candidate.type = learn
  -> src/content/learn/[slug].mdx

candidate.type = agent
  -> src/content/agents/[slug].json

candidate.type = download
  -> src/content/downloads/[slug].json
```

- [ ] Step 7: 创建内部发布 API `/api/internal/publish-candidate`。

发布 API 行为：

```text
Input: candidate id
  -> 读取 Candidate
  -> 校验 status === approved
  -> 校验 recommendation === ready_for_approval
  -> 校验 permissionStatus，Signals 必须允许完整翻译
  -> 生成正式内容文件
  -> 更新 candidate.status = published
  -> 写入 candidate.publishedAs
  -> 返回正式页面 URL
```

- [ ] Step 8: 在 `/internal/candidates` 一级页面加一键发布按钮。

按钮状态：

```text
candidate / reviewing -> disabled: "Needs review"
approved + ready_for_approval -> enabled: "Publish"
published -> disabled: "Published"
rejected / archived -> hidden or disabled
```

- [ ] Step 9: 在候选详情页加 `Approve` 和 `Publish` 两步。

```text
Review detail page
  -> 点击 Approve
  -> status = approved
  -> 回到 /internal/candidates
  -> 点击 Publish
  -> 内容进入正式网页
```

- [ ] Step 10: 正式网页不得读取 `src/content/candidates`。

Run:

```bash
npm run build
```

Expected:

```text
Public pages build without candidate items leaking into frontend listings
```

---

### Task 3: 首页 `/`

**Files:**

- Create: `src/pages/index.astro`
- Create: `src/components/SearchHero.astro`
- Create: `src/components/ToolCard.astro`
- Create: `src/components/RouteCard.astro`
- Create: `src/components/ArticleCard.astro`
- Create: `src/components/DownloadCard.astro`

- [ ] Step 1: 从 `src/content/tools` 读取 featured / newest tools。

- [ ] Step 2: 实现 Hero：标题、定位文案、搜索框、类型 tabs。

- [ ] Step 3: 实现 Today's Additions。

- [ ] Step 4: 实现 Browse by Type、Browse by Category、Browse by Agent。

- [ ] Step 5: 实现 Learn Highlights、Signals Highlights、Free Downloads。

- [ ] Step 6: 首页视觉对齐 `demo/sitemap-v1-demo.html`。

- [ ] Step 7: 验证构建。

Run:

```bash
npm run build
```

Expected:

```text
Build completes successfully
```

---

### Task 4: 工具列表页 `/tools` 与类型页 `/type/[type]`

**Files:**

- Create: `src/pages/tools/index.astro`
- Create: `src/pages/type/[type].astro`
- Create: `src/components/FilterSidebar.astro`
- Create: `src/components/ToolListItem.astro`
- Create: `src/lib/filters.ts`

- [ ] Step 1: 写 `filters.ts`，实现按 type、category、agent 过滤工具。

- [ ] Step 2: `/tools` 展示所有工具。

- [ ] Step 3: `/type/[type]` 根据 type 过滤工具。

- [ ] Step 4: 添加静态筛选入口。

- [ ] Step 5: 添加排序入口：Newest / Most Stars / Trending。

- [ ] Step 6: 验证 `/type/skill` 和 `/type/mcp` 能生成。

Run:

```bash
npm run build
```

Expected:

```text
/type/skill and /type/mcp generated
```

---

### Task 5: 工具详情页 `/item/[id]`

**Files:**

- Create: `src/pages/item/[id].astro`
- Create: `src/components/InstallBox.astro`
- Create: `src/components/RelatedItems.astro`
- Create: `src/lib/tool-relations.ts`

- [ ] Step 1: 生成每个 Tool 的详情页。

- [ ] Step 2: 实现 Breadcrumb、标题、summary、type、agent tags。

- [ ] Step 3: 实现 Install 安装区和 Copy 按钮。

- [ ] Step 4: 实现 Configuration、Usage、Verification、Requirements。

- [ ] Step 5: 实现 Source、Related Items、Related Learn、Related Signals。

- [ ] Step 6: 验证至少 3 个工具详情页。

Run:

```bash
npm run build
```

Expected:

```text
All /item/[id] pages generated
```

---

### Task 6: Agent 兼容页 `/for/[agent]`

**Files:**

- Create: `src/pages/for/[agent].astro`
- Create: `src/components/AgentSummary.astro`

- [ ] Step 1: 读取 Agent profile。

- [ ] Step 2: 根据 compatibleAgents 过滤工具。

- [ ] Step 3: 展示 Skills / MCPs / CLI / Workflows 数量。

- [ ] Step 4: 添加 tabs：All / Skills / MCPs / Workflows / CLI。

- [ ] Step 5: 添加深度学习入口，例如 `Read the Claude Code guide`。

- [ ] Step 6: 验证 `/for/codex`、`/for/claude-code` 能生成。
- [ ] Step 7: 验证 `/for/qwen-code`、`/for/kimi-agent`、`/for/codegeex`、`/for/openclaw`、`/for/trae` 能生成。

---

### Task 7: Learn 与 Signals

**Files:**

- Create: `src/pages/learn/index.astro`
- Create: `src/pages/learn/[...slug].astro`
- Create: `src/pages/signals/index.astro`
- Create: `src/pages/signals/[slug].astro`
- Create: `src/layouts/ArticleLayout.astro`

- [ ] Step 1: 实现 Learn 首页：学习路径、概念卡片、决策卡片、Glossary 入口。

- [ ] Step 2: 实现 Learn 文章页。

- [ ] Step 3: 实现 Signals 首页：定位文案、筛选器、信号卡片。

- [ ] Step 4: 实现 Signal 详情页：来源说明、摘要、翻译声明、why it matters、相关工具。

- [ ] Step 5: 在 Signal 详情页强制显示 permission status。

- [ ] Step 6: 没有全文授权的 Signal 不展示 Full English Translation。

---

### Task 8: Free / Upgrade、Changelog、About、RSS、Sitemap

**Files:**

- Create: `src/pages/upgrade/index.astro`
- Create: `src/pages/changelog.astro`
- Create: `src/pages/about.astro`
- Create: `src/pages/rss.xml.ts`
- Create: `src/pages/sitemap.xml.ts`

- [ ] Step 1: 实现 Free downloads 页面。

- [ ] Step 2: 实现 Changelog 时间线。

- [ ] Step 3: 实现 About。

- [ ] Step 4: 生成 RSS feed。

- [ ] Step 5: 生成 sitemap.xml。

---

### Task 9: Search v1

**Files:**

- Create: `src/pages/search.astro`
- Create: `src/lib/search.ts`
- Create: `src/pages/search-index.json.ts`

- [ ] Step 1: 生成静态 search index JSON。

- [ ] Step 2: 搜索范围先支持 Tools。

- [ ] Step 3: v1.1 扩展到 Learn 和 Signals。

- [ ] Step 4: 实现关键词高亮。

---

### Task 10: QA 与上线前检查

**Files:**

- Modify: all changed files.

- [ ] Step 1: 类型检查。

Run:

```bash
npm run astro check
```

- [ ] Step 2: 构建检查。

Run:

```bash
npm run build
```

- [ ] Step 3: 本地预览。

Run:

```bash
npm run preview
```

- [ ] Step 4: 手动检查页面。

Check:

```text
/
/tools
/type/skill
/type/mcp
/item/context7
/for/codex
/learn
/signals
/upgrade
```

- [ ] Step 5: 检查移动端布局。

- [ ] Step 6: 检查每个工具详情页都有 install、requirements、source、related content。

- [ ] Step 7: 检查 Signals 不违规发布未经授权全文翻译。

---

## 8. 里程碑

### Milestone 1: 可浏览静态站

完成：

- Astro 项目。
- 首页。
- Tools 列表。
- Type 页。
- 6-10 个工具内容。

### Milestone 2: 工具详情闭环

完成：

- `/item/[id]`。
- install / usage / verification / source。
- related tools / learn / signals。

### Milestone 3: Agent 兼容页

完成：

- `/for/[agent]`。
- Agent 工具数量。
- Agent 兼容工具列表。
- Agent guide 入口。

### Milestone 4: Learn + Signals 内容层

完成：

- Learn 首页和文章页。
- Signals 首页和详情页。
- 翻译授权规则展示。

### Milestone 5: Search + polish

完成：

- search index。
- mobile polish。
- RSS。
- sitemap.xml。
- changelog。

---

## 9. 暂不做

v1 不做：

- 用户账号。
- 投稿后台。
- 自动全网爬虫。
- 在线支付。
- 复杂 dashboard。
- 未授权全文翻译。
- 多语言站点。

这些都等核心工具目录闭环跑通后再考虑。

---

## 10. 下一步执行建议

下一步直接从 **Task 1: 初始化 Astro 项目骨架** 开始。

执行前确认两件事：

1. 是否接受 Astro 作为 v1 技术栈。
2. 是否允许把当前目录从纯文档/demo 项目升级成正式 Astro 项目。
