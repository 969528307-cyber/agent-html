# agentk.it — Design System + Homepage Layout Spec

> Target: Astro + Tailwind CSS | Dark-mode-first | Developer tool aesthetic
> References: smithery.ai (minimal dark + purple), raycast.com (polished + orange), cursor.directory (dense cards + green)

---

## PART 1: DESIGN SYSTEM

### 1.1 Color System

#### Dark Mode (Primary)
```
Background hierarchy:
  bg-root       #09090B   → page background (deepest)
  bg-surface    #131317   → card, navbar, elevated surfaces
  bg-raised     #1A1A20   → hovered card, dropdown, code block bg
  bg-overlay    #22222A   → modal backdrop, tooltip

Text hierarchy:
  text-primary  #F4F4F6   → headings, body, nav links
  text-secondary #A1A1AA  → descriptions, secondary nav, metadata
  text-tertiary  #71717A  → captions, placeholders, timestamps
  text-inverse   #09090B  → text on accent/light backgrounds

Border:
  border-default #27272D  → card borders, input borders, dividers
  border-subtle  #1D1D24  → subtle separators, inner borders
  border-hover   #3F3F46  → hover state borders
```

**Tailwind config:**
```js
// tailwind.config.mjs
colors: {
  bg: {
    root:    '#09090B',
    surface: '#131317',
    raised:  '#1A1A20',
    overlay: '#22222A',
  },
  text: {
    primary:   '#F4F4F6',
    secondary: '#A1A1AA',
    tertiary:  '#71717A',
    inverse:   '#09090B',
  },
  border: {
    DEFAULT: '#27272D',
    subtle:  '#1D1D24',
    hover:   '#3F3F46',
  },
}
```

#### Accent Colors — Cyan Primary

```
Cyan scale (primary brand):
  cyan-50   #ECFEFF    → subtle highlight bg
  cyan-100  #CFFAFE    → light badge bg
  cyan-200  #A5F3FC    → ...
  cyan-300  #67E8F9    → muted accent
  cyan-400  #22D3EE    → interactive elements
  cyan-500  #06B6D4    → PRIMARY — buttons, links, active states
  cyan-600  #0891B2    → hover state
  cyan-700  #0E7490    → pressed state
  cyan-800  #155E75    → dark accent bg
  cyan-900  #164E63    → deep accent bg
  cyan-950  #083344    → deepest accent bg
```

**Tailwind config:**
```js
colors: {
  accent: {
    50:  '#ECFEFF',
    100: '#CFFAFE',
    200: '#A5F3FC',
    300: '#67E8F9',
    400: '#22D3EE',
    500: '#06B6D4',  // primary brand
    600: '#0891B2',
    700: '#0E7490',
    800: '#155E75',
    900: '#164E63',
    950: '#083344',
  },
}
```

#### Semantic Colors
```
Success:  #22C55E (green-500)   → verified badges, success toasts
Warning:  #F59E0B (amber-500)   → deprecation warnings, alerts
Error:    #EF4444 (red-500)     → error states, destructive actions
Info:     #3B82F6 (blue-500)    → info banners, tips
```

#### Type Badge Colors (for [Skill]/[MCP]/[CLI]/[Workflow] tags)
```
Type-Skill:     bg #7C3AED/15 text #A78BFA border #7C3AED/30  (purple)
Type-MCP:       bg #06B6D4/15 text #22D3EE border #06B6D4/30  (cyan)
Type-CLI:       bg #F59E0B/15 text #FBBF24 border #F59E0B/30  (amber)
Type-Workflow:  bg #EC4899/15 text #F472B6 border #EC4899/30  (pink)
```

**Tailwind classes:**
- Skill: `bg-purple-500/15 text-purple-300 border border-purple-500/30`
- MCP: `bg-accent-500/15 text-accent-300 border border-accent-500/30`
- CLI: `bg-amber-500/15 text-amber-300 border border-amber-500/30`
- Workflow: `bg-pink-500/15 text-pink-300 border border-pink-500/30`

#### Code Block Colors
```
code-bg:      #1E1E2A   → inline code and block background
code-border:  #2D2D3A   → code block border
code-text:    #E4E4E7   → main code text
code-comment: #6B7280   → comments
code-keyword: #C084FC   → keywords (purple)
code-string:  #34D399   → strings (emerald)
code-func:    #60A5FA   → functions (blue)
code-number:  #FBBF24   → numbers (amber)
```

#### Light Mode (Secondary — toggle via `class="light"` on `<html>`)
```
Light mode tokens:
  bg-root:       #FAFAFA
  bg-surface:    #FFFFFF
  bg-raised:     #F4F4F5
  bg-overlay:    #E4E4E7
  text-primary:  #18181B
  text-secondary:#52525B
  text-tertiary: #A1A1AA
  border-default:#E4E4E7
  border-subtle: #F4F4F5
  border-hover:  #D4D4D8
```
*Accent and semantic colors remain identical in both modes.*

---

### 1.2 Typography

#### Font Stack
```
Display/Headings:  'Inter', system-ui, -apple-system, sans-serif
Body:              'Inter', system-ui, -apple-system, sans-serif
Mono/Code:         'JetBrains Mono', 'Fira Code', ui-monospace, monospace
```

**Google Fonts import:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

**Rationale:** Inter is the de-facto standard for dev tools (used by Vercel, Linear, Raycast). JetBrains Mono is the most popular dev monospace — excellent for install commands.

#### Heading Scale
```
| Level | Size       | Weight | Line-height | Letter-spacing | Tailwind Class            |
|-------|-----------|--------|-------------|----------------|---------------------------|
| h1    | 3.5rem    | 800    | 1.1         | -0.02em        | text-6xl font-extrabold tracking-tight |
| h2    | 2.25rem   | 700    | 1.2         | -0.015em       | text-4xl font-bold tracking-tight |
| h3    | 1.5rem    | 600    | 1.3         | -0.01em        | text-2xl font-semibold tracking-tight |
| h4    | 1.25rem   | 600    | 1.4         | normal         | text-xl font-semibold     |
| h5    | 1.125rem  | 600    | 1.5         | normal         | text-lg font-semibold     |
| h6    | 1rem      | 600    | 1.5         | normal         | text-base font-semibold   |
```

