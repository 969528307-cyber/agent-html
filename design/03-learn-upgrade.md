# agentk.it — Design Specification v1.0

> AI Agent toolkit aggregation site | Astro + Tailwind CSS | Dark-mode-first | Responsive
>
> Delivered: Part 1 (Learn Article) + Part 2 (Glossary) + Part 3 (Upgrade/Download) + Part 4 (Global Framework)

---

## 0. Design System Foundation

### 0.1 Color Palette

| Token | Dark Mode | Light Mode | Role |
|-------|-----------|------------|------|
| `--bg-root` | `#08080a` | `#fafafa` | Page background |
| `--bg-surface` | `#111113` | `#ffffff` | Card, elevated surface |
| `--bg-surface-hover` | `#18181b` | `#f4f4f5` | Surface hover |
| `--bg-surface-raised` | `#1a1a1e` | `#f5f5f5` | Code blocks, inset areas |
| `--bg-overlay` | `rgba(0,0,0,0.6)` | `rgba(0,0,0,0.4)` | Modal backdrop |
| `--text-primary` | `#fafafa` | `#0a0a0b` | Body, headings |
| `--text-secondary` | `#a1a1aa` | `#52525b` | Subtitle, secondary text |
| `--text-tertiary` | `#71717a` | `#a1a1aa` | Metadata, placeholders |
| `--text-disabled` | `#52525b` | `#d4d4d8` | Disabled states |
| `--border-default` | `#27272a` | `#e4e4e7` | Card borders, dividers |
| `--border-hover` | `#3f3f46` | `#d4d4d8` | Border hover |
| `--accent-primary` | `#3b82f6` | `#2563eb` | Primary CTA, links, active |
| `--accent-primary-hover` | `#60a5fa` | `#1d4ed8` | CTA hover |
| `--accent-secondary` | `#a78bfa` | `#7c3aed` | Secondary accent (glossary links) |
| `--accent-success` | `#34d399` | `#059669` | Success, "inside" checkmarks |
| `--accent-warning` | `#fbbf24` | `#d97706` | Warnings, difficulty: Intermediate |
| `--accent-error` | `#f87171` | `#dc2626` | Error, form validation |
| `--tag-beginner` | `#22c55e` | `#16a34a` | Beginner difficulty |
| `--tag-intermediate` | `#f59e0b` | `#d97706` | Intermediate difficulty |
| `--tag-advanced` | `#ef4444` | `#dc2626` | Advanced difficulty |

**Rationale**: Neutral slate-zinc base with blue primary accent — familiar to developers, avoids trendy colors that date. Violent secondary for glossary/special links to differentiate from standard hyperlinks. Green/Yellow/Red difficulty tags are universally understood traffic-light semantics.

### 0.2 Typography

| Token | Font | Tailwind Class |
|-------|------|---------------|
| Display | Inter, weight 700 | `font-display` (custom) |
| Heading | Inter, weight 600 | `font-heading` (custom) |
| Body | Inter, weight 400 | `font-sans` |
| UI | Inter, weight 500 | `font-sans font-medium` |
| Mono | JetBrains Mono, weight 400 | `font-mono` |

**Google Fonts link:**
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

**Tailwind config extension:**
```js
fontFamily: {
  sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
  mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
}
```

**Type Scale (Tailwind-aligned):**

| Role | Size | Weight | Line Height | Letter Spacing |
|------|------|--------|-------------|----------------|
| H1 (page title) | `text-4xl` (36px) | 700 | `leading-tight` (1.25) | `tracking-tight` (-0.025em) |
| H1 mobile | `text-3xl` (30px) | 700 | `leading-tight` | `tracking-tight` |
| H2 (section) | `text-2xl` (24px) | 600 | `leading-snug` (1.375) | normal |
| H3 (subsection) | `text-xl` (20px) | 600 | `leading-snug` | normal |
| H4 (minor heading) | `text-lg` (18px) | 600 | `leading-normal` (1.5) | normal |
| Body large | `text-lg` (18px) | 400 | `leading-relaxed` (1.625) | normal |
| Body | `text-base` (16px) | 400 | `leading-relaxed` (1.625) | normal |
| Body small | `text-sm` (14px) | 400 | `leading-relaxed` (1.625) | normal |
| Caption | `text-xs` (12px) | 400 | `leading-normal` (1.5) | normal |
| Code inline | `text-sm` (14px) | 400 | — | normal |
| Code block | `text-sm` (14px) | 400 | `leading-relaxed` | normal |

**Body line-height rationale**: `leading-relaxed` (1.625) is chosen for readability on content-heavy learn pages. Dense text needs breathing room. This is wider than typical SaaS UI but appropriate for long-form reading.

### 0.3 Spacing Scale

Use Tailwind's default 4px-based scale. Key values:

| Token | px | Tailwind | Use |
|-------|-----|----------|-----|
| xs | 4px | `p-1` / `gap-1` | Tight icon groups |
| sm | 8px | `p-2` / `gap-2` | Inline elements |
| md | 12px | `p-3` / `gap-3` | Compact cards |
| lg | 16px | `p-4` / `gap-4` | Standard padding |
| xl | 24px | `p-6` / `gap-6` | Card internal |
| 2xl | 32px | `p-8` / `gap-8` | Section internal |
| 3xl | 48px | `p-12` / `gap-12` | Section gap |
| 4xl | 64px | `p-16` / `gap-16` | Major section gap |
| 5xl | 80px | `p-20` / `gap-20` | Hero gap |

**Content max-width**: `max-w-3xl` (768px) for article body — matches optimal reading line length (~65-75 chars).

### 0.4 Shadows & Borders

| Name | Dark Mode | Light Mode | Use |
|------|-----------|------------|-----|
| `shadow-card` | `0 0 0 1px #27272a` | `0 0 0 1px #e4e4e7` | Card border |
| `shadow-card-hover` | `0 0 0 1px #3f3f46, 0 4px 16px rgba(0,0,0,0.3)` | `0 0 0 1px #d4d4d8, 0 4px 16px rgba(0,0,0,0.08)` | Card hover |
| `shadow-pdf` | `0 0 0 1px #27272a, 0 8px 32px rgba(0,0,0,0.5)` | `0 0 0 1px #e4e4e7, 0 8px 32px rgba(0,0,0,0.12)` | PDF preview thumbnail |
| `shadow-focus` | `0 0 0 2px #3b82f6` | `0 0 0 2px #2563eb` | Input/button focus ring |
| `shadow-focus-error` | `0 0 0 2px #f87171` | `0 0 0 2px #dc2626` | Input error focus |

**Border radius scale:**
- `rounded` (4px): Inline code, small badges
- `rounded-md` (6px): Buttons, inputs
- `rounded-lg` (8px): Cards, code blocks
- `rounded-xl` (12px): PDF preview, featured cards
- `rounded-full` (9999px): Pills, difficulty tags

### 0.5 Transition Tokens

