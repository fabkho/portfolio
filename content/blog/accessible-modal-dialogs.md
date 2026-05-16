---
tag: "ACCESSIBILITY"
title: "Accessible Modal Dialogs in Vue"
description: "A practical guide to focus management, ARIA roles, and keyboard traps for modals."
date: "2025-11-22"
author: "Fabian Kirchhoff"
specs: ["VUE", "A11Y", "ARIA"]
status: draft
---

# Accessible Modal Dialogs in Vue

Modals are deceptively complex. They look simple — show a box, dim the background — but getting them right for keyboard and screen reader users requires careful focus management, proper ARIA semantics, and understanding when to use `dialog` vs `alertdialog`.

This guide distills what we learned building the modal system at [anny.co](https://anny.co), serving thousands of users daily including those relying on assistive technology.

## Core Principles

### 1. Focus Trap

When a modal opens, keyboard focus must be **trapped inside** the modal. Users cannot tab to background content.

```vue
<script setup>
import { useFocusTrap } from '@vueuse/integrations/useFocusTrap'

const modalRef = ref<HTMLElement>()
const { activate, deactivate } = useFocusTrap(modalRef)

watch(show, (val) => {
  if (val) activate()
  else deactivate()
})
</script>

<template>
  <div v-if="show" ref="modalRef" role="dialog" aria-modal="true">
    <slot />
  </div>
</template>
```

### 2. Initial Focus Placement

There is no blanket rule — focus placement depends on context:

| Modal Type | Focus Target | Rationale |
|------------|-------------|-----------|
| Short info message | Close button | Quick dismiss, low risk |
| Long/complex content | Heading | Let user orient first |
| Brief form (login, search) | First input | User conveyed intent |
| Destructive confirmation | Cancel button | Least destructive option |

We implement this with a `data-autofocus` attribute:

```vue
<!-- Delete confirmation: focus the safe option -->
<BaseModal :show="showDelete" role="alertdialog">
  <h2>Delete Item?</h2>
  <p data-description>This action cannot be undone.</p>
  <button @click="confirm">Delete</button>
  <button data-autofocus @click="cancel">Cancel</button>
</BaseModal>
```

### 3. Focus Return

When the modal closes, focus **must** return to the element that triggered it:

```typescript
const triggerRef = ref<HTMLElement>()

function openModal(event: Event) {
  triggerRef.value = event.currentTarget as HTMLElement
  show.value = true
}

function closeModal() {
  show.value = false
  nextTick(() => triggerRef.value?.focus())
}
```

## Dialog vs AlertDialog

The `role` attribute changes screen reader behavior significantly:

| Role | Use Case | Description Announced? |
|------|----------|----------------------|
| `dialog` | Forms, info, complex content | ❌ Not reliably |
| `alertdialog` | Confirmations, warnings | ✅ Automatically |

Use `alertdialog` when the user needs to acknowledge something before proceeding:

```vue
<BaseModal :show="show" role="alertdialog">
  <h2>Discard Changes?</h2>
  <p data-description>You have unsaved work that will be lost.</p>
  <button data-autofocus @click="cancel">Keep Editing</button>
  <button @click="discard">Discard</button>
</BaseModal>
```

VoiceOver announces: *"Discard Changes?, You have unsaved work that will be lost., Keep Editing, button"*

## The `inert` Attribute

Instead of managing `aria-hidden` on every background element, use `inert`:

```vue
<div id="main-content" :inert="hasOpenModal">
  <!-- All page content -->
</div>

<Teleport to="body">
  <BaseModal :show="hasOpenModal">...</BaseModal>
</Teleport>
```

`inert` makes the background **completely inaccessible** — no focus, no clicks, no screen reader access. One attribute replaces multiple ARIA hacks.

## Testing Checklist

### Keyboard
- [ ] Tab cycles only through modal elements
- [ ] Cannot tab to background content
- [ ] Escape closes modal
- [ ] Focus returns to trigger on close

### Screen Reader
- [ ] Modal role announced on open
- [ ] For `alertdialog`: description announced automatically
- [ ] Initial focus target announced
- [ ] Close action announced

### Visual
- [ ] Focus ring visible on focused element
- [ ] Background is visually dimmed/inactive

## Resources

- [W3C APG Dialog Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [Adrian Roselli: Where to Put Focus](https://adrianroselli.com/2025/06/where-to-put-focus-when-opening-a-modal-dialog.html)
- [Scott O'Hara: Use the dialog element](https://www.scottohara.me/blog/2023/01/26/use-the-dialog-element.html)