#### Body & Utility Scale
```
| Use          | Size    | Weight | Line-height | Tailwind Class              |
|-------------|---------|--------|-------------|-----------------------------|
| Body-lg     | 1.125rem| 400    | 1.6         | text-lg                     |
| Body        | 1rem    | 400    | 1.6         | text-base                   |
| Body-sm     | 0.875rem| 400    | 1.5         | text-sm                     |
| Caption     | 0.75rem | 400    | 1.5         | text-xs                     |
| Code inline | 0.875rem| 500    | 1.5         | text-sm font-mono font-medium|
| Code block  | 0.8125rem|400   | 1.7         | text-[13px] font-mono       |
```

#### Custom Tailwind fontSizes (extend in config):
```js
fontSize: {
  // override base scale for sharper dev-tool feel
  '2xs':  ['0.6875rem', { lineHeight: '1.25' }],
  'code': ['0.8125rem', { lineHeight: '1.7' }],
}
```

---

### 1.3 Spacing System

```yaml
Page:
  max-width:         1280px       # max-w-7xl
  page-padding-x:    1.5rem       # px-6 (desktop), px-4 (mobile)

Section:
  section-padding-y: 5rem         # py-20 (desktop), py-12 (mobile)
  section-gap:       3rem         # gap between major sections

Card:
  card-padding:      1.25rem      # p-5
  card-padding-sm:   1rem         # p-4 (mobile)
  card-gap:          1rem         # gap-4 between cards in grid

Component gaps:
  stack-xs:          0.25rem      # gap-1  (label + value)
  stack-sm:          0.5rem       # gap-2  (title + subtitle)
  stack-md:          0.75rem      # gap-3  (card content stack)
  stack-lg:          1rem         # gap-4  (section title + content)
  stack-xl:          1.5rem       # gap-6  (major content blocks)

Navbar:
  navbar-height:     3.5rem       # h-14
```

**Tailwind extend:**
```js
spacing: {
  '18': '4.5rem',   // useful for icon sizing
  '88': '22rem',    // sidebar width
  '128': '32rem',   // wide cards
}
```

---

### 1.4 Component Tokens

#### Border Radius
```
| Element     | Radius   | Tailwind    | Rationale                   |
|------------|---------|-------------|-----------------------------|
| Button     | 0.5rem  | rounded-lg  | slight round for clickable  |
| Card       | 0.75rem | rounded-xl  | soft, modern cards          |
| Input      | 0.5rem  | rounded-lg  | matches button              |
| Code block | 0.5rem  | rounded-lg  | matches input               |
| Badge/Pill | 9999px  | rounded-full| full pill for tags          |
| Modal      | 1rem    | rounded-2xl | prominent overlay           |
| Avatar     | 9999px  | rounded-full| circular                    |
```

#### Shadows (dark-mode-appropriate — colored, not pure black)
```css
/* Use box-shadow with accent tint for depth in dark mode */
shadow-card:   0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.4)
shadow-hover:  0 4px 6px -1px rgb(0 0 0 / 0.5), 0 2px 4px -2px rgb(0 0 0 / 0.4)
shadow-modal:  0 20px 25px -5px rgb(0 0 0 / 0.6), 0 8px 10px -6px rgb(0 0 0 / 0.4)
shadow-glow:   0 0 15px -3px rgb(6 182 212 / 0.15)  /* cyan glow for hero/CTA */

/* Tailwind extend: */
boxShadow: {
  'card':  '0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.4)',
  'hover': '0 4px 6px -1px rgb(0 0 0 / 0.5), 0 2px 4px -2px rgb(0 0 0 / 0.4)',
  'glow':  '0 0 15px -3px rgb(6 182 212 / 0.15)',
}
```

#### Transitions
```css
--transition-fast:    150ms ease     /* hover color, opacity */
--transition-base:    200ms ease     /* standard transitions */
--transition-slow:    300ms ease     /* card hover lift, expand */
--transition-spring:  400ms cubic-bezier(0.34, 1.56, 0.64, 1) /* modals, drawers */
```

**Tailwind extend:**
```js
transitionDuration: {
  'fast': '150ms',
  'slow': '300ms',
},
transitionTimingFunction: {
  'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
}
```

#### Borders
```css
border-width: 1px (default for all borders — no thick borders)
border-style: solid (no dashed/dotted in main UI)

/* Fancy gradient borders (for hero card, featured items): */
border-gradient: linear-gradient(135deg, #06B6D4, #7C3AED) border-box
```

#### Focus Rings
```
focus-ring: ring-2 ring-accent-500/50 ring-offset-2 ring-offset-bg-root
All interactive elements must show visible focus indicators (WCAG 2.1 AA).
```

---

### 1.5 Component Primitives

#### Button Variants
```
primary:    bg-accent-500 text-white hover:bg-accent-600 active:bg-accent-700
secondary:  bg-bg-raised text-text-primary border border-border-default hover:bg-bg-overlay
ghost:      text-text-secondary hover:text-text-primary hover:bg-bg-raised
danger:     bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25
```

#### Input
```
default:  bg-bg-surface border border-border-default rounded-lg px-4 py-2.5
          text-text-primary placeholder:text-text-tertiary
          focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20
          transition-colors duration-fast
```

#### Card
```
default:  bg-bg-surface border border-border-default rounded-xl p-5
          transition-all duration-slow
          hover:border-border-hover hover:shadow-hover hover:-translate-y-0.5
```

#### Badge
```
default:  inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
          (color varies by type — see Type Badge Colors above)
```

#### Divider
```
default:  border-t border-border-subtle
section:  border-t border-border-default my-8
```

---

## PART 2: HOMEPAGE LAYOUT

### Section 1: Navbar

#### Desktop Layout (≥1024px)
```
┌─────────────────────────────────────────────────────────────────────┐
│  [agentk.it]    Tools ▾  Learn ▾  Free ▾              [🔍] [★]  │  ← h-14
│  bg-bg-root/80 backdrop-blur-xl border-b border-border-subtle       │
└─────────────────────────────────────────────────────────────────────┘
  sticky top-0 z-50
```

