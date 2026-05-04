# Portfolio Implementation Plan

## Design Reference

`design-reference/final-design.html` — open in browser as the visual source of truth.

---

## Design System (Tailwind v4 + CSS Variables)

All design tokens are defined in `app/assets/css/main.css` via Tailwind v4's `@theme` directive, which exposes them as CSS custom properties. Components use Tailwind utility classes for simple styling and scoped `<style scoped>` with `var(--token)` for complex/unique visuals.

**Conventions:**
- Always use CSS variables when referencing design tokens — in Tailwind classes or in scoped styles
- Never hardcode hex values in components
- Tailwind classes for layout/spacing, scoped styles with `var()` for complex visuals (hatching, textures, animations)
- `@tailwindcss/vite` must be installed and registered in `nuxt.config.ts` under `vite: { plugins: [tailwindcss()] }` — this is what processes Tailwind (NuxtUI used to provide this)
- Tokens are defined TWICE: in `:root` (for scoped component styles to access via `var()`) and in `@theme static` (for Tailwind utility class generation). Both blocks have identical values.

### Tokens

```
Colors
  --color-bg:              #F5F2EB     warm eggshell / drafting paper
  --color-ink:             #2C2C2A     charcoal
  --color-ink-muted:       #6B6B69     secondary text (WCAG AA safe, replaces 40% opacity)
  --color-accent:          #B93E2E     drafting red (WCAG AA safe, darkened from prototype's #D44D3A)
  --color-accent-light:    #E8665A     accent for use on dark backgrounds (WCAG AA on --color-ink)

Fonts
  --font-mono:   'IBM Plex Mono', 'Courier New', Courier, monospace
  --font-sans:   'Inter', -apple-system, BlinkMacSystemFont, sans-serif
  --font-serif:  'Times New Roman', Times, serif

Layout
  --max-width-board:   1400px
  --sidebar-width:     320px

Typography scale
  --text-xs:     0.75rem     labels, metadata, card headers
  --text-sm:     0.85rem     sidebar records, nav links
  --text-base:   1rem        body
  --text-lg:     1.2rem      book titles, section content
  --text-xl:     2rem        card titles (serif italic)
  --text-2xl:    2.5rem      blog post h1
  --text-3xl:    clamp(2rem, 5vw, 3rem)   site h1
```

### Utility classes (defined in `main.css`)

```css
.hatch-ink    { /* 45deg repeating lines using --color-ink-muted */ }
.hatch-accent { /* 45deg repeating lines using --color-accent */ }
.paper-texture { /* SVG noise pseudo-element overlay at 15% opacity */ }
```

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| **Framework** | Nuxt 4 |
| **Styling** | TailwindCSS 4 (tokens via `@theme` → CSS vars) |
| **Content** | NuxtContent 3 (strict Zod schemas in `content.config.ts`) + Nuxt Studio |
| **Testing** | `@nuxt/test-utils` + Vitest (server routes + composables only) |
| **Books data** | Turso (LibSQL) — CLI writes via embedded replica, portfolio reads via `@libsql/client` |
| **Images** | `@nuxt/image` with Cloudflare optimization (proxy book covers) |
| **Hosting** | Cloudflare Pages via `@nuxthub/core` (domain: fabkho.dev) |
| **Icons** | `@iconify-json/lucide` |
| **Utilities** | `@vueuse/nuxt` (heavily used — IntersectionObserver, scroll, etc.) |

### Nuxt modules

```ts
modules: [
  '@nuxt/content',
  '@nuxt/eslint',
  '@nuxt/fonts',
  '@nuxt/image',
  '@nuxt/a11y',
  '@nuxt/hints',
  '@nuxt/test-utils/module',
  '@nuxtjs/seo',
  '@nuxthub/core',
  '@vueuse/nuxt',
  'nuxt-studio'
]
```

---

## External Dependencies (tracked as GitHub issues on reading-tracker-cli)

These do NOT block portfolio development. Build with current data, improve later.

