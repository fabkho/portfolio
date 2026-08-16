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

I use one question:

**Does the response decide the layout, or does it fill a layout that is already decided?**

Decides the layout → fetch it on the server. Fills it → fetch it on the client.

Anything that decides layout has to be in the HTML, because the browser sizes the page from that HTML. If it arrives later and changes a size, it moves content the user is already looking at. Everything else can arrive whenever it wants, as long as the space it lands in is already the right shape.

## One table needs both

Admin tables are the clearest example I have, because a single component fetches both kinds.

The columns aren't knowable at build time. Each tenant defines their own custom fields, and the bookable add-ons differ per tenant, so the column list is per-tenant data that doesn't exist in the bundle. It comes from an endpoint:

```
GET /api/table-config/bookings
```

```json
{
  "entity": "bookings",
  "columns": [
    { "key": "customer", "header": "Customer", "type": "text", "width": 180 },
    { "key": "total", "header": "Umsatz", "type": "currency", "align": "right" },
    { "key": "customFields.cost_center", "header": "Kostenstelle", "type": "text" }
  ]
}
```

Run the test on the two fetches.

**The column config decides the layout.** How many columns exist, how wide each one is, what order they're in. Nothing about the page's shape can be known without it. It's also small, changes rarely, and is identical for every page of results, so it's cheap to render on the server and cheap to cache.

**The rows fill it.** They're large, paginated, and different on every request, and they have no effect on the layout: they drop into columns whose widths the config already fixed.

So the config goes in the SSR pass and the rows are fetched from the client.

The rows still arrive late. The skeletons are still there. What changes is that they're already the right shape — correct number of columns, correct widths, correct headers — so when the data lands, nothing moves:

:table-hydration-demo

Both modes fetch rows on the client. That never changes, and it isn't the point. The difference is whether the skeleton is the real layout or a guess that gets corrected.

## Writing it down

The server side is `useAsyncData`. It runs during SSR, serializes the result into the payload, and the client reads it from there instead of making a second request:

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

The key is a function, not a string. `entity` and `locale` are reactive, and a static key freezes whatever they were on the first call, so every table after that reads the wrong cache entry. Anything the response varies by belongs in the key.

The `await` is load-bearing. It suspends the component during SSR until the config resolves, which is what puts the finished markup in the server response. It also means you can only call this from a setup Nuxt is allowed to suspend — a page component, or something inside `<Suspense>`. From an event handler or a `watch`, it throws.

The client side is the same request with one option flipped:

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

## Running the test on everything else

The table is one case. The question works on any fetch:

| Fetch | Decides layout? | Where |
|---|---|---|
| Table column config | Yes — column count and widths | Server |
| Table rows | No — they fill fixed columns | Client |
| Permission-filtered navigation | Yes — which sections exist | Server |
| Feature flags that hide whole sections | Yes | Server |
| Translated labels | Yes — text length sets widths | Server |
| Chart series in a fixed-height card | No | Client |
| Search results | No | Client |
| Notification count badge | No — fixed-size slot | Client |

Two of those are worth spelling out.

Translated labels count as layout. A German header is routinely half again as long as its English one, so resolving translations after hydration resizes columns, buttons and tabs. That's why the config endpoint above returns `"Umsatz"` and not a translation key.

Feature flags count as layout when they hide sections rather than swap contents. A flag that removes a sidebar changes every width on the page. A flag that swaps one button's label doesn't.

## Where the test gives the wrong answer

**The endpoint is slow.** The test assumes the thing that decides layout is cheap. If it takes 800ms, putting it in the SSR pass delays the whole document to fix a shift the user would have seen for a fraction of that. Cache it, or accept the shift. Ours answers in single-digit milliseconds; without that cache I wouldn't do it.

**Crawlers need it.** Content that has to be in the HTML for SEO goes on the server whether or not it affects layout. That's a different requirement, and it outranks this one.

**It's known at build time.** A static five-column table doesn't need a fetch at all. An array in the component gives you type inference, jump-to-definition and no network dependency for your layout. The test only applies once the answer genuinely lives on the server.

## Resources

- [Nuxt `useAsyncData`](https://nuxt.com/docs/api/composables/use-async-data) — payload serialization and cache keys
- [Nuxt data fetching](https://nuxt.com/docs/getting-started/data-fetching) — `server: false` and where requests run
- [Cumulative Layout Shift](https://web.dev/articles/cls) — what the shifts this avoids actually cost