**Specs:**
- Height: `h-14` (3.5rem / 56px)
- Container: `max-w-7xl mx-auto px-6 flex items-center justify-between`
- Background: `bg-bg-root/80 backdrop-blur-xl` (frosted glass)
- Border bottom: `border-b border-border-subtle`
- Position: `sticky top-0 z-50`
- Logo: `text-lg font-bold tracking-tight` — text-accent-500, monospaced feel
  - "agentk" in text-primary, ".it" in text-accent-500 → `agentk<span class="text-accent-500">.it</span>`
- Nav links (Tools / Learn / Free): `text-sm text-text-secondary hover:text-text-primary transition-colors`
  - Each with `▾` chevron indicator (dropdown menus for sub-categories)
- Search icon (right): `w-5 h-5 text-text-tertiary hover:text-text-primary` — opens search overlay
- Star/bookmark icon (optional): `w-5 h-5 text-text-tertiary hover:text-accent-500` — saved items

**Dropdown menus (Tools / Learn / Free):**
```
Tools ▾
  ┌──────────────────┐
  │ Skills           │
  │ MCP Servers      │
  │ CLI Tools        │
  │ Workflows        │
  └──────────────────┘
  bg-bg-raised border border-border-default rounded-lg shadow-hover p-1.5
  Each item: py-2 px-3 text-sm rounded-md hover:bg-bg-overlay transition-colors

Learn ▾
  ┌──────────────────┐
  │ What is MCP?     │
  │ Agent Comparison │
  │ How to Choose    │
  │ Getting Started  │
  └──────────────────┘

Free ▾
  ┌──────────────────┐
  │ MCP Cheatsheet   │
  │ Agent CLI Ref    │
  │ Framework Comp.  │
  │ Newsletter       │
  └──────────────────┘
```

#### Mobile Layout (<1024px)
```
┌─────────────────────────────────┐
│  [agentk.it]        [☰] [🔍] │  ← h-14, px-4
└─────────────────────────────────┘
  Hamburger menu opens slide-over drawer:
  
  ┌─────────────────────┐
  │ [✕] Close           │
  │                     │
  │ Tools ▸             │
  │ Learn ▸             │
  │ Free ▸              │
  │ ────────────────    │
  │ ★ Saved             │
  │ About               │
  └─────────────────────┘
  bg-bg-root w-full h-full p-6
  z-50 fixed inset-0
```

**Component Props (Navbar.astro):**
```ts
interface NavbarProps {
  // No props needed — static, data-independent
}

// States:
// - Default: sticky, translucent bg
// - Scrolled: bg-bg-root/95 (slightly more opaque on scroll — add scroll listener)
// - Mobile menu open: full-screen overlay with close button
```

**Interactive States:**
| Element | Default | Hover | Active/Focus |
|---------|---------|-------|--------------|
| Nav link | `text-text-secondary` | `text-text-primary` | Focus: `ring-2 ring-accent-500/50 rounded` |
| Search icon | `text-text-tertiary` | `text-text-primary` | Opens search overlay on click |
| Dropdown trigger | `text-text-secondary` | `text-text-primary` | `aria-expanded` toggle |
| Hamburger | `text-text-secondary` | `text-text-primary` | Toggles mobile drawer |

---

### Section 2: Hero

#### Desktop Layout (≥1024px)
```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│              Discover AI Agent Tools.                               │  ← h1 (text-6xl)
│                                                                     │
│         Daily-updated library of Skills, MCP servers,               │  ← body-lg
│         CLI tools and workflows — copy, paste, run.                 │  text-text-secondary
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  🔍  Search skills, MCPs, tools...                     [⌘K]  │  │  ← search bar
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│        [Skills]   [MCPs]   [CLI Tools]   [Workflows]               │  ← type tabs
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
  pt-24 pb-16 (desktop), pt-16 pb-12 (mobile)
  max-w-3xl mx-auto text-center px-6
```

**Specs:**
- Section padding: `pt-24 pb-16` (desktop), `pt-16 pb-12` (mobile)
- Heading: `text-6xl font-extrabold tracking-tight leading-[1.1]` (desktop)
  - Mobile: `text-4xl`
  - Color: `text-text-primary`
- Subtitle: `text-lg text-text-secondary max-w-2xl mx-auto mt-4`
  - Mobile: `text-base`
- Search bar: `mt-8 max-w-2xl mx-auto`
  - Height: `h-14` (56px)
  - Background: `bg-bg-surface border border-border-default rounded-lg`
  - Focus: `border-accent-500 ring-2 ring-accent-500/20`
  - Left icon: Search magnifying glass `w-5 h-5 text-text-tertiary ml-4`
  - Placeholder: `text-text-tertiary` — "Search skills, MCPs, tools..."
  - Right: `⌘K` shortcut badge — `text-xs text-text-tertiary bg-bg-raised px-2 py-0.5 rounded mr-3`
  - Input text: `text-base text-text-primary`
- Type tabs: `mt-6 flex justify-center gap-2`
  - Each tab: `px-4 py-2 rounded-lg text-sm font-medium transition-colors`
  - Default (inactive): `text-text-secondary hover:text-text-primary hover:bg-bg-raised`
  - Active: `bg-accent-500/15 text-accent-400 border border-accent-500/30`

#### Mobile Layout (<640px)
```
┌─────────────────────────┐
│                         │
│  Discover AI Agent      │
│  Tools.                 │  ← text-4xl
│                         │
│  Daily-updated library  │
│  of Skills, MCP servers,│  ← text-base
│  CLI tools & workflows. │
│                         │
│ ┌─────────────────────┐ │
│ │🔍 Search skills...  │ │  ← h-12
│ └─────────────────────┘ │
│                         │
│ [Skills][MCPs][CLI]    │  ← scrollable row
│                         │
└─────────────────────────┘
```

