# agentk.it — 列表页 + 详情页 完整 Layout Spec

> Astro + Tailwind CSS · 暗色模式优先 · 响应式 · 开发者工具聚合站

---

## 0. Design System

### 0.1 Colors

```
Base (Dark)
  bg-page      #09090b  (zinc-950)   — 页面最底层背景
  bg-surface   #18181b  (zinc-900)   — 卡片、代码块背景
  bg-elevated  #27272a  (zinc-800)   — hover 态卡片、下拉面板
  bg-overlay   #3f3f46  (zinc-700)   — 分割线、选中态背景
  border       #27272a  (zinc-800)   — 卡片边框
  border-subtle #1f1f22 (zinc-900/80)— 微妙分割线

Text (Dark)
  text-primary    #fafafa  (zinc-50)    — 标题、重要文本
  text-secondary  #a1a1aa  (zinc-400)  — 正文、描述
  text-tertiary   #71717a  (zinc-500)  — 辅助信息、时间戳
  text-disabled   #52525b  (zinc-600)  — 禁用态

Accent
  accent          #06b6d4  (cyan-500)   — 主强调色
  accent-hover    #22d3ee  (cyan-400)   — hover
  accent-muted    #155e75  (cyan-800)   — 弱强调背景

Semantic
  success  #22c55e  (green-500)
  warning  #f59e0b  (amber-500)
  error    #ef4444  (red-500)
  info     #3b82f6  (blue-500)

Type Badge Colors (for card type labels)
  MCP badge:       bg-blue-900/40  text-blue-400  border-blue-800
  Skill badge:     bg-purple-900/40 text-purple-400 border-purple-800
  CLI badge:       bg-amber-900/40 text-amber-400 border-amber-800
  Workflow badge:  bg-emerald-900/40 text-emerald-400 border-emerald-800

Code Block
  bg-code         #0c0a09  (stone-950) — 代码块背景（比卡片更深）
  text-code       #a8a29e  (stone-400) — 代码文字
  border-code     #292524  (stone-800) — 代码块边框
  accent-code     #fbbf24  (amber-400) — 代码块内命令高亮色（用于 install 命令）
```

### 0.2 Typography

```
Font Stack
  UI:      'Inter', system-ui, -apple-system, sans-serif
  Mono:    'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace

Type Scale (Tailwind classes → rem/px)
  text-xs    0.75rem / 12px   — badges, tags, meta
  text-sm    0.875rem / 14px  — descriptions, secondary text
  text-base  1rem / 16px      — body, install commands
  text-lg    1.125rem / 18px  — card titles
  text-xl    1.25rem / 20px   — section headers
  text-2xl   1.5rem / 24px    — page title (mobile)
  text-3xl   1.875rem / 30px  — page title (desktop)

Font Weights
  font-normal   400 — body, descriptions
  font-medium   500 — card titles, section headers, buttons
  font-semibold 600 — page titles, tab active
  font-bold     700 — hero emphasis only

Letter Spacing
  tracking-tight  -0.025em — titles
  tracking-normal  0       — body
  tracking-wide    0.025em — mono code (preserve alignment)
```

### 0.3 Spacing

```
Gap Scale (Tailwind gap-*)
  gap-1   4px    — inline tag lists
  gap-2   8px    — card internal spacing
  gap-3   12px   — filter row gap
  gap-4   16px   — card grid gap (mobile)
  gap-6   24px   — card grid gap (desktop), section gaps
  gap-8   32px   — major section separations
  gap-12  48px   — page header to content

Padding Scale (Tailwind p-*)
  p-2   8px    — small badges
  p-3   12px   — filter pills
  p-4   16px   — card padding (mobile)
  p-5   20px   — card padding (desktop)
  p-6   24px   — section padding
  p-8   32px   — page-level padding

Page Width
  max-w-5xl  1024px  — content area (cards, details)
  max-w-7xl  1280px  — page container (filters + content)
```

### 0.4 Borders & Radii

```
  rounded-md   6px   — buttons, pills, badges
  rounded-lg   8px   — cards, code blocks
  rounded-xl   12px  — modals, larger cards
  border       1px solid border color
```

### 0.5 Shadows (dark mode)

```
  shadow-sm   — subtle lift for cards: 0 1px 2px rgba(0,0,0,0.4)
  shadow-md   — dropdowns: 0 4px 12px rgba(0,0,0,0.5)
  none        — flat design baseline
```

### 0.6 Transitions

```
  transition-colors duration-150  — hover/focus color changes
  transition-all   duration-200  — filter toggle, card hover lift
  transition-opacity duration-150 — loading states, fade in/out
  ease-out                       — all transitions (natural deceleration)
```

### 0.7 Focus Ring

```
  focus-visible:outline-none
  focus-visible:ring-2
  focus-visible:ring-accent     (#06b6d4)
  focus-visible:ring-offset-2
  focus-visible:ring-offset-bg-page
```

---

## 1. List Page — Full Spec

### 1.1 Desktop Wireframe