- [ ] **Backfill ratings** — 74 read books have NULL ratings. Add a bulk rate command or import from Obsidian frontmatter.
- [ ] **Swap cover source** — Replace Fable CDN URLs (`cdn.fable.co`) with a public API (Open Library, Google Books). Fable URLs may break.
- [ ] **Migrate to Turso** — Swap `better-sqlite3` for `@libsql/client` with embedded replicas. CLI writes locally + auto-syncs to Turso. Portfolio reads from Turso.

Until these are done: gallery shows "Currently Reading" + "Recently Finished" instead of "Top Rated", covers use existing Fable URLs proxied through `@nuxt/image`, and the Nitro routes read from a static copy of the SQLite DB.

---

## Component Architecture

### Layouts

#### `layouts/default.vue`
Full-width layout. Used by Home and Projects.

```
┌──────────────────────────────────────────────┐
│  TheHeader                                   │
├──────────────────────────────────────────────┤
│                                              │
│  <slot />                                    │
│                                              │
├──────────────────────────────────────────────┤
│  TheFooter                                   │
└──────────────────────────────────────────────┘
```

- Drafting-board shell: ink border, paper texture `::before`, `min-height: 100dvh`
- `max-width: var(--max-width-board)` centered
- SchematicBackground rendered inside main area

#### `layouts/with-sidebar.vue`
Two-column layout. Used by Blog (index + post) and Books.

```
┌──────────────────────────────────────────────┐
│  TheHeader                                   │
├────────────────────────────┬─────────────────┤
│                            │                 │
│  <slot />                  │  <slot name=    │
│                            │   "sidebar" />  │
│                            │                 │
├────────────────────────────┴─────────────────┤
│  TheFooter                                   │
└──────────────────────────────────────────────┘
```

- Grid: `1fr var(--sidebar-width)`
- Responsive: single column below 1024px, sidebar stacks below main
- No SchematicBackground (content-heavy pages need clean backgrounds)

### Global Components

#### `TheHeader.vue`

```
┌──────────────────────┬───────────────────┬──────────────┐
│  FABIAN KIRCHHOFF    │  FABKHO // GERMANY│    Home      │
│  (subtitle from      │  [GitHub icon]    │    Projects  │
│   current route)     │                   │    Blog      │
│                      │                   │    Books     │
└──────────────────────┴───────────────────┴──────────────┘
```

- Name + subtitle (via `useRouteSubtitle()`)
- Meta cell: `FABKHO // GERMANY` + GitHub icon link
- Nav cell: `<NuxtLink>`s with `aria-current="page"`, hatching bg with hover distortion (scoped CSS)
- Responsive: cells stack vertically below 768px, h1 uses `clamp()`

#### `TheFooter.vue`

Bottom legend strip. Accent dot + GitHub link. Static.

#### `SchematicBackground.vue`

Decorative circles + axis lines. `aria-hidden="true"`, pure CSS, 15% opacity. Only rendered in `layouts/default.vue` (Home + Projects).

#### `SkipLink.vue`

"Skip to main content" — hidden until focused.

### Content Components

#### `TheCard.vue`

Main card. Used for projects and blog teasers.

```
┌──────────────────────────┐
│  TAG LABEL               │  ← header bar (ink bg, light text)
├──────────────────────────┤
│                          │
│  Card Title              │  ← serif, italic
│                          │
│  Description text...     │  ← sans
│                          │
│  ┌────────┐ ┌──────────┐│
│  │ NUXT 4 │ │TYPESCRIPT││  ← spec badges
│  └────────┘ └──────────┘│
└──────────────────────────┘
```

```ts
interface Props {
  tag: string              // "ANNY.CO", "CMD-BAR", "MEMO // BLOG"
  title: string
  description: string
  specs?: string[]
  url?: string             // makes card clickable
  variant?: 'default' | 'hatched'
}
```

- `<article>` wrapper
- If `url`: entire card is `<NuxtLink>` (internal `/...`) or `<a target="_blank">` (external `http...`), auto-detected
- Hover: subtle border color change or translate
- `focus-visible` ring for keyboard users