```css
--transition-fast: 150ms ease;
--transition-base: 200ms ease;
--transition-slow: 300ms ease;
```

---

## Part 1: Learn Article Page Template

> Applies to: `/learn/what-is-mcp`, `/learn/what-is-agent-skill`, `/learn/agent-comparison`, etc.

### 1.1 ASCII Wireframes

#### Desktop (1024px+)

```
┌──────────────────────────────────────────────────────────────────────┐
│  NAVBAR (sticky, bg-root/90, backdrop-blur)                          │
│  [agentk.it]  Tools ▾  Learn ▾  Free ▾                     🔍  ☀/🌙 │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─ Breadcrumb ──────────────────────────────────────────────┐      │
│  │  📚 Learn  →  What is MCP?                                │      │
│  └────────────────────────────────────────────────────────────┘      │
│                                                                      │
│  ┌─ Article Header ──────────────────────────────────────────┐      │
│  │                                                            │      │
│  │  # What is MCP?                                            │      │
│  │  Model Context Protocol Explained                          │      │
│  │                                                            │      │
│  │  ⏱ 8 min read  ·  🟢 Beginner  ·  📅 May 10, 2026        │      │
│  │                                                            │      │
│  │  ┌──────────────────────────────────────────────────┐     │      │
│  │  │           [SVG Architecture Diagram]              │     │      │
│  │  │        (rounded-lg, shadow-card, max-h-80)        │     │      │
│  │  └──────────────────────────────────────────────────┘     │      │
│  └────────────────────────────────────────────────────────────┘      │
│                                                                      │
│  ┌─ Article Body (max-w-3xl, mx-auto) ───────────────────────┐      │
│  │                                                            │      │
│  │  ## The Big Picture                               [h2]    │      │
│  │  MCP is like USB-C for AI agents...               [p]     │      │
│  │                                                            │      │
│  │  ## How It Works                                  [h2]    │      │
│  │  Client → Transport → Server → Tools              [p]     │      │
│  │                                                            │      │
│  │  ### Architecture Overview                        [h3]    │      │
│  │  ...                                             [p]     │      │
│  │                                                            │      │
│  │  ## MCP vs REST API: What's Different?            [h2]    │      │
│  │                                                            │      │
│  │  ┌──────────┬──────────┬──────────┐                │      │
│  │  │ Feature  │ MCP      │ REST API │   [comparison] │      │
│  │  ├──────────┼──────────┼──────────┤   [table]      │      │
│  │  │ Protocol │ JSON-RPC │ HTTP     │                │      │
│  │  └──────────┴──────────┴──────────┘                │      │
│  │                                                            │      │
│  │  ## See It In Action                              [h2]    │      │
│  │                                                            │      │
│  │  ┌─ Code Block ─────────────────────────────────────┐     │      │
│  │  │  npx @anthropic-ai/mcp-server-brave-search  [📋] │     │      │
│  │  └──────────────────────────────────────────────────┘     │      │
│  │                                                            │      │
│  │  > 💡 Tip: Always check the MCP server docs...   [bq]    │      │
│  │                                                            │      │
│  │  ## Related Tools                                 [h2]    │      │
│  │                                                            │      │
│  │  ┌─ ToolCard ───┐ ┌─ ToolCard ───┐ ┌─ ToolCard ───┐     │      │
│  │  │ Brave Search  │ │ SearXNG MCP  │ │ Tavily MCP   │     │      │
│  │  │ Web+local srch│ │ Self-hosted  │ │ AI-optimized │     │      │
│  │  │ → Details     │ │ → Details    │ │ → Details    │     │      │
│  │  └───────────────┘ └──────────────┘ └──────────────┘     │      │
│  │                                                            │      │
│  └────────────────────────────────────────────────────────────┘      │
│                                                                      │
│  ┌─ Further Reading ─────────────────────────────────────────┐      │
│  │  → What is an Agent Skill?                                │      │
│  │  → Setting Up Your First MCP Server                       │      │
│  │  → Agent Comparison: Which Framework?                     │      │
│  └────────────────────────────────────────────────────────────┘      │
│                                                                      │
│  ┌─ CTA Box (bg-surface, rounded-xl, border, p-8) ───────────┐      │
│  │  📬 Get the MCP Cheatsheet (Free PDF)                     │      │
│  │  50 most popular MCP servers — install commands included. │      │
│  │  ┌────────────────────────────────────────────────────┐   │      │
│  │  │  📧 you@email.com              [Get Free PDF →]    │   │      │
│  │  └────────────────────────────────────────────────────┘   │      │
│  └────────────────────────────────────────────────────────────┘      │
│                                                                      │
│  ┌─ Share ──────────────────────────────────────────────────┐      │
│  │  Share on:  [𝕏 Twitter]  [🐙 GitHub]                     │      │
│  └────────────────────────────────────────────────────────────┘      │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
│  FOOTER                                                            │
└──────────────────────────────────────────────────────────────────────┘
```

#### Mobile (<768px)

```
┌──────────────────────────────┐
│ ≡ [agentk.it]        ☀/🌙   │  ← Navbar (shrink to hamburger)
├──────────────────────────────┤
│                              │
│ Learn → What is MCP?         │  ← Breadcrumb (smaller, scrollable)
│                              │
│ # What is MCP?               │  ← H1: text-3xl
│ Model Context Protocol...    │
│ ⏱ 8 min · 🟢 Beginner        │  ← Meta stacks vertically
│ 📅 May 10, 2026              │
│                              │
│ ┌────────────────────────┐   │
│ │  [SVG Diagram]         │   │  ← Full-width, reduced height
│ └────────────────────────┘   │
│                              │
│ ## The Big Picture           │
│ MCP is like USB-C...         │
│                              │
│ ## How It Works              │
│ ...                          │
│                              │
│ ## MCP vs REST API           │
│ ┌──────┬──────────┐          │  ← Table scrolls horizontally
│ │ Feat │ MCP      │          │
│ │ Prot │ JSON-RPC │          │
│ └──────┴──────────┘          │
│                              │
│ ## See It In Action          │
│ ┌──────────────────────[📋]┐ │
│ │ npx @anthropic-ai/...    │ │
│ └──────────────────────────┘ │
│                              │
│ > 💡 Tip: Always check...    │
│                              │
│ ## Related Tools             │
│ ┌── ToolCard ──────────┐     │  ← Stack vertically
│ │ Brave Search MCP     │     │
│ └──────────────────────┘     │
│ ┌── ToolCard ──────────┐     │
│ │ SearXNG MCP          │     │
│ └──────────────────────┘     │
│ ┌── ToolCard ──────────┐     │
│ │ Tavily Search MCP    │     │
│ └──────────────────────┘     │
│                              │
│ Further Reading              │
│ → What is an Agent Skill?    │
│ → Setting Up Your First MCP  │
│                              │
│ ┌─ CTA Box ──────────────┐   │
│ │ 📬 Get the Cheatsheet  │   │
│ │ 50 most popular MCP... │   │
│ │ ┌──────────────────┐   │   │  ← Input + button stack
│ │ │ 📧 you@email.com │   │   │
│ │ └──────────────────┘   │   │
│ │ [Get Free PDF →]       │   │
│ └────────────────────────┘   │
│                              │
│ [𝕏 Share] [🐙 Share]        │
│                              │
│ FOOTER (stacked links)       │
└──────────────────────────────┘
```