```
┌─────────────────────────────────────────────────────────────────────┐
│  [agentk.it]  Skills  MCPs  CLI  Workflows  🔍  [🌙]              │  ← Nav (not in scope, reference only)
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ← Back to Browse              max-w-7xl mx-auto px-6               │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  MCP Servers                                (487 tools)       │   │  Page Header
│  │  text-3xl font-semibold tracking-tight       text-tertiary   │   │
│  │                                                                │   │
│  │  Protocol servers that extend AI agents     text-secondary    │   │  Subtitle
│  │  with external tools and data sources.      text-base          │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Category: [All] [Search] [DevOps] [Data] [Comm] [Auto] ...  │   │  Filter Row 1
│  │  Agent:    [All] [Hermes] [Claude] [Cursor] [OpenClaw] [Cdx] │   │  Filter Row 2
│  │  Sort:     [Newest ▾] [Most Stars] [Trending]                 │   │  Filter Row 3
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  ┌────────────────────────────────────────────────────────┐  │   │
│  │  │ [MCP] Brave Search                       ☆ 1.2k        │  │   │  Tool Card 1
│  │  │ Web & local search API · 🔑 API key req'd              │  │   │
│  │  │ [Hermes] [Claude] [Cursor] [OpenClaw]                  │  │   │  Compat tags
│  │  │ $ npx @anthropic-ai/mcp-server-brave-search   [📋Copy] │  │   │  Install + copy
│  │  │ Updated Apr 20, 2026                                   │  │   │  Timestamp
│  │  └────────────────────────────────────────────────────────┘  │   │
│  │  ┌────────────────────────────────────────────────────────┐  │   │
│  │  │ [MCP] SearXNG Search                      ☆ 856        │  │   │  Tool Card 2
│  │  │ Privacy-respecting metasearch engine · Free            │  │   │
│  │  │ [Hermes] [Claude] [OpenClaw]                           │  │   │
│  │  │ $ pip install mcp-server-searxng             [📋Copy]  │  │   │
│  │  │ Updated Apr 19, 2026                                   │  │   │
│  │  └────────────────────────────────────────────────────────┘  │   │
│  │  ...                                                          │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│                    [← Previous]  1  2  3  ...  12  [Next →]         │  Pagination
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Mobile Wireframe

```
┌───────────────────────────┐
│  [☰]           [🔍] [🌙] │  ← Nav
├───────────────────────────┤
│                           │
│  MCP Servers    (487)     │  page title
│  Protocol servers that... │  subtitle
│                           │
│  [Filters ▾]  [Sort ▾]    │  collapsed filters
│                           │
│  ┌───────────────────────┐│
│  │ [MCP] Brave Search    ││
│  │ Web & local search... ││
│  │ [Hermes] [Claude] ... ││
│  │ $ npx @anthropi...📋  ││
│  │ ☆ 1.2k · Apr 20       ││
│  └───────────────────────┘│
│  ┌───────────────────────┐│
│  │ [MCP] SearXNG Search  ││
│  │ Privacy-respecting... ││
│  │ [Hermes] [Claude] ... ││
│  │ $ pip install mcp...📋 ││
│  │ ☆ 856 · Apr 19        ││
│  └───────────────────────┘│
│  ...                      │
│                           │
│      [Load More ▼]        │  load more button
│                           │
└───────────────────────────┘
```

### 1.3 Component Specs

#### 1.3.1 PageHeader

```
Component: PageHeader
Props:
  title: string            — "MCP Servers"
  count: number            — 487
  description?: string     — optional subtitle

Layout: flex flex-col gap-2

┌─ Tailwind ──────────────────────────────────────────────────┐
│ <header class="flex flex-col gap-2 mb-8">                    │
│   <div class="flex items-baseline gap-3 flex-wrap">          │
│     <h1 class="text-3xl font-semibold tracking-tight         │
│                text-zinc-50">                                │
│       {title}                                                │
│     </h1>                                                    │
│     <span class="text-zinc-500 text-lg font-normal">         │
│       ({count} tools)                                        │
│     </span>                                                  │
│   </div>                                                     │
│   {description && (                                          │
│     <p class="text-zinc-400 text-base max-w-2xl">            │
│       {description}                                          │
│     </p>                                                     │
│   )}                                                         │
│ </header>                                                    │
└──────────────────────────────────────────────────────────────┘
```

#### 1.3.2 FilterBar

```
Component: FilterBar
Props:
  categories: {label: string, value: string}[]
  activeCategory: string        — default "all"
  agents: {label: string, value: string}[]
  activeAgent: string
  sortOptions: {label: string, value: string}[]
  activeSort: string
  onCategoryChange: (value) => void
  onAgentChange: (value) => void
  onSortChange: (value) => void

Desktop Layout: flex flex-col gap-3 mb-8
Mobile Layout:  collapsed into dropdown buttons

┌─ Tailwind (Desktop) ────────────────────────────────────────┐
│ <div class="flex flex-col gap-3 mb-8">                       │
│   <!-- Category row -->                                      │
│   <div class="flex items-center gap-2 flex-wrap">            │
│     <span class="text-zinc-500 text-sm w-20 shrink-0">       │
│       Category:                                              │
│     </span>                                                   │
│     <div class="flex gap-1.5 flex-wrap">                     │
│       {categories.map(cat => (                               │
│         <FilterPill                                          │
│           label={cat.label}                                  │
│           active={activeCategory === cat.value}              │
│           onClick={() => onCategoryChange(cat.value)}        │
│         />                                                   │
│       ))}                                                    │
│     </div>                                                    │
│   </div>                                                      │
│   <!-- Agent row -->                                          │
│   <div class="flex items-center gap-2 flex-wrap">            │
│     <span class="text-zinc-500 text-sm w-20 shrink-0">       │
│       Agent:                                                  │
│     </span>                                                    │
│     <div class="flex gap-1.5 flex-wrap">                     │
│       {agents.map(ag => <FilterPill ... />)}                 │
│     </div>                                                    │
│   </div>                                                      │
│   <!-- Sort row -->                                           │
│   <div class="flex items-center gap-2">                       │
│     <span class="text-zinc-500 text-sm w-20 shrink-0">       │
│       Sort:                                                   │
│     </span>                                                    │
│     <div class="flex gap-1.5">                                │
│       {sortOptions.map(s => <FilterPill ... />)}             │
│     </div>                                                    │
│   </div>                                                      │
│ </div>                                                        │
└──────────────────────────────────────────────────────────────┘

Sub-component: FilterPill
Props:
  label: string
  active: boolean
  onClick: () => void