#### `SectionLabel.vue`

```ts
interface Props {
  label: string
  tag?: 'h2' | 'h3'  // default h2
}
```

Uppercase heading with bottom border divider.

#### `ContentGrid.vue`

Slot wrapper. `grid-cols-2 gap-8`, collapses to 1 column on mobile.

#### `SpecBadge.vue`

```ts
interface Props {
  label: string
}
```

Small bordered mono tag inside cards.

### Blog Components (Phase 2)

#### `BlogArticle.vue`

Wraps `<ContentRenderer>`. Scoped prose styles: serif body, ink-bg code blocks, heading hierarchy. No props.

#### `BlogSidebar.vue`

Sidebar for blog post detail. Metadata + TOC with active heading highlight.

```ts
interface Props {
  author: string
  date: string
  status: string
  toc: TocItem[]
}
```

#### `BlogIndexSidebar.vue`

Sidebar for blog index. Navigable list of all posts.

### Books Components (Phase 3)

#### `BookCard.vue`

Featured book with cover image for the gallery.

```ts
interface Props {
  book: Book
}
```

Cover via `<NuxtImage>` (proxied through Cloudflare), fallback placeholder if no cover. Title, author, rating (when available).

#### `BookGallery.vue`

Horizontal scrollable / wrapped grid of `BookCard`s.

```ts
interface Props {
  books: Book[]
  title?: string   // "Currently Reading", "Recently Finished"
}
```

Scroll snap on mobile, grid on desktop.

#### `BookTable.vue`

Full data table with real `<table>` markup.

```ts
interface Props {
  books: Book[]
  loading?: boolean
}
```

`<thead>`, `<tbody>`, `<th scope="col">`, `<td>`. Empty state, loading skeleton. Active rows highlighted.

#### `BookRow.vue`

Single `<tr>`.

```ts
interface Props {
  book: Book
}
```

#### `BookStatus.vue`

```
reading → [PROCESSING]   accent
done    → [ASSIMILATED]  ink
dnf     → [ABANDONED]    muted
```

With `aria-label` for screen readers.

#### `RatingNodes.vue`

```ts
interface Props {
  rating: number
  max?: number  // default 5
}
```

Filled/empty circles. `aria-label="Rated 4 out of 5"`. Gracefully handles null/0 (shows "Unrated").

#### `BookSidebarStats.vue`

```ts
interface Props {
  stats: BookStats
}
```

Big number (total volumes), currently reading list, recently finished list.

---

## Pages

| Page | Layout | Sidebar | SchematicBg |
|------|--------|---------|-------------|
| `pages/index.vue` | `default` | — | ✅ |
| `pages/projects.vue` | `default` | — | ✅ |
| `pages/blog/index.vue` | `with-sidebar` | `BlogIndexSidebar` | — |
| `pages/blog/[...slug].vue` | `with-sidebar` | `BlogSidebar` | — |
| `pages/books.vue` | `with-sidebar` | `BookSidebarStats` | — |

### Home — `pages/index.vue`
- `SectionLabel("Selected Works")` → `ContentGrid` with 2x `TheCard` (featured projects)
- `SectionLabel("Recent Memos")` → `TheCard` (latest blog post via `queryCollection`)

### Projects — `pages/projects.vue`
- `SectionLabel("Constructed Mechanisms")` → `ContentGrid` with all `TheCard`s
- Data: `queryCollection('projects')`

### Blog Index — `pages/blog/index.vue`
- `SectionLabel("Technical Memos")` → list of `TheCard`s for each post
- Sidebar: `BlogIndexSidebar` with navigable post list

### Blog Post — `pages/blog/[...slug].vue`
- `BlogArticle` wrapping `<ContentRenderer>`
- Sidebar: `BlogSidebar` with metadata + TOC (active heading via `useActiveSection`)

