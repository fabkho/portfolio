---
title: Keyboard Navigation in Composite Widgets
author: Fabian Kirchhoff
date: 2026-05-10
description: Roving tabindex vs aria-activedescendant — when to use each pattern, with interactive demos and implementation examples.
featured: false
specs:
  - VUE
  - A11Y
  - ARIA
status: published
tag: ACCESSIBILITY
---

# Keyboard Navigation in Composite Widgets

Composite widgets — tab bars, toolbars, listboxes, comboboxes — contain multiple interactive elements but should behave as a single tab stop. Two W3C patterns handle this: **roving tabindex** and **aria-activedescendant**. They solve the same problem differently, and picking the wrong one makes the widget harder to use.

This post walks through both patterns with interactive demos and production implementation details.

## The Problem: Tab Key Overload

Imagine a tab bar with 8 tabs where each tab is a separate tab stop. A keyboard user must press Tab 8 times just to get past it. For a toolbar with 12 buttons, that's 12 Tab presses before reaching the main content. This is a terrible experience.

Composite widgets should work like this:

- **Tab** moves focus *into* and *out of* the widget (one tab stop)
- **Arrow keys** navigate between items *within* the widget
- **Enter/Space** activates the focused item

This is the pattern every native OS widget follows. Both roving tabindex and aria-activedescendant achieve it — but through different mechanisms.

## Pattern 1: Roving Tabindex

Only one item in the group has `tabindex="0"` at any given time. All other items have `tabindex="-1"`. When arrow keys are pressed, `tabindex="0"` moves to the new target and `.focus()` is called on it. Focus actually moves in the DOM.

:roving-tab-demo

Try it: use Tab to enter the widget, then Arrow keys to move between items. Tab again to leave. Notice how focus visibly moves from one item to the next — that's real DOM focus shifting.

### How It Works

1. One element gets `tabindex="0"`, the rest get `tabindex="-1"`
2. Arrow keys update which element has `tabindex="0"` and call `.focus()` on it
3. Tab leaves the widget entirely. Shift+Tab re-enters at the last focused item (because it still has `tabindex="0"`)
4. Home/End jump to first/last item

When the user tabs away and later tabs back, the previously focused item still has `tabindex="0"` — focus returns right where they left off.

### Implementation

The core logic tracks which tab holds `tabindex="0"` (keyboard focus) separately from which tab is active (displayed panel):

```typescript
const focusedTab = ref(tabs[0])
const activeTab = ref(tabs[0])

function handleKeydown(event: KeyboardEvent) {
  const idx = tabs.indexOf(focusedTab.value)
  let next: number | null = null

  switch (event.key) {
    case 'ArrowRight':
      next = (idx + 1) % tabs.length
      break
    case 'ArrowLeft':
      next = (idx - 1 + tabs.length) % tabs.length
      break
    case 'Home':
      next = 0
      break
    case 'End':
      next = tabs.length - 1
      break
    case 'Enter':
    case ' ':
      event.preventDefault()
      activeTab.value = focusedTab.value
      return
  }

  if (next !== null) {
    event.preventDefault()
    focusedTab.value = tabs[next]
    tabRefs[next].focus()
  }
}
```

```vue
<button
  v-for="tab in tabs"
  role="tab"
  :aria-selected="tab === activeTab"
  :tabindex="tab === focusedTab ? 0 : -1"
  @keydown="handleKeydown"
>
  {{ tab.label }}
</button>
```

Circular wrapping (ArrowRight on last goes to first) matches the W3C Tabs pattern recommendation.

## Pattern 2: aria-activedescendant

Focus stays on a container element — usually an `<input>`. The container's `aria-activedescendant` attribute points to the `id` of the currently "active" option. The screen reader announces the referenced element even though it never receives DOM focus.

:aria-active-descendant-demo

Try it: focus the input, then use Arrow keys. Notice the input stays focused the whole time — you can still type while navigating. The highlighted item changes visually, and screen readers announce it, but DOM focus never leaves the input.

### How It Works