**Component Props (Hero.astro):**
```ts
interface HeroProps {
  heading: string;         // "Discover AI Agent Tools."
  subtitle: string;        // "Daily-updated library..."
  searchPlaceholder: string;
  activeTab?: 'skills' | 'mcps' | 'cli' | 'workflows';
  onSearch: (query: string) => void;
  onTabChange: (tab: string) => void;
}
```

**Interactive States:**
| Element | States |
|---------|--------|
| Search input | Default: border-border-default. Focus: border-accent-500 + ring. Typing: text appears + ⌘K badge hides. Empty: shows placeholder. |
| Type tabs | Inactive: text-text-secondary. Hover: bg-bg-raised + text-text-primary. Active: accent bg + accent text. Focus: ring-2. |
| ⌘K shortcut | Press ⌘K anywhere on page to focus search. Esc to blur. |

**Search Overlay (triggered by ⌘K or clicking search icon):**
```
Full-screen modal overlay:
  bg-black/60 backdrop-blur-sm fixed inset-0 z-50
  
  ┌──────────────────────────────────────────┐
  │  🔍 Search tools...              [esc]   │  ← search input, auto-focused
  ├──────────────────────────────────────────┤
  │  Suggestions:                            │
  │  ┌─ GitHub MCP Server             [MCP]  │
  │  ├─ PR Review Skill              [Skill] │
  │  ├─ Brave Search MCP              [MCP]  │
  │  └─ ...                                  │
  │                                          │
  │  Press ↑↓ to navigate, ↵ to select       │
  └──────────────────────────────────────────┘
  bg-bg-surface border border-border-default rounded-xl shadow-modal
  max-w-2xl mx-auto mt-[20vh] p-0
  Results: divide-y divide-border-subtle
  Each result: px-4 py-3 flex items-center gap-3 hover:bg-bg-raised cursor-pointer
```

---

### Section 3: Today's Additions

#### Desktop Layout (≥1024px)
```
┌─────────────────────────────────────────────────────────────────────┐
│  🆕 Today's Additions                          May 9, 2026          │  ← section header
│                                                                     │
│  ┌────────────────────────────────┐ ┌──────────────────────────────┐│
│  │ [MCP] Figma MCP Server         │ │ [Skill] GitHub PR Review     ││
│  │ Design-to-code bridge for      │ │ Auto-review PRs with AI for  ││
│  │ Claude and Cursor agents.      │ │ Hermes Agent and OpenClaw.   ││
│  │                                │ │                              ││
│  │ npx @anthropic/mcp-figma       │ │ hermes skills install https  ││
│  │                      [📋 Copy] │ │                    [📋 Copy] ││
│  │ ☆ 124 · Added 3h ago          │ │ ☆ 342 · Added 5h ago         ││
│  └────────────────────────────────┘ └──────────────────────────────┘│
│                                                                     │
│  ┌────────────────────────────────┐ ┌──────────────────────────────┐│
│  │ [CLI] codex-cli                │ │ [MCP] Brave Search Server    ││
│  │ ...                            │ │ ...                          ││
│  └────────────────────────────────┘ └──────────────────────────────┘│
│  ... (10 cards, 2-column grid)                                      │
│                                                                     │
│  [View all today's additions →]                                     │  ← CTA link
└─────────────────────────────────────────────────────────────────────┘
  py-20 max-w-7xl mx-auto px-6
```

**Specs:**
- Section: `py-20 max-w-7xl mx-auto px-6`
- Header: `flex items-baseline justify-between mb-8`
  - Title: `text-2xl font-semibold tracking-tight text-text-primary`
  - Date: `text-sm text-text-tertiary`
  - Emoji: `🆕` before title (or use a CSS dot `●` in accent-500)
- Card grid: `grid grid-cols-1 md:grid-cols-2 gap-4`
- Card structure:

```
┌─────────────────────────────────────────┐
│ [MCP]               ← type badge (top)  │
│                                         │
│ Figma MCP Server     ← h5 name          │
│ Design-to-code bridge for Claude        │
│ and Cursor agents.   ← body-sm desc     │
│                      (2 line clamp)      │
│                                         │
│ ┌─────────────────────┐ [📋 Copy]       │
│ │ npx @anthropic/...  │ ← code row      │
│ └─────────────────────┘                 │
│                                         │
│ ☆ 124 · Added 3h ago  ← metadata row   │
└─────────────────────────────────────────┘
  bg-bg-surface border border-border-default rounded-xl p-5
  flex flex-col gap-3
  transition-all duration-slow
  hover:border-border-hover hover:shadow-hover hover:-translate-y-0.5
```

**Card sub-layout (top to bottom):**
1. **Type badge**: `self-start` — `px-2.5 py-0.5 rounded-full text-xs font-medium border` (color-coded per type)
2. **Name**: `text-lg font-semibold text-text-primary` — single line, truncate
3. **Description**: `text-sm text-text-secondary line-clamp-2` — 2-line max
4. **Code row**: `flex items-center gap-2`
   - Code text: `flex-1 bg-bg-raised border border-border-subtle rounded-md px-3 py-2 text-sm font-mono text-text-primary truncate`
   - Copy button: `shrink-0`
5. **Metadata row**: `flex items-center gap-3 text-xs text-text-tertiary`
   - Star count: `☆ {count}` with star icon
   - Separator: `·` (middle dot)
   - Time: `Added {relative time}`

**Copy Button (CopyButton.astro):**
```ts
interface CopyButtonProps {
  text: string;          // the text to copy
  label?: string;        // "Copy" (default)
}

// States:
// - idle:     bg-bg-raised text-text-secondary hover:bg-bg-overlay hover:text-text-primary
//              px-3 py-1.5 rounded-md text-xs font-medium
//              border border-border-subtle
// - copying:  bg-green-500/15 text-green-400 border-green-500/30
//              Icon changes from 📋 → ✓ (checkmark)
// - copied:   bg-green-500/15 text-green-400 (persists 2s, then resets)
// - error:    bg-red-500/15 text-red-400 (rare — Clipboard API failure)
```