### Books — `pages/books.vue`
- `BookGallery` — "Currently Reading" + "Recently Finished" (swap to "Top Rated" once ratings exist)
- `SectionLabel("Full Archive")` → `BookTable`
- Sidebar: `BookSidebarStats`

---

## Composables

### `useRouteSubtitle.ts`
Maps route → subtitle for TheHeader. Pure function, testable.

### `useBooks.ts` (Phase 3)
Wraps `useFetch('/api/books')` with filter/sort options.

### `useBookStats.ts` (Phase 3)
Wraps `useFetch('/api/books/stats')`.

### `useActiveSection.ts` (Phase 2)
`useIntersectionObserver` from VueUse on heading elements → returns active heading id.

---

## Server Routes (Phase 3)

### `server/utils/db.ts`
Turso connection via `@libsql/client`. Falls back to local SQLite in dev.

### `server/api/books/index.get.ts`
`GET /api/books?status=reading&limit=10&sortBy=rating` → `{ books: Book[] }`

### `server/api/books/stats.get.ts`
`GET /api/books/stats` → `{ total, reading, done, dnf, currentlyReading[], topAuthors[] }`

---

## Content Schema (`content.config.ts`)

Strict Zod schemas for both collections. Build fails on invalid content.

```ts
import { defineCollection, z } from '@nuxt/content'

export const collections = {
  projects: defineCollection({
    source: 'projects/*.yml',
    type: 'data',
    schema: z.object({
      tag: z.string(),
      title: z.string(),
      description: z.string(),
      specs: z.array(z.string()),
      url: z.string().optional(),
      featured: z.boolean().optional(),
      order: z.number().optional()
    })
  }),
  blog: defineCollection({
    source: 'blog/**/*.md',
    type: 'page',
    schema: z.object({
      tag: z.string(),
      title: z.string(),
      description: z.string(),
      date: z.string(),
      specs: z.array(z.string()).optional(),
      status: z.enum(['draft', 'published']).default('published')
    })
  })
}
```

---

## Types (`app/types/index.ts`)

```ts
export interface Project {
  tag: string
  title: string
  description: string
  specs: string[]
  url?: string
  featured?: boolean
  order?: number
}

export interface Book {
  id: string
  title: string
  author: string
  status: 'reading' | 'done' | 'dnf' | 'want-to-read'
  rating: number | null
  series?: string
  cover?: string
  started?: string
  finished?: string
  pageCount?: number
  currentPage?: number
}

export interface BookStats {
  total: number
  reading: number
  done: number
  dnf: number
  currentlyReading: Book[]
  topAuthors: { name: string; count: number }[]
}

export interface TocItem {
  id: string
  text: string
  depth: number
}
```

---

## Tests (`tests/`)

Server routes + composables only.

- `tests/server/api/books.test.ts` — filters, sorting, limit, empty state, invalid params
- `tests/server/api/books-stats.test.ts` — aggregation, counts, top authors
- `tests/composables/useRouteSubtitle.test.ts` — route → subtitle mapping

---

## Implementation Phases

### Phase 1 — Foundation + Home + Projects
1. Remove NuxtUI — strip module, dependency, CSS import, app.config UI overrides
2. Add modules: `@nuxt/fonts`, `@nuxt/image`, `@nuxt/a11y`, `@nuxt/hints`, `@nuxtjs/seo`, `@nuxthub/core`, `@vueuse/nuxt`, `nuxt-studio`
3. Configure `@nuxt/fonts` for IBM Plex Mono + Inter
4. Configure `nuxt-studio` (GitHub repo: `fabkho/portfolio`, branch: `main`)
5. Configure `@nuxtjs/seo` (site url: `https://fabkho.dev`)
6. Design system in `main.css` — `@theme` tokens, hatching utilities, paper texture
7. `content.config.ts` — strict Zod schemas for projects + blog collections
8. `layouts/default.vue` + `layouts/with-sidebar.vue`
9. `TheHeader`, `TheFooter`, `SchematicBackground`, `SkipLink`
10. `TheCard`, `SectionLabel`, `ContentGrid`, `SpecBadge`
11. Project YAML files in `content/projects/`
12. Home page + Projects page
13. A11y + responsive pass

