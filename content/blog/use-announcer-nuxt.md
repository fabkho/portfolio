---
tag: "OPEN SOURCE"
title: "Adding useAnnouncer to Nuxt Core"
description: "How I contributed a screen reader announcement composable and component to the Nuxt framework."
date: "2026-04-01"
author: "Fabian Kirchhoff"
specs: ["NUXT", "A11Y", "OPEN SOURCE"]
status: draft
---

# Adding useAnnouncer to Nuxt Core

TODO: Write this post about the `useAnnouncer` composable and `<NuxtAnnouncer>` component contribution to Nuxt.

## Topics to Cover

- The problem: SPAs don't announce route changes to screen readers
- How `aria-live` regions work
- The `useAnnouncer` API design
- The `<NuxtAnnouncer>` component
- Getting it merged into Nuxt core

## Related

- [PR #34318](https://github.com/nuxt/nuxt/pull/34318)
- [Nuxt Accessibility Roadmap](https://github.com/nuxt/nuxt/issues/23255)