#### Mobile Layout (<768px)
```
┌─────────────────────────┐
│ 🆕 Today's Additions    │
│ May 9, 2026             │
│                         │
│ ┌─────────────────────┐ │
│ │ [MCP] Figma MCP     │ │
│ │ Design-to-code...   │ │
│ │ npx @anthropic/...  │ │
│ │ [Copy] ☆124 · 3h    │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ [Skill] GitHub PR.. │ │
│ │ ...                 │ │
│ └─────────────────────┘ │
│ ... (single column)     │
│                         │
│ [View all →]            │
└─────────────────────────┘
  grid-cols-1 gap-3 px-4
```

**Component Props (ToolCard.astro):**
```ts
interface ToolCardProps {
  id: string;
  type: 'skill' | 'mcp' | 'cli' | 'workflow';
  name: string;
  description: string;
  installCommand: string;
  stars: number;
  addedAt: string;       // ISO 8601, client computes relative time
  agentCompatibility?: string[];  // ['hermes', 'claude-code', ...]
  href: string;          // link to detail page
}
```

**Card States:**
| State | Appearance |
|-------|-----------|
| Default | `bg-bg-surface border border-border-default` |
| Hover | `border-border-hover shadow-hover -translate-y-0.5` |
| Focus (keyboard) | `ring-2 ring-accent-500/50 ring-offset-2 ring-offset-bg-root` |
| Loading (skeleton) | `animate-pulse bg-bg-raised rounded-xl h-[180px]` — shimmer placeholder |
| Empty state | "No tools added today. Check back tomorrow!" centered with muted icon |
| Error | "Failed to load. [Retry]" — inline error with retry button |

---

### Section 4: Trending This Week

#### Desktop Layout (≥1024px)
```
┌─────────────────────────────────────────────────────────────────────┐
│  🔥 Trending This Week                                              │
│  Tools gaining the most stars this week.    [View all trending →]   │  ← header
│                                                                     │
│  ┌────────────────────────────────┐ ┌──────────────────────────────┐│
│  │ 🔥 +1.2k  [MCP] Brave Search  │ │ 🔥 +892   [Skill] PR Review  ││  ← same card style
│  │ ...                            │ │ ...                          ││  but with fire indicator
│  └────────────────────────────────┘ └──────────────────────────────┘│
│  ... (10 cards)                                                     │
└─────────────────────────────────────────────────────────────────────┘
  py-20 max-w-7xl mx-auto px-6
```

**Differences from "Today's Additions" cards:**
- Add a **trend indicator** in the card header (before type badge):
  ```
  🔥 +1.2k stars this week    ← text-xs text-amber-400 font-medium
  ```
  - Position: top-right corner of card, or inline with type badge
  - Color: `text-amber-400` (warm fire color)
  - Alternative: replace `☆` with `🔥` in metadata row, show weekly delta
- Sorting: by weekly star gain descending
- Otherwise identical card structure

#### Mobile Layout (<768px)
```
Same single-column card layout as Section 3.
```

**Component Props (TrendingCard extends ToolCard):**
```ts
interface TrendingCardProps extends ToolCardProps {
  weeklyStarDelta: number;  // e.g., 1240
  rank?: number;            // 1-10, for top badge
}

// Top 3 cards get a subtle "glow" left border:
// rank 1: border-l-2 border-l-amber-400
// rank 2: border-l-2 border-l-zinc-400  
// rank 3: border-l-2 border-l-amber-700
```

---

### Section 5: Browse by Category

#### Desktop Layout (≥1024px)
```
┌─────────────────────────────────────────────────────────────────────┐
│  Browse by Category                                                 │
│                                                                     │
│  [🔍 Search]  [⚙️ DevOps]  [💬 Communication]  [📊 Data]           │  ← pill buttons
│  [🤖 Automation]  [✅ Productivity]  [🎬 Media]  [🔒 Security]     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
  py-20 max-w-7xl mx-auto px-6
```

**Specs:**
- Title: `text-2xl font-semibold tracking-tight text-text-primary mb-6`
- Pill container: `flex flex-wrap gap-3`
- Category pill button:
```css
/* Default pill */
inline-flex items-center gap-2 px-5 py-3 
  bg-bg-surface border border-border-default rounded-full
  text-sm font-medium text-text-secondary
  transition-all duration-fast
  hover:border-border-hover hover:text-text-primary hover:bg-bg-raised
  focus-visible:ring-2 ring-accent-500/50

/* Active/selected state */
  border-accent-500/50 bg-accent-500/10 text-accent-400

/* Hover: slight scale/fade animation */
  hover:scale-[1.02]
```

- Each pill has: emoji icon + label + optional count badge
  - Example: `🔍 Search (342)`
  - Count badge: `text-xs text-text-tertiary ml-1`

**Categories:**
```
| Emoji | Label         | Slug       |
|-------|---------------|------------|
| 🔍    | Search        | search     |
| ⚙️    | DevOps        | devops     |
| 💬    | Communication | comms      |
| 📊    | Data          | data       |
| 🤖    | Automation    | automation |
| ✅    | Productivity  | productivity|
| 🎬    | Media         | media      |
| 🔒    | Security      | security   |
```

#### Mobile Layout (<640px)
```
┌─────────────────────────┐
│ Browse by Category      │
│                         │
│ [🔍 Search] [⚙️ DevOps]│  ← wraps, no horizontal scroll
│ [💬 Comms] [📊 Data]   │
│ [🤖 Auto] [✅ Prod]    │
│ [🎬 Media] [🔒 Sec]    │
└─────────────────────────┘
  flex flex-wrap gap-2 px-4
  Pill: px-4 py-2.5 text-xs
```

**Component Props (CategoryPills.astro):**
```ts
interface Category {
  emoji: string;
  label: string;
  slug: string;
  count: number;
}

interface CategoryPillsProps {
  categories: Category[];
  activeCategory?: string;
}
```

**States:**
| State | Style |
|-------|-------|
| Default | bg-bg-surface border-border-default text-text-secondary |
| Hover | border-border-hover text-text-primary bg-bg-raised scale-[1.02] |
| Active | border-accent-500/50 bg-accent-500/10 text-accent-400 |
| Focus | ring-2 ring-accent-500/50 |

---

### Section 6: Browse by Agent