### Phase 2 — Blog + Nuxt Studio
1. `BlogArticle`, `BlogSidebar`, `BlogIndexSidebar`
2. Blog index + post detail pages
3. Migrate 3 drafts from Obsidian to `content/blog/`
4. `useActiveSection` composable (using VueUse's `useIntersectionObserver`)
5. NuxtContent prose overrides to match schematics aesthetic
6. RSS + SEO meta per page
7. Verify Nuxt Studio editing flow

### Phase 3 — Books Integration
1. Setup Vitest + `@nuxt/test-utils`
2. Server routes: `db.ts` (Turso/local SQLite), `books/index.get.ts`, `books/stats.get.ts`
3. Tests for server routes
4. `BookCard`, `BookGallery`, `BookTable`, `BookRow`, `BookStatus`, `RatingNodes`, `BookSidebarStats`
5. Books page (gallery + table + sidebar)
6. Book covers via `@nuxt/image` with Cloudflare optimization
7. Create GitHub issues on reading-tracker-cli: ratings backfill, cover source, Turso migration

### Phase 4 — Polish + Deploy
1. Dark mode (CSS `[data-theme="dark"]` palette inversion)
2. Page transitions
3. Accessibility audit (full pass, screen reader, keyboard)
4. Performance (Lighthouse, bundle analysis)
5. Deploy to Cloudflare Pages via NuxtHub (fabkho.dev)

---

## File Structure

```
portfolio/
├── app/
│   ├── assets/css/main.css
│   ├── components/
│   │   ├── TheHeader.vue
│   │   ├── TheFooter.vue
│   │   ├── TheCard.vue
│   │   ├── SchematicBackground.vue
│   │   ├── SkipLink.vue
│   │   ├── SectionLabel.vue
│   │   ├── ContentGrid.vue
│   │   ├── SpecBadge.vue
│   │   ├── blog/
│   │   │   ├── BlogArticle.vue
│   │   │   ├── BlogSidebar.vue
│   │   │   └── BlogIndexSidebar.vue
│   │   └── books/
│   │       ├── BookCard.vue
│   │       ├── BookGallery.vue
│   │       ├── BookTable.vue
│   │       ├── BookRow.vue
│   │       ├── BookStatus.vue
│   │       ├── RatingNodes.vue
│   │       └── BookSidebarStats.vue
│   ├── composables/
│   │   ├── useRouteSubtitle.ts
│   │   ├── useBooks.ts
│   │   ├── useBookStats.ts
│   │   └── useActiveSection.ts
│   ├── layouts/
│   │   ├── default.vue
│   │   └── with-sidebar.vue
│   ├── pages/
│   │   ├── index.vue
│   │   ├── projects.vue
│   │   ├── books.vue
│   │   └── blog/
│   │       ├── index.vue
│   │       └── [...slug].vue
│   ├── types/
│   │   └── index.ts
│   ├── app.vue
│   └── app.config.ts
├── content/
│   ├── blog/
│   │   ├── lazy-loading-fontawesome.md
│   │   ├── accessible-modal-dialogs.md
│   │   └── vue-transition-vs-flip.md
│   └── projects/
│       ├── anny.yml
│       ├── cmd-bar.yml
│       ├── nuxt-i18n-kit.yml
│       ├── reading-tracker.yml
│       ├── fontawesome-esm.yml
│       └── pi-extensions.yml
├── content.config.ts
├── server/
│   ├── api/books/
│   │   ├── index.get.ts
│   │   └── stats.get.ts
│   └── utils/
│       └── db.ts
├── tests/
│   ├── server/api/
│   │   ├── books.test.ts
│   │   └── books-stats.test.ts
│   └── composables/
│       └── useRouteSubtitle.test.ts
├── design-reference/
│   └── final-design.html
├── nuxt.config.ts
├── vitest.config.ts
├── PLAN.md
└── package.json
```