┌─ Tailwind ──────────────────────────────────────────────────┐
│ <button                                                     │
│   class={[                                                   │
│     "px-3 py-1.5 rounded-md text-sm font-medium",           │
│     "transition-all duration-200 ease-out",                  │
│     "focus-visible:outline-none focus-visible:ring-2",       │
│     "focus-visible:ring-cyan-500 focus-visible:ring-offset-2",│
│     "focus-visible:ring-offset-zinc-950",                     │
│     active                                                  │
│       ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30" │
│       : "bg-transparent text-zinc-400 border border-transparent",│
│     !active && "hover:text-zinc-200 hover:bg-zinc-800/50",   │
│   ].join(" ")}                                               │
│   onClick={onClick}                                          │
│ >                                                            │
│   {label}                                                    │
│ </button>                                                    │
└──────────────────────────────────────────────────────────────┘

States:
  Default:    bg-transparent text-zinc-400 border-transparent
  Hover:      bg-zinc-800/50 text-zinc-200
  Active:     bg-cyan-500/15 text-cyan-400 border-cyan-500/30
  Focus:      ring-2 ring-cyan-500
  Disabled:   text-zinc-600 cursor-not-allowed
```

#### 1.3.3 ToolCard

```
Component: ToolCard
Props:
  id: string
  type: 'mcp' | 'skill' | 'cli' | 'workflow'
  name: string
  description: string          — max 1 line, truncate
  compatible: string[]         — e.g. ['hermes-agent', 'claude-code']
  installCommand: string       — truncated to 1 line
  stars: number
  updatedAt: string            — ISO date
  apiKeyRequired?: boolean

Layout: grid grid-cols-[auto_1fr_auto] gap-x-4 gap-y-2 items-start

Desktop card:

┌─ Tailwind ──────────────────────────────────────────────────┐
│ <a href={`/item/${id}`} class="block group">                │
│   <article class={[                                         │
│     "p-5 rounded-lg border border-zinc-800",                │
│     "bg-zinc-900 hover:bg-zinc-800/80",                     │
│     "transition-all duration-200 ease-out",                 │
│     "hover:border-zinc-700 hover:shadow-sm",                │
│     "focus-visible:outline-none focus-visible:ring-2",       │
│     "focus-visible:ring-cyan-500",                          │
│   ].join(" ")}>                                              │
│                                                              │
│     <!-- Row 1: Type badge + Name + Stars -->               │
│     <div class="flex items-start justify-between gap-4      │
│                 mb-2">                                       │
│       <div class="flex items-center gap-3 min-w-0">          │
│         <TypeBadge type={type} />                            │
│         <h2 class="text-lg font-medium text-zinc-50         │
│                    truncate">                                │
│           {name}                                             │
│         </h2>                                                │
│       </div>                                                 │
│       <div class="flex items-center gap-1 shrink-0          │
│                   text-zinc-500 text-sm">                    │
│         <StarIcon class="w-4 h-4" />                        │
│         <span>{formatStars(stars)}</span>                    │
│       </div>                                                 │
│     </div>                                                   │
│                                                              │
│     <!-- Row 2: Description (truncated 1 line) -->          │
│     <p class="text-zinc-400 text-sm truncate mb-3">          │
│       {description}                                          │
│       {apiKeyRequired && (                                  │
│         <span class="text-amber-400 ml-1">· 🔑 API key</span>│
│       )}                                                     │
│     </p>                                                     │
│                                                              │
│     <!-- Row 3: Compat badges -->                            │
│     <div class="flex gap-1.5 flex-wrap mb-3">                │
│       {compatible.slice(0, 5).map(agent => (                │
│         <CompatBadge agent={agent} />                        │
│       ))}                                                    │
│       {compatible.length > 5 && (                            │
│         <span class="text-zinc-600 text-xs">                 │
│           +{compatible.length - 5}                           │
│         </span>                                              │
│       )}                                                     │
│     </div>                                                   │
│                                                              │
│     <!-- Row 4: Install command + Copy + Updated -->        │
│     <div class="flex items-center gap-2">                    │
│       <code class="flex-1 min-w-0 px-3 py-1.5 rounded-md    │
│                    bg-stone-950 border border-stone-800       │
│                    text-stone-400 text-sm font-mono           │
│                    truncate">                                │
│         <span class="text-amber-400">$</span> {installCmd}   │
│       </code>                                                │
│       <CopyButton text={installCommand} />                   │
│       <span class="text-zinc-600 text-xs shrink-0">          │
│         {formatDate(updatedAt)}                              │
│       </span>                                                │
│     </div>                                                   │
│                                                              │
│   </article>                                                 │
│ </a>                                                         │
└──────────────────────────────────────────────────────────────┘

Card States:
  Default:   bg-zinc-900  border-zinc-800
  Hover:     bg-zinc-800/80  border-zinc-700  shadow-sm
  Focus:     ring-2 ring-cyan-500
  Active:    bg-zinc-800  border-zinc-600  (clicking)
  Loading:   pulse animation on card skeleton (see skeleton spec below)

Card Skeleton (Loading):
  <div class="animate-pulse p-5 rounded-lg border border-zinc-800 bg-zinc-900">
    <div class="flex gap-3 mb-2">
      <div class="w-14 h-5 bg-zinc-800 rounded-md" />   <!-- type badge -->
      <div class="w-48 h-5 bg-zinc-800 rounded-md" />    <!-- name -->
    </div>
    <div class="w-3/4 h-4 bg-zinc-800 rounded-md mb-3" /> <!-- desc -->
    <div class="flex gap-1.5 mb-3">
      <div class="w-16 h-5 bg-zinc-800 rounded-md" />
      <div class="w-16 h-5 bg-zinc-800 rounded-md" />
    </div>
    <div class="flex gap-2">
      <div class="flex-1 h-8 bg-zinc-800 rounded-md" />  <!-- code -->
      <div class="w-8 h-8 bg-zinc-800 rounded-md" />     <!-- copy btn -->
    </div>
  </div>

