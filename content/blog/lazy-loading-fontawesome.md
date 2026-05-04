---
tag: "PERFORMANCE"
title: "Lazy-Loading FontAwesome Icons in Vue/Nuxt"
description: "How we slashed build times by converting FontAwesome CJS icons to ESM for lazy CDN loading."
date: "2025-10-14"
author: "Fabian Kirchhoff"
specs: ["VUE", "NUXT", "PERFORMANCE"]
status: published
---

# Lazy-Loading FontAwesome Icons in Vue/Nuxt

When architecting a production system like [anny.co](https://anny.co), bundle size directly impacts operational efficiency. We identified a critical bottleneck during our Nuxt migration: FontAwesome's CommonJS icon packages were inflating the initial payload, causing **3+ minute build times**.

## The Problem

FontAwesome distributes icons as CommonJS modules. Each icon package (`@fortawesome/free-solid-svg-icons`, etc.) exports a barrel file containing every icon definition — even if you only use a handful.

In a Nuxt/Vite setup, this means:

- The bundler cannot tree-shake CJS modules effectively
- Every icon SVG path is included in the chunk
- Build times scale linearly with the number of icon packages

Our production app used ~120 icons across 3 packages. The resulting chunk was **2.4MB uncompressed**.

## The Solution: ESM Conversion

We built [fontawesome-chunks](https://github.com/fabkho/fontawesome-chunks) — a build tool that converts FontAwesome's CJS exports into individual ESM files, one per icon.

```typescript
// Before: imports entire package (CJS barrel)
import { faUser, faHome, faCog } from '@fortawesome/free-solid-svg-icons'

// After: individual ESM chunks, lazy-loaded
const faUser = await import('@fabkho/fa-solid-esm/faUser')
```

### How It Works

The converter reads FontAwesome's source packages, extracts each icon definition, and emits individual ES module files:

```typescript
// fontawesome-esm-converter
import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

export function convertPackage(packageName: string, outDir: string) {
  const source = require(packageName)

  for (const [name, definition] of Object.entries(source)) {
    if (!isIconDefinition(definition)) continue

    const esm = `export default ${JSON.stringify(definition)};`
    writeFileSync(resolve(outDir, `${name}.js`), esm)
  }
}
```

Each generated file is a standalone ES module that Vite can code-split and lazy-load on demand.

### Vue Component Integration

We created a thin wrapper component that resolves icons at render time:

```vue
<script setup lang="ts">
const props = defineProps<{ icon: string }>()

const iconDef = ref(null)

onMounted(async () => {
  const mod = await import(`@fabkho/fa-solid-esm/${props.icon}`)
  iconDef.value = mod.default
})
</script>

<template>
  <svg v-if="iconDef" :viewBox="`0 0 ${iconDef[0]} ${iconDef[1]}`">
    <path :d="iconDef[4]" fill="currentColor" />
  </svg>
</template>
```

## Results

| Metric | Before | After |
|--------|--------|-------|
| Build time | 3+ minutes | 48 seconds |
| Icon chunk size | 2.4 MB | 0 (loaded on demand) |
| Initial payload | +890 KB | +12 KB (loader only) |

The client now requests SVG definitions incrementally as icons enter the viewport. Build times dropped by **75%** because Vite no longer processes massive CJS barrel files.

## When to Use This Approach

This pattern works best when:

- You use many icons across different pages
- Icons are not critical for first paint (below the fold, in modals, etc.)
- Build time is a bottleneck in your CI/CD pipeline

For icons visible on first paint (hero sections, navigation), keep them inlined or preloaded for optimal LCP.