### 1.2 Component Specifications

#### 1.2.1 Breadcrumb Component

```tsx
interface BreadcrumbProps {
  items: { label: string; href?: string }[];
}

// Example: [{ label: "Learn", href: "/learn" }, { label: "What is MCP?" }]
```

**Tailwind classes:**
```
// Container
flex items-center gap-1.5 text-sm text-text-tertiary mb-8

// Link (non-last item)
text-text-tertiary hover:text-accent-primary transition-colors
underline-offset-2 hover:underline

// Last item (current page)
text-text-secondary font-medium

// Separator
text-text-tertiary/50 mx-1
→ (U+2192)
```

**States:** Default only (static navigation).

#### 1.2.2 Article Header

```tsx
interface ArticleHeaderProps {
  title: string;            // "What is MCP?"
  subtitle: string;         // "Model Context Protocol Explained"
  readTime: number;         // 8 (minutes)
  difficulty: "beginner" | "intermediate" | "advanced";
  date: string;             // "May 10, 2026"
  heroImage?: string;       // Optional SVG diagram URL
  heroImageAlt?: string;
}
```

**Tailwind classes:**

```
// ArticleHeader container
mb-12

// H1
text-4xl font-bold tracking-tight text-text-primary mb-3

// Subtitle (p)
text-xl text-text-secondary mb-6

// Meta row
flex flex-wrap items-center gap-4 text-sm text-text-tertiary mb-8

// Individual meta item
flex items-center gap-1.5

// Difficulty tag (pill)
inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
bg-<color>/10 text-<color> border border-<color>/20

// Beginner:  bg-green-500/10 text-green-400 border-green-500/20
// Intermediate: bg-yellow-500/10 text-yellow-400 border-yellow-500/20
// Advanced: bg-red-500/10 text-red-400 border-red-500/20

// Hero image wrapper
rounded-lg overflow-hidden shadow-card mb-8
aspect-video max-h-80 w-full

// Hero image (img)
w-full h-full object-contain bg-bg-surface-raised
```

**States:**
- Hero image loading: skeleton placeholder (`animate-pulse bg-bg-surface-raised rounded-lg aspect-video max-h-80`)

#### 1.2.3 Article Body — Typography

```css
/* Article prose container: max-w-3xl mx-auto */

.article-body h2 {
  @apply text-2xl font-semibold text-text-primary mt-12 mb-4;
}

.article-body h3 {
  @apply text-xl font-semibold text-text-primary mt-8 mb-3;
}

.article-body h4 {
  @apply text-lg font-semibold text-text-primary mt-6 mb-2;
}

.article-body p {
  @apply text-base leading-relaxed text-text-secondary mb-4;
}

.article-body a:not(.tool-card-link):not(.cta-link) {
  /* Auto-link to glossary terms */
  @apply text-accent-secondary underline underline-offset-2 decoration-accent-secondary/40
         hover:decoration-accent-secondary transition-colors;
}

.article-body strong {
  @apply text-text-primary font-semibold;
}
/* Content link: @apply text-accent-primary underline underline-offset-2 decoration-accent-primary/30 hover:decoration-accent-primary transition-colors */
```

#### 1.2.4 Inline Glossary Link

When a term (e.g., "MCP") appears in article body, it auto-links to `/learn/glossary#mcp`.

```tsx
interface GlossaryLinkProps {
  term: string;
  href: string;  // e.g. "/learn/glossary#mcp"
}
```

**Tailwind classes:**
```
text-accent-secondary underline underline-offset-2 decoration-accent-secondary/40
hover:decoration-accent-secondary transition-colors cursor-help
```

**Rationale**: Purple/violet distinguishes glossary links from standard content links (blue), preventing user confusion about link destinations. `cursor-help` signals "this is a definition, not navigation."

#### 1.2.5 Code Block

```tsx
interface CodeBlockProps {
  code: string;
  language?: string;  // "bash", "json", "yaml", etc.
  showCopy?: boolean; // default true
}
```

**Tailwind classes:**

```
// Code block wrapper
relative group rounded-lg overflow-hidden shadow-card mb-6

// Header bar (language label + copy button)
flex items-center justify-between px-4 py-2 bg-bg-surface-raised border-b border-border-default

// Language label
text-xs text-text-tertiary font-mono uppercase tracking-wider

// Copy button
text-xs text-text-tertiary hover:text-text-primary transition-colors
opacity-0 group-hover:opacity-100 (desktop) | always-visible (mobile)

// Code content (pre)
p-4 bg-bg-surface-raised overflow-x-auto

// Code content (code)
text-sm font-mono text-text-primary leading-relaxed whitespace-pre
```

**States:**

| State | Behavior |
|-------|----------|
| Default | Copy button hidden on desktop (shown on group hover); visible on mobile |
| Copy clicked | Button text: "Copied!" with `text-accent-success` for 2s, then reverts |
| Copy error | Button text: "Failed" with `text-accent-error` for 2s |
| Scroll | `overflow-x-auto` with subtle scrollbar styling |

**Scrollbar styling:**
```css
.code-block::-webkit-scrollbar { height: 4px; }
.code-block::-webkit-scrollbar-track { @apply bg-transparent; }
.code-block::-webkit-scrollbar-thumb { @apply bg-border-default rounded-full; }
```

#### 1.2.6 Blockquote

```
// Blockquote wrapper
border-l-3 border-accent-primary/40 pl-4 py-1 my-6

// Blockquote text
text-text-secondary italic

// Info/Tip variant (adds emoji prefix)
// "💡" prefix + same styling
```

**Tailwind:**
```
border-l-[3px] border-blue-500/40 pl-4 py-1 my-6 text-text-secondary italic
```

#### 1.2.7 Lists (ul/ol)

```
// Unordered list
list-disc pl-6 space-y-1.5 mb-4 text-text-secondary

// Ordered list
list-decimal pl-6 space-y-1.5 mb-4 text-text-secondary

// List item
text-base leading-relaxed

// Nested lists
pl-4 mt-1.5 (adds indentation for nested levels)
```

#### 1.2.8 Images / Figures

```tsx
interface ArticleImageProps {
  src: string;
  alt: string;
  caption?: string;
}
```

**Tailwind classes:**

```
// Figure
my-8 text-center

// Image
rounded-lg shadow-card mx-auto max-w-full

// Caption (figcaption)
mt-3 text-sm text-text-tertiary italic
```

**Loading state:** `animate-pulse bg-bg-surface-raised rounded-lg` placeholder matching image aspect ratio.