Mobile: full-width card, same structure but:
  - Stars move next to type badge (same row as name)
  - Compat badges hidden behind "+N agents" pill if >3
  - install command font-size drops to text-xs
  - Copy button stays 44x44px touch target
```

#### 1.3.4 TypeBadge

```
Component: TypeBadge
Props:
  type: 'mcp' | 'skill' | 'cli' | 'workflow'

┌─ Tailwind ──────────────────────────────────────────────────┐
│ <span class={[                                               │
│   "inline-flex items-center gap-1 px-2 py-0.5 rounded-md",  │
│   "text-xs font-medium border shrink-0",                     │
│   type === 'mcp'      && "bg-blue-900/30 text-blue-400    border-blue-800/50",  │
│   type === 'skill'    && "bg-purple-900/30 text-purple-400 border-purple-800/50",│
│   type === 'cli'      && "bg-amber-900/30 text-amber-400  border-amber-800/50",  │
│   type === 'workflow' && "bg-emerald-900/30 text-emerald-400 border-emerald-800/50",│
│ ].join(" ")}>                                                │
│   {iconMap[type]} {labelMap[type]}                          │
│   {/* iconMap: MCP→🔌, Skill→🧩, CLI→⌨, Workflow→⚙ */}    │
│ </span>                                                      │
└──────────────────────────────────────────────────────────────┘
```

#### 1.3.5 CompatBadge

```
Component: CompatBadge
Props:
  agent: string  — 'hermes-agent' | 'claude-code' | 'cursor' | 'openclaw' | 'codex'

┌─ Tailwind ──────────────────────────────────────────────────┐
│ <span class="inline-flex px-2 py-0.5 rounded-md             │
│              bg-zinc-800 text-zinc-400                      │
│              text-xs font-medium border border-zinc-700/50   │
│              shrink-0">                                       │
│   {agentLabel[agent]}                                       │
│ </span>                                                      │
│                                                              │
│ agentLabel map:                                              │
│   hermes-agent → "Hermes"                                   │
│   claude-code  → "Claude"                                   │
│   cursor       → "Cursor"                                   │
│   openclaw     → "OpenClaw"                                 │
│   codex        → "Codex"                                    │
└──────────────────────────────────────────────────────────────┘
```

#### 1.3.6 CopyButton

```
Component: CopyButton
Props:
  text: string            — the text to copy

States: default, hover, clicked (copied), error

┌─ Tailwind ──────────────────────────────────────────────────┐
│ <button                                                     │
│   onClick={handleCopy}                                       │
│   class={[                                                   │
│     "shrink-0 p-2 rounded-md",                              │
│     "transition-all duration-150 ease-out",                  │
│     "focus-visible:outline-none focus-visible:ring-2",       │
│     "focus-visible:ring-cyan-500",                          │
│     copied                                                  │
│       ? "bg-green-500/15 text-green-400"                     │
│       : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800",│
│   ].join(" ")}                                               │
│   aria-label={copied ? "Copied" : "Copy to clipboard"}      │
│ >                                                            │
│   {copied ? <CheckIcon class="w-4 h-4" />                   │
│           : <CopyIcon  class="w-4 h-4" />}                  │
│ </button>                                                    │
└──────────────────────────────────────────────────────────────┘

States:
  Default:  text-zinc-500
  Hover:    text-zinc-300 bg-zinc-800
  Focus:    ring-2 ring-cyan-500
  Copied:   bg-green-500/15 text-green-400 (auto-resets after 2s)
  Error:    bg-red-500/15 text-red-400 (auto-resets after 2s)

JS behavior:
  - Click → navigator.clipboard.writeText(text)
  - Success → set copied=true, setTimeout(() => set copied=false, 2000)
  - Error   → set error=true, setTimeout(() => set error=false, 2000)
```

#### 1.3.7 Pagination

```
Component: Pagination
Props:
  currentPage: number
  totalPages: number
  onPageChange: (page) => void

Desktop: centered flex row with page numbers
Mobile: "Load More" button (infinite-scroll style pagination)

┌─ Tailwind (Desktop) ────────────────────────────────────────┐
│ <nav class="flex items-center justify-center gap-1 mt-10    │
│            mb-6" aria-label="Pagination">                    │
│   <PageBtn label="← Prev" disabled={currentPage === 1} />  │
│   {pageNumbers.map(p => (                                    │
│     <PageBtn label={String(p)} active={p === currentPage} />│
│   ))}                                                        │
│   <PageBtn label="Next →" disabled={currentPage === last} />│
│ </nav>                                                       │
│                                                              │
│ Sub-component: PageBtn                                       │
│ <button class={[                                             │
│   "min-w-[40px] h-10 px-3 rounded-md text-sm font-medium",  │
│   "transition-colors duration-150",                          │
│   "focus-visible:ring-2 focus-visible:ring-cyan-500",       │
│   active                                                   │
│     ? "bg-cyan-500/15 text-cyan-400"                        │
│     : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800",│
│   disabled && "text-zinc-600 cursor-not-allowed             │
│                hover:bg-transparent hover:text-zinc-600",   │
│ ].join(" ")}>                                                │
│   {label}                                                    │
│ </button>                                                    │
└──────────────────────────────────────────────────────────────┘

┌─ Tailwind (Mobile: Load More) ──────────────────────────────┐
│ <button class="w-full py-3 px-6 rounded-lg                  │
│                bg-zinc-900 border border-zinc-800             │
│                text-zinc-400 text-sm font-medium              │
│                hover:bg-zinc-800 hover:text-zinc-200          │
│                transition-colors duration-150                 │
│                focus-visible:ring-2 focus-visible:ring-cyan-500">│
│   Load More                                                  │
│ </button>                                                    │
└──────────────────────────────────────────────────────────────┘
```

#### 1.3.8 Empty State

```
Component: EmptyState
Props:
  title?: string
  message: string
  actionLabel?: string
  actionHref?: string

