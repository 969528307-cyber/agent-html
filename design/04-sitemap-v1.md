# agentk.it — 站点地图 v1 与页面模块说明

> 版本：v1  
> 产品定位：以 AI Agent 工具聚合站为主，以学习内容和中文高质量内容英译为辅

---

## 1. 产品结构原则

### 1.1 核心产品逻辑

站点由三条主要内容线组成：

1. **Tools 工具**
   - 整个产品的核心
   - 主要内容类型：`Skill`、`MCP`、`CLI`、`Workflow`

2. **Learn 学习**
   - 教育、解释、对比类内容
   - 帮用户理解协议、技能、Agent 和工作流

3. **Signals 信号**
   - 中文高质量 AI / Agent 内容的英文全文翻译
   - 作为编辑型内容层，把用户再导回工具页和学习页

### 1.2 Agent 的定位

`Agent` **不是**站点的主内容类型。

`Agent` 在 v1 中承担两种角色：

- **浏览维度**
  - 例如：`/for/claude-code`
  - 展示这个 Agent 可用的所有工具

- **学习专题**
  - 例如：`/learn/agent-comparison`
  - 用于解释不同 Agent 的差异和适用场景

---

## 2. 全局导航

顶部导航 v1 建议：

- `Tools`
- `Learn`
- `Signals`
- `Free`
- `Search`

可选辅助导航：

- `Changelog`
- `About`

---

## 3. 最终 Sitemap v1

```text
/
├── 首页 Home
│
├── /tools
│   ├── /type/skill
│   ├── /type/mcp
│   ├── /type/cli
│   ├── /type/workflow
│   ├── /category/[category]
│   ├── /for/[agent]
│   └── /item/[id]
│
├── /search
│
├── /learn
│   ├── /learn/what-is-mcp
│   ├── /learn/what-is-agent-skill
│   ├── /learn/agent-comparison
│   ├── /learn/how-to-choose-agent
│   ├── /learn/glossary
│   ├── /learn/guide/[slug]
│   └── /learn/agent/[agent]
│
├── /signals
│   └── /signals/[slug]
│
├── /upgrade
│   ├── /upgrade/mcp-cheatsheet
│   ├── /upgrade/hermes-commands
│   └── /upgrade/agent-comparison
│
├── /changelog
├── /about
├── /rss.xml
└── /sitemap.xml
```

---

## 4. 页面模块说明

## 4.1 首页 `/`

### 目标

首页必须首先让用户感知到：这是一个**工具聚合站**，不是媒体站，也不是单纯的 Agent 学习站。

### 页面模块

1. **Hero 首屏**
   - 主标题
   - 一句产品定位
   - 全局搜索框
   - 类型 tabs：`All / Skills / MCPs / CLI / Workflows`

2. **Today's Additions 今日新增**
   - 展示最近新增工具
   - 显示类型、简述、安装命令片段、时间信息

3. **Trending This Week 本周趋势**
   - 展示近期热度增长快的工具
   - 强调发现价值

4. **Browse by Type 按类型浏览**
   - Skills
   - MCPs
   - CLI Tools
   - Workflows

5. **Browse by Category 按分类浏览**
   - Search
   - DevOps
   - Communication
   - Data
   - Automation
   - Productivity
   - Media
   - Security

6. **Browse by Agent 按 Agent 浏览**
   - Claude Code
   - Codex
   - Cursor
   - Hermes Agent
   - Qwen Code
   - Kimi CLI / Kimi Agent
   - CodeGeeX
   - Lingma / 通义灵码
   - Trae
   - OpenClaw
   - Generic

7. **Learn Highlights 学习精选**
   - 3-4 张重点学习卡片
   - 例如：
     - What is MCP?
     - What is an Agent Skill?
     - Agent Comparison
     - How to Choose an Agent

8. **Signals Highlights 信号精选**
   - 2-4 张翻译内容卡片
   - 用于展示编辑能力，但不抢首页主线

9. **Free Downloads 免费下载**
   - Cheatsheets
   - Comparisons
   - Guides

10. **Footer 页脚**
   - About
   - RSS
   - GitHub
   - Twitter / X

---

## 4.2 工具总览页 `/tools`

### 目标

作为统一的工具浏览页，承接所有主类型内容。

### 页面模块

1. 页面标题与说明
2. 站内工具搜索
3. 按类型筛选
4. 按分类筛选
5. 按兼容 Agent 筛选
6. 排序方式
   - Newest
   - Most Stars
   - Trending
7. 工具卡片列表
8. 分页或加载更多

---

## 4.3 类型页 `/type/[type]`

例如：

- `/type/skill`
- `/type/mcp`
- `/type/cli`
- `/type/workflow`

### 页面模块

1. 类型标题和介绍
2. 类型内搜索
3. 分类筛选
4. Agent 兼容筛选
5. 排序控件
6. 工具卡片列表
7. 相关 Learn 内容推荐

---

## 4.4 分类页 `/category/[category]`

### 目标

帮助用户按任务场景或主题方向浏览工具。

### 页面模块

1. 分类标题
2. 分类说明
3. 类型筛选
4. Agent 筛选
5. 工具卡片列表
6. 相关 Learn 内容

---

## 4.5 Agent 浏览页 `/for/[agent]`

例如：

- `/for/claude-code`
- `/for/codex`
- `/for/cursor`
- `/for/hermes-agent`
- `/for/qwen-code`
- `/for/kimi-agent`
- `/for/codegeex`
- `/for/lingma`
- `/for/trae`

### 目标

这是一个**兼容性浏览页**，不是完整的 Agent 学习页。

### 页面模块

1. Agent 标题
2. 简短介绍
   - 这个 Agent 是什么
   - 适合谁