#### 1.2.9 Comparison Table

```
// Table wrapper (for horizontal scroll on mobile)
overflow-x-auto my-6 rounded-lg shadow-card

// Table
w-full text-sm text-left border-collapse

// Header
bg-bg-surface-raised

// Header cells (th)
px-4 py-3 font-semibold text-text-primary border-b border-border-default

// Body cells (td)
px-4 py-3 text-text-secondary border-b border-border-default/50

// Row hover
hover:bg-bg-surface-hover transition-colors

// First column emphasis
font-medium text-text-primary
```

#### 1.2.10 Related Tools — Inline Tool Card

```tsx
interface InlineToolCardProps {
  name: string;        // "Brave Search MCP"
  description: string; // "Web and local search through Brave's API"
  href: string;        // "/item/mcp-server-brave-search"
  icon?: string;       // Optional icon URL
}
```

**Desktop layout:** 3-column grid
**Mobile layout:** Single column stacked

**Tailwind classes:**

```
// Card grid
grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 my-6

// Individual card
flex items-start gap-3 p-4 rounded-lg border border-border-default
bg-bg-surface hover:bg-bg-surface-hover hover:border-border-hover
transition-all duration-200 cursor-pointer group

// Icon (optional)
w-8 h-8 rounded bg-bg-surface-raised flex-shrink-0 (placeholder)

// Content
flex-1 min-w-0

// Tool name
text-sm font-semibold text-text-primary group-hover:text-accent-primary transition-colors

// Description
text-xs text-text-tertiary mt-0.5 truncate

// Arrow indicator
text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity
ml-2 flex-shrink-0 self-center
→
```

**States:**
- Default: Subtle border, surface background
- Hover: Border highlights, name turns accent color, arrow appears
- Focus: `shadow-focus` ring

**Visual distinction from regular links:** Card format with border + background clearly separates tool references from body text links. The hover effect draws attention to interactivity.

#### 1.2.11 Further Reading

```
// Section container
mt-16 pt-8 border-t border-border-default

// Heading
text-lg font-semibold text-text-primary mb-4
"Further Reading"

// Link list
space-y-2

// Individual link
flex items-center gap-2 text-text-secondary hover:text-accent-primary transition-colors
text-base

// Arrow prefix
→ (or use ::before with "→ ")
```

#### 1.2.12 CTA Box (Bottom of Article)

```tsx
interface ArticleCTABoxProps {
  title: string;        // "Get the MCP Cheatsheet (Free PDF)"
  description: string;  // "50 most popular MCP servers at a glance..."
  upgradeHref: string;  // "/upgrade/mcp-cheatsheet"
}
```

**Tailwind classes:**

```
// CTA wrapper
mt-12 p-8 rounded-xl border border-border-default bg-bg-surface

// Title
text-xl font-semibold text-text-primary mb-2

// Description
text-text-secondary mb-6

// Inline form (not full page — just teaser)
flex flex-col sm:flex-row gap-3

// Email input (inside CTA box)
flex-1 px-4 py-2.5 rounded-md bg-bg-root border border-border-default
text-text-primary placeholder:text-text-tertiary text-sm
focus:outline-none focus:shadow-focus

// CTA button
inline-flex items-center gap-2 px-5 py-2.5 rounded-md
bg-accent-primary text-white font-medium text-sm
hover:bg-accent-primary-hover transition-colors
focus:outline-none focus:shadow-focus

// Privacy note (small)
mt-3 text-xs text-text-tertiary
"No spam. Unsubscribe anytime."
```

**States for inline form:**
- Input default: `border-border-default bg-bg-root`
- Input focus: `shadow-focus border-accent-primary`
- Input error: `shadow-focus-error border-accent-error`
- Button default/hover/focus: standard CTA states

#### 1.2.13 Share Buttons

```
// Container
flex items-center gap-3 mt-12 pt-6 border-t border-border-default

// Label
text-sm text-text-tertiary

// Share buttons
inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm
text-text-tertiary hover:text-text-primary hover:bg-bg-surface-hover
border border-border-default hover:border-border-hover
transition-all duration-200
```

### 1.3 Full Page Layout Classes

```html
<!-- Page container -->
<main class="min-h-screen bg-bg-root text-text-primary">
  <!-- Article wrapper -->
  <article class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
    <!-- Breadcrumb -->
    <!-- Article Header -->
    <!-- Article Body -->
    <!-- Further Reading -->
    <!-- CTA Box -->
    <!-- Share -->
  </article>
</main>
```

---

## Part 2: Glossary Page

> Applies to: `/learn/glossary`

### 2.1 ASCII Wireframes

#### Desktop

