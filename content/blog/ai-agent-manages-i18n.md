---
title: Let Your AI Agent Manage i18n Translations
author: Fabian Kirchhoff
date: 2026-06-13
description: How an MCP server gives your coding agent surgical access to translation files — without dumping 50KB of JSON into its context window.
featured: true
order: 1
specs:
  - MCP
  - i18n
  - AI
status: published
tag: TOOLS
---

# Let Your AI Agent Manage i18n Translations

You ask your AI coding agent to add a "save changes" button. It writes the Vue component, wires the click handler, then it hits the translations and stalls. Your locale files are 30+ JSON files, each over a thousand lines. Dumping them into context isn't practical — the agent drowns in irrelevant keys, hallucinates the wrong structure, and ignores your glossary.

The-i18n-kit solves this with an MCP server. Your agent doesn't read locale files directly. It calls purpose-built tools that operate on only the keys it needs.

## The Architecture

Instead of the agent reading and writing JSON:

```typescript
// What the agent used to do (bad)
const en = JSON.parse(fs.readFileSync('locales/en.json'))
en.booking.confirm.title = 'Confirm Booking'
fs.writeFileSync('locales/en.json', JSON.stringify(en, null, 2))
// Repeat for 27 more locale files...
```

It now calls tools:

```json
{
  "tool": "add_translations",
  "arguments": {
    "layer": "root",
    "translations": {
      "en": { "booking.confirm.title": "Confirm Booking" },
      "de": { "booking.confirm.title": "Buchung bestätigen" }
    }
  }
}
```

The server handles opening, merging, and writing locale files. The agent never sees the full JSON — it gets back a confirmation: `{ "written": 2, "locales": ["en", "de"] }`.

## What the Agent Can Do

12 MCP tools give the agent surgical control:

| Tool | What it does |
|------|-------------|
| `detect_i18n_config` | Auto-detects framework (Nuxt, Laravel, generic) and project structure |
| `get_translations` | Reads one or more keys — only those the agent asks for |
| `add_translations` | Writes exact translations the agent provides |
| `update_translations` | Modifies existing keys across locales |
| `remove_translations` | Deletes keys from all locale files at once |
| `rename_key` | Renames a key across every locale file |
| `search_translations` | Searches by key pattern or value substring |
| `get_missing_translations` | Finds keys present in one locale but missing in others |
| `translate_missing` | Fills missing keys via LLM sampling (uses glossary + tone notes) |
| `translate_key` | Refreshes one source key into all target locales |
| `find_orphan_keys` | Scans codebase for keys no longer referenced anywhere |
| `find_misplaced_keys` | Detects keys in the wrong layer directory |

None of these tools return full locale files. Each one returns only the keys and metadata the agent asked for.

## The Workflow

When an agent builds a feature that needs translations:

1. **Agent writes** `$t('booking.confirm.title')` in the Vue component
2. **Agent calls** `detect_i18n_config` — loads context, glossary, layer rules from `.i18n-mcp.json`
3. **Agent calls** `add_translations` — writes the source locale value it just created
4. **Agent calls** `translate_missing` — fills all other locales via LLM sampling, respecting glossary terms and tone notes

All 28 locales updated. No manual copy-paste. The agent knows "Booking" translates to "Boeking" in Dutch because the glossary says so.

## Project Context

A `.i18n-mcp.json` at the project root gives the agent domain knowledge:

```json
{
  "context": "B2B SaaS booking platform",
  "glossary": {
    "Booking": "Core concept. Dutch: 'Boeking'.",
    "Resource": "A bookable entity (room, desk, person)"
  },
  "translationPrompt": "Professional but approachable tone. Keep translations concise.",
  "localeNotes": {
    "de": "Informal German (du)",
    "de-formal": "Formal German (Sie)"
  },
  "layerRules": {
    "common": "Keys used across the entire app",
    "dashboard": "Keys specific to the dashboard layer"
  }
}
```

The agent loads this before any translation work. Consistent terminology across all locales — no more "Booking" becoming "Reservierung" in German because the LLM made it up.

## Framework Support

The server auto-detects your setup at startup. Zero configuration for supported frameworks:

- **Nuxt** — reads `nuxt.config.ts`, discovers layers, locale files, `@nuxtjs/i18n` config
- **Laravel** — detects `artisan`, `composer.json`, PHP locale arrays, Blade patterns
- **Generic** — point it at your locale dirs in `.i18n-mcp.json` and it works with any JSON or PHP structure

## Setting Up

Add one config block to your MCP host:

```json
{
  "servers": {
    "the-i18n-mcp": {
      "type": "stdio",
      "command": "npx",
      "args": ["the-i18n-mcp@latest"]
    }
  }
}
```

That's it. No install, no build step. Works with VS Code, Cursor, Claude Desktop, Zed — anything that speaks MCP.

Then create the `.i18n-mcp.json` (or let your agent generate it — ask it to inspect your locale layout).

## The CLI Companion

The same core library ships as a standalone CLI for direct terminal use:

```bash
npm install -g the-i18n-cli

the-i18n-cli missing --project /path/to/project
the-i18n-cli orphans --output-file /tmp/orphans.json
the-i18n-cli rename old.key new.key
the-i18n-cli cleanup --commit
```

Same tools, same logic — with or without an AI agent.

## Large Outputs Don't Flood Context

`find_orphan_keys` and `get_missing_translations` can return tens of thousands of keys. Instead of dumping them into the agent's context, pass `outputFile` to write a JSON report to disk:

```json
{
  "tool": "find_orphan_keys",
  "arguments": { "outputFile": "/tmp/orphans.json" }
}
// Response: { "reportFile": "/tmp/orphans.json", "summary": { "orphanCount": 1103 } }
```

The agent gets a compact summary. The full report is on disk for reference. Set `reportOutput: true` in `.i18n-mcp.json` to make this the default.

## Resources

- [GitHub: the-i18n-kit](https://github.com/fabkho/the-i18n-kit)
- [the-i18n-mcp on npm](https://npmjs.com/package/the-i18n-mcp)
- [the-i18n-cli on npm](https://npmjs.com/package/the-i18n-cli)
- [MCP (Model Context Protocol)](https://modelcontextprotocol.io)
