# agentk.it — AI Agent 工具链聚合站 项目方案

> 每天从 GitHub 自动抓取 AI Agent 生态的 Skill / MCP / CLI 工具 / Workflow，
> 标准化为「描述 + 安装 + 配置 + 使用示例 + 源仓库」格式，一键复制即用。

---

## 目录

1. [产品定位](#1-产品定位)
2. [市场机会](#2-市场机会)
3. [内容标准化模板](#3-内容标准化模板)
4. [数据管线架构](#4-数据管线架构)
5. [站点信息架构](#5-站点信息架构)
6. [技术栈](#6-技术栈)
7. [SEO & 内容策略](#7-seo--内容策略)
8. [开发里程碑](#8-开发里程碑)
9. [运营策略](#9-运营策略)
10. [盈利模式](#10-盈利模式)
11. [风险与对策](#11-风险与对策)
12. [科普知识体系](#12-科普知识体系)
13. [内容升级策略（Lead Magnet）](#13-内容升级策略lead-magnet)
14. [用户旅程与转化漏斗](#14-用户旅程与转化漏斗)

---

## 1. 产品定位

**一句话：** "Agent 开发者的 npmjs.com —— 每天更新的 Skill / MCP / CLI / Workflow 库。"

**目标用户：** AI Agent 的搭建者和重度使用者。使用 Hermes Agent / OpenClaw / Claude Code / Cursor / Codex 等工具的开发者。

**核心价值：**
- 不用自己去 GitHub 搜索 "topic:mcp-server" 再逐个翻 README
- 所有工具用统一模板呈现，一眼就知道能干什么、怎么装、怎么配
- 每条内容有 Copy 按钮，直接复制到终端就能跑

**差异化：**

| | smithery.ai | theresanaiforthat | GitHub Topics | agentk.it |
|---|---|---|---|---|
| 覆盖 MCP | ✅ | ❌ | ✅ | ✅ |
| 覆盖 Skills | ❌ | ❌ | 散落 | ✅ |
| 覆盖 CLI 工具 | ❌ | ✅ (用户向) | 散落 | ✅ (开发者向) |
| 覆盖 Workflow | ❌ | ❌ | ❌ | ✅ |
| 标准化安装指令 | ✅ (绑定 Smithery CLI) | 弱 | 无 | ✅ (原生指令) |
| 每日自动更新 | ❌ | ✅ | 手动 | ✅ |
| 跨 Agent 兼容标签 | ❌ | ❌ | ❌ | ✅ |

---

## 2. 市场机会

### 数据规模预估

| 内容类型 | 当前大约数量 | 预计月增速 |
|---------|------------|----------|
| MCP Servers | ~9,000+ (Smithery 已收录) | ~300-500 |
| Hermes Skills | ~200+ (Hub + 社区) | ~50-100 |
| OpenClaw Skills | ~500+ (ClawHub) | ~100-200 |
| Claude/Cursor Rules | ~1,000+ (cursor.directory) | ~150 |
| AI Agent CLI 工具 | ~800+ (npm + PyPI) | ~80 |
| AI Workflow 配置 | ~200+ (n8n + 社区) | ~50 |

**总可收录池：~12,000+ 条目，每月新增 ~700+。**

### 搜索需求验证

- "mcp server list" — 月搜索量 ~5,000
- "hermes agent skills" — 月搜索量 ~2,000
- "openclaw skills" — 月搜索量 ~3,000
- "claude code mcp setup" — 月搜索量 ~8,000
- "ai agent tools github" — 月搜索量 ~4,000

**合计头部关键词月搜索量 ~22,000+，长尾更大。**

### 竞品空白

| 需求场景 | 现状 | 
|---------|------|
| 我想给 Hermes 加一个飞书通知 Skill | 用户要去 GitHub 搜，没有结构化列表 |
| 我想给 Claude Code 加 GitHub MCP | Smithery 有但绑定其 CLI，不能直接用 |
| 我想知道这周 Agent 生态新增了什么工具 | 没有产品覆盖这个需求 |
| 我想对比 3 个相似的 MCP Server | 需要手动打开 3 个 GitHub repo 对比 |

---

## 3. 内容标准化模板

### 3.1 Skill 条目模板

```markdown
---
id: hermes-skill-github-pr-review
type: skill
name: GitHub PR Review
compatible: [hermes-agent]
category: devops
source: https://github.com/user/hermes-github-pr-review
stars: 342
updated: 2026-05-08
added: 2026-05-09
---

## GitHub PR Review

Automatically review GitHub pull requests with code quality checks and suggestions.

### Compatible With
- Hermes Agent

### Install
\`\`\`bash
hermes skills install https://raw.githubusercontent.com/user/hermes-github-pr-review/main/SKILL.md
\`\`\`

### What It Does
- Fetches open PRs from a GitHub repo
- Runs automated code review using configured LLM
- Posts review comments inline on the PR
- Supports configurable review severity levels

### Configuration
\`\`\`yaml
# ~/.hermes/config.yaml
skills:
  github-pr-review:
    repo: owner/repo
    severity: medium
    auto_approve: false
\`\`\`

### Usage
Just say: "Review all open PRs in owner/repo"

### Source
- **Repo:** https://github.com/user/hermes-github-pr-review
- **License:** MIT
- **Last commit:** 2026-05-08
```

### 3.2 MCP Server 条目模板

```markdown
---
id: mcp-server-brave-search
type: mcp
name: Brave Search MCP
compatible: [claude-code, cursor, hermes-agent, openclaw]
category: search
source: https://github.com/modelcontextprotocol/servers/tree/main/src/brave-search
stars: —
updated: 2026-04-20
added: 2026-05-09
---

## Brave Search MCP

Web and local search through Brave's search API. No additional setup required beyond an API key.

### Compatible With
- Claude Code · Cursor · Hermes Agent · OpenClaw

### Install
\`\`\`bash
npx @anthropic-ai/mcp-server-brave-search
\`\`\`

### API Key Required
Get a free API key at https://brave.com/search/api/

### Configuration

**Claude Code:**
\`\`\`json
{
  "mcpServers": {
    "brave-search": {
      "command": "npx",
      "args": ["@anthropic-ai/mcp-server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "your-key-here"
      }
    }
  }
}
\`\`\`

**Hermes Agent:**
\`\`\`bash
hermes mcp add brave-search --command "npx @anthropic-ai/mcp-server-brave-search"
# Then set BRAVE_API_KEY in ~/.hermes/.env
\`\`\`

### Test
\`\`\`bash
echo '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"search","arguments":{"query":"AI agent tools"}},"id":1}' | npx @anthropic-ai/mcp-server-brave-search
\`\`\`

### Source
- **Repo:** github.com/modelcontextprotocol/servers
- **License:** MIT
```

### 3.3 CLI 工具条目模板

```markdown
---
id: cli-tool-hermes-cli
type: cli
name: hermes
compatible: [macos, linux, windows-wsl]
category: agent
source: https://github.com/NousResearch/hermes-agent
stars: 141000
updated: 2026-05-10
added: 2026-05-09
---

## Hermes Agent CLI

The self-improving AI agent by Nous Research.

### Install
\`\`\`bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
\`\`\`

### Quick Start
\`\`\`bash
hermes                    # Interactive chat
hermes chat -q "hello"    # Single query
hermes model              # Change model/provider
hermes setup              # Setup wizard
\`\`\`

### Key Subcommands
| Command | Purpose |
|---------|---------|
| `hermes config` | View/edit configuration |
| `hermes tools` | Enable/disable toolsets |
| `hermes skills list` | List installed skills |
| `hermes gateway run` | Start messaging gateway |
| `hermes mcp list` | List MCP servers |
| `hermes profile create` | Create a new profile |

### Source
- **Repo:** github.com/NousResearch/hermes-agent
- **Stars:** 141k
- **License:** MIT
```

### 3.4 Workflow 条目模板

```markdown
---
id: workflow-auto-pr-review
type: workflow
name: Auto PR Review Pipeline
compatible: [hermes-agent, openclaw]
uses: [github-mcp, hermes-skill-pr-review]
category: devops
source: https://github.com/user/agent-workflows
stars: 89
updated: 2026-05-07
added: 2026-05-09
---

## Auto PR Review Pipeline

Automatically review every new PR, post inline comments, and request changes if issues found.

### Compatible With
- Hermes Agent · OpenClaw

### What It Does
```
New PR opened → Agent detects webhook → Checks out PR → 
Runs linter + tests → LLM code review → Posts review → 
Labels PR (approved/changes-requested)
```

### Tools Used
- GitHub MCP Server (for PR access)
- Hermes PR Review Skill (for code analysis)
- Cron (for periodic checks, if no webhook)

### Setup

**Step 1 — GitHub MCP:**
\`\`\`bash
hermes mcp add github --command "npx @anthropic-ai/mcp-server-github"
# Set GITHUB_PERSONAL_ACCESS_TOKEN in ~/.hermes/.env
\`\`\`

**Step 2 — Install Skill:**
\`\`\`bash
hermes skills install https://raw.githubusercontent.com/user/hermes-pr-review/main/SKILL.md
\`\`\`

**Step 3 — Webhook (optional, for instant trigger):**
\`\`\`bash
hermes webhook subscribe pr-review
# Configure GitHub webhook → https://your-server/webhooks/pr-review
\`\`\`

**Step 4 — Cron (alternative, polls every 30 min):**
\`\`\`bash
hermes cron create "every 30m" \\
  --prompt "Check for new PRs in owner/repo and review them using the PR Review skill" \\
  --skills "github-pr-review"
\`\`\`

### Source
- **Workflow:** github.com/user/agent-workflows/auto-pr-review
- **License:** MIT
```

---

## 4. 数据管线架构

### 4.1 整体流程

```
GitHub API / PyPI / npm
        │
        ▼
┌──────────────────┐
│  Data Fetcher    │  ← GitHub Actions cron (daily)
│  (Python)        │
└──────┬───────────┘
       │ raw JSON
       ▼
┌──────────────────┐
│  LLM Parser      │  ← 提取标准字段
│  (DeepSeek API)  │    描述/安装/配置/用法
└──────┬───────────┘
       │ structured JSON
       ▼
┌──────────────────┐
│  Quality Gate    │  ← 去重/过滤无效/打分
│  (Python)        │
└──────┬───────────┘
       │ curated JSON
       ▼
┌──────────────────┐
│  Static Site     │  ← Astro build
│  Generator       │    → Markdown/MDX pages
└──────┬───────────┘
       │
       ▼
   Cloudflare Pages
```

### 4.2 数据源

| 来源 | 获取方式 | 频率 | 预估条数/天 |
|------|---------|------|------------|
| GitHub Topic: `mcp-server` | Search API `topic:mcp-server` | Daily | 5-15 新增 |
| GitHub Topic: `hermes-skill` | Search API `topic:hermes-skill` | Daily | 1-5 新增 |
| GitHub Topic: `openclaw-skill` | Search API `topic:openclaw-skill` | Daily | 3-10 新增 |
| GitHub Topic: `claude-mcp` | Search API | Daily | 10-20 新增 |
| GitHub Topic: `cursor-rule` | Search API | Daily | 5-15 新增 |
| Specific repos (已知大仓) | 监控 `modelcontextprotocol/servers`、NousResearch/hermes-agent 技能目录 | Daily | 变化检测 |
| npm: keyword `mcp` | npm Registry API | Daily | 2-5 新增 |
| PyPI: keyword `mcp-server` | PyPI JSON API | Daily | 2-5 新增 |
| Awesome Lists | 解析 awesome-mcp、awesome-hermes 等 | Weekly | 批量入库 |

### 4.3 LLM 解析 Prompt 设计

```
You are a parser that extracts structured fields from a GitHub repository README 
or package description. Output ONLY valid JSON.

Given the following raw text, extract:

{
  "name": "Human-readable tool name",
  "description": "One paragraph, plain English",
  "category": "search | devops | communication | data | automation | productivity | media | security | other",
  "install_command": "The exact terminal command to install (with placeholders for keys if needed)",
  "install_type": "npm | pip | brew | go | curl | docker | git-clone | manual",
  "config_example": "JSON/YAML/TOML config snippet if applicable, or null",
  "usage_example": "Short usage example, or null",
  "api_key_required": true/false,
  "api_key_url": "URL to get API key, or null",
  "test_command": "Command to verify installation works, or null",
  "compatible_with": ["hermes-agent", "openclaw", "claude-code", "cursor", "codex", "generic-agent"],
  "license": "MIT | Apache-2.0 | GPL-3.0 | ... | null"
}

Raw text:
{readme_content_truncated_to_8k_chars}
```

### 4.4 去重与质量控制

- 同 GitHub URL → 直接去重
- 同 name + 不同 source → 人工标记为 duplicate
- 无 install_command → 标记为 incomplete，不发布
- 已收录条目 → diff README，有变化则更新
- 连续 3 次解析失败 → 加入 skip list

### 4.5 数据存储

```json
// data/items/hermes-skill-github-pr-review.json
{
  "id": "hermes-skill-github-pr-review",
  "type": "skill",
  "name": "GitHub PR Review",
  "slug": "github-pr-review",
  "description": "Automatically review GitHub pull requests...",
  "compatible": ["hermes-agent"],
  "category": "devops",
  "install_command": "hermes skills install https://...",
  "install_type": "hermes-skill",
  "config_example": "skills:\n  github-pr-review:\n    repo: owner/repo",
  "usage_example": "Review all open PRs in owner/repo",
  "api_key_required": false,
  "test_command": null,
  "source": {
    "url": "https://github.com/user/hermes-github-pr-review",
    "stars": 342,
    "license": "MIT",
    "last_commit": "2026-05-08T14:32:00Z"
  },
  "added_at": "2026-05-09T02:15:00Z",
  "updated_at": "2026-05-09T02:15:00Z",
  "status": "published"
}
```

---

## 5. 站点信息架构

### 5.1 URL 结构

```
/                          Home — 今日新增 + 热榜 + Learn 入口
/search?q=github+mcp       Search results
/tools                     Browse all tools (unified)
/type/skill                Skill 列表
/type/mcp                  MCP Server 列表
/type/cli                  CLI 工具列表
/type/workflow             Workflow 列表
/for/hermes-agent          Hermes 兼容工具
/for/openclaw              OpenClaw 兼容工具
/for/claude-code           Claude Code 兼容工具
/for/cursor                Cursor 兼容工具
/category/devops           DevOps 分类
/category/search           Search 分类
/item/hermes-skill-github-pr-review  详情页
/changelog                 每日新增记录
/learn                     科普知识主页
/learn/what-is-mcp         什么是 MCP
/learn/what-is-agent-skill 什么是 Agent Skill
/learn/agent-comparison    Agent 框架对比
/learn/how-to-choose-agent 如何选择 Agent
/learn/glossary            术语表
/learn/guide/xxx           系列教程文章
/upgrade                   内容升级主页 (Lead Magnet 入口)
/upgrade/mcp-cheatsheet    MCP 速查表
/upgrade/hermes-commands   Hermes CLI 命令速查表
/upgrade/agent-comparison  框架对比 PDF
/about                     关于页
/rss.xml                   RSS feed
/sitemap.xml               Sitemap
```

### 5.2 首页布局

```
┌──────────────────────────────────────────────┐
│  [Logo]  Skills  MCPs  CLI  Workflows  🔍   │  ← Nav
├──────────────────────────────────────────────┤
│                                              │
│  "Discover AI Agent Tools."                  │
│  "Daily-updated library of Skills, MCP       │
│   servers, CLI tools & workflows —           │
│   copy, paste, run."                         │
│                                              │
│  [🔍 Search skills, MCPs, tools...        ]  │
│                                              │
│  [Skills] [MCPs] [CLI] [Workflows]          │  ← Type tabs
│                                              │
├──────────────────────────────────────────────┤
│  🆕 Today's Additions (May 9, 2026)         │
│  ┌─────────────────────────────────────────┐ │
│  │ [MCP] Figma MCP Server                  │ │
│  │ Design-to-code bridge · Claude/Cursor   │ │
│  │ npx @anthropic-ai/mcp-server-figma      │ │
│  │ [Copy]  ☆ 124  Added 3h ago            │ │
│  └─────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────┐ │
│  │ [Skill] GitHub PR Review                │ │
│  │ Auto-review PRs with AI · Hermes        │ │
│  │ hermes skills install https://...       │ │
│  │ [Copy]  ☆ 342  Added 5h ago            │ │
│  └─────────────────────────────────────────┘ │
│  ... (10 items)                              │
├──────────────────────────────────────────────┤
│  🔥 Trending This Week                       │
│  (按本周 Star 增量排序)                       │
│  ... (10 items)                              │
├──────────────────────────────────────────────┤
│  Browse by Category                          │
│  [Search] [DevOps] [Communication] [Data]   │
│  [Automation] [Productivity] [Media]         │
├──────────────────────────────────────────────┤
│  Browse by Agent                             │
│  [Hermes Agent] [OpenClaw] [Claude Code]     │
│  [Cursor] [Codex] [Generic]                  │
├──────────────────────────────────────────────┤
│  📚 Learn                                    │  ← 科普入口
│  ┌────────────┐ ┌────────────┐ ┌──────────┐ │
│  │ What is    │ │ Agent      │ │ How to   │ │
│  │ MCP?       │ │ Comparison │ │ Choose   │ │
│  │ → Read     │ │ → Compare  │ │ → Guide  │ │
│  └────────────┘ └────────────┘ └──────────┘ │
├──────────────────────────────────────────────┤
│  🎁 Free Downloads                           │  ← 内容升级
│  [📄 MCP Cheatsheet (PDF)] [📄 Agent CLI   ] │
│  [📄 Framework Comparison ] [📬 Newsletter ] │
├──────────────────────────────────────────────┤
│  Footer: About · RSS · GitHub · Twitter      │
└──────────────────────────────────────────────┘
```

### 5.3 列表页设计

```
┌──────────────────────────────────────────────┐
│  MCP Servers  (487 tools)                    │
│                                              │
│  Filter: [All] [Search] [DevOps] [Data] ...  │
│  Compatible: [All] [Hermes] [Claude] ...     │
│  Sort: [Newest] [Most Stars] [Trending]      │
│                                              │
│  ┌─────────────────────────────────────────┐ │
│  │ 🔌 Brave Search MCP                     │ │
│  │ Web & local search API · 🔑 API key     │ │
│  │ [Hermes] [Claude] [Cursor] [OpenClaw]   │ │
│  │ npx @anthropic-ai/mcp-server-brave-...  │ │
│  │ [Copy]  ☆ —  Updated Apr 20            │ │
│  └─────────────────────────────────────────┘ │
│  ...                                         │
└──────────────────────────────────────────────┘
```

### 5.4 详情页设计

```
┌──────────────────────────────────────────────┐
│  ← Back to MCP Servers                       │
│                                              │
│  # Brave Search MCP                          │
│                                              │
│  Web and local search through Brave's API.   │
│                                              │
│  [Hermes Agent] [Claude Code] [Cursor]       │  ← 兼容标签
│                                              │
│  ## Install                                  │
│  ┌──────────────────────────────────────┐    │
│  │ npx @anthropic-ai/mcp-server-...    │ [📋]│  ← Copy 按钮
│  └──────────────────────────────────────┘    │
│                                              │
│  ## API Key                                  │
│  Get key at brave.com/search/api/            │
│                                              │
│  ## Configuration                            │
│  ┌──────────────────────────────────────┐    │
│  │ { "mcpServers": { ... } }            │ [📋]│
│  └──────────────────────────────────────┘    │
│                                              │
│  Tabs: [Claude Code] [Hermes] [Cursor]       │  ← 按平台切换配置
│                                              │
│  ## Source                                   │
│  github.com/modelcontextprotocol/servers     │
│  License: MIT · Last commit: Apr 20, 2026    │
│                                              │
│  ## Related Tools                            │
│  SearXNG MCP · Tavily Search MCP · ...       │
│                                              │
│  [Report issue] [Suggest edit]               │
└──────────────────────────────────────────────┘
```

---

## 6. 技术栈

### 6.1 选型

| 层 | 技术 | 理由 |
|---|------|------|
| 框架 | **Astro** | 静态生成，MDX 原生支持，零 JS 到客户端 |
| 样式 | **Tailwind CSS** | 快速出暗色主题，最小 CSS 体积 |
| 内容 | **MDX (Markdown + JSX)** | 每条工具渲染为 MDX 页面，SEO 完美 |
| 搜索 | **Pagefind** | 纯静态搜索，构建时生成索引，零服务器 |
| 部署 | **Cloudflare Pages** | 全球 CDN，免费额度足够，边缘函数可选 |
| 数据管线 | **Python + GitHub Actions** | 免费 cron，和 GitHub API 天然集成 |
| LLM 解析 | **DeepSeek API (批量)** | 便宜 (¥1/1M tokens)，中文+英文都好 |
| 数据存储 | **JSON files + Git** | 数据即代码，有版本历史，可回滚 |
| 监控 | **Cloudflare Analytics** | 免费，隐私友好 |

### 6.2 为什么不选

| 方案 | 放弃原因 |
|------|---------|
| Next.js | 重，客户端 JS 过多，SEO 虽好但杀鸡用牛刀 |
| 数据库 (Supabase/PlanetScale) | 没有 UGC，不需要动态查询，JSON 文件够用 |
| Vercel | Cloudflare Pages 免费额度更大且全球节点更多 |
| Algolia | 贵，Pagefind 对 5,000 条内容完全够用 |
| Strapi/WordPress | 无编辑后台需求，全部自动化 |

### 6.3 项目结构

```
agentk-it/
├── astro.config.mjs
├── tailwind.config.mjs
├── package.json
├── src/
│   ├── pages/
│   │   ├── index.astro              # 首页
│   │   ├── search.astro             # 搜索页
│   │   ├── type/[type].astro        # /type/skill, /type/mcp ...
│   │   ├── for/[agent].astro        # /for/hermes-agent ...
│   │   ├── category/[cat].astro     # /category/devops ...
│   │   ├── item/[id].astro          # 详情页
│   │   ├── changelog.astro          # 每日更新记录
│   │   ├── about.astro
│   │   ├── rss.xml.js               # RSS feed
│   │   └── sitemap.xml.js
│   ├── components/
│   │   ├── ToolCard.astro
│   │   ├── CopyButton.astro
│   │   ├── CompatibilityTags.astro
│   │   ├── SearchBar.astro
│   │   ├── TypeTabs.astro
│   │   └── TrendingList.astro
│   ├── layouts/
│   │   └── BaseLayout.astro
│   └── lib/
│       ├── data.ts                  # 数据加载 (import JSON)
│       ├── search.ts                # Pagefind 集成
│       └── utils.ts
├── data/
│   ├── items/                       # 每条工具一个 JSON
│   │   ├── mcp-server-brave-search.json
│   │   ├── hermes-skill-pr-review.json
│   │   └── ...
│   ├── changelog/
│   │   └── 2026-05-09.json          # 每日新增记录
│   └── stats.json                   # 站点统计数据
├── pipeline/                        # 数据管线 (Python)
│   ├── fetch.py                     # GitHub/PyPI/npm 数据抓取
│   ├── parse.py                     # LLM 解析 + 标准化
│   ├── dedupe.py                    # 去重 + 质量检查
│   ├── build.py                     # 生成 JSON → data/items/
│   ├── requirements.txt
│   └── config.yaml                  # API keys, 监控列表
├── .github/
│   └── workflows/
│       └── daily-fetch.yml          # 每日 cron
├── public/
│   └── favicon.svg
└── README.md
```

---

## 7. SEO & 内容策略

### 7.1 每页自动生成的 SEO 元数据

```html
<!-- 列表页 -->
<title>MCP Servers for AI Agents — agentk.it</title>
<meta name="description" content="Browse 487 MCP servers compatible with Claude Code, Cursor, Hermes Agent, and OpenClaw. Updated daily.">

<!-- 详情页 -->
<title>Brave Search MCP — Install & Config for Claude, Cursor, Hermes — agentk.it</title>
<meta name="description" content="Brave Search MCP server: web search for AI agents. Install command, configuration for Claude Code, Cursor, Hermes Agent. API key setup guide.">
```

### 7.2 Schema.org 结构化数据

每页嵌入 JSON-LD `SoftwareApplication` / `HowTo` schema：
- 详情页 → `SoftwareApplication` + `HowTo` (安装步骤)
- 列表页 → `ItemList`

### 7.3 首发文章内容策略

站点本身也可以有一个 `/blog` 板块，发布：
- "Top 10 MCP Servers Every AI Agent Developer Should Know"
- "Hermes Skills vs OpenClaw ClawHub: A Complete Comparison"
- "How to Build an Automated PR Review Pipeline with Hermes Agent"
- "The Ultimate Guide to Setting Up MCP Servers for Claude Code"

每篇博客内链到相关工具详情页。

### 7.4 RSS 分发

- `/rss.xml` — 每日新增工具
- `/type/mcp/rss.xml` — MCP 专属 feed
- `/changelog/rss.xml` — changelog feed

推动到 Twitter / Discord / Slack 自动分发。

---

## 8. 开发里程碑

### Phase 0：基础骨架 (Week 1)

- [x] 项目初始化 (Astro + Tailwind)
- [ ] 首页布局 (Hero + Search + Tabs)
- [ ] 列表页布局 (type/agent/category)
- [ ] 详情页布局
- [ ] Copy 按钮组件
- [ ] 暗色模式切换
- [ ] 响应式适配 (移动端优先)

### Phase 1：数据管线 MVP (Week 2)

- [ ] `pipeline/fetch.py` — GitHub Search API
- [ ] `pipeline/parse.py` — LLM 标准化 (先手动处理 20 条建立模板)
- [ ] `pipeline/dedupe.py` — 去重逻辑
- [ ] `pipeline/build.py` — JSON 写入 data/
- [ ] GitHub Actions daily cron
- [ ] 手动导入首批 100 条数据验证

### Phase 2：核心功能 (Week 3)

- [ ] Pagefind 搜索集成
- [ ] 兼容性标签筛选
- [ ] 分类浏览
- [ ] "Today's Additions" 首页模块
- [ ] "Trending This Week" (按 Star 增量)
- [ ] 详情页按平台 Tab 切换配置
- [ ] RSS feed 生成

### Phase 2.5：科普内容 (Week 3-4，与 Phase 2/3 并行)

- [ ] `/learn` 主页（卡片式导航）
- [ ] `What is MCP?` 科普页（图文 + 架构图 + 类比解释）
- [ ] `What is an Agent Skill?` 科普页
- [ ] `Agent Comparison` 对比页（Hermes vs OpenClaw vs Claude Code vs Codex）
- [ ] `How to Choose an Agent` 决策指南页（决策树/流程图）
- [ ] `/learn/glossary` 术语表（MCP / Skill / Gateway / Profile / Kanban ...）
- [ ] 工具详情页内链到科普页（遇到术语时自动链接）

### Phase 3：内容上线 (Week 5)

- [ ] 数据管线跑通，收录 ≥500 条
- [ ] SEO 元数据 + 结构化数据
- [ ] Sitemap 生成
- [ ] Cloudflare Pages 部署
- [ ] 自定义域名绑定
- [ ] Google Search Console 提交

### Phase 4：运营增长 (Week 6-8)

- [ ] Blog 板块 + 首发 4 篇文章
- [ ] Twitter 自动分发 bot
- [ ] "Submit a tool" 页面 (GitHub Issue 表单)
- [ ] 邮件订阅 (Buttondown / ConvertKit)
- [ ] Discord 社区频道

### Phase 4.5：内容升级上线 (Week 8-10)

- [ ] `/upgrade/mcp-cheatsheet` — MCP 速查表 PDF（Top 50 MCP 一页纸）
- [ ] `/upgrade/hermes-commands` — Hermes Agent CLI 命令速查表
- [ ] `/upgrade/agent-comparison` — 4 大 Agent 框架对比表 PDF
- [ ] 所有 PDF 通过邮箱订阅后解锁（ConvertKit automation）
- [ ] Newsletter 首期发送 → 含本周热榜 + 1 篇科普 + 1 个升级物
- [ ] 7-Day Email Course：「7 天搭建你的第一个 AI Agent」（自动序列）

---

## 9. 运营策略

### 9.1 冷启动

1. **Product Hunt 发布** — 标题 "agentk.it — Discover & copy-paste tools for AI agents"
2. **Reddit 发帖** — r/LocalLLaMA、r/ClaudeAI、r/OpenClaw、r/ChatGPTCoding
3. **Hacker News Show HN** — 选在周二/周三上午 PST 发布
4. **Twitter 线程** — "I built a daily-updated library of 500+ AI agent tools..." + 截图
5. **GitHub Awesome List** — 提交到 awesome-mcp、awesome-ai-agents

### 9.2 日常运营

- 每天自动发推：🆕 Today's 3 new MCP servers + link
- 每周 blog 一篇：深度对比/教程
- 每月 newsletter 一封：本月最热工具 Top 10
- 关注 GitHub trending，第一时间收录新品

### 9.3 护城河建设

- **速度优势**：新工具发布后 24 小时内收录
- **格式优势**：统一模板，竞品只能模仿无法超越（除非他们也搭 LLM pipeline）
- **SEO 优势**：静态页面 + 结构化数据，Google 收录极快
- **社区优势**：开放 "Submit" + Discord，培育贡献者

---

## 10. 盈利模式

| 阶段 | 模式 | 预估月收入 |
|------|------|-----------|
| 0-6 个月 | 免费，积累内容 + SEO 权重 | $0 |
| 6-12 个月 | Carbon 广告 (开发者向) | $200-500 |
| 6-12 个月 | "Featured Tool" 置顶 ($99/月) | $500-2,000 |
| 12+ 个月 | Newsletter 赞助位 | $500-1,500 |
| 12+ 个月 | "Verified by agentk.it" 认证徽章 (免费，但作为企业版入口) | $0 (获客) |
| 18+ 个月 | 企业版 API (数据订阅) | $2,000-5,000 |

**不做的：** 卖用户数据、付费墙、强制注册。保持对开发者友好的免费体验。

---

## 11. 风险与对策

| 风险 | 概率 | 对策 |
|------|------|------|
| GitHub API rate limit (60 req/h 未认证) | 中 | 使用 GitHub Token (5,000 req/h)，或拆分到多个 token |
| LLM 解析质量不稳定 | 高 | 每个条目跑 3 次取多数，失败则人工标记 |
| 内容增长超过 LLM 成本 | 中 | 新增条目优先；存量条目只在源 repo 有更新时重解析 |
| 竞品模仿 | 中 | 速度壁垒 + SEO 先发优势 + 社区粘性 |
| 某个 Agent 生态衰退 | 低 | 覆盖 5+ Agent，不绑定单一平台 |
| SEO 被 Google 算法更新打击 | 中 | 高质量原创内容（详情页的标准化处理本身是原创），不依赖 AI 生成内容 |

---

## 12. 科普知识体系

### 12.1 为什么需要科普

纯工具目录的用户是「我知道我要什么」的高级用户。但 80% 的搜索流量来自「MCP 是什么」「Agent Skill 怎么用」「OpenClaw 和 Hermes 哪个好」这类问题。

科普内容的作用：
- **Top of Funnel 获客** — 长尾 SEO 关键词覆盖
- **建立信任** — 用户从「看到一篇科普文章」→「信任这个站」→「收藏 + 经常回来」
- **降低产品使用门槛** — 懂原理后才能用对工具

### 12.2 科普内容矩阵

#### 第一层：基石概念（4 篇必须写）

| 标题 | 目标搜索词 | 内容结构 |
|------|----------|---------|
| What is MCP? A Beginner's Guide to Model Context Protocol | "what is mcp", "mcp protocol explained" | 类比（USB-C of AI agents）+ 架构图 + 对比 REST API + 代码示例 |
| What is an Agent Skill? How AI Agents Learn and Improve | "what is agent skill", "ai agent skills explained" | 类比（App Store for AI）+ Hermes/OpenClaw Skill 对比 + 创建演示 |
| Hermes Agent vs OpenClaw: Complete Comparison 2026 | "hermes vs openclaw", "openclaw alternative" | 功能矩阵 + 适用场景 + 迁移难度 + 价格对比 + 社区活跃度 |
| How to Choose an AI Agent in 2026 | "which ai agent should i use", "best ai agent 2026" | 决策流程图 + 5 个灵魂问题 + 每种 Agent 的最佳场景 |

#### 第二层：实操指南（6 篇）

| 标题 | 类型 |
|------|------|
| Setting Up Your First MCP Server (in 5 Minutes) | Step-by-step |
| How to Create a Hermes Agent Skill from Scratch | Step-by-step |
| Connecting AI Agents to Slack, Discord, Telegram | Multi-platform guide |
| Self-Hosting an AI Agent on a $5 VPS | Infrastructure |
| Understanding Agent Memory: Built-in vs Honcho vs Mem0 | Deep dive |
| Agent Security 101: Secrets, PII, and Approval Flows | Security |

#### 第三层：进阶专题（持续更新）

| 标题 | 类型 |
|------|------|
| Multi-Agent Orchestration with Hermes Kanban | Architecture |
| Building an Automated PR Review Pipeline | Workflow tutorial |
| Cost Breakdown: Running Hermes Agent 24/7 for a Month | Case study |
| MCP Server Development: Build Your Own in Python | Development |
| AI Agent Observability: Debugging with AgentOps | Tool deep dive |

### 12.3 科普页设计规范

每篇科普页的标准结构：

```
┌──────────────────────────────────────────────┐
│  📚 Learn → What is MCP?                     │  ← 面包屑
├──────────────────────────────────────────────┤
│                                              │
│  # What is MCP?                              │
│  Model Context Protocol Explained             │
│                                              │
│  ⏱ 8 min read  ·  🏷 Beginner  ·  📅 2026   │  
│                                              │
│  ## The Big Picture                          │
│  (一段类比：MCP 就是 AI Agent 界的 USB-C)     │
│                                              │
│  ![MCP Architecture Diagram]                  │  ← 自绘 SVG 架构图
│                                              │
│  ## How It Works                             │
│  Client → Transport → Server → Tools          │
│                                              │
│  ## MCP vs REST API: What's Different?       │
│  (对比表)                                    │
│                                              │
│  ## See It In Action                         │
│  ```bash                                     │
│  npx @anthropic-ai/mcp-server-brave-search   │
│  ```                                         │
│                                              │
│  ## Related Tools                            │
│  → Brave Search MCP (详情页链接)             │
│  → SearXNG MCP                               │
│  → Tavily Search MCP                         │
│                                              │
│  ## Further Reading                          │
│  → What is an Agent Skill?                   │
│  → Setting Up Your First MCP Server          │
│                                              │
│  [📬 Get the MCP Cheatsheet (Free PDF)]       │  ← 内容升级 CTA
│  [Email input → Download]                    │
└──────────────────────────────────────────────┘
```

### 12.4 术语表 /learn/glossary

```
A B C D E F G H I J K L M N O P Q R S T U V W X Y Z

Agent Skill        A reusable procedure that an AI agent can learn...
API Server         Exposes an agent via REST API for programmatic access
ClawHub            OpenClaw's community skill marketplace
Gateway            Multi-platform messaging bridge (Telegram, Discord, ...)
Honcho             Third-party memory backend for AI agents
Kanban             Multi-agent work queue and orchestration system
MCP Server         A server implementing the Model Context Protocol
Mem0               Memory backend with entity extraction
Profile            Isolated agent instance with own config, memory, skills
Toolset            A group of related tools (web, terminal, file, ...)
```

每个术语有 1 句话定义 + 「了解更多 →」链接到对应的科普页或工具列表。

### 12.5 嵌入工具详情页

工具详情页里，第一次出现的术语自动链接到科普页：

```html
<!-- Before -->
Brave Search MCP provides web search capabilities through Brave's API.

<!-- After (auto-linked by glossary) -->
Brave Search <a href="/learn/what-is-mcp">MCP</a> provides web search...
```

这通过构建时扫描所有 `data/items/*.json` 的 `description` 字段 + glossary 匹配自动实现。

---

## 13. 内容升级策略（Lead Magnet）

### 13.1 什么是内容升级

用户在浏览免费内容时，提供一个「相关但更深度/更便携」的资源，用邮箱换取。

和常见的 "Subscribe to newsletter" 不同，内容升级是上下文相关的——用户在看 MCP 列表时推 MCP 速查表，而非通用 Newsletter。

### 13.2 内容升级物清单

| 升级物 | 触发页面 | 格式 | 预估转化率 |
|--------|---------|------|-----------|
| MCP Cheatsheet | /type/mcp, /learn/what-is-mcp, MCP 详情页 | 1 页 PDF | 3-5% |
| Hermes Agent CLI Commands | /for/hermes-agent, Hermes 详情页 | 1 页 PDF | 3-5% |
| Agent Framework Comparison | /learn/agent-comparison | 2 页 PDF | 4-7% |
| "7 Days to Your First AI Agent" | /learn, Blog 文章底部 | Email Course | 5-8% |
| Weekly Top 10 Tools | 全站底部 Banner | Newsletter | 2-3% |

### 13.3 升级页设计

```
┌──────────────────────────────────────────────┐
│  🎁 Free Download                            │
│                                              │
│  # MCP Servers Cheatsheet                    │
│                                              │
│  50 most popular MCP servers at a glance —   │
│  categorized, with install commands.         │
│                                              │
│  ┌─────────────────────────────────────┐     │
│  │         [PDF Preview Image]         │     │  ← 缩略图预览
│  └─────────────────────────────────────┘     │
│                                              │
│  What's inside:                              │
│  ✅ Top 50 MCP servers ranked by GitHub Stars│
│  ✅ Install commands for Claude/Cursor/Hermes│
│  ✅ Category icons (Search, Data, DevOps...) │
│  ✅ API key required indicator               │
│  ✅ Printer-friendly A4 layout               │
│                                              │
│  ┌─────────────────────────────────────┐     │
│  │  📧 your@email.com    [Get Free PDF] │     │
│  └─────────────────────────────────────┘     │
│                                              │
│  📬 You'll also get the weekly agentk.it     │
│  newsletter (unsubscribe anytime).           │
└──────────────────────────────────────────────┘
```

### 13.4 Email 序列设计

**订阅后即时：**
```
Subject: Your MCP Cheatsheet is ready →
Body: Download link + 3 related tools to try today
```

**Day 2：**
```
Subject: The 3 MCP servers every AI agent needs
Body: Brave Search, GitHub, Filesystem — why they're essential
```

**Day 4：**
```
Subject: How to connect your AI agent to Slack (step by step)
Body: Tutorial + link to relevant tool pages
```

**Day 7：**
```
Subject: This week's top 5 new AI agent tools
Body: Curated list + invitation to join Discord
```

之后转为每周 Newsletter。

### 13.5 技术实现

不需要后端。完全靠第三方工具：

```
User visits /upgrade/mcp-cheatsheet
         │
         ▼
  Email input form (ConvertKit embedded form)
         │
         ▼
  ConvertKit: tag user as "downloaded-mcp-cheatsheet"
         │
         ▼
  Redirect to /downloads/mcp-cheatsheet.pdf (static file)
         │
         ▼
  ConvertKit automation: trigger 4-email welcome sequence
```

---

## 14. 用户旅程与转化漏斗

### 14.1 四条典型路径

```
Path 1: Search → Learn → Browse → Download → Subscribe

  Google: "what is mcp"
       │
       ▼
  /learn/what-is-mcp  (科普页)
       │
       ▼
  内链 → /type/mcp  (浏览 MCP 列表)
       │
       ▼
  底部 CTA → /upgrade/mcp-cheatsheet  (下载 PDF)
       │
       ▼
  输入邮箱 → Newsletter 订阅者


Path 2: Search → Tool Detail → Copy → Return

  Google: "brave search mcp claude code setup"
       │
       ▼
  /item/mcp-server-brave-search  (详情页)
       │
       ▼
  点 Copy → 成功安装 → 收藏站点 → 回来搜更多


Path 3: Social → Home → Explore → Subscribe

  Twitter/HN: "This site tracks every new MCP daily"
       │
       ▼
  /  (首页)
       │
       ▼
  浏览 Today's Additions → 发现价值
       │
       ▼
  底部 Newsletter CTA → 订阅


Path 4: Direct → Power User

  agentk.it 直接输入地址栏
       │
       ▼
  搜索框 → 找到工具 → Copy → 离开
  (这类用户不需要科普，但他们是 DAU 基础)
```

### 14.2 转化漏斗指标预估

```
月访问量 (6个月后)
│
├── 70% 来自 SEO (科普 + 工具详情页长尾)
├── 15% 来自 Direct (品牌搜索)
├── 10% 来自 Social (Twitter/Reddit/HN)
└── 5%  来自 Referral (其他博客链接)

漏斗：
  10,000 visitors/month
    → 6,000 浏览工具列表或科普页
    → 800 点击内容升级 CTA (8%)
    → 300 提交邮箱 (3% 全局转化率)
    → 250 打开首封邮件
    → 100 活跃订阅者 (持续打开率 40%)
```

### 14.3 导航栏重新设计

```
┌──────────────────────────────────────────────┐
│  [agentk.it]  Tools ▾  Learn ▾  Free ▾  🔍   │
│               Skills    Guide     Cheatsheets │
│               MCPs      Compare   Newsletter  │
│               CLI       Glossary              │
│               Workflows                       │
└──────────────────────────────────────────────┘
```

---

## 附录 A：参考站点清单

| 站点 | 学习点 |
|------|--------|
| smithery.ai | MCP 目录的 UX + 搜索设计 |
| cursor.directory | 社区 + 工具目录的融合模式 |
| n8n.io/workflows | 可复制模版的展示方式 |
| artificialanalysis.ai | 数据可视化 + 比较页设计 |
| joshwcomeau.com | 人格化品牌建设 |
| digitalocean.com/community/tutorials | 教程型内容的 SEO 架构 |
| theresanaiforthat.com | 大规模工具目录的运营方法 |

---

## 附录 B：立即可以做的事

1. 注册域名 `agentk.it` (Namecheap/Dynadot, ~$10/年)
2. `npm create astro@latest agentk-it`
3. 手动整理 20 条高质量条目作为种子数据
4. 搭建 GitHub 仓库 `github.com/<user>/agentk-it`
5. 跑通第一条数据管线（拉一个 repo → LLM 解析 → 生成 JSON）

---

> 下一步：确认方案后，可以进入 Phase 0 的具体代码实现。
