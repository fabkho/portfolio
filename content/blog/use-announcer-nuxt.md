---
title: Announcing Dynamic Changes in Vue with aria-live
author: Fabian Kirchhoff
date: 2026-05-15
description: How to make dynamic content changes visible to screen readers using aria-live regions, and how to wrap it into a reusable composable.
featured: true
order: 2
specs:
  - VUE
  - A11Y
  - ARIA
status: published
tag: ACCESSIBILITY
---

# Announcing Dynamic Changes in Vue with aria-live

A Vue app re-renders reactively — a ref changes, the DOM updates, the user sees it. Screen readers don't. They need to be told explicitly when something important changed.

`aria-live` is the attribute that does this. It tells the browser: "When this element's content changes, announce it."

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

## Common Use Cases

**Route changes** — SPAs don't trigger the screen reader's "new page loaded" announcement. A live region can announce the new page title after navigation.

**Form feedback** — "Message sent", "3 validation errors", "Saving...". The user needs confirmation that their action had an effect.

**Live search results** — "Found 12 results" as the user types. Without this, filtering a list is completely silent.

**Async operations** — "Loading", then "Data loaded" or "Request failed". Without these, the user has no idea the app is working.

**Toast notifications** — these are visually obvious but completely invisible to screen readers without a live region backing them.

> **Don't overuse this.** Most dynamic UI in Vue is better served by moving focus to the new content or using semantic HTML. `aria-live` is for the cases where there's no element to focus — a background process finishing, a count changing while the user types elsewhere. Reach for focus management first.

## The Announcer Pattern

Scattering `aria-live` regions throughout the app is messy. The announcer pattern centralizes this: one hidden live region in the DOM, one composable to control it from anywhere.

The region component renders a visually hidden `aria-live` element. The composable controls it:

```typescript
const message = shallowRef('')
const politeness = shallowRef<Politeness>('polite')

export function useAnnouncer() {
  function set(msg: string, level: Politeness = 'polite') {
    message.value = ''
    nextTick(() => {
      politeness.value = level
      message.value = msg
    })
  }

  function polite(msg: string) { set(msg, 'polite') }
  function assertive(msg: string) { set(msg, 'assertive') }

  return { message, politeness, set, polite, assertive }
}
```

Module-level refs make this a singleton — every call to `useAnnouncer()` shares the same live region.

```vue
<script setup lang="ts">
const { polite, assertive } = useAnnouncer()

async function submitForm() {
  await $fetch('/api/contact', { method: 'POST', body: formData })
    .then(() => polite('Message sent'))
    .catch(() => assertive('Error: Failed to send message'))
}
</script>
```


## When Not to Use This

The announcer is a tool of last resort. Prefer native semantics and focus management first:

**Moving focus is often enough.** After navigating to a new page, focusing the `<h1>` announces the heading text. After deleting an item from a list, focusing the next item tells the user where they are. Focus is the primary channel screen readers use — an announcement is the fallback.

**Native elements already announce.** An `<input>` with a visible `<label>` doesn't need an announcer to tell the user what field they're in. A `<button>` announces its text content on focus. Don't replicate what the platform gives you for free.

**Use the announcer when there's no focus target.** A background save that finishes. A timer that expires. A filter that reduces a list from 50 to 3 items while focus stays in the search input. These have no natural element to focus — that's when the announcer earns its place.

For composite widgets where focus management handles navigation directly, see [Keyboard Navigation in Composite Widgets](/blog/keyboard-navigation-composite-widgets).

## Resources

- [ARIA19: Using aria-live regions to identify errors](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA19)
- [MDN: ARIA live regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions)
- [Nuxt](https://nuxt.com/docs/api/composables/use-announcer) [`useAnnouncer`](https://nuxt.com/docs/api/composables/use-announcer) [composable](https://nuxt.com/docs/api/composables/use-announcer)
- [PR #34318 — feat(nuxt): add useAnnouncer](https://github.com/nuxt/nuxt/pull/34318)
