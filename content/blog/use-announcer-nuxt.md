---
tag: "ACCESSIBILITY"
title: "aria-live Regions and the Announcer Pattern in Vue"
description: "How to make dynamic content changes visible to screen readers using aria-live regions, and how to wrap it into a reusable composable."
date: "2026-05-15"
author: "Fabian Kirchhoff"
specs: ["VUE", "A11Y", "ARIA"]
status: published
featured: true
order: 2
---

# aria-live Regions and the Announcer Pattern in Vue

Single-page applications mutate the DOM without full page reloads. Sighted users see the change instantly. Screen reader users hear nothing — the assistive technology has no way to know that something important just appeared on screen.

This is the core problem `aria-live` solves. It tells the browser: "When this element's content changes, announce it."

## The Problem

A screen reader builds a virtual representation of the page. It announces content when the user navigates to it — Tab to a button, arrow through a list, read the next paragraph. But it doesn't re-read the entire page when something changes. Why would it? On a static page, nothing changes unless the user interacts.

SPAs break this assumption. Route changes swap the entire view. Form submissions show success messages. Search inputs filter a list in real-time. Toast notifications pop up and disappear. None of these trigger a screen reader announcement by default.

The user submits a form, hears nothing, and has no idea whether it worked.

## How aria-live Works

An `aria-live` region is an element the browser watches for content mutations. When text inside it changes, the screen reader announces the new content — even if the user's focus is somewhere else entirely.

```html
<div aria-live="polite" aria-atomic="true">
  <!-- When text changes here, screen readers announce it -->
</div>
```

Three politeness levels:

- **`polite`** — waits until the screen reader finishes its current announcement, then speaks. Use this for most things: status updates, search results counts, non-critical feedback.
- **`assertive`** — interrupts whatever the screen reader is currently saying. Reserved for errors and time-sensitive information.
- **`off`** — the default. Changes are not announced.

`aria-atomic="true"` tells the screen reader to announce the entire region content, not just the changed text node. Without it, partial updates can produce confusing fragments.

### The Empty-Then-Fill Trick

There's a browser quirk: if you set the same text twice in a row, some screen readers won't announce it the second time (the content didn't "change"). The workaround is to clear the region first, then set the new text on the next tick:

```typescript
function announce(message: string) {
  region.textContent = ''
  requestAnimationFrame(() => {
    region.textContent = message
  })
}
```

This forces a mutation the browser recognizes as a change, guaranteeing the announcement fires.

### What Gets Announced

The screen reader announces the **text content** of the live region after a mutation. It doesn't read ARIA attributes, roles, or child structure — just the flattened text. Keep messages short and self-contained:

- ✅ "3 results found"
- ✅ "Form submitted successfully"
- ✅ "Error: Email address is required"
- ❌ A full paragraph of instructions
- ❌ An entire component tree

## Common Use Cases

**Route changes** — SPAs don't trigger the screen reader's "new page loaded" announcement. A live region can announce the new page title after navigation.

**Form feedback** — "Message sent", "3 validation errors", "Saving...". The user needs confirmation that their action had an effect.

**Live search results** — "Found 12 results" as the user types. Without this, filtering a list is completely silent.

**Async operations** — "Loading", then "Data loaded" or "Request failed". Long operations need bookend announcements so the user isn't left wondering.

**Toast notifications** — these are visually obvious but completely invisible to screen readers without a live region backing them.

## The Announcer Pattern

Scattering `aria-live` regions throughout the app is messy and error-prone. The announcer pattern centralizes this: one live region in the DOM, one composable to control it.

```vue
<!-- App.vue or layout -->
<template>
  <div>
    <slot />
    <AnnouncerRegion />
  </div>
</template>
```

The region component renders a visually hidden `aria-live` element:

```vue
<!-- AnnouncerRegion.vue -->
<script setup lang="ts">
const { message, politeness } = useAnnouncer()
</script>

<template>
  <div
    :aria-live="politeness"
    aria-atomic="true"
    class="sr-only"
  >
    {{ message }}
  </div>
</template>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
```

And the composable provides the API:

```typescript
import { shallowRef } from 'vue'

type Politeness = 'polite' | 'assertive' | 'off'

const message = shallowRef('')
const politeness = shallowRef<Politeness>('polite')

export function useAnnouncer() {
  function set(msg: string, level: Politeness = 'polite') {
    // Empty first to guarantee re-announcement
    message.value = ''
    nextTick(() => {
      politeness.value = level
      message.value = msg
    })
  }

  function polite(msg: string) {
    set(msg, 'polite')
  }

  function assertive(msg: string) {
    set(msg, 'assertive')
  }

  return { message, politeness, set, polite, assertive }
}
```

Module-level refs make this a singleton — every component that calls `useAnnouncer()` shares the same state, and there's only one live region in the DOM reading from it.

### Usage

```vue
<script setup lang="ts">
const { polite, assertive } = useAnnouncer()

async function submitForm() {
  try {
    await $fetch('/api/contact', { method: 'POST', body: formData })
    polite('Message sent successfully')
  } catch {
    assertive('Error: Failed to send message')
  }
}
</script>
```

:announcer-demo

## When Not to Use This

The announcer is a tool of last resort. Prefer native semantics and focus management first:

**Moving focus is often enough.** After navigating to a new page, focusing the `<h1>` announces the heading text. After deleting an item from a list, focusing the next item tells the user where they are. Focus is the primary channel screen readers use — an announcement is the fallback.

**Native elements already announce.** An `<input>` with a visible `<label>` doesn't need an announcer to tell the user what field they're in. A `<button>` announces its text content on focus. Don't replicate what the platform gives you for free.

**Use the announcer when there's no focus target.** A background save that finishes. A timer that expires. A filter that reduces a list from 50 to 3 items while focus stays in the search input. These have no natural element to focus — that's when the announcer earns its place.

For composite widgets where focus management handles navigation directly, see [Keyboard Navigation in Composite Widgets](/blog/keyboard-navigation-composite-widgets).

## Resources

- [ARIA19: Using aria-live regions to identify errors](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA19)
- [MDN: ARIA live regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions)
- [Nuxt `useAnnouncer` composable](https://nuxt.com/docs/api/composables/use-announcer)
- [PR #34318 — feat(nuxt): add useAnnouncer](https://github.com/nuxt/nuxt/pull/34318)
