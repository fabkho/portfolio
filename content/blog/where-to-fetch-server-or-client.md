---
tag: "ARCHITECTURE"
title: "The Layout Test: What to Fetch on the Server, What to Fetch on the Client"
description: "One question decides where every fetch in a Nuxt app belongs — does the response determine the layout, or does it fill a layout that is already decided?"
date: "2026-08-15"
author: "Fabian Kirchhoff"
specs: ["NUXT", "VUE", "SSR", "TYPESCRIPT"]
status: published
featured: false
---

# The Layout Test: What to Fetch on the Server, What to Fetch on the Client

Nuxt gives you two places to fetch. During SSR, where the result ships inside the HTML document. Or on the client after hydration, where it arrives as a second request. The docs explain how to do both. They don't tell you which to pick.

I use one question: **does the response decide the layout, or does it fill a layout that is already decided?**

:layout-test-rule

Whatever decides the layout has to be in the HTML, because the browser sizes the page from that HTML. If it arrives later and changes a size, it moves content the user is already looking at.

## One table needs both

Admin tables are the clearest example I have, because one component fetches both kinds.

The columns aren't knowable at build time — each tenant defines their own custom fields, so the column list is per-tenant data that doesn't exist in the bundle. It comes from an endpoint:

```json
// GET /api/table-config/bookings
{
  "entity": "bookings",
  "columns": [
    { "key": "customer", "header": "Customer", "type": "text", "width": 200 },
    { "key": "total", "header": "Umsatz", "type": "currency", "width": 110 },
    { "key": "customFields.cost_center", "header": "Kostenstelle", "type": "text" }
  ]
}
```

The config decides the layout: how many columns exist, how wide each one is, what order they're in.

The rows don't. A cell can render anything — a badge, a truncated name, an avatar — but it renders inside a column the config already sized. The rows change what's in the table, not its shape.

So the config goes in the SSR pass and the rows are fetched from the client. The rows still arrive late and the skeletons are still there, but they're already sitting in the real columns:

:table-hydration-demo

Fetch the config on the client instead and the bundle has to render something first. When the real config lands it drops a column, reorders another and resets every width — a full reflow, before a single row exists.

## Writing it down

`useAsyncData` runs during SSR, serializes the result into the payload, and the client reads it from there instead of making a second request:

```typescript
export async function useTableConfig(entity: MaybeRefOrGetter<string>) {
  const { locale } = useI18n()

  const { data } = await useAsyncData(
    () => `table-config:${toValue(entity)}:${locale.value}`,
    () => $fetch<TableConfig>(`/api/table-config/${toValue(entity)}`)
  )

  return { columns: computed(() => data.value?.columns ?? []) }
}
```

The key is a function, not a string. `entity` and `locale` are reactive, and a static key freezes whatever they were on the first call, so every table after that reads the wrong cache entry.

The `await` is load-bearing. It suspends the component during SSR until the config resolves, which is what puts the finished markup in the server response. That also means you can only call it from a setup Nuxt can suspend — a page component, or something inside `<Suspense>`.

The rows are the same request with one option flipped:

```vue
<script setup lang="ts">
const { columns } = await useTableConfig('bookings')

const { data: rows, pending } = useFetch('/api/bookings', { server: false })
</script>

<template>
  <DataTable
    :columns="columns"
    :rows="rows ?? []"
    :loading="pending"
  />
</template>
```

`server: false` is the whole split in one option.

## When to break it

The rule assumes what decides layout is cheap. If that endpoint takes 800ms, putting it in the SSR pass delays the whole document to fix a shift the user would have seen for a fraction of that. Cache it, or accept the shift. Ours answers in single-digit milliseconds; without that cache I wouldn't do it.

## Resources

- [Nuxt `useAsyncData`](https://nuxt.com/docs/api/composables/use-async-data) — payload serialization and cache keys
- [Nuxt data fetching](https://nuxt.com/docs/getting-started/data-fetching) — `server: false` and where requests run
- [Cumulative Layout Shift](https://web.dev/articles/cls) — what the shifts this avoids actually cost