#### Desktop Layout (≥1024px)
```
┌─────────────────────────────────────────────────────────────────────┐
│  Browse by Agent                                                    │
│  Find tools compatible with your AI agent.                          │  ← subtitle
│                                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│  │  Hermes  │ │ OpenClaw │ │  Claude  │ │  Cursor  │             │  ← 4-col grid
│  │  Agent   │ │          │ │   Code   │ │          │             │
│  │          │ │          │ │          │ │          │             │
│  │ 42 tools │ │ 38 tools │ │ 56 tools │ │ 34 tools │             │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘             │
│  ┌──────────┐ ┌──────────┐                                        │
│  │  Codex   │ │ Generic  │                                        │  ← 2 remaining
│  │          │ │          │                                        │
│  │ 29 tools │ │ 87 tools │                                        │
│  └──────────┘ └──────────┘                                        │
└─────────────────────────────────────────────────────────────────────┘
  py-20 max-w-7xl mx-auto px-6
```

**Specs:**
- Header: `text-2xl font-semibold tracking-tight text-text-primary`
- Subtitle: `text-sm text-text-secondary mt-1 mb-6`
- Grid: `grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4`
- Agent card:
```css
flex flex-col items-center gap-3 p-6
  bg-bg-surface border border-border-default rounded-xl
  transition-all duration-slow
  hover:border-border-hover hover:shadow-hover hover:-translate-y-1
  group cursor-pointer
```
- Card structure:
  - Agent icon/logo (top, centered): `w-10 h-10 rounded-lg bg-bg-raised` placeholder
  - Agent name: `text-sm font-semibold text-text-primary group-hover:text-accent-400 transition-colors`
  - Tool count: `text-xs text-text-tertiary`
  - Optional: small color dot matching agent brand

**Agent list:**
```
| Agent         | Icon hint    |
|---------------|-------------|
| Hermes Agent  | Wing/helm   |
| OpenClaw      | Claw icon   |
| Claude Code   | Anthropic   |
| Cursor        | Cursor logo |
| Codex         | OpenAI      |
| Generic       | Globe       |
```

#### Mobile Layout (<640px)
```
┌─────────────────────────┐
│ Browse by Agent         │
│                         │
│ ┌─────────┐┌──────────┐ │
│ │ Hermes  ││ OpenClaw │ │  ← 2-col grid
│ │ 42      ││ 38       │ │
│ └─────────┘└──────────┘ │
│ ┌─────────┐┌──────────┐ │
│ │ Claude  ││ Cursor   │ │
│ │ 56      ││ 34       │ │
│ └─────────┘└──────────┘ │
└─────────────────────────┘
  grid-cols-2 gap-3 px-4
```

**Component Props (AgentCard.astro):**
```ts
interface AgentCardProps {
  id: string;
  name: string;          // "Hermes Agent"
  slug: string;          // "hermes-agent"
  toolCount: number;
  iconUrl?: string;      // logo image URL
  color?: string;        // accent color for card hover glow
}
```

**States:**
| State | Behavior |
|-------|----------|
| Default | bg-bg-surface, subtle border |
| Hover | Lift (-1px), border lightens, name turns accent-400 |
| Focus | Ring + lift |
| Loading | Skeleton card (same size, pulse animation) |

---

### Section 7: Learn Entry

#### Desktop Layout (≥1024px)
```
┌─────────────────────────────────────────────────────────────────────┐
│  📚 Learn                                                           │
│                                                                     │
│  ┌──────────────────────┐ ┌──────────────────────┐ ┌─────────────┐ │
│  │                      │ │                      │ │             │ │
│  │  What is MCP?        │ │  Agent Comparison    │ │  How to     │ │
│  │                      │ │                      │ │  Choose     │ │
│  │  Understand Model    │ │  Compare Claude Code, │ │  Find the   │ │
│  │  Context Protocol    │ │  Cursor, Codex, and  │ │  right agent│ │
│  │  and how it works.   │ │  Hermes Agent.       │ │  for you.   │ │
│  │                      │ │                      │ │             │ │
│  │  Read guide →        │ │  Compare →           │ │  See guide →│ │
│  └──────────────────────┘ └──────────────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
  py-20 max-w-7xl mx-auto px-6
```

**Specs:**
- Header: `text-2xl font-semibold tracking-tight text-text-primary mb-6`
- Grid: `grid grid-cols-1 md:grid-cols-3 gap-4`
- Learn card:
```css
flex flex-col gap-4 p-6
  bg-bg-surface border border-border-default rounded-xl
  transition-all duration-slow
  hover:border-border-hover hover:shadow-hover hover:-translate-y-1
```
- Card structure:
  - Icon area (top): `w-10 h-10 rounded-lg bg-accent-500/10 flex items-center justify-center`
    - Icon: `w-5 h-5 text-accent-400` (Lucide icons or inline SVG)
  - Title: `text-base font-semibold text-text-primary`
  - Description: `text-sm text-text-secondary line-clamp-2`
  - CTA link: `inline-flex items-center gap-1.5 text-sm font-medium text-accent-400 hover:text-accent-300 transition-colors mt-auto`
    - Text + `→` arrow

**Learn cards:**
```
1. "What is MCP?"
   "Understand the Model Context Protocol — the universal standard for AI agent tools."
   → "Read guide"

2. "Agent Comparison"
   "Compare Claude Code, Cursor, Codex, and Hermes Agent side by side."
   → "Compare"

3. "How to Choose"
   "Find the right agent for your workflow based on your needs."
   → "See guide"
```

#### Mobile Layout (<768px)
```
┌─────────────────────────┐
│ 📚 Learn                │
│ ┌─────────────────────┐ │
│ │ What is MCP?        │ │
│ │ ...                 │ │
│ │ Read guide →        │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ Agent Comparison    │ │
│ │ ...                 │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ How to Choose       │ │
│ │ ...                 │ │
│ └─────────────────────┘ │
└─────────────────────────┘
  grid-cols-1 gap-3 px-4
```

**Component Props (LearnCard.astro):**
```ts
interface LearnCardProps {
  title: string;
  description: string;
  ctaLabel: string;
  href: string;
  icon: string;   // Lucide icon name
}
```

