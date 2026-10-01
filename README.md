# Fabian Kirchhoff

Personal portfolio and blog at [fabkho.dev](https://fabkho.dev).

Built with Nuxt, Nuxt Content, Tailwind CSS, and NuxtHub. Deployed to Cloudflare Workers.

## Setup

```bash
pnpm install
```

## Development

```bash
pnpm dev
```

Runs at `http://localhost:3000`.

## Scripts

```bash
pnpm build       # production build
pnpm preview     # preview the production build
pnpm lint        # eslint
pnpm typecheck   # nuxt typecheck
pnpm test        # vitest
pnpm sync        # refresh GitHub project + contribution data
```

CI (`.github/workflows/ci.yml`) runs lint, typecheck, and test on every push.

## Content

Articles live in `content/blog/` and are `status: draft` until published. Collections and their schemas are defined in `content.config.ts`.

## GitHub data sync

`pnpm sync` runs `scripts/sync-projects.ts` and `scripts/sync-contributions.ts`, writing `content/projects/*.yml` and `content/contributions/*.yml`. Which repos get tracked, and their ordering and copy overrides, live in `scripts/github-sync.config.yml`.

A `GITHUB_TOKEN` is optional — it only raises the API rate limit:

```bash
GITHUB_TOKEN=$(gh auth token) pnpm sync
```

`.github/workflows/sync-github-data.yml` runs the same scripts weekly and commits the result.
