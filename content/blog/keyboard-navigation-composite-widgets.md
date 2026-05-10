---
tag: "ACCESSIBILITY"
title: "Keyboard Navigation in Composite Widgets"
description: "Roving tabindex vs aria-activedescendant — when to use each pattern, with interactive demos and production implementation details."
date: "2026-05-10"
author: "Fabian Kirchhoff"
specs: ["VUE", "A11Y", "ARIA"]
status: published
---

# Keyboard Navigation in Composite Widgets

Composite widgets — tab bars, toolbars, listboxes, comboboxes — contain multiple interactive elements but should behave as a single tab stop. Two W3C patterns handle this: **roving tabindex** and **aria-activedescendant**. They solve the same problem differently, and picking the wrong one makes the widget harder to use.

This post walks through both with interactive demos, then shows how we implement each in production at [anny.co](https://anny.co).

## The Problem: Tab Key Overload

Imagine a tab bar with 8 tabs where each tab is a separate tab stop. A keyboard user must press Tab 8 times just to get past it. For a toolbar with 12 buttons, that's 12 Tab presses before reaching the main content. This is a terrible experience.

Composite widgets should work like this:

- **Tab** moves focus _into_ and _out of_ the widget (one tab stop)
- **Arrow keys** navigate between items _within_ the widget
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

The beauty of this approach: when the user tabs away and later tabs back, the previously focused item still has `tabindex="0"`, so focus returns right where they left off.

### Production: TabBar

Here's a simplified version of how we implement roving tabindex in our TabBar component at anny.co. The key pieces:

- `focusedTabValue` tracks which tab currently holds `tabindex="0"`
- `activationMode` controls whether arrow keys also activate (switch panels) or only move focus
- Manual activation is better when switching panels triggers expensive loads

```typescript
const focusedTabValue = ref(currentTab)

function getTabTabindex(tab): number {
  return tab.value === focusedTabValue.value ? 0 : -1
}

function focusTab(tab) {
  focusedTabValue.value = tab.value
  nextTick(() => {
    tabsRefMap.value[`tab_${tab.value}`]?.focus()
  })
}

function handleKeydown(event: KeyboardEvent, tab) {
  const currentIndex = getTabIndex(tab)
  const lastIndex = visibleTabs.value.length - 1
  let targetTab

  switch (event.key) {
    case 'ArrowRight':
      event.preventDefault()
      targetTab = visibleTabs.value[currentIndex === lastIndex ? 0 : currentIndex + 1]
      break
    case 'ArrowLeft':
      event.preventDefault()
      targetTab = visibleTabs.value[currentIndex === 0 ? lastIndex : currentIndex - 1]
      break
    case 'Home':
      event.preventDefault()
      targetTab = visibleTabs.value[0]
      break
    case 'End':
      event.preventDefault()
      targetTab = visibleTabs.value[lastIndex]
      break
    case 'Enter':
    case ' ':
      event.preventDefault()
      activateTab(tab, event)
      return
  }

  if (targetTab) {
    if (activationMode === 'automatic') {
      focusTab(targetTab)
      activateTab(targetTab)
    } else {
      focusTab(targetTab)
    }
  }
}
```

The template wires everything together — each tab gets its computed `tabindex`, and both click and keyboard events are handled:

```vue
<button
  v-for="tab in visibleTabs"
  role="tab"
  :aria-selected="tab.value === currentTab"
  :aria-controls="getPanelId(tab)"
  :tabindex="getTabTabindex(tab)"
  @click="handleClick(tab, $event)"
  @keydown="handleKeydown($event, tab)"
  @focus="handleFocus(tab)"
>
  {{ tab.title }}
</button>
```

Notice the circular wrapping: ArrowRight on the last tab goes to the first, ArrowLeft on the first goes to the last. This matches the W3C Tabs pattern recommendation.

The `activationMode` distinction matters. With `'automatic'`, arrow keys both move focus and switch the active panel — good for lightweight tabs. With `'manual'` (our default), arrow keys only move focus; Enter or Space activates. Manual is better when panel content is expensive to render or fetched from the network.

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

### Production: VSelect

Here's how we use aria-activedescendant in our VSelect component. The input keeps focus and manages everything through attribute updates:

```typescript
const highlightedIndex = ref(-1)

const activeDescendantId = computed(() => {
  if (highlightedIndex.value < 0) return undefined
  return `${menuContainerId}-option-${highlightedIndex.value}`
})

function handleKeydown(event: KeyboardEvent) {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      highlightedIndex.value = Math.min(
        highlightedIndex.value + 1,
        filteredOptions.value.length - 1
      )
      scrollHighlightedIntoView()
      break
    case 'ArrowUp':
      event.preventDefault()
      highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0)
      scrollHighlightedIntoView()
      break
    case 'Enter':
      event.preventDefault()
      selectHighlighted()
      break
    case 'Escape':
      event.preventDefault()
      close()
      break
  }
}
```

The template shows the ARIA relationship between the input and the listbox:

```vue
<input
  role="combobox"
  :aria-activedescendant="activeDescendantId"
  :aria-controls="menuContainerId"
  :aria-expanded="isOpen"
  @keydown="handleKeydown"
/>
<ul :id="menuContainerId" role="listbox">
  <li
    v-for="(option, index) in filteredOptions"
    :id="`${menuContainerId}-option-${index}`"
    role="option"
    :aria-selected="index === highlightedIndex"
  >
    {{ option.label }}
  </li>
</ul>
```

Every option needs a unique `id` that matches what `aria-activedescendant` references. We derive them from `menuContainerId` + the index, which keeps them stable as long as the filtered list doesn't change underneath us.

The `scrollHighlightedIntoView()` call is critical for long lists — without it, the highlighted option scrolls out of the visible area and the user has no idea where they are.

### Type-Ahead in Non-Searchable Mode

For non-searchable selects (dropdowns without a text input), users still expect to type a character and jump to a matching option. We handle this with a `useMenuTypeAhead` composable:

```typescript
// useMenuTypeAhead composable (simplified)
function handleTypeAhead(key: string) {
  searchString.value += key
  clearTimeout(timer)
  timer = setTimeout(() => { searchString.value = '' }, 500)

  // Search circularly from current position
  const startIndex = (highlightedIndex.value + 1) % options.length
  for (let i = 0; i < options.length; i++) {
    const index = (startIndex + i) % options.length
    if (options[index].label.toLowerCase().startsWith(searchString.value)) {
      highlightedIndex.value = index
      break
    }
  }
}
```

Characters typed within 500ms accumulate into a search string. Typing "ca" quickly highlights "California" (or the first match starting with "ca"). The circular search starts from the current position, so typing the same letter repeatedly cycles through all options starting with that letter — just like a native `<select>`.

## When to Use Which

| Criteria | Roving Tabindex | aria-activedescendant |
|----------|----------------|----------------------|
| DOM focus | Moves to each item | Stays on container |
| Best for | Tabs, toolbars, radio groups, menu bars | Comboboxes, searchable selects, listboxes with input |
| Input field | Not needed | Required (or container acts as one) |
| Browser support | Universal | Universal (but SR support varies) |
| Complexity | Lower | Higher (need unique ids, careful attribute management) |
| Filtering/search | Awkward (focus + input conflict) | Natural (focus stays on input) |
| Screen reader | Directly announced (element is focused) | Announced via relationship (more indirection) |

### Decision Rule

Three cases cover almost every widget:

1. **The widget has an input field** that the user types into while navigating options → **aria-activedescendant**. This is the only pattern that lets the input stay focused while options are highlighted. Comboboxes, searchable selects, autocompletes — all use this.

2. **Items are standalone interactive elements** like tabs, toolbar buttons, or menu items → **roving tabindex**. Each item is a real focusable element, and there's no input to maintain focus on.

3. **Not sure** → **roving tabindex**. It's simpler to implement, has more consistent screen reader support, and covers most composite widget patterns.

## Common Pitfalls

1. **Forgetting `event.preventDefault()`** — Arrow keys scroll the page if not prevented. Every arrow key handler in a composite widget needs this.

2. **Not wrapping at boundaries** — When arrowing past the last item, should it cycle to the first or stop? Either is fine, but be consistent. The W3C Tabs pattern recommends wrapping; listboxes typically don't.

3. **Missing `role` attributes** — Without `role="tablist"`, `role="tab"`, `role="listbox"`, and `role="option"`, screen readers can't identify the widget pattern and won't announce items correctly.

4. **Stale `aria-activedescendant`** — When filtering changes the option list, the id referenced by `aria-activedescendant` might no longer exist in the DOM. Always reset `highlightedIndex` (or recompute it) when the filtered list changes.

5. **Not scrolling highlighted items into view** — In long lists, arrowing through options can move the highlight off-screen. Call `scrollIntoView({ block: 'nearest' })` on the highlighted element after each navigation.

## Resources

- [W3C APG: Developing a Keyboard Interface](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)
- [W3C APG: Tabs Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)
- [W3C APG: Combobox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)
- [MDN: aria-activedescendant](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-activedescendant)
