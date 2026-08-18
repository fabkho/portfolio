---
tag: "ANIMATION"
title: "One Overlay, Three Layouts: Morphing UI with the View Transitions API"
description: "How to morph a record panel between slideover, modal and fullscreen — and keep the text crisp while the browser animates bitmaps."
date: "2026-08-17"
author: "Fabian Kirchhoff"
specs: ["VUE", "CSS", "ANIMATION"]
status: draft
---

# One Overlay, Three Layouts: Morphing UI with the View Transitions API

In an admin app I work on, people open records from tables all day. Some want a quick peek in a panel beside the table, some want a focused modal, some want the whole screen. Instead of picking one, I built a single overlay that supports all three layouts — and switching between them *morphs* the panel instead of blinking.

The part that makes this interesting: each layout is a completely different component tree. The slideover is a docked sidebar, the modal has a mask and a second column, fullscreen is a page-like surface. On switch, the whole tree swaps, and the View Transitions API animates the difference.

:morph-overlay-demo

The full-size version, with a real record and a broken-mode toggle, is at [fabkho.github.io/overlay-morph](https://fabkho.github.io/overlay-morph/) ([source](https://github.com/fabkho/overlay-morph)).

## What startViewTransition actually does

1. The browser **snapshots the old state** — as images
2. You **mutate the DOM** — any way you like
3. The browser **snapshots the new state**
4. Elements sharing a `view-transition-name` **morph** between snapshots; everything else cross-fades

```css
.om-panel-box { view-transition-name: om-panel; }
.om-title     { view-transition-name: om-title; }
```

```ts
document.startViewTransition(() => { mode.value = 'fullscreen' })
```

The two states can be entirely different component trees. The browser pairs elements by name across the swap and diffs the rest for you — no FLIP bookkeeping, no measuring boxes.

In Vue there is one load-bearing detail: flush the render before the "new" snapshot is taken, or the browser captures a tree that doesn't exist yet.

```ts
async function runTransition(mutate: () => void, options?: { types?: string[] }) {
  if (!document.startViewTransition
    || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    mutate()
    return
  }
  const update = async () => {
    mutate()
    await nextTick() // the "after" snapshot must see the new tree
  }
  await document.startViewTransition({ update, types: options?.types }).finished
}
```

Both bail-outs matter. Without `startViewTransition` the switch still works, just instantly — that's the entire fallback story. And reduced motion has to skip the morph, not just shorten it.

## Snapshots are bitmaps

This is the trap that decides whether the technique is usable. `::view-transition-old` and `::view-transition-new` are *images*. When a named element changes size, the browser stretches both images into the interpolating box and cross-fades them. For a panel surface that's fine. For text it's a smear.

:morph-bitmap-demo

The fix is three lines, per content group:

```css
::view-transition-group(om-primary) { overflow: clip; }   /* box becomes a reveal window */
::view-transition-new(om-primary)   { width: auto; height: auto; } /* natural size — never stretched */
::view-transition-old(om-primary)   { animation: none; opacity: 0; } /* no cross-fade smear */
```

The group box still morphs — but now it clips a natural-size, live snapshot instead of stretching a bitmap. The old image is dropped entirely, so a content-identical pair becomes pure motion.

There's a precondition hiding in there: killing the cross-fade only works if the content really is identical in both states. In my overlay the primary column is exactly the same width in every layout for this reason. If the width changed, text would rewrap and the missing cross-fade would show as a jump.

The rule that falls out: let flat **chrome** (panel surfaces) stretch freely, give **content** the reveal treatment.

## Keeping the morph inside the panel

By default every named element becomes a direct child of the root pseudo-tree — the panel's title and content animate *next to* the panel, not inside it, and can leak past its edges mid-morph.

```css
.om-panel-box {
  view-transition-name: om-panel;
  view-transition-group: contain;   /* descendants nest under this group */
}

::view-transition-group-children(om-panel) {
  overflow: clip;                   /* the panel box clips them */
}
```

This is Chrome 140+. Older engines ignore both rules and the morph still runs — descendants just animate in the root transition. That's the degradation you want: same motion, slightly less containment.

## Retiming one morph family, not the page

`startViewTransition` accepts `types`, and CSS can match them:

```ts
runTransition(() => { mode.value = target }, {
  types: [`om-${from}-to-${target}`],
})
```

```css
/* only during OUR morphs — an unscoped rule would retime
   every future view transition on the page */
html:active-view-transition-type(om-slideover-to-modal)::view-transition-old(root) {
  animation-duration: 340ms;
}
```

Typed transitions are also what make per-direction motion possible. In my overlay, every morph springs — except the two directions *into* fullscreen, which glide on a decelerating curve instead, because edges expanding toward the app chrome must not overshoot into it:

```css
::view-transition-image-pair(om-panel) {
  animation-name: om-panel-settle;  /* a centered 1% dip — the spring's bounce */
}

html:active-view-transition-type(om-slideover-to-fullscreen)::view-transition-group(*) {
  animation-timing-function: var(--ease-emphasized);
}
html:active-view-transition-type(om-slideover-to-fullscreen)::view-transition-image-pair(om-panel) {
  animation-name: none;             /* glide directions drop the bounce too */
}
```

## Two Vue-specific traps

**Competing transitions get snapshotted.** If a CSS transition or a Vue `<Transition>` is running on the panel when the "new" snapshot is taken, you capture it mid-animation and the morph lands on a half-faded frame. While a view transition runs, I set a class on `<html>` that force-disables the shells' own animations:

```css
html.om-vt-lock .om-panel-box,
html.om-vt-lock .om-docked {
  transition: none !important;
  animation: none !important;
}
```

```ts
watch(isTransitioning, on =>
  document.documentElement.classList.toggle('om-vt-lock', on))
```

**Vue's leave keeps the old element alive at capture time.** `<Transition>` gates its leave on `requestAnimationFrame`, so for a frame the old panel and the new panel exist together — two elements with the same `view-transition-name`. Duplicate names don't warn; they silently skip the entire transition. My docked panel therefore closes without `<Transition>` at all: a raw CSS width collapse plus a `transitionend` unmount.

```css
.om-docked {
  width: 420px;
  transition: width 340ms var(--ease-pop);
}
@starting-style {
  .om-docked { width: 0; }  /* enter animates too — still no <Transition> */
}
.om-docked--closing { width: 0; }
```

Silent failure is the theme here. A duplicate name, a token declared on `body` instead of `:root` (the pseudo-tree inherits from the document root, so your easing quietly falls back to `ease`), a second transition starting mid-flight — none of them throw. Await `transition.finished` and log rejections in development.

## Support

As of August 2026:

| Feature | Chrome / Edge | Safari | Firefox |
| --- | --- | --- | --- |
| Same-document view transitions | 111+ | 18+ | 144+ |
| `types` / `:active-view-transition-type` | 125+ | 18.2+ | 144+ |
| Nested groups (`view-transition-group: contain`) | 140+ | — | — |

So there are three tiers, and the code above handles all of them without branching: full containment on current Chrome, the same morph minus nesting on Safari and Firefox, and an instant layout swap everywhere else. The overlay itself never depends on the animation.

## When not to use it

- **Text that must change size.** A named group can only scale its bitmap. If the same heading needs to grow while staying crisp, transition `font-size` on the real element instead and pay the layout cost knowingly.
- **List mutations.** Reordering, inserting, resizing items in place — that's FLIP territory (or `<TransitionGroup>`). View transitions are for two *different layouts* that share elements.
- **Concurrent animations.** Only one document transition runs at a time; a second call skips the first to completion. Element-scoped transitions (Chrome 147+) lift this, but you can't build on that yet.

## Resources

- [Live demo](https://fabkho.github.io/overlay-morph/) · [source](https://github.com/fabkho/overlay-morph) — the CSS in `src/styles/morph.css` is the whole technique, commented
- [Same-document view transitions](https://developer.chrome.com/docs/web-platform/view-transitions/same-document) — Chrome's API guide
- [Nested view transition groups](https://developer.chrome.com/docs/css-ui/view-transitions/nested-view-transition-groups)
- [View Transition API on MDN](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API)