┌─ Tailwind ──────────────────────────────────────────────────┐
│ <div class="flex flex-col items-center justify-center        │
│            py-20 px-6 text-center">                          │
│   <div class="w-16 h-16 rounded-full bg-zinc-800             │
│               flex items-center justify-center mb-4">         │
│     <SearchXIcon class="w-8 h-8 text-zinc-600" />           │
│   </div>                                                     │
│   <h3 class="text-zinc-400 text-lg font-medium mb-2">        │
│     {title || "No tools found"}                              │
│   </h3>                                                      │
│   <p class="text-zinc-500 text-sm max-w-sm mb-6">            │
│     {message}                                                │
│   </p>                                                       │
│   {actionLabel && (                                          │
│     <a href={actionHref} class="inline-flex px-4 py-2       │
│       rounded-md bg-cyan-500/10 text-cyan-400                │
│       text-sm font-medium border border-cyan-500/30           │
│       hover:bg-cyan-500/20 transition-colors">               │
│       {actionLabel}                                          │
│     </a>                                                     │
│   )}                                                         │
│ </div>                                                       │
└──────────────────────────────────────────────────────────────┘
```

#### 1.3.9 Error State

```
Component: ErrorBanner
Props:
  message: string
  onRetry?: () => void

┌─ Tailwind ──────────────────────────────────────────────────┐
│ <div class="flex items-center gap-3 p-4 rounded-lg           │
│            bg-red-500/10 border border-red-500/20             │
│            text-red-400 text-sm mb-6">                       │
│   <AlertTriangleIcon class="w-5 h-5 shrink-0" />            │
│   <span class="flex-1">{message}</span>                      │
│   {onRetry && (                                              │
│     <button onClick={onRetry}                                │
│       class="shrink-0 px-3 py-1 rounded-md                  │
│              bg-red-500/15 hover:bg-red-500/25                │
│              text-red-300 text-sm font-medium                 │
│              transition-colors">                              │
│       Retry                                                  │
│     </button>                                                │
│   )}                                                         │
│ </div>                                                       │
└──────────────────────────────────────────────────────────────┘
```

### 1.4 Filter Transition Spec

When switching filters, cards should animate out/in:

```
Old cards:   opacity-100 → opacity-0, translate-y-0 → translate-y-2
             duration-150, then unmount
New cards:   mount hidden, then opacity-0 → opacity-100, translate-y-2 → translate-y-0
             duration-150, delay-75
```

---

## 2. Detail Page — Full Spec

### 2.1 Desktop Wireframe

```
┌─────────────────────────────────────────────────────────────────────┐
│  [agentk.it]  Skills  MCPs  CLI  Workflows  🔍  [🌙]              │  Nav
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ← Back to MCP Servers                          max-w-5xl mx-auto   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                                                                │   │
│  │  [MCP]  ← type badge                                         │   │
│  │                                                                │   │
│  │  Brave Search MCP                              ☆ 1,245       │   │  h1 + stars
│  │  text-3xl font-semibold tracking-tight                       │   │
│  │                                                                │   │
│  │  Web and local search through Brave's API.                    │   │  Description
│  │  Supports text, image, and video search with                   │   │  (1-2 paragraphs)
│  │  customizable result counts and safe search modes.            │   │
│  │                                                                │   │
│  │  [Hermes Agent] [Claude Code] [Cursor] [OpenClaw] [+2]      │   │  Compat tags (large)
│  │                                                                │   │
│  └──────────────────────────────────────────────────────────────┘   │  Section: Header
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  ## Install                                                   │   │  Section: Install
│  │                                                                │   │
│  │  ┌──────────────────────────────────────────────────────┐    │   │
│  │  │ $ npx @anthropic-ai/mcp-server-brave-search         │ [📋]│   │  Code block + copy
│  │  └──────────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  ## API Key                                                   │   │  Section: API Key
│  │  🔑 This tool requires an API key                             │   │  (conditional)
│  │  Get one at → brave.com/search/api/                           │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  ## Configuration                                             │   │  Section: Config
│  │                                                                │   │
│  │  [Claude Code] [Hermes Agent] [Cursor] [OpenClaw]             │   │  Platform tabs
│  │  ──────────────────────────────────────────                   │   │
│  │  ┌──────────────────────────────────────────────────────┐    │   │
│  │  │ {                                                     │    │   │  Config code block
│  │  │   "mcpServers": {                                    │    │   │
│  │  │     "brave-search": {                                │    │   │
│  │  │       "command": "npx",                              │    │   │
│  │  │       "args": ["-y", "@anthropic-ai/mcp-server-.."], │    │   │
│  │  │       "env": {                                       │    │   │
│  │  │         "BRAVE_API_KEY": "your-key-here"             │    │   │
│  │  │       }                                              │    │   │
│  │  │     }                                                │    │   │
│  │  │   }                                                  │ [📋]│   │
│  │  │ }                                                     │    │   │
│  │  └──────────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  ## What It Does                                              │   │  Section: Features
│  │                                                                │   │
│  │  ✓ Web search with Brave's independent index                  │   │
│  │  ✓ Local search for businesses and places                      │   │
│  │  ✓ Image and video search support                             │   │
│  │  ✓ Configurable safe search levels                             │   │
│  │  ✓ Auto-suggests related queries                               │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  ## Usage Example                                             │   │  Section: Usage
│  │                                                                │   │
│  │  ┌──────────────────────────────────────────────────────┐    │   │
│  │  │ "Search for recent news about AI agents"             │    │   │  Example prompt
│  │  └──────────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  ## Test Command                                              │   │  Section: Test
│  │                                                                │   │
│  │  ┌──────────────────────────────────────────────────────┐    │   │
│  │  │ $ npx @anthropic-ai/mcp-server-brave-search --help  │ [📋]│   │
│  │  └──────────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  ## Source                                                     │   │  Section: Source
│  │                                                                │   │
│  │  github.com/anthropics/mcp-server-brave-search    ↗          │   │
│  │  License: MIT  ·  Last commit: Apr 20, 2026                  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  ## Related Tools                                              │   │  Section: Related
│  │                                                                │   │
│  │  ┌──────────────────┐ ┌──────────────────┐ ┌───────────────┐ │   │
│  │  │ SearXNG MCP       │ │ Tavily Search    │ │ Brave Search  │ │   │  Mini cards
│  │  │ Privacy-first     │ │ Real-time search │ │ Local MCP     │ │   │
│  │  │ ☆ 856  [MCP]     │ │ ☆ 723  [MCP]    │ │ ☆ 412  [MCP] │ │   │
│  │  └──────────────────┘ └──────────────────┘ └───────────────┘ │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  [Report issue]  [Suggest edit]                               │   │  Footer actions
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Mobile Wireframe