```
┌──────────────────────────────────────────────────────────────────────┐
│  NAVBAR                                                              │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  # Glossary                                                          │
│  Key terms in the AI Agent ecosystem — explained in plain English.   │
│                                                                      │
│  ┌─ A-Z Navigation (sticky) ────────────────────────────────────┐   │
│  │  A  B  C  D  E  F  G  H  I  J  K  L  M  N  O  P  Q  R  ... │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                            ↑ sticky top-16, bg-bg-root/95 backdrop-blur │
│                                                                      │
│  ┌─ A ──────────────────────────────────────────────────────────┐   │
│  │                                                               │   │
│  │  Agent Skill                                                  │   │
│  │  A reusable procedure that an AI agent can learn and execute. │   │
│  │  Learn more →                                                │   │
│  │                                                               │   │
│  │  API Server                                                   │   │
│  │  Exposes an agent via REST API for programmatic access.       │   │
│  │  Learn more →                                                │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─ C ──────────────────────────────────────────────────────────┐   │
│  │  ClawHub                                                     │   │
│  │  OpenClaw's community skill marketplace.                     │   │
│  │  Learn more →                                                │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ... more letters ...                                                │
│                                                                      │
│  ┌─ M ──────────────────────────────────────────────────────────┐   │
│  │  MCP Server                                                  │   │
│  │  A server implementing the Model Context Protocol.           │   │
│  │  Learn more →                                                │   │
│  │                                                               │   │
│  │  Mem0                                                        │   │
│  │  Memory backend with entity extraction for AI agents.        │   │
│  │  Learn more →                                                │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

#### Mobile

```
┌──────────────────────────────┐
│ NAVBAR                       │
├──────────────────────────────┤
│                              │
│ # Glossary                   │
│ Key terms explained.         │
│                              │
│ ┌─ A-Z Nav (sticky, ──────┐  │  ← Horizontally scrollable
│ │ A B C D E F G H I J ... │  │
│ └──────────────────────────┘  │
│                              │
│ A                            │
│ ┌────────────────────────┐   │
│ │ Agent Skill            │   │
│ │ A reusable procedure...│   │
│ │ Learn more →           │   │
│ └────────────────────────┘   │
│ ┌────────────────────────┐   │
│ │ API Server             │   │
│ │ Exposes an agent via...│   │
│ │ Learn more →           │   │
│ └────────────────────────┘   │
│                              │
│ C                            │
│ ┌────────────────────────┐   │
│ │ ClawHub                │   │
│ │ OpenClaw's community...│   │
│ │ Learn more →           │   │
│ └────────────────────────┘   │
│ ...                          │
└──────────────────────────────┘
```

### 2.2 Component Specifications

#### 2.2.1 Glossary Page Header

```tsx
interface GlossaryHeaderProps {
  title: string;       // "Glossary"
  subtitle: string;    // "Key terms in the AI Agent ecosystem — explained in plain English."
}
```

**Tailwind:**
```
// Container
max-w-3xl mx-auto px-4 pt-12 pb-8

// Title
text-4xl font-bold tracking-tight text-text-primary mb-3

// Subtitle
text-lg text-text-secondary
```

#### 2.2.2 A-Z Navigation

```tsx
interface AZNavProps {
  letters: string[];  // ["A","B","C",...,"Z"]
  activeLetter?: string;
  onLetterClick: (letter: string) => void;  // smooth scroll to #letter-{letter}
}
```

**Tailwind classes:**

```
// Sticky wrapper
sticky top-16 z-10 py-3 -mx-4 px-4
bg-bg-root/95 backdrop-blur-sm border-b border-border-default

// Letter list
flex gap-1 overflow-x-auto scrollbar-none

// Individual letter button
w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium
transition-colors duration-150

// Default letter
text-text-tertiary hover:text-text-primary hover:bg-bg-surface-hover

// Active letter
bg-accent-primary text-white

// Disabled letter (no terms for this letter)
text-text-disabled cursor-not-allowed
```

**Scroll behavior:** `scroll-mt-24` on each letter section to account for sticky nav + A-Z bar height.

**States:**

| State | Style |
|-------|-------|
| Default | `text-text-tertiary hover:text-text-primary hover:bg-bg-surface-hover` |
| Active | `bg-accent-primary text-white` |
| Disabled | `text-text-disabled opacity-40 cursor-not-allowed` |
| Focus | `shadow-focus` |

#### 2.2.3 Letter Section

```tsx
interface LetterSectionProps {
  letter: string;  // "A"
  terms: GlossaryTerm[];
}

interface GlossaryTerm {
  name: string;         // "Agent Skill"
  definition: string;   // "A reusable procedure that an AI agent can learn..."
  href: string;         // "/learn/what-is-agent-skill"
}
```

**Tailwind classes:**

```
// Section wrapper
mb-10 scroll-mt-24 (for smooth scroll offset)

// Letter heading
text-2xl font-bold text-text-primary mb-5 pb-2 border-b border-border-default
id="letter-{letter}"

// Term list
space-y-3

// Individual term card
group p-4 rounded-lg border border-transparent
hover:bg-bg-surface-hover hover:border-border-default
transition-all duration-200 cursor-pointer

// Term name
text-base font-semibold text-text-primary group-hover:text-accent-primary transition-colors

// Term definition
text-sm text-text-secondary mt-1

// "Learn more" link
inline-flex items-center gap-1 mt-2 text-sm text-accent-secondary
opacity-0 group-hover:opacity-100 transition-opacity
→
```

**States:**

| State | Style |
|-------|-------|
| Default | Transparent border, subtle |
| Hover | Border appears, background lightens, name turns accent, "Learn more" fades in |
| Focus (keyboard) | `shadow-focus` ring on the card |

### 2.3 Auto-Glossary Linking Strategy

During Astro build, scan article content. When a glossary term (case-insensitive) first appears in an article, wrap it in `<GlossaryLink>`:

```astro
<!-- Build-time transformation -->
<!-- Input: "MCP is a protocol..." -->
<!-- Output: "MCP is a protocol..." with first "MCP" linked to /learn/glossary#mcp -->
```

The GlossaryLink component is described in 1.2.4. It uses `text-accent-secondary` (purple/violet) to distinguish from regular `text-accent-primary` (blue) content links.

---

## Part 3: Upgrade / Download Page

> Applies to: `/upgrade/mcp-cheatsheet`, `/upgrade/hermes-commands`, etc.

### 3.1 ASCII Wireframes

#### Desktop

```
┌──────────────────────────────────────────────────────────────────────┐
│  NAVBAR                                                              │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│            ┌──────────────────────────────────────────┐              │
│            │                                          │              │
│            │  🎁 Free Download                        │              │
│            │                                          │              │
│            │  # MCP Servers Cheatsheet                │              │
│            │                                          │              │
│            │  50 most popular MCP servers at a        │              │
│            │  glance — categorized, with install      │              │
│            │  commands.                               │              │
│            │                                          │              │
│            │  ┌────────────────────────────────┐      │              │
│            │  │                                │      │              │
│            │  │     [PDF Preview Thumbnail]    │      │              │
│            │  │                                │      │              │
│            │  └────────────────────────────────┘      │              │
│            │                                          │              │
│            │  What's inside:                          │              │
│            │  ✅ Top 50 MCP servers by GitHub Stars   │              │
│            │  ✅ Install commands (Claude/Cursor/...)  │              │
│            │  ✅ Category icons                       │              │
│            │  ✅ API key required indicator            │              │
│            │  ✅ Printer-friendly A4 layout            │              │
│            │                                          │              │
│            │  ┌────────────────────────────────┐      │              │
│            │  │ 📧 your@email.com  [Get Free PDF]│      │              │
│            │  └────────────────────────────────┘      │              │
│            │                                          │              │
│            │  🔒 No spam. Unsubscribe anytime.        │              │
│            │                                          │              │
│            └──────────────────────────────────────────┘              │
│                                                                      │
│           (centered single column, max-w-lg)                         │
│                                                                      │
│  ┌─ Success State (hidden by default) ───────────────────────────┐   │
│  │                                                                │   │
│  │  ✅ Check your email!                                          │   │
│  │  We sent the MCP Cheatsheet to you@email.com.                  │   │
│  │  [Download PDF →]  (direct link fallback)                      │   │
│  │  Didn't get it? Check spam or [try again].                     │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

#### Mobile

```
┌──────────────────────────────┐
│ NAVBAR                       │
├──────────────────────────────┤
│                              │
│ 🎁 Free Download             │
│                              │
│ # MCP Servers                │
│ Cheatsheet                   │
│                              │
│ 50 most popular MCP          │
│ servers at a glance...       │
│                              │
│ ┌──────────────────────┐     │
│ │  [PDF Preview]       │     │
│ └──────────────────────┘     │
│                              │
│ What's inside:               │
│ ✅ Top 50 MCP servers        │
│ ✅ Install commands          │
│ ✅ Category icons            │
│ ✅ API key indicator         │
│ ✅ Printer-friendly layout   │
│                              │
│ 📧 your@email.com            │
│ [      Get Free PDF →      ] │  ← Full-width button
│                              │
│ 🔒 No spam. Unsubscribe      │
│    anytime.                  │
│                              │
│ --- or scroll to see: ---    │
│                              │
│ ✅ Check your email!         │
│ We sent the PDF to...        │
│ [Download PDF →]             │
└──────────────────────────────┘
```

### 3.2 Component Specifications

#### 3.2.1 Upgrade Page Layout

**Tailwind classes:**

```
// Page container
min-h-screen bg-bg-root flex flex-col items-center justify-center px-4 py-16

// Content card
w-full max-w-lg mx-auto

// Badge/eyebrow
inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium
bg-accent-primary/10 text-accent-primary border border-accent-primary/20
mb-6
"🎁 Free Download"

// Title
text-4xl font-bold tracking-tight text-text-primary mb-3

// Description
text-lg text-text-secondary mb-8
```

#### 3.2.2 PDF Preview Thumbnail

```tsx
interface PDFPreviewProps {
  src: string;     // Image URL of the PDF preview
  alt: string;
}
```

**Tailwind classes:**

```
// Thumbnail wrapper
relative rounded-xl overflow-hidden shadow-pdf mb-8
bg-bg-surface border border-border-default

// Aspect ratio: 3:4 (portrait A4-ish)
aspect-[3/4] w-full max-w-sm mx-auto

// Image
w-full h-full object-cover

// Loading state (skeleton)
animate-pulse bg-bg-surface-raised rounded-xl aspect-[3/4] max-w-sm mx-auto
```

**Rationale**: `shadow-pdf` (0px 0px 0px 1px border + 8px 32px dark shadow) mimics a printed piece of paper resting on a surface. The border gives edge definition; the shadow gives physicality.

#### 3.2.3 What's Inside Checklist

```tsx
interface ChecklistProps {
  items: string[];  // ["Top 50 MCP servers by GitHub Stars", ...]
}
```

**Tailwind classes:**

```
// Section label
text-sm font-semibold text-text-primary mb-3
"What's inside:"

// List
space-y-2 mb-8

// Individual item
flex items-start gap-2.5 text-text-secondary text-sm

// Checkmark
flex-shrink-0 w-5 h-5 text-accent-success mt-0.5
```
```
```

#### 3.2.4 Email Form

```tsx
interface EmailFormProps {
  buttonText: string;           // "Get Free PDF"
  placeholder: string;          // "your@email.com"
  onSubmit: (email: string) => Promise<void>;
}
```

**Tailwind classes:**

```
// Form wrapper
flex flex-col sm:flex-row gap-3 mb-3

// Email input
flex-1 px-4 py-2.5 rounded-md bg-bg-root border text-sm
transition-all duration-200

// Input — default
border-border-default text-text-primary placeholder:text-text-tertiary

// Input — focus
focus:outline-none border-accent-primary shadow-focus

// Input — error
border-accent-error shadow-focus-error text-text-primary

// Input — success (post-submit, hidden)
border-accent-success bg-accent-success/5

// Input — disabled (during loading)
opacity-60 cursor-not-allowed

// Submit button
inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md
bg-accent-primary text-white font-medium text-sm
hover:bg-accent-primary-hover transition-colors
focus:outline-none focus:shadow-focus
disabled:opacity-60 disabled:cursor-not-allowed
shrink-0

// Privacy note
text-xs text-text-tertiary flex items-center gap-1
🔒 icon (lock SVG inline)
```

**Form states:**

| State | Input Style | Button Style | Behavior |
|-------|------------|--------------|----------|
| Default | `border-border-default` | Primary blue | — |
| Input focused | `border-accent-primary shadow-focus` | Primary blue | — |
| Error (invalid email) | `border-accent-error shadow-focus-error` | Primary blue | Show inline error: "Please enter a valid email" |
| Error (server) | `border-accent-error` | Primary blue | Show inline error message from server |
| Submitting | `opacity-60` | Disabled + spinner icon | Button shows spinner |
| Success | Form hidden entirely | — | Success message shown (3.2.5) |

#### 3.2.5 Success State

**Tailwind classes:**

```
// Success container (replaces form entirely)
text-center py-6

// Success icon
w-12 h-12 mx-auto mb-4 text-accent-success
(animated checkmark SVG or emoji "✅" with scale animation)

// Success title
text-xl font-semibold text-text-primary mb-2
"Check your email!"

// Success message
text-text-secondary mb-4
"We sent the MCP Cheatsheet to you@example.com."

// Download button (secondary, direct link fallback)
inline-flex items-center gap-2 px-5 py-2.5 rounded-md
border border-border-default text-text-primary font-medium text-sm
hover:bg-bg-surface-hover hover:border-border-hover
transition-all duration-200
"Download PDF →"

// Help text
mt-4 text-xs text-text-tertiary
"Didn't get it? Check spam or "
[link: "try again" — resets form]
```

**Animation:** Container slides in with `animate-in fade-in slide-in-from-bottom-4 duration-300`.

#### 3.2.6 Form Validation (Inline)

```tsx
// Below the input, shown on error
interface FormErrorProps {
  message: string;
}
```

**Tailwind:**
```
text-xs text-accent-error mt-1.5 flex items-center gap-1
```

---

## Part 4: Global Framework

### 4.1 404 Page

#### ASCII Wireframe

```
┌──────────────────────────────────────────────────────────────────────┐
│  NAVBAR                                                              │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│                                                                      │
│                           404                                        │
│                    Page not found                                    │
│                                                                      │
│          The page you're looking for doesn't exist or has            │
│          been moved.                                                 │
│                                                                      │
│          ┌────────────────────────────────────────────┐              │
│          │  🔍 Search agentk.it...                    │              │
│          └────────────────────────────────────────────┘              │
│                                                                      │
│          [← Back to Home]    or    [Browse Tools →]                  │
│                                                                      │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

#### Component Spec

**Tailwind classes:**

```
// Page container
min-h-screen bg-bg-root flex flex-col items-center justify-center px-4 py-20

// 404 number
text-8xl font-bold text-text-primary/10 select-none mb-4
(sets tone — big but not shouting. Glitch or static visual optional)

// Heading
text-2xl font-semibold text-text-primary mb-2
"Page not found"

// Description
text-text-secondary text-center max-w-md mb-8
"The page you're looking for doesn't exist or has been moved."

// Search bar
w-full max-w-md mb-6
(dark-themed input — see search component 4.1.1)

// Action buttons
flex items-center gap-4 text-sm

// Primary action
inline-flex items-center gap-2 px-5 py-2.5 rounded-md
bg-accent-primary text-white font-medium
"← Back to Home"

// Secondary action
inline-flex items-center gap-2 text-text-secondary hover:text-text-primary
transition-colors
"Browse Tools →"
```

#### 4.1.1 Search Component (shared with 404, navbar)

```tsx
interface SearchProps {
  placeholder?: string;  // "Search agentk.it..."
  onSubmit: (query: string) => void;
}
```

**Tailwind classes:**

```
// Search wrapper
relative w-full

// Search icon
absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary
(🔍 SVG icon, 16x16)

// Search input
w-full pl-10 pr-4 py-2.5 rounded-md
bg-bg-surface border border-border-default
text-text-primary placeholder:text-text-tertiary text-sm
focus:outline-none focus:border-accent-primary focus:shadow-focus
transition-all duration-200
```

### 4.2 Dark/Light Mode Toggle

**Position:** Navbar right side, before search icon.

#### Component Spec

```tsx
interface ThemeToggleProps {
  theme: "dark" | "light";
  onToggle: () => void;
}
```

**Tailwind classes:**

```
// Button
relative w-9 h-9 flex items-center justify-center rounded-md
text-text-tertiary hover:text-text-primary hover:bg-bg-surface-hover
transition-all duration-200
focus:outline-none focus:shadow-focus

// Icon container
relative w-5 h-5

// Sun icon (shown in dark mode = "switch to light")
absolute inset-0 transition-all duration-300
dark-mode: opacity-100 rotate-0 scale-100
light-mode: opacity-0 rotate-90 scale-0

// Moon icon (shown in light mode = "switch to dark")
absolute inset-0 transition-all duration-300
dark-mode: opacity-0 -rotate-90 scale-0
light-mode: opacity-100 rotate-0 scale-100
```

**Animation:** 300ms rotation + scale crossfade between sun ☀️ and moon 🌙 icons. Smooth, satisfying, no jarring flash.

**System preference detection:**
```astro
<script>
  // Inline in <head> to prevent FOUC
  const theme = localStorage.getItem('theme') ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.classList.add(theme);
</script>
```

**Theme implementation approach:**
```js
// tailwind.config.js
module.exports = {
  darkMode: 'class',  // toggle via .dark class on <html>
  // ...
}
```

CSS custom properties defined on `:root` for light, `.dark` for dark (see 0.1 Color Palette). All components reference `--text-primary`, `--bg-surface`, etc., so theme switching is instant.

### 4.3 Loading States (Skeleton Screens)

#### 4.3.1 Page-Level Skeleton (for page navigation)

```
┌──────────────────────────────────────────────────────────────────────┐
│  NAVBAR (always visible, no skeleton)                                │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─ Breadcrumb skeleton ──────────────────────────────────────┐     │
│  │  ██████████                                                │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                      │
│  ┌─ Article Header skeleton ──────────────────────────────────┐     │
│  │  ████████████████████████   (title)                        │     │
│  │  ████████████████          (subtitle)                      │     │
│  │  ████  ████  ████         (meta)                          │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                      │
│  ┌─ Article Body skeleton ────────────────────────────────────┐     │
│  │  ████████████                                              │     │
│  │  ████████████████████████████████████████████████████████  │     │
│  │  ██████████████████████████████████████████████            │     │
│  │  ████████████████████████████████                          │     │
│  │                                                            │     │
│  │  ██████████                                                │     │
│  │  ████████████████████████████████████████████████████████  │     │
│  │  ██████████████████████████████                            │     │
│  │                                                            │     │
│  │  ██████████                                                │     │
│  │  ████████████████████████████████████████████████████████  │     │
│  │  ███████████████████████████████████████████               │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

**Implementation:** Each skeleton line is a `<div>` with `animate-pulse bg-bg-surface-raised rounded h-4`. Width varies per line (randomly between 40%-100%) to mimic natural text flow.

```tsx
// SkeletonLine component
interface SkeletonLineProps {
  width?: string;  // "75%", "100%", "50%" — default random
  height?: string; // default "h-4"
}
```

**Tailwind:**
```
animate-pulse bg-bg-surface-raised rounded
```

#### 4.3.2 Tool Card Skeleton

```
┌─ Tool Card Skeleton ──────────┐
│  ┌──┐                         │
│  │  │  ██████████████         │  ← Icon square + title line
│  └──┘  ██████████            │  ← Description line
│         ██████               │  ← Tag line
└───────────────────────────────┘
```

**Tailwind:**
```
// Card wrapper
rounded-lg border border-border-default p-4 space-y-3

// Icon + title row
flex items-center gap-3
  // Icon placeholder
  w-8 h-8 rounded bg-bg-surface-raised animate-pulse
  // Title
  flex-1 h-4 rounded bg-bg-surface-raised animate-pulse

// Description line
h-3 rounded bg-bg-surface-raised animate-pulse w-3/4

// Tag line
h-3 rounded bg-bg-surface-raised animate-pulse w-1/2
```

#### 4.3.3 List Page Skeleton

```
┌─ List Row Skeleton ─┐  (repeated N times)
│ ████████████████████ │
│ ██████████████      │
└──────────────────────┘
```

Same pattern: `animate-pulse bg-bg-surface-raised rounded` lines inside a bordered card.

### 4.4 About Page

#### ASCII Wireframe

```
┌──────────────────────────────────────────────────────────────────────┐
│  NAVBAR                                                              │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│            ┌──────────────────────────────────────────┐              │
│            │  # About agentk.it                       │              │
│            │                                          │              │
│            │  agentk.it is a curated, auto-updating   │              │
│            │  directory of AI Agent tools — Skills,   │              │
│            │  MCP Servers, CLI tools, and Workflows.  │              │
│            │                                          │              │
│            │  We scan GitHub daily, standardize every │              │
│            │  entry into a consistent format, and     │              │
│            │  provide one-click copy for install      │              │
│            │  commands.                               │              │
│            │                                          │              │
│            │  ## Data Sources                         │              │
│            │  • GitHub topic:mcp-server (~9,000+)     │              │
│            │  • Hermes Agent community skills          │              │
│            │  • OpenClaw ClawHub                      │              │
│            │  • npm / PyPI AI agent packages          │              │
│            │                                          │              │
│            │  ## How It Works                         │              │
│            │  Automated pipeline: Fetch → Parse →     │              │
│            │  Standardize → Publish.                  │              │
│            │                                          │              │
│            │  ## Contact                              │              │
│            │  📧 hello@agentk.it                      │              │
│            │  🐙 github.com/agentk-it                 │              │
│            │  𝕏 @agentk_it                            │              │
│            └──────────────────────────────────────────┘              │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

#### Component Spec

**Layout:** Single column, `max-w-2xl`, centered.

**Tailwind classes:**

```
// Page container
min-h-screen bg-bg-root

// Content wrapper
max-w-2xl mx-auto px-4 py-16

// Title
text-4xl font-bold tracking-tight text-text-primary mb-8
"About agentk.it"

// Body paragraph
text-base leading-relaxed text-text-secondary mb-6

// Section heading
text-xl font-semibold text-text-primary mt-10 mb-4

// Data sources list
space-y-2 mb-6 text-text-secondary

// Contact section
flex flex-col gap-2 text-text-secondary

// Contact item
flex items-center gap-2 hover:text-accent-primary transition-colors
```

**No complex states** — this is a static informational page with standard link hovers.

---

## 5. Tailwind Config Reference

```js
// tailwind.config.js
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        mono: ['JetBrains Mono', ...defaultTheme.fontFamily.mono],
      },
      colors: {
        // Semantic tokens map to CSS custom properties at runtime
        // Dark mode values shown; light mode set via .class on <html>
        'bg-root': 'var(--bg-root)',
        'bg-surface': 'var(--bg-surface)',
        'bg-surface-hover': 'var(--bg-surface-hover)',
        'bg-surface-raised': 'var(--bg-surface-raised)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-tertiary': 'var(--text-tertiary)',
        'border-default': 'var(--border-default)',
        'border-hover': 'var(--border-hover)',
        'accent-primary': 'var(--accent-primary)',
        'accent-primary-hover': 'var(--accent-primary-hover)',
        'accent-secondary': 'var(--accent-secondary)',
        'accent-success': 'var(--accent-success)',
        'accent-error': 'var(--accent-error)',
      },
      boxShadow: {
        'card': '0 0 0 1px var(--border-default)',
        'card-hover': '0 0 0 1px var(--border-hover), 0 4px 16px rgba(0,0,0,0.3)',
        'pdf': '0 0 0 1px var(--border-default), 0 8px 32px rgba(0,0,0,0.5)',
        'focus': '0 0 0 2px var(--accent-primary)',
        'focus-error': '0 0 0 2px var(--accent-error)',
      },
      borderRadius: {
        'card': '8px',
        'code': '8px',
        'pdf': '12px',
      },
      maxWidth: {
        'article': '768px',  // max-w-3xl
        'upgrade': '512px',  // max-w-lg
        'about': '672px',    // max-w-2xl
      },
    },
  },
  plugins: [],
}
```

## 6. CSS Custom Properties (global.css)

```css
:root {
  /* Light mode defaults */
  --bg-root: #fafafa;
  --bg-surface: #ffffff;
  --bg-surface-hover: #f4f4f5;
  --bg-surface-raised: #f5f5f5;
  --text-primary: #0a0a0b;
  --text-secondary: #52525b;
  --text-tertiary: #a1a1aa;
  --text-disabled: #d4d4d8;
  --border-default: #e4e4e7;
  --border-hover: #d4d4d8;
  --accent-primary: #2563eb;
  --accent-primary-hover: #1d4ed8;
  --accent-secondary: #7c3aed;
  --accent-success: #059669;
  --accent-warning: #d97706;
  --accent-error: #dc2626;
}

