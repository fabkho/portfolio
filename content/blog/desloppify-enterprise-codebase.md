---
tag: "AI"
title: "How to De-Sloppify an Enterprise Codebase"
description: "AI slop is a codebase problem, not a model problem. What I changed in a 2,000-component Nuxt monorepo so that agents produce our code instead of plausible-looking entropy."
date: "2026-08-16"
author: "Fabian Kirchhoff"
specs: ["AI", "ESLINT", "DESIGN TOKENS", "STORYBOOK", "TYPESCRIPT"]
status: draft
featured: false
---

# How to De-Sloppify an Enterprise Codebase

Give a coding agent a large enterprise repo with no boundaries and it will produce *slop*: a fourth button variant, a hardcoded `#396DEF` that happens to match your primary color, a reimplemented modal sitting next to the one that's used in 94 files. None of it is wrong, exactly. All of it is entropy.

The instinct is to fix this with better prompts. That's backwards. Slop isn't a model problem — it's a codebase problem. An agent samples from the space of plausible code, and in a codebase where everything is plausible, you get everything. The fix is to shrink the space: give the agent context as a starting point, but give it **boundaries and fixed conventions** as the main course — and enforce those conventions with deterministic tools, not prose.

Here's what that looked like in practice, in a Nuxt monorepo with six apps, ~2,000 Vue components, and years of history.

## 1. Lock in the design language

An agent can't freestyle a color it isn't allowed to type. So the first move was a full token system: semantic color tokens (`--primary-color`, `--text-secondary-color`, `--danger-overlay`), motion tokens (`--duration-fast`, `--ease-emphasized`, down to a 20-stop `linear()` spring), and a typography scale — all living in one `core/` directory that every app imports.

Tokens alone are documentation. The enforcement arm is Stylelint:

```js
// stylelint.config.mjs
'scale-unlimited/declaration-strict-value': [
  ['font-size'],
  { autoFixFunc: './stylelint-autofix-font-size.cjs' },
],
'anny/motion-easing-token': true,   // raw cubic-bezier() → var(--ease-*)
'anny/no-layout-animation': true,   // no `transition: all`, no animating top/left
```

The custom motion rule even autofixes: it recognizes the four canonical easing curves and rewrites them to their token. And where Stylelint can't reach — the Web Animations API — a custom ESLint rule picks up the same convention:

```js
// ESLint: use-motion-tokens
el.animate(keyframes, {
  duration: 200,                    // ⚠ use motionDuration('fast')
  easing: 'cubic-bezier(.2,0,0,1)', // ⚠ use motionEasing('standard')
})
```

One convention, two enforcement tools, zero prose. That's the pattern to aim for.

## 2. Shrink the entry point

Before: a 393-line `copilot-instructions.md` that explained Nuxt auto-imports, told the agent to use `<script setup>`, and included a section titled "Testing: no guidelines at the moment." Generic tutorial content the model already knows, padded around the few rules that mattered.

After: a 143-line `AGENTS.md`, with `CLAUDE.md` as a symlink to it so every tool reads the same file. The rule for what goes in: **the entry point should never be huge.** Most of the time the code should speak for itself. The entry doc earns its lines three ways only:

- **Enforcing conventions** the tools can't (yet) catch — "wrap ORM instances in `reactive()`, never wrap collections."
- **Explaining special stuff** an agent would get wrong — our i18n locales are addressed by *code* (`de`, `en-us`), not filename, and there are four of them.
- **Referencing skills** for anything deeper.

Everything else got deleted. If a rule is generic, the model knows it. If a rule is enforced by a linter, the linter is the documentation.

## 3. Build a skill tree, not a skill pile

The old setup had ~4,700 lines of per-component skill files — one for the dropdown, one for the modal, one for the tab bar. They went stale the day they were written, and worse, they bloated every session whether relevant or not.

The replacement has three parts:

**Delete the bloat.** The per-component skills are gone. Their replacement is one line: *"read the component's `.stories.ts`"* — stories can't go stale, because they're executable (more on that below).

**Load lazily.** Skills that only apply to narrow domains carry `disable-model-invocation: true` in their frontmatter, so they never auto-load into context. Context for instructions works like code-splitting: pay for what the task actually needs.

**Make review a skill that fans out.** The `anny-ui-review` skill is the interesting one. It doesn't contain the conventions — it maps changed file types to the skills that do, loads each at most once, and prescribes the report format (`🔴 file:line — problem. fix.`). One entry point, a tree of leaves, loaded on demand.