1. The container (input or div with `role="combobox"`) keeps DOM focus at all times
2. Arrow keys update `aria-activedescendant` to reference a different option's `id`
3. The referenced option is visually highlighted and announced by screen readers
4. Option elements never receive `.focus()`
5. Because focus stays on the input, it remains editable while navigating options

This is what makes searchable comboboxes possible. With roving tabindex, moving focus to an option would pull focus out of the input — you'd lose your cursor position and stop being able to type.

### Implementation

The input keeps focus and manages everything through attribute updates:

```typescript
const activeIndex = ref(0)

const activeDescendant = computed(() =>
  options[activeIndex.value]?.id
)

function handleKeydown(event: KeyboardEvent) {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      activeIndex.value = Math.min(activeIndex.value + 1, options.length - 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      activeIndex.value = Math.max(activeIndex.value - 1, 0)
      break
    case 'Enter':
      event.preventDefault()
      selectOption(options[activeIndex.value])
      break
  }
}
```

```vue
<input
  role="combobox"
  :aria-activedescendant="activeDescendant"
  :aria-controls="listboxId"
  aria-expanded="true"
  @keydown="handleKeydown"
/>
<ul :id="listboxId" role="listbox">
  <li
    v-for="option in options"
    :id="option.id"
    role="option"
    :aria-selected="option.id === activeDescendant"
  >
    {{ option.label }}
  </li>
</ul>
```

Every option needs a unique `id` that matches what `aria-activedescendant` references. When filtering changes the list, reset `activeIndex` — a stale reference to a removed `id` breaks the announcement chain.

## When to Use Which

| Criteria         | Roving Tabindex                         | aria-activedescendant                                  |
| ---------------- | --------------------------------------- | ------------------------------------------------------ |
| DOM focus        | Moves to each item                      | Stays on container                                     |
| Best for         | Tabs, toolbars, radio groups, menu bars | Comboboxes, searchable selects, listboxes with input   |
| Input field      | Not needed                              | Required (or container acts as one)                    |
| Browser support  | Universal                               | Universal (but SR support varies)                      |
| Complexity       | Lower                                   | Higher (need unique ids, careful attribute management) |
| Filtering/search | Awkward (focus + input conflict)        | Natural (focus stays on input)                         |
| Screen reader    | Directly announced (element is focused) | Announced via relationship (more indirection)          |

### Decision Rule

Three cases cover almost every widget:

1. **The widget has an input field** that the user types into while navigating options → **aria-activedescendant**. This is the only pattern that lets the input stay focused while options are highlighted. Comboboxes, searchable selects, autocompletes — all use this.
2. **Items are standalone interactive elements** like tabs, toolbar buttons, or menu items → **roving tabindex**. Each item is a real focusable element, and there's no input to maintain focus on.
3. **Not sure** → **roving tabindex**. It's simpler to implement, has more consistent screen reader support, and covers most composite widget patterns.

## Common Pitfalls

1. **Forgetting** **`event.preventDefault()`** — Arrow keys scroll the page if not prevented. Every arrow key handler in a composite widget needs this.
2. **Not wrapping at boundaries** — When arrowing past the last item, should it cycle to the first or stop? Either is fine, but be consistent. The W3C Tabs pattern recommends wrapping; listboxes typically don't.
3. **Missing** **`role`** **attributes** — Without `role="tablist"`, `role="tab"`, `role="listbox"`, and `role="option"`, screen readers can't identify the widget pattern and won't announce items correctly.
4. **Stale** **`aria-activedescendant`** — When filtering changes the option list, the id referenced by `aria-activedescendant` might no longer exist in the DOM. Always reset `highlightedIndex` (or recompute it) when the filtered list changes.
5. **Not scrolling highlighted items into view** — In long lists, arrowing through options can move the highlight off-screen. Call `scrollIntoView({ block: 'nearest' })` on the highlighted element after each navigation.

## Resources

- [W3C APG: Developing a Keyboard Interface](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)
- [W3C APG: Tabs Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)
- [W3C APG: Combobox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)
- [MDN: aria-activedescendant](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-activedescendant)

## Related Posts

- [Announcing Dynamic Changes in Vue with aria-live](/blog/use-announcer-nuxt) — for changes that have no focus target at all