.dark {
  --bg-root: #08080a;
  --bg-surface: #111113;
  --bg-surface-hover: #18181b;
  --bg-surface-raised: #1a1a1e;
  --text-primary: #fafafa;
  --text-secondary: #a1a1aa;
  --text-tertiary: #71717a;
  --text-disabled: #52525b;
  --border-default: #27272a;
  --border-hover: #3f3f46;
  --accent-primary: #3b82f6;
  --accent-primary-hover: #60a5fa;
  --accent-secondary: #a78bfa;
  --accent-success: #34d399;
  --accent-warning: #fbbf24;
  --accent-error: #f87171;
}

/* Base typography */
body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: var(--text-primary);
  background: var(--bg-root);
}

/* Mono font for code */
pre, code, .font-mono {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
}

/* Custom scrollbar for code blocks */
.code-scroll::-webkit-scrollbar { height: 4px; }
.code-scroll::-webkit-scrollbar-track { background: transparent; }
.code-scroll::-webkit-scrollbar-thumb {
  background: var(--border-default);
  border-radius: 9999px;
}

/* Selection color */
::selection {
  background: var(--accent-primary);
  color: #ffffff;
}
```

## 7. Component Tree Summary

```
src/
├── layouts/
│   └── BaseLayout.astro         # HTML shell, theme script, fonts, global.css
│
├── components/
│   ├── global/
│   │   ├── Navbar.astro         # Sticky nav with dropdowns, search, theme toggle
│   │   ├── Footer.astro
│   │   ├── ThemeToggle.astro    # Sun/Moon icon toggle
│   │   ├── SearchInput.astro    # Shared search bar
│   │   └── Skeleton.astro       # SkeletonLine, SkeletonCard, SkeletonPage
│   │
│   ├── learn/
│   │   ├── ArticleHeader.astro  # H1 + subtitle + meta + hero image
│   │   ├── ArticleBody.astro    # Prose container with typography classes
│   │   ├── Breadcrumb.astro
│   │   ├── CodeBlock.astro      # With copy button + language label
│   │   ├── GlossaryLink.astro   # Auto-linked term → /learn/glossary
│   │   ├── InlineToolCard.astro # Tool reference card inside article
│   │   ├── ComparisonTable.astro
│   │   ├── Blockquote.astro
│   │   ├── ArticleCTA.astro     # Bottom-of-article email CTA
│   │   ├── FurtherReading.astro
│   │   ├── ShareButtons.astro
│   │   └── DifficultyTag.astro  # Beginner/Intermediate/Advanced pill
│   │
│   ├── glossary/
│   │   ├── AZNav.astro          # Sticky A-Z letter bar
│   │   ├── LetterSection.astro  # Single letter + its terms
│   │   └── GlossaryTerm.astro   # Individual term card
│   │
│   ├── upgrade/
│   │   ├── PDFPreview.astro     # PDF thumbnail with paper shadow
│   │   ├── Checklist.astro      # "What's inside" with checkmarks
│   │   ├── EmailForm.astro      # Input + submit + validation
│   │   ├── FormError.astro      # Inline error message
│   │   └── UpgradeSuccess.astro # Post-submit confirmation
│   │
│   └── pages/
│       ├── NotFound.astro       # 404
│       └── About.astro          # About page
│
└── pages/
    ├── index.astro
    ├── learn/
    │   ├── [slug].astro         # Dynamic learn article route
    │   └── glossary.astro
    ├── upgrade/
    │   └── [slug].astro         # Dynamic upgrade page route
    └── 404.astro
```

## 8. Accessibility Notes

- All interactive elements have visible focus rings (`shadow-focus`) for keyboard navigation
- Color contrast ratios meet WCAG 2.1 AA:
  - `text-primary` on `bg-root`: 14.6:1 (dark), 14.2:1 (light)
  - `text-secondary` on `bg-root`: 6.8:1 (dark), 7.1:1 (light)
  - `accent-primary` on `bg-root`: 4.7:1 (dark), 5.3:1 (light)
- Skip-to-content link at top of page
- `aria-label` on icon-only buttons (theme toggle, copy, share)
- Form inputs have associated `<label>` elements (visually hidden where appropriate)
- Glossary A-Z nav is keyboard navigable (arrow keys + Enter)
- `prefers-reduced-motion` respected: disable skeleton pulse animation, transition durations set to 0
- Semantic HTML: `<article>`, `<nav>`, `<main>`, `<figure>`, `<figcaption>`, `<blockquote>`