## 4. Prefer determinism over prose

This is the core thesis: **a convention only really exists if a deterministic tool enforces it.** Prose rules decay; lint rules don't. So I doubled down on custom ESLint rules — not style nits, but encoded domain knowledge:

- `no-ref-resource-collection` — our ORM's collections are already reactive; wrapping one in `ref()` breaks it subtly. The rule names the fix: `useResourceCollection()`.
- An architecture boundary: shared code (`components/`, `composables/`, `stores/`) may not import from any `app-*` directory. `no-restricted-imports` with one regex — cheaper than any "please respect the layering" paragraph.
- Four custom a11y rules that *replace* upstream ones instead of disabling them. The stock `click-events-have-key-events` false-positived on our dropdown trigger pattern, and the usual enterprise answer is `eslint-disable` sprinkled everywhere. Instead: fork the rule, teach it that `v-bind="triggerAttrs"` already carries the keyboard contract, keep it at error. A rule your codebase fights is a rule your agents will learn to silence.

TypeScript gets the same treatment, with a twist. You don't turn on `strict` + `noUncheckedIndexedAccess` in a legacy monorepo and fix 16,598 pre-existing errors first. You **ratchet**: a `typecheck:diff` script baselines every existing error per file and error code, and fails only on *new* ones. The debt is frozen; the delta must stay at zero. "Keep the repo TS-error-free" really means "keep the ratchet at zero" — and that's a rule an agent can verify itself, at the end of every task.

## 5. Give the agent eyes on itself

Two more systems close the loop.

**Storybook as a component database.** Every blessed base component gets a story — 356 stories across inputs, tables, navigation, overlays. For an agent this is not documentation, it's an *index of what exists*: before building anything, `find` the story, read the real usage, pick the existing component. Stories beat skill files because they're executable — a stale story fails to build; a stale markdown file just lies.

**Tests as the self-check.** Frontend tests matter more in the agent era, not less, because they're the only way an agent can review its own work without a human in the loop. ~1,800 Vitest cases run on every merge request, covering the highest-traffic systems — tables, overlay stacking, unsaved-changes guards. The agent doesn't need to be trusted; it needs to be checkable.

## 6. The last mile: your ratchets must actually run

Here's the honest part, because I audited my own setup while writing this.

The failure mode of de-sloppification isn't picking the wrong tools — it's **stopping at prose**. My own repo, at time of writing:

- The typecheck ratchet, the single most important invariant, is wired into `AGENTS.md`… and not into CI. It relies on the agent obeying a paragraph.
- The Stylelint job runs with `allow_failure: true` ("297 existing warnings, flip after cleanup"), which means every token rule is currently advisory.
- ESLint's warn-tier rules run without `--max-warnings`, so warnings can grow forever without failing anything.
- Nothing enforces "base components need a story" — so coverage drifted toward what was fun to storybook (inputs, tables) while the three most-reinvented components in the repo (the modal, used in 94 files; the action button, 86; the base dropdown, 73) have none.
- The rules banning `text-gray-*` and `dark:` utilities existed only as prose — Stylelint parses `<style>` blocks, so it can't see `class=""` attributes. The fix was a small custom ESLint rule that tokenizes template class strings; 19 violations across 17 files surfaced the moment it first ran. Fixing them all in the same MR meant the rule could ship at `error` from day one — paying the cleanup cost upfront beats a warn-tier rule everyone learns to scroll past.

Every one of these is the same bug: a convention that made it into words but not into a pipeline gate. The fix is mechanical — put `typecheck:diff --since $BASE` in CI, flip `allow_failure`, pin `--max-warnings` at the current count and ratchet down — and it's exactly the work I'd assign the agent next. Which is fitting: the agent is very good at satisfying deterministic gates. That's the whole point.

## The hierarchy

If I compress the whole effort into one ranking:

1. **Deterministic gates** (lint rules, type ratchets, tests in CI) — conventions that enforce themselves.
2. **Executable references** (stories) — documentation that can't silently rot.
3. **Small, sharp prose** (a 143-line entry point, lazy-loaded skills) — only for what tools can't express yet, and every prose rule is a candidate for promotion to layer 1.

The uncomfortable, useful realization: none of this is agent-specific. A codebase where a human can't hardcode a hex color, can't skip the story, can't merge a new type error — that was always the better codebase. The agents didn't create the need for guardrails. They just made the missing ones impossible to ignore.