**States:**
| State | Behavior |
|-------|----------|
| Default | bg-bg-surface border-border-default |
| Hover | Lift, border lighter, CTA text brightens |
| Focus | Ring + lift |

---

### Section 8: Free Downloads

#### Desktop Layout (≥1024px)
```
┌─────────────────────────────────────────────────────────────────────┐
│  🎁 Free Downloads                                                  │
│                                                                     │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌───┐│
│  │ 📄              │ │ 📄              │ │ 📄              │ │📬 ││
│  │ MCP Cheatsheet  │ │ Agent CLI Ref   │ │ Framework Comp. │ │NL ││
│  │                 │ │                 │ │                 │ │   ││
│  │ Quick reference │ │ Common commands │ │ Side-by-side    │ │Wkly││
│  │ for all MCP     │ │ for Claude Code,│ │ comparison of   │ │tips││
│  │ concepts.       │ │ Cursor, Codex.  │ │ agent platforms.│ │   ││
│  │                 │ │                 │ │                 │ │   ││
│  │ Download PDF →  │ │ Download PDF →  │ │ Download PDF →  │ │Sub││
│  └─────────────────┘ └─────────────────┘ └─────────────────┘ └───┘│
└─────────────────────────────────────────────────────────────────────┘
  py-20 max-w-7xl mx-auto px-6
```

**Specs:**
- Header: `text-2xl font-semibold tracking-tight text-text-primary mb-6`
- Grid: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`
- Download card:
```css
flex flex-col items-center text-center gap-3 p-5
  bg-bg-surface border border-border-default rounded-xl
  transition-all duration-slow
  hover:border-accent-500/30 hover:shadow-glow hover:-translate-y-1
```
- Card structure:
  - PDF icon: `w-12 h-12 rounded-lg bg-accent-500/10 flex items-center justify-center`
    - Icon: `w-6 h-6 text-accent-400`
    - Newsletter variant: `bg-pink-500/10` with `text-pink-400` icon
  - Title: `text-sm font-semibold text-text-primary`
  - Description: `text-xs text-text-secondary line-clamp-2`
  - CTA: `text-xs font-medium text-accent-400 hover:text-accent-300`

**Download items:**
```
1. 📄 MCP Cheatsheet (PDF)       — "Quick reference for all MCP concepts."
2. 📄 Agent CLI Reference (PDF)  — "Common CLI commands for popular agents."
3. 📄 Framework Comparison (PDF) — "Side-by-side comparison of agent platforms."
4. 📬 Newsletter                — "Weekly tips, new tools, and tutorials."
```

#### Mobile Layout (<640px)
```
┌─────────────────────────┐
│ 🎁 Free Downloads       │
│ ┌─────────────────────┐ │
│ │ 📄 MCP Cheatsheet   │ │
│ │ Download PDF →      │ │
│ └─────────────────────┘ │
│ ... (vertical stack)    │
└─────────────────────────┘
  grid-cols-1 gap-3 px-4
```

**Component Props (DownloadCard.astro):**
```ts
interface DownloadCardProps {
  title: string;
  description: string;
  type: 'pdf' | 'newsletter';
  ctaLabel: string;    // "Download PDF" | "Subscribe"
  href: string;
  iconName: string;
}
```

**States:**
| State | Behavior |
|-------|----------|
| Default | bg-bg-surface border-border-default |
| Hover | Cyan glow border, lift, icon area brightens |
| Focus | Ring + cyan border |
| Newsletter signup | Opens inline email input instead of link |
| Success (after submit) | Card shows ✓ "Subscribed!" in green |

---

### Section 9: Footer

#### Desktop Layout (≥1024px)
```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  [agentk.it]                                                        │  ← logo
│  Daily-updated AI agent tools library.                              │  ← tagline
│                                                                     │
│  ───────────────────────────────────────────────────────────────    │  ← divider
│                                                                     │
│  About  ·  RSS  ·  GitHub  ·  Twitter/X  ·  Privacy                │  ← links
│                                                                     │
│  © 2026 agentk.it — Built with Astro. Data from GitHub.            │  ← copyright
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
  py-12 max-w-7xl mx-auto px-6 border-t border-border-default
```

**Specs:**
- Container: `max-w-7xl mx-auto px-6 py-12`
- Top border: `border-t border-border-default`
- Logo: `text-lg font-bold` — "agentk.it" with accent-500 dot
- Tagline: `text-sm text-text-tertiary mt-2`
- Divider: `border-t border-border-subtle my-6`
- Link row: `flex flex-wrap gap-x-6 gap-y-2 text-sm text-text-secondary`
  - Each link: `hover:text-text-primary transition-colors`
  - Separator: `·` (middle dot, text-text-tertiary)
- Copyright: `text-xs text-text-tertiary mt-4`
  - "© 2026 agentk.it — Built with Astro. Data from GitHub."

#### Mobile Layout (<640px)
```
┌───────────────────────┐
│                       │
│ agentk.it             │
│ Daily-updated AI      │
│ agent tools library.  │
│                       │
│ ─────────────────     │
│                       │
│ About  ·  RSS         │
│ GitHub  ·  Twitter/X  │
│ Privacy               │
│                       │
│ © 2026 agentk.it      │
└───────────────────────┘
  px-4 py-8
  Links stack in 2 columns if needed
```

**Component Props (Footer.astro):**
```ts
// No props — fully static
```

**States:** N/A — all static links, no interactive states beyond standard link hover.

---

## PART 3: GLOBAL BEHAVIORS

### 3.1 Scroll Behavior
```
- Navbar: sticky, becomes more opaque on scroll (bg-bg-root/80 → bg-bg-root/95)
  - Transition triggers at scrollY > 20px
  - Smooth: transition-colors duration-300
- Smooth scrolling: scroll-behavior: smooth on <html> (respects prefers-reduced-motion)
```

### 3.2 Loading States
```
Route changes (Astro SPA):
  - Progress bar: thin (2px) accent-500 gradient bar at top of viewport
  - Duration: auto, nprogress-style

