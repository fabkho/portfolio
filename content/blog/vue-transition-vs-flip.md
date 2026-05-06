---
tag: "ANIMATION"
title: "Vue Transition vs FLIP: When to Use Which"
description: "Comparing Vue's built-in transition system with manual FLIP animations for complex layout shifts."
date: "2025-09-03"
author: "Fabian Kirchhoff"
specs: ["VUE", "CSS", "ANIMATION"]
status: published
---

# Vue Transition vs FLIP: When to Use Which

Vue's `<Transition>` and `<TransitionGroup>` components handle most animation needs elegantly. But when elements move unpredictably across the page — reordering lists, expanding cards, or animating between routes — you need the FLIP technique.

## Vue's Built-in Transitions

Vue transitions work by toggling CSS classes at the right moments:

```vue
<Transition name="fade">
  <div v-if="show" class="panel">Content</div>
</Transition>

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
```

This covers:
- **Enter/leave** — elements appearing/disappearing
- **List moves** — `<TransitionGroup>` with `move` class
- **Mode control** — `out-in` / `in-out` sequencing

### When It Breaks Down

Vue transitions struggle when:

1. **Elements change position unpredictably** (grid reflow after filter)
2. **You need to animate from one component to another** (shared element transitions)
3. **Layout shifts happen outside Vue's reactivity** (resize, scroll-triggered repositioning)

## The FLIP Technique

FLIP stands for **First, Last, Invert, Play**:

1. **First** — record the element's starting position
2. **Last** — apply the DOM change, measure the new position
3. **Invert** — use `transform` to move the element back to its original position
4. **Play** — remove the transform with a transition, animating to the final position

```typescript
function flip(el: HTMLElement, callback: () => void) {
  // First: capture current bounds
  const first = el.getBoundingClientRect()

  // Last: apply DOM changes
  callback()

  // Measure new position
  const last = el.getBoundingClientRect()

  // Invert: calculate delta and apply as transform
  const dx = first.left - last.left
  const dy = first.top - last.top

  el.style.transform = `translate(${dx}px, ${dy}px)`
  el.style.transition = 'none'

  // Play: animate to final position
  requestAnimationFrame(() => {
    el.style.transition = 'transform 0.3s ease'
    el.style.transform = ''
  })
}
```

### As a Vue Composable

```typescript
export function useFlip(containerRef: Ref<HTMLElement | undefined>) {
  const positions = new Map<string, DOMRect>()

  function recordPositions() {
    const el = containerRef.value
    if (!el) return

    for (const child of el.children) {
      const key = (child as HTMLElement).dataset.flipKey
      if (key) positions.set(key, child.getBoundingClientRect())
    }
  }

  function playAnimations() {
    const el = containerRef.value
    if (!el) return

    for (const child of el.children) {
      const key = (child as HTMLElement).dataset.flipKey
      if (!key) continue

      const first = positions.get(key)
      if (!first) continue

      const last = child.getBoundingClientRect()
      const dx = first.left - last.left
      const dy = first.top - last.top

      if (dx === 0 && dy === 0) continue

      const htmlChild = child as HTMLElement
      htmlChild.style.transform = `translate(${dx}px, ${dy}px)`

      requestAnimationFrame(() => {
        htmlChild.style.transition = 'transform 0.3s cubic-bezier(0.2, 0, 0, 1)'
        htmlChild.style.transform = ''

        htmlChild.addEventListener('transitionend', () => {
          htmlChild.style.transition = ''
        }, { once: true })
      })
    }

    positions.clear()
  }

  return { recordPositions, playAnimations }
}
```

Usage:

```vue
<script setup>
const gridRef = ref()
const { recordPositions, playAnimations } = useFlip(gridRef)

function reorder() {
  recordPositions()
  items.value = shuffle(items.value)
  nextTick(() => playAnimations())
}
</script>

<template>
  <div ref="gridRef">
    <div v-for="item in items" :key="item.id" :data-flip-key="item.id">
      {{ item.name }}
    </div>
  </div>
</template>
```

## Decision Matrix

| Scenario | Use |
|----------|-----|
| Simple show/hide | `<Transition>` |
| List item add/remove | `<TransitionGroup>` |
| List reordering (predictable) | `<TransitionGroup>` with move class |
| Grid reflow after filter | FLIP |
| Shared element between routes | FLIP + View Transitions API |
| Expand/collapse with layout shift | FLIP |
| Staggered entrance | `<TransitionGroup>` + CSS delay |

## Combining Both

The best approach is often hybrid — use Vue transitions for enter/leave, and FLIP for position changes:

```vue
<TransitionGroup
  name="grid"
  @before-leave="recordPositions"
  @enter="playAnimations"
>
  <div v-for="item in filtered" :key="item.id" :data-flip-key="item.id">
    <Card :item="item" />
  </div>
</TransitionGroup>
```

## Performance Tips

1. **Only animate `transform` and `opacity`** — they don't trigger layout
2. **Use `will-change: transform`** sparingly on elements about to animate
3. **Batch DOM reads before writes** — avoid layout thrashing in FLIP calculations
4. **Use `requestAnimationFrame`** to ensure the browser has painted the inverted state before playing