```
┌───────────────────────────┐
│  [☰]           [🔍] [🌙] │  Nav
├───────────────────────────┤
│                           │
│  ← Back to MCP Servers   │
│                           │
│  [MCP]                    │
│                           │
│  Brave Search MCP         │
│  ☆ 1,245                 │
│                           │
│  Web and local search     │
│  through Brave's API.     │
│  Supports text, image,    │
│  and video search with    │
│  customizable result...   │
│                           │
│  [Hermes] [Claude]        │
│  [Cursor] [OpenClaw] [+2] │
│                           │
│  ─── Install ───          │
│  ┌─────────────────────┐  │
│  │ $ npx @anthropic.. │📋│
│  └─────────────────────┘  │
│                           │
│  ─── API Key ───          │
│  🔑 Required              │
│  brave.com/search/api/    │
│                           │
│  ─── Config ───           │
│  [Claude] [Hermes] [...]  │  h-scroll tabs
│  ┌─────────────────────┐  │
│  │ { "mcpServers":    │📋│
│  │   { ... } }         │  │
│  └─────────────────────┘  │
│                           │
│  ─── What It Does ───     │
│  ✓ Web search             │
│  ✓ Local search           │
│  ✓ Image search           │
│  ...                      │
│                           │
│  ─── Usage ───            │
│  ┌─────────────────────┐  │
│  │ "Search for recent  │  │
│  │  news about AI..."  │  │
│  └─────────────────────┘  │
│                           │
│  ─── Source ───           │
│  github.com/anthropics/.. │
│  MIT · Apr 20, 2026       │
│                           │
│  ─── Related ───          │
│  [SearXNG MCP]            │  full-width cards
│  [Tavily Search MCP]      │
│  [Brave Local MCP]        │
│                           │
│  [Report] [Suggest edit]  │
│                           │
└───────────────────────────┘
```

### 2.3 Component Specs

#### 2.3.1 DetailHeader

```
Component: DetailHeader
Props:
  type: 'mcp' | 'skill' | 'cli' | 'workflow'
  name: string
  description: string
  compatible: string[]
  stars: number
  sourceUrl: string
  license: string
  lastCommit: string

┌─ Tailwind ──────────────────────────────────────────────────┐
│ <header class="mb-10">                                       │
│   <!-- Back link -->                                          │
│   <a href={backUrl} class="inline-flex items-center gap-1    │
│     text-zinc-500 hover:text-zinc-300 text-sm mb-6            │
│     transition-colors">                                       │
│     ← Back to {parentType}                                   │
│   </a>                                                        │
│                                                               │
│   <!-- Type badge -->                                         │
│   <TypeBadge type={type} class="mb-4" />                    │
│                                                               │
│   <!-- Name + Stars -->                                       │
│   <div class="flex items-start justify-between gap-4          │
│               flex-wrap mb-4">                                │
│     <h1 class="text-3xl font-semibold tracking-tight         │
│                text-zinc-50">                                 │
│       {name}                                                  │
│     </h1>                                                     │
│     <div class="flex items-center gap-1.5 text-zinc-400      │
│                 text-sm shrink-0 mt-1">                       │
│       <StarIcon class="w-4 h-4" />                           │
│       <span class="font-medium text-zinc-300">{stars}</span>  │
│       <span class="text-zinc-500">stars</span>                │
│     </div>                                                    │
│   </div>                                                      │
│                                                               │
│   <!-- Description -->                                        │
│   <p class="text-zinc-400 text-base leading-relaxed           │
│            max-w-3xl mb-5">                                   │
│     {description}                                             │
│   </p>                                                        │
│                                                               │
│   <!-- Compat tags (larger than card version) -->             │
│   <div class="flex gap-2 flex-wrap mb-5">                     │
│     {compatible.map(agent => (                                │
│       <span class="px-3 py-1 rounded-md bg-zinc-800/80        │
│                    text-zinc-300 text-sm font-medium           │
│                    border border-zinc-700/50">                 │
│         {agentLabel[agent]}                                   │
│       </span>                                                  │
│     ))}                                                       │
│   </div>                                                      │
│                                                               │
│   <!-- Source meta -->                                        │
│   <div class="flex items-center gap-4 text-sm text-zinc-500   │
│               flex-wrap">                                     │
│     <a href={sourceUrl} class="inline-flex items-center gap-1 │
│       text-zinc-500 hover:text-cyan-400 transition-colors">   │
│       {formatSourceUrl(sourceUrl)} ↗                          │
│     </a>                                                      │
│     <span>{license}</span>                                    │
│     <span>Last commit: {formatDate(lastCommit)}</span>        │
│   </div>                                                      │
│ </header>                                                     │
└──────────────────────────────────────────────────────────────┘
```

#### 2.3.2 DetailSection

```
Component: DetailSection  (reusable wrapper for all sections)
Props:
  title: string
  children: ReactNode
  id?: string

┌─ Tailwind ──────────────────────────────────────────────────┐
│ <section id={id} class="mb-10">                              │
│   <h2 class="text-xl font-semibold text-zinc-100             │
│            tracking-tight mb-4 pb-3                          │
│            border-b border-zinc-800">                        │
│     {title}                                                   │
│   </h2>                                                       │
│   {children}                                                  │
│ </section>                                                    │
└──────────────────────────────────────────────────────────────┘
```