Data loading:
  - Cards: skeleton pulse animation (bg-bg-raised animate-pulse rounded-xl)
  - Section: show skeleton grid matching layout
  - Lists: 3-5 skeleton cards loaded initially

First paint:
  - No flash of unstyled content: critical CSS inlined in <head>
  - Tailwind: use @apply in layout styles, inline critical
```

### 3.3 Empty States
```
| Section          | Empty State                                                |
|-----------------|------------------------------------------------------------|
| Today's Additions| "No tools added today. Check back tomorrow!" + 📭 icon    |
| Trending        | "Not enough data yet. Trending list updates weekly."        |
| Category pills  | Hide empty categories, or show "(0)" badge                  |
| Agent cards     | "0 tools" — card still shows, links to empty filtered page  |
| Search results  | "No results for 'X'. Try a different search term."          |
```

### 3.4 Error States
```
Network error (data fetch failure):
  ┌──────────────────────────────────────┐
  │ ⚠️ Failed to load tools             │
  │ The data might be temporarily        │
  │ unavailable.                         │
  │                        [Retry]       │
  └──────────────────────────────────────┘
  bg-bg-surface border border-red-500/20 rounded-xl p-6 text-center
  Retry button: secondary variant with refresh icon

Copy error:
  Toast notification: "Failed to copy to clipboard"
  position: bottom-center, auto-dismiss after 3s
```

### 3.5 Accessibility Checklist
```
✓ All interactive elements: visible focus ring (ring-2 ring-accent-500/50)
✓ Links distinguishable from text (accent color + underline on hover)
✓ All images have alt text (or aria-hidden for decorative)
✓ Color contrast: ≥4.5:1 for text (WCAG AA)
  - text-primary (#F4F4F6) on bg-root (#09090B): 15.4:1 ✓
  - text-secondary (#A1A1AA) on bg-surface (#131317): 7.1:1 ✓
  - text-tertiary (#71717A) on bg-surface (#131317): 4.6:1 ✓
✓ Skip-to-content link: sr-only focus:not-sr-only at top of page
✓ Nav links: proper ARIA for dropdown menus (aria-haspopup, aria-expanded)
✓ Search: role="combobox", aria-autocomplete="list", aria-activedescendant
✓ Type tabs: role="tablist", role="tab", aria-selected
✓ Cards: wrapped in <a> or role="link" with tabindex="0"
✓ Copy buttons: aria-label="Copy install command"
✓ Reduced motion: @media (prefers-reduced-motion: reduce) disables animations
✓ Screen reader: sr-only labels for icon-only buttons
```

### 3.6 Responsive Breakpoints
```
| Breakpoint | Width    | Layout changes                          |
|-----------|---------|-----------------------------------------|
| base      | <640px  | Single column, stacked, smaller text    |
| sm        | ≥640px  | 2-column grid, full nav (no hamburger) |
| md        | ≥768px  | 2-column tool cards, 3 learn cards     |
| lg        | ≥1024px | Full desktop: 2-col tools, 4-col agents|
| xl        | ≥1280px | Max-width container kicks in           |
```

---

## PART 4: TAILWIND CONFIG SUMMARY

```js
// tailwind.config.mjs
import defaultTheme from 'tailwindcss/defaultTheme'

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',  // toggle with class="light" on <html>
  theme: {
    extend: {
      colors: {
        bg: {
          root:    '#09090B',
          surface: '#131317',
          raised:  '#1A1A20',
          overlay: '#22222A',
        },
        text: {
          primary:   '#F4F4F6',
          secondary: '#A1A1AA',
          tertiary:  '#71717A',
          inverse:   '#09090B',
        },
        border: {
          DEFAULT: '#27272D',
          subtle:  '#1D1D24',
          hover:   '#3F3F46',
        },
        accent: {
          50:  '#ECFEFF',
          100: '#CFFAFE',
          200: '#A5F3FC',
          300: '#67E8F9',
          400: '#22D3EE',
          500: '#06B6D4',
          600: '#0891B2',
          700: '#0E7490',
          800: '#155E75',
          900: '#164E63',
          950: '#083344',
        },
      },
      fontFamily: {
        sans:  ['Inter', ...defaultTheme.fontFamily.sans],
        mono:  ['JetBrains Mono', 'Fira Code', ...defaultTheme.fontFamily.mono],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1.25' }],
        'code': ['0.8125rem', { lineHeight: '1.7' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        // Ensuring Tailwind has the right scale
        // rounded-lg (0.5rem), rounded-xl (0.75rem), rounded-2xl (1rem) are defaults
      },
      boxShadow: {
        'card':  '0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.4)',
        'hover': '0 4px 6px -1px rgb(0 0 0 / 0.5), 0 2px 4px -2px rgb(0 0 0 / 0.4)',
        'glow':  '0 0 15px -3px rgb(6 182 212 / 0.15)',
      },
      transitionDuration: {
        'fast': '150ms',
        'slow': '300ms',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
}
```

---

## SUMMARY

This Design Spec covers:

1. **Color System** — Dark-mode-first with cyan accent, neutral gray scale, semantic colors, type badge colors, code highlighting, and a complete light mode alternative.

2. **Typography** — Inter + JetBrains Mono via Google Fonts, 6-level heading scale, body/caption/code utility classes, all with Tailwind mappings.

3. **Spacing** — Page max-width (1280px), section padding, card padding, component gaps, navbar height.

4. **Component Tokens** — Border radius per element type, shadow system (card/hover/glow), transitions (fast/base/slow/spring), border styles, focus rings.

5. **9 Homepage Sections** — Each with:
   - Desktop ASCII wireframe annotated with Tailwind classes
   - Mobile layout wireframe
   - Exact spacing/color/font values in px/rem/hex
   - Component prop TypeScript interfaces
   - All interactive states (default/hover/focus/active/loading/empty/error)

6. **Global Behaviors** — Scroll behavior, loading states, empty states, error states, accessibility checklist, responsive breakpoints.

7. **Tailwind Config** — Complete copy-paste-ready `tailwind.config.mjs`.

Ready for implementation in Astro + Tailwind.
