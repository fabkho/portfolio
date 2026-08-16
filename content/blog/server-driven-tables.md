---
tag: "ARCHITECTURE"
title: "Server-Driven Tables: Structure That Arrives With the HTML"
description: "Moving table column definitions into the backend, and why resolving them during SSR settles the table's shape before a single row is fetched."
date: "2026-08-15"
author: "Fabian Kirchhoff"
specs: ["NUXT", "VUE", "SSR", "TYPESCRIPT"]
status: published
featured: false
---

# Server-Driven Tables: Structure That Arrives With the HTML

Every admin table I've built started the same way: a `columns` array in the frontend, hand-written per page.

```typescript
const columns = [
  { key: 'customer', header: 'Customer', width: 180 },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'total', header: 'Total', type: 'currency', align: 'right' }
]
```

That works until the columns stop being knowable at build time. Ours stopped for three reasons at once: each tenant defines their own custom fields, the bookable add-ons differ per tenant, and users save views that pin a column order, a set of widths and a filter. None of that exists in the bundle. All of it is per-tenant data.

So I moved the column catalog to the backend. One endpoint per entity returns every column that tenant can render, already localized:

```
GET /api/table-config/bookings
```

```json
{
  "entity": "bookings",
  "columns": [
    { "key": "customer", "header": "Customer", "type": "text", "sortable": true },
    { "key": "total", "header": "Umsatz", "type": "currency", "align": "right" },
    { "key": "customFields.cost_center", "header": "Kostenstelle", "type": "text" }
  ]
}
```

The endpoint isn't the interesting part. What matters is *when* you fetch it.

## A table waits for two different things

Pull them apart and the whole design falls out:

**Structure** — which columns exist, their order, their widths, which view is active, which filters it carries. Small, tenant-scoped, changes rarely, identical for every page of results.

**Rows** — the actual data. Large, paginated, filtered, sorted, different on every request.

These have nothing in common except that a table needs both. Structure is a perfect fit for SSR: a few kilobytes, cacheable per tenant and locale, and it's what determines the page's layout. Rows are a bad fit: big, slow, and they'd hold the whole document hostage.

So: **structure from the server, rows from the client.**

The rows still arrive late. Skeletons still appear. What changes is that they appear inside columns that are already the right width, under headers that are already correct, below a view tab that's already underlined. The data drops into a table whose shape was settled before the browser painted anything.

:table-hydration-demo

Both modes fetch rows on the client — that never changes. The difference is whether the skeleton is the real layout or a guess that gets corrected.

## Fetching structure on the server

`useAsyncData` is what makes this work. It runs during SSR, serializes the result into the payload, and the client picks it up without a second request:

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

The key is a function, not a string. `entity` and `locale` are reactive, and a static key freezes whatever they were on the first call — every table after that reads the wrong cache entry. Anything the response varies by belongs in the key.

The `await` is load-bearing. It suspends the component during SSR until the config resolves, which is what puts the finished markup in the server response. It also means the composable can only be called from a setup Nuxt is allowed to suspend — a page component, or something inside `<Suspense>`. Calling it from an event handler or a `watch` throws.

Rows go the other way, deliberately client-side:

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

## Views are config on top of the catalog

A saved view doesn't store columns. It stores a small object that references catalog keys:

```typescript
interface TableViewConfig {
  sort: { column: string, direction: 'asc' | 'desc' }[]
  columnOrder: string[]
  columnWidths: Record<string, number>
  columnVisibility: Record<string, boolean>
}
```

That indirection is what makes views survive schema changes. A view can't reference a column the catalog no longer exposes, so a deleted custom field degrades to "column missing from this view" instead of a render crash.

Switching views splits along the same seam. The columns rearrange with no request at all — the catalog is already in memory, so reordering, resizing and hiding are local state. The rows do need a round trip, because a view's `filter` and `sort` are query parameters the server resolves, not client-side predicates:

:view-config-demo

So a view switch is a structural change costing zero requests and a data change costing exactly one. Skeletons come back — inside the new column layout, already at its saved widths.

Views are fetched in the same SSR pass as the catalog, which is why the correct tab is underlined on first paint instead of snapping into place a moment later. A saved view is part of the structure, not part of the data.

## What a backend cannot send

JSON can't carry functions, and that constraint shapes the whole column contract. The split I ended up with:

| Field | Owner | Why |
|---|---|---|
| `type` | Backend | Sort and align primitive — `text`, `date`, `currency` |
| `format` | Backend | Declarative transform, fully enumerated server-side |
| `cell` | Backend (descriptor) | Names a registered component + props |
| `slot` | Frontend | Escape hatch for one-off markup |

`cell` is a descriptor, not a component: `{ component: 'currency', props: { currency: 'EUR' } }`. The frontend keeps a registry mapping those names to real components. The backend picks *which* cell renders; the frontend owns *how* it renders.

`format` has to be exhaustively implemented on the backend. The temptation is to leave a gap and patch it with a frontend function for the one weird column — and then that column is the only one that can't be exported, because the export pipeline reads the same catalog and has no JavaScript runtime to call into.

## When this is the wrong shape

Columns known at build time don't need any of this. A static table with five fixed columns is better served by an array in the component — you get type inference, jump-to-definition, and no network dependency for your layout.

It also costs a round trip on the server. If the config endpoint is slow, you've moved the delay from "the table settles late" to "the page arrives late", which is worse. Ours is cached per tenant and locale and answers in single-digit milliseconds; without that cache I wouldn't do it.

And it moves presentation decisions into backend code. Deciding that "Total" is right-aligned now happens in a PHP class. That's a real cost, paid deliberately — the alternative was two sources of truth for the same column, and the export pipeline drifting out of sync with the table was how that cost got paid instead.

## Resources

- [Nuxt `useAsyncData`](https://nuxt.com/docs/api/composables/use-async-data) — payload serialization and cache keys
- [Nuxt data fetching](https://nuxt.com/docs/getting-started/data-fetching) — `server: false` and when requests run where
- [TanStack Table](https://tanstack.com/table/latest) — if you want the headless engine rather than a config protocol