#### 2.3.3 CodeBlock (Install / Config / Test sections)

```
Component: CodeBlock
Props:
  code: string
  language?: string         — 'bash' | 'json' | 'yaml' | 'plain'
  showCopy?: boolean        — default true
  showDollarSign?: boolean  — prepend "$" for bash, default false

┌─ Tailwind ──────────────────────────────────────────────────┐
│ <div class="relative group rounded-lg                        │
│            bg-stone-950 border border-stone-800               │
│            overflow-hidden">                                  │
│   <!-- Header bar -->                                        │
│   <div class="flex items-center justify-between              │
│               px-4 py-2 border-b border-stone-800/50          │
│               bg-stone-950/80">                               │
│     <span class="text-stone-500 text-xs font-mono">          │
│       {language || 'bash'}                                   │
│     </span>                                                   │
│     {showCopy && <CopyButton text={code} />}                 │
│   </div>                                                      │
│   <!-- Code content -->                                       │
│   <pre class="p-4 overflow-x-auto"><code                     │
│     class="text-sm font-mono leading-relaxed                  │
│            text-stone-300">                                   │
│     {showDollarSign && (                                     │
│       <span class="text-amber-400 select-none">$ </span>     │
│     )}                                                        │
│     {code}                                                    │
│   </code></pre>                                               │
│ </div>                                                        │
└──────────────────────────────────────────────────────────────┘

States:
  Default:  border-stone-800
  Hover:    border-stone-700 (subtle, code block itself doesn't change)
  The CopyButton inside has its own hover/copied states

Syntax highlighting hints (CSS, handled by Shiki/Prism in build):
  command:  text-amber-300
  string:   text-green-300
  key:      text-cyan-300
  comment:  text-stone-600 italic
```

#### 2.3.4 APIBadge

```
Component: APIBadge
Props:
  keyUrl: string

Conditional section — only rendered if tool requires an API key.

┌─ Tailwind ──────────────────────────────────────────────────┐
│ <div class="flex items-start gap-3 p-4 rounded-lg            │
│            bg-amber-500/10 border border-amber-500/20">       │
│   <KeyIcon class="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />│
│   <div>                                                       │
│     <p class="text-amber-300 text-sm font-medium mb-1">      │
│       API Key Required                                       │
│     </p>                                                      │
│     <a href={keyUrl}                                          │
│       class="text-amber-400/70 hover:text-amber-300          │
│              text-sm underline underline-offset-2              │
│              transition-colors"                               │
│       target="_blank" rel="noopener noreferrer">              │
│       Get API key at {keyUrl} ↗                              │
│     </a>                                                      │
│   </div>                                                      │
│ </div>                                                        │
└──────────────────────────────────────────────────────────────┘
```

#### 2.3.5 ConfigTabs

```
Component: ConfigTabs
Props:
  platforms: {
    agent: string                    — 'claude-code' | 'hermes-agent' | 'cursor' | 'openclaw'
    label: string                    — "Claude Code", "Hermes Agent", ...
    config: string                   — the config code for this platform
  }[]
  defaultAgent?: string              — uses first platform if not set

┌─ Tailwind ──────────────────────────────────────────────────┐
│ <div>                                                        │
│   <!-- Tab bar -->                                           │
│   <div class="flex gap-0.5 mb-4 overflow-x-auto              │
│               pb-1 scrollbar-none" role="tablist">           │
│     {platforms.map(platform => (                             │
│       <button                                                 │
│         role="tab"                                            │
│         aria-selected={active === platform.agent}            │
│         onClick={() => setActive(platform.agent)}            │
│         class={[                                              │
│           "px-4 py-2 rounded-md text-sm font-medium",        │
│           "transition-colors duration-150",                   │
│           "focus-visible:outline-none focus-visible:ring-2",  │
│           "focus-visible:ring-cyan-500 whitespace-nowrap",   │
│           active === platform.agent                          │
│             ? "bg-cyan-500/15 text-cyan-400"                 │
│             : "text-zinc-400 hover:text-zinc-200              │
│                hover:bg-zinc-800/50",                         │
│         ].join(" ")}>                                         │
│         {platform.label}                                     │
│       </button>                                               │
│     ))}                                                       │
│   </div>                                                      │
│                                                               │
│   <!-- Tab content -->                                        │
│   {platforms.map(platform => (                                │
│     <div                                                     │
│       role="tabpanel"                                         │
│       class={active === platform.agent ? 'block' : 'hidden'} │
│     >                                                         │
│       <CodeBlock code={platform.config} language="json" />   │
│     </div>                                                    │
│   ))}                                                         │
│ </div>                                                        │
└──────────────────────────────────────────────────────────────┘

Tab Transition Animation:
  Content swap: opacity-0 → opacity-100 with duration-200
  Active tab indicator: no sliding underline, uses bg-color change (cleaner)
```

#### 2.3.6 FeatureList

```
Component: FeatureList
Props:
  features: string[]

┌─ Tailwind ──────────────────────────────────────────────────┐
│ <ul class="space-y-3">                                       │
│   {features.map((feature, i) => (                             │
│     <li class="flex items-start gap-3 text-zinc-400          │
│                text-sm">                                      │
│       <CheckCircleIcon class="w-5 h-5 text-emerald-500       │
│                               mt-0.5 shrink-0" />            │
│       <span>{feature}</span>                                 │
│     </li>                                                     │
│   ))}                                                         │
│ </ul>                                                         │
└──────────────────────────────────────────────────────────────┘
```

#### 2.3.7 RelatedCard (mini card for Related Tools section)