3. 不同类型工具数量
   - Skills
   - MCPs
   - CLI
   - Workflows
4. Tabs
   - All
   - Skills
   - MCPs
   - Workflows
   - CLI
5. 筛选与排序
6. hover 预览卡片
   - 能帮你做什么
   - 上手是否简单
7. 工具列表卡片
8. 深度学习内容入口
   - 例如：`Read the Claude Code guide`

---

## 4.6 工具详情页 `/item/[id]`

### 目标

这是整个站点最重要的转化页面。

### 页面模块

1. Breadcrumb
2. 条目标题
3. 一句话说明
4. 类型标签
5. 兼容 Agent 标签
6. Install 安装区
   - 主安装命令
   - Copy 按钮
7. Configuration 配置区
8. Usage 用法区
9. Test / Verification 测试验证区
10. Requirements 要求
   - API key
   - runtime
   - permissions
11. Source 来源区
   - repo
   - license
   - updated date
12. Related Items 相关条目
13. Related Learn 相关学习内容
14. Related Signals 相关信号内容

---

## 4.7 搜索页 `/search`

### 目标

作为全站统一搜索入口，优先搜工具，后续可扩展到 Learn 和 Signals。

### 页面模块

1. 搜索输入框
2. 结果数量
3. 搜索范围切换
   - Tools
   - Learn
   - Signals
4. 工具结果的类型筛选
5. 结果列表
6. 关键词高亮

---

## 4.8 Learn 首页 `/learn`

### 目标

作为协议、技能、Agent、工作流的学习入口。

### 页面模块

1. Learn 页面标题
2. 学习路径精选
3. 概念类卡片
   - What is MCP?
   - What is an Agent Skill?
4. 决策类卡片
   - Agent Comparison
   - How to Choose an Agent
5. 指南类内容入口
6. Glossary 入口

---

## 4.9 Learn 文章页 `/learn/*`

例如：

- `/learn/what-is-mcp`
- `/learn/what-is-agent-skill`
- `/learn/agent-comparison`
- `/learn/how-to-choose-agent`
- `/learn/agent/[agent]`

### 页面模块

1. 文章头部
   - 标题
   - 副标题
   - 阅读时长
   - 难度
2. 正文内容
3. 图表或对比表格
4. 示例工具或协议
5. 相关工具推荐
6. 延伸阅读
7. 下载或工具浏览 CTA

---

## 4.10 Signals 首页 `/signals`

### 目标

作为“中文高质量 AI / Agent 内容英译”频道首页。

### 页面模块

1. 页面标题
2. 定位文案
   - English translations of high-quality AI writing from China
3. 筛选器
   - Topic
   - Source
   - Agent-related
   - Tool-related
4. 信号卡片列表
   - 英文标题
   - 简短摘要
   - 原始来源
   - 作者
   - 发布时间
   - why it matters
5. 相关工具标签

---

## 4.11 Signal 详情页 `/signals/[slug]`

### 目标

展示选定中文优质内容的英文全文翻译。

### 页面模块

1. 文章头部
   - 英文标题
   - 原中文标题
   - 来源
   - 作者
   - 日期
2. 来源说明区
   - 原文链接
   - 翻译声明
3. Executive Summary 摘要区
4. Full English Translation 全文翻译区
5. Why it matters for builders
6. Related Tools
7. Related Agents
8. Related Learn 内容

### 发布规则

只有在版权或授权允许的情况下，才发布完整英文翻译。

---

## 4.12 Upgrade 页 `/upgrade`

### 目标

承接 Lead Magnet 和可下载资源。

### 页面模块

1. 下载资源卡片
2. 邮箱订阅或 CTA
3. 资源分类
4. 精选 PDF / cheatsheet / 对比资料

---

## 4.13 Changelog 页 `/changelog`

### 目标

证明站点持续在更新，增强可信度。

### 页面模块

1. 按日期时间线
2. 新增工具记录
3. 更新工具记录
4. 新增 Learn / Signals 内容记录

---

## 5. 内容类型定义

## 5.1 工具类内容

- `skill`
- `mcp`
- `cli`
- `workflow`

这些内容共享通用详情页结构，但字段会略有差异。

## 5.2 支撑类内容

- `learn_article`
- `signal`
- `download`
- `agent_profile`
- `category`

---

## 6. 内容获取流程

## 6.1 工具内容

```text
GitHub / 官方文档 / 包管理器 / 用户提交
    -> 候选池
    -> 元数据标准化
    -> 类型归类
    -> 兼容 Agent 映射
    -> 编辑审核
    -> 发布为结构化 item JSON
```

## 6.2 Signals 内容

```text
中文白名单来源 / 人工精选 / 投稿
    -> signal 候选池
    -> 质量评分
    -> 权限检查
    -> 是否允许全文翻译？
        -> 是：摘要 + 全文翻译
        -> 否：不发布全文翻译
    -> 编辑审核
    -> 发布到 /signals
```

---

## 7. v1 优先级

### MVP 必做

1. Home 首页
2. `/type/skill`
3. `/type/mcp`
4. `/item/[id]`
5. `/for/[agent]`
6. `/learn`
7. `/signals`
8. `/signals/[slug]`

### MVP 之后再做

1. 更完整的分类系统
2. 更多 Learn 子指南
3. 完整的 Upgrade 资源中心
4. 更丰富的 Changelog 视图

---

## 8. 最终定位总结

### 产品层级应该是：

1. **Tools 第一**
2. **Learn 第二**
3. **Signals 第三**

### 首页应该传达的是：

- 这是一个找工具的地方
- 这是一个理解生态的地方
- 这是一个能读到中文高质量内容英译的地方

但无论如何，站点在用户第一感知上都不应该先像媒体站，再像工具聚合站。
