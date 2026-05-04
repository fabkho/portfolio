Design a personal developer portfolio website for Fabian Kirchhoff (@fabkho), a full-stack web developer based in Germany who works primarily with Vue/Nuxt, TypeScript, PHP/Laravel. He also does open-source work and is a serious sci-fi and fantasy book reader (155 books tracked, 98 finished — top authors: Christopher Ruocchio, Philip K. Dick, Gene Wolfe, Neil Gaiman, Pierce Brown, Terry Pratchett). He currently reads "Project Hail Mary" by Andy Weir and "Stories of Your Life and Others" by Ted Chiang.

## Tech stack (already scaffolded)
Nuxt 4 + NuxtUI 4 + TailwindCSS 4 + NuxtContent 3. The site will be statically generated and content-driven.

## Personality & vibe
- **Sci-fi bookworm** — His reading habit is a core part of his identity, not a sidebar hobby. He built a CLI reading tracker (SQLite, @clack/prompts) and wants it front-and-center as a portfolio showcase. Think: the kind of person who has opinions about Gene Wolfe's unreliable narrators and rates Asimov's Foundation a 5/5.
- **Builder, not a talker** — His portfolio notes reference antfu.me and roe.dev as inspiration. He likes clean, functional design that lets the work speak. No flashy animations for their own sake, no corporate marketing language.
- **Terminal-native** — He builds CLI tools, Pi coding agent extensions, MCP servers. His tools have keyboard shortcuts, fuzzy search, command palettes. The portfolio should feel like it was made by someone who lives in the terminal.
- **Open-source contributor** — Ships real packages people use: `cmd-bar` (Vue 3 command palette, npm), `fontawesome-esm` (CJS→ESM icon converter), `nuxt-i18n-kit` (i18n toolkit with AI translation), Pi extensions. These aren't side projects — they solve real problems he hit at work.
- **Craft-conscious** — His blog drafts cover accessibility (ARIA dialog patterns, focus management), performance (FLIP animations vs TransitionGroup), and developer tooling. He writes about things he actually built and debugged, not trend pieces.

## Pages & sections

### 1. Hero / Landing
Name, tagline (something like "Full-stack developer. Open-source contributor. Sci-fi reader."), brief intro. Maybe a subtle terminal/monospace aesthetic nod. Links to GitHub (@fabkho), socials. Inspirations: antfu.me's minimalism, roe.dev's clarity.

### 2. Projects
Showcase cards for:
- **cmd-bar** — Vue 3 command bar component. Unstyled, extensible, keyboard-driven, virtualized lists. Used in production at anny.co. npm package.
- **reading-tracker-cli** — CLI tool to track reading. SQLite + @clack/prompts. Search, shelves, statistics, configurable. This one bridges into the Books page.
- **fontawesome-esm** — Converts FA CommonJS icons to ESM for lazy CDN loading. Solved a 3+ minute build time problem. Includes a zero-dep Vue component.
- **nuxt-i18n-kit** — Complete i18n toolkit for Nuxt: key extraction, CI validation, AI-powered translation via Gemini, dev warnings for missing keys.
- **Pi extensions** — Coding agent extensions: Laravel Artisan tool, session tagging & search.
- **anny.co (professional)** — SaaS booking platform. Led Nuxt 2→4 migration, built command bar, custom forms system, queue management for government, HR integrations (Personio/HRworks), holiday management system across 15+ languages.

### 3. Books / Reading
This is the showcase page. Powered by the reading-tracker-cli's SQLite database exposed via an API or at build time. Sections:
- Currently reading (with progress)
- Recently finished
- Top rated (5-star books)
- Stats: 155 books tracked, 98 finished, top authors, favorite series (Red Rising, Foundation, Book of the New Sun, Sandman, Sun Eater)
- Maybe a "bookshelf" visual or grid with covers

### 4. Blog
Powered by NuxtContent. Technical articles. First posts planned:
- Lazy-loading FontAwesome icons in Vue/Nuxt (already drafted, detailed, production-tested)
- Accessible modal dialogs in Vue (ARIA patterns, focus traps, alert dialogs — full guide already written)
- Vue TransitionGroup vs FLIP animations (deep-dive into why TransitionGroup fails for layout shifts)
- A11y in Vue (roving tabindex, aria-activeDescendant)

### 5. About / Contact
Brief bio, tech stack, link to GitHub. Maybe a fun "currently reading" widget.

## Design direction
- **Dark mode first** (he's a terminal person), with light mode toggle
- **Monospace accents** — code snippets, terminal-like UI touches. Not a full terminal theme, but the DNA should be visible.
- **Minimal, content-forward** — Let the projects and writing do the talking. Think roe.dev's restraint mixed with antfu.me's personality.
- **The books page should feel special** — It's his differentiator. Most dev portfolios have projects + blog. This one has a living bookshelf. Give it visual love — cover art, reading progress bars, genre tags, maybe a subtle sci-fi atmosphere.
- **Command palette Easter egg** — He built cmd-bar. The portfolio should have a working command palette (Cmd+K) for navigation. This is both a UX feature and a portfolio piece.
- **Typography matters** — Clean sans-serif for body, monospace for code/accents. Good hierarchy. He writes about accessibility — the site should practice what he preaches.
- **Subtle, not flashy** — Transitions should be purposeful (he literally wrote about FLIP animations). No gratuitous particle effects or hero animations. Motion should be functional.

## Color palette suggestion
Dark backgrounds with warm accent colors. Think: the glow of a terminal in a room full of bookshelves. Not cold tech-blue — something warmer, maybe amber/gold accents (he reads by lamplight, metaphorically). The sci-fi influence could come through in subtle ways — constellation-like dot patterns, very faint grid lines, a slightly otherworldly feel without going full cyberpunk.

## What this is NOT
- Not a corporate resume site
- Not a flashy "creative agency" portfolio
- Not a template with stock photos
- Not overdesigned — if antfu can ship a portfolio that's basically a list, the design should earn every pixel it uses