```
Component: RelatedCard
Props:
  id: string
  name: string
  type: 'mcp' | 'skill' | 'cli' | 'workflow'
  description: string         — 1 line only
  stars: number

┌─ Tailwind ──────────────────────────────────────────────────┐
│ <a href={`/item/${id}`} class="block group">                │
│   <article class="p-4 rounded-lg border border-zinc-800      │
│                  bg-zinc-900 hover:bg-zinc-800/80             │
│                  transition-all duration-200">                │
│     <div class="flex items-center gap-2 mb-1.5">             │
│       <TypeBadge type={type} />                              │
│       <h3 class="text-sm font-medium text-zinc-200            │
│                  truncate group-hover:text-zinc-100">         │
│         {name}                                                │
│       </h3>                                                   │
│     </div>                                                    │
│     <p class="text-xs text-zinc-500 truncate mb-2">          │
│       {description}                                          │
│     </p>                                                      │
│     <div class="flex items-center gap-1 text-zinc-600        │
│                 text-xs">                                     │
│       <StarIcon class="w-3 h-3" /> {stars}                  │
│     </div>                                                    │
│   </article>                                                  │
│ </a>                                                          │
└──────────────────────────────────────────────────────────────┘

Desktop grid (3 cols):  grid grid-cols-3 gap-4
Tablet (2 cols):        md:grid-cols-2
Mobile (1 col):         default single column
```

#### 2.3.8 PageFooter

```
Component: PageFooter
Props:
  reportUrl: string
  suggestUrl: string

┌─ Tailwind ──────────────────────────────────────────────────┐
│ <footer class="flex items-center gap-4 pt-6                  │
│               border-t border-zinc-800 mt-10">               │
│   <a href={reportUrl} class="text-zinc-600 hover:text-red-400│
│     text-sm transition-colors" target="_blank"               │
│     rel="noopener noreferrer">                               │
│     Report issue                                             │
│   </a>                                                        │
│   <span class="text-zinc-700">·</span>                       │
│   <a href={suggestUrl} class="text-zinc-600                  │
│     hover:text-zinc-400 text-sm transition-colors"            │
│     target="_blank" rel="noopener noreferrer">               │
│     Suggest edit                                             │
│   </a>                                                        │
│ </footer>                                                     │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. Shared Utilities

### 3.1 formatStars()

```
Input:  1245    →  "1.2k"
Input:  856     →  "856"
Input:  23      →  "23"
Input:  12450   →  "12.4k"

function formatStars(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`
  return String(n)
}
```

### 3.2 formatDate()

```
Input:  "2026-04-20T14:32:00Z"  →  "Apr 20, 2026"
Input:  "2026-05-09T02:15:00Z"  →  "May 9, 2026"

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
}
```

### 3.3 formatSourceUrl()

```
Input:  "https://github.com/anthropics/mcp-server-brave-search"
Output: "github.com/anthropics/mcp-server-brave-search"

function formatSourceUrl(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
}
```

---

## 4. Responsive Breakpoints

```
Breakpoints (Tailwind defaults):
  sm:  640px   — mobile landscape
  md:  768px   — tablet
  lg:  1024px  — desktop
  xl:  1280px  — wide desktop

Key layout shifts:

  Page container:
    Default: px-4
    sm:      px-6
    lg:      px-8

  Tool cards:
    Default: single column, full width
    lg:      single column, max-w-5xl centered

  Related cards:
    Default: 1 col
    sm:      2 cols (grid-cols-2)
    lg:      3 cols (grid-cols-3)

  Filter bar:
    Default: collapsed dropdowns ("Filters ▾" "Sort ▾")
    md:      expanded horizontal pills

  Detail header compat badges:
    Default: 2-3 visible, rest in "+N" pill
    sm:      all visible, wrap naturally

  Code blocks:
    Default: text-xs
    sm:      text-sm
```

---

## 5. Accessibility Notes

```
- All interactive elements have focus-visible:ring-2 ring-cyan-500
- Copy buttons have aria-label that changes between "Copy" and "Copied"
- Filter pills use role="radio" or role="tab" in context
- ConfigTabs use role="tablist" / role="tab" / role="tabpanel"
- Pagination has aria-label="Pagination" and aria-current="page" on active
- Loading skeletons have aria-hidden="true"
- Error banners use role="alert"
- Minimum touch target 44x44px on mobile (especially CopyButton)
- Color contrast: text-zinc-400 (#a1a1aa) on bg-zinc-900 (#18181b) = 6.23:1 (passes AA)
- Color contrast: text-cyan-400 on bg-cyan-500/15 on bg-zinc-900 — verify at build time
```

---

## 6. Implementation Notes

```
1. All colors use Tailwind zinc-* + cyan-* + semantic colors — no custom hex values
   needed in CSS. The exceptions are code-block colors (stone-950, amber-400)
   which should be in tailwind.config.mjs extend block.

2. The "Dollar sign" in install commands uses text-amber-400 with select-none
   to prevent copy-paste including the prompt character.

3. Filter transitions: use CSS @starting-style or a simple JS mount/unmount with
   opacity + translateY. No heavy animation libraries needed.

4. CopyButton should use navigator.clipboard.writeText() with a 2-second
   "copied" feedback state that auto-resets.

5. ConfigTabs should default to the first compatible platform in the tool's data.
   If the tool is compatible with "hermes-agent" and "claude-code", show
   "claude-code" first (alphabetical is fine).

6. Empty state should trigger when filtered results === 0, not just on page load.

7. Error state covers: failed data fetch, network error, JSON parse failure.
   Always include a "Retry" action.

8. The "Back to {type}" link on detail page should use browser history when possible,
   fall back to /type/{type} or /for/{agent} depending on referrer context.

9. All links in ToolCard are wrapped in a single <a> tag covering the entire card
   for natural click behavior. Internal CopyButton uses e.stopPropagation().

10. Skeleton cards: show 6 skeletons on first load, then replace with real cards
    once data arrives. No infinite spinner — use discrete skeleton grid.
```
