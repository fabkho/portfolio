---
tag: "ARCHITECTURE"
title: "Server-Driven Tables: Config That Arrives With the HTML"
description: "Moving table column definitions into the backend, and why fetching them during SSR removes the post-hydration reflow entirely."
date: "2026-08-15"
author: "Fabian Kirchhoff"
specs: ["NUXT", "VUE", "SSR", "TYPESCRIPT"]
status: published
featured: false
---

# Server-Driven Tables: Config That Arrives With the HTML

Every admin table I've built started the same way: a `columns` array in the frontend, hand-written per page.

```typescript
const columns = [
  { key: 'customer', header: 'Customer', width: 180 },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'total', header: 'Total', type: 'currency', align: 'right' }
]
```

That works until the columns stop being knowable at build time. Ours stopped for three reasons at once: organizations define their own custom fields, bookable add-ons vary per organization, and users save views that pin a column order, widths and a filter set. None of that exists in the bundle. All of it is per-tenant data.

So I moved the column catalog to the backend. One endpoint per entity returns every column that tenant can render, already localized:

```
GET /ui/admin/table-config/bookings
```

```json
{
  "entityType": "bookings",
  "columns": [
    { "key": "customer", "header": "Customer", "type": "text", "sortable": true,
      "cell": { "component": "customer" } },
    { "key": "total", "header": "Umsatz", "type": "currency", "align": "right",
      "cell": { "component": "currency", "props": { "currency": "EUR" } } },
    { "key": "customFields.cost_center", "header": "Kostenstelle", "type": "text",
      "cell": { "component": "custom-field", "props": { "fieldId": "cf_8812" } } }
  ]
}
```

The interesting part isn't the endpoint. It's what happens when you fetch it during SSR.

## The reflow you stop paying for

A client-fetched catalog puts the table's entire shape behind a request that starts after hydration. Until it resolves the browser has nothing to render — not the headers, not the widths, not the view tabs, not the active filter chips. Everything downstream of the catalog is blank, then all of it appears at once.

Fetch the same catalog on the server and the HTML that leaves the server already contains the final table: right columns, right order, right widths, correct view tab underlined, filter chips rendered. Hydration attaches listeners to markup that never moves.

:table-hydration-demo

The second mode has no "loading columns" state because there is no moment where the columns are unknown. That's a category difference, not a speed difference — no amount of tuning the client request produces it.

## Fetching it in the right place

`useAsyncData` is what makes this work. It runs during SSR, serializes the result into the Nuxt payload, and the client picks it up without a second request:

```typescript
export async function useTableConfig(entityType: MaybeRefOrGetter<TableConfigEntityType>) {
  const jsonApiService = useJsonApiService()
  const { locale } = useI18n()
  const { authenticatedOrganization } = useAuth()

  const { data } = await useAsyncData<TableConfigResponse>(
    () => `table-config-${toValue(entityType)}-${authenticatedOrganization.value.id}-${locale.value}`,
    async () => {
      const { data } = await new QueryBuilder('', jsonApiService.getClient(Booking), jsonApiService)
        .request(`ui/admin/table-config/${toValue(entityType)}`, 'GET')
      return data
    }
  )

  const columns = computed<TableColumnDefinition[]>(() =>
    (data.value?.columns ?? []).map(toTableColumnDefinition)
  )

  return { columns }
}
```

Two details in there cost me real debugging time.

The **cache key includes the organization id**. Switching organization is an SPA navigation, and Nuxt never clears payload data across those. With a key of just `table-config-bookings-de`, the second organization silently renders the first one's custom-field columns until a hard reload.

The **key is a function, not a string**. `entityType` and `locale` are reactive; a static key freezes the first value and every subsequent entity reads the wrong cache entry.

The `await` is load-bearing. It suspends the component during SSR until the config resolves, which is what puts the final markup in the server response. It also means the composable can only be called from a setup that Nuxt is allowed to suspend — inside `<Suspense>`, or a page component. Calling it from an event handler or a `watch` throws.

## Rows are a separate problem

Config and data have different SSR economics. The catalog is small, cacheable per tenant and locale, and cheap to render. A page of bookings is neither.

We SSR the config and let the rows stream in on the client. Skeleton rows still appear — but they appear inside correctly sized columns, so nothing reflows when the real data lands. The layout is settled before the data exists:

```vue
<OrmTable
  :columns="columns"
  :collection="bookings"
  :is-loading="bookings.isLoading"
/>
```

Splitting it this way is the whole trick. Shape from the server, contents from the client.

## Views are just config on top of the catalog

A saved view doesn't store columns. It stores a config object that references catalog keys:

```typescript
interface TableViewConfig {
  sort: { column: string, direction: 'asc' | 'desc' }[]
  columnWidths: Record<string, number>
  columnOrder: string[]
  columnVisibility: Record<string, boolean>
}
```

That indirection is what makes views survive schema changes. A view can't reference a column the catalog no longer exposes, so a removed custom field degrades to "column missing from this view" instead of a render crash.

Applying a view is pure state — no request:

:view-config-demo

Views come down in the same SSR pass as the catalog, which is why the correct tab is already underlined on first paint rather than snapping into place a moment later.

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

It also costs a round trip on the server. If the config endpoint is slow, you've moved the delay from "table appears late" to "page appears late", which is usually worse. Ours is cached per tenant and locale and answers in single-digit milliseconds; without that cache I wouldn't do it.

And it moves presentation decisions into backend code. Deciding that "Total" is right-aligned now happens in a PHP class. That's a real cost, paid deliberately — the alternative was two sources of truth for the same column, and the export pipeline drifting out of sync with the table was how that cost got paid instead.

## Resources

- [Nuxt `useAsyncData`](https://nuxt.com/docs/api/composables/use-async-data) — payload serialization and cache keys
- [Nuxt data fetching](https://nuxt.com/docs/getting-started/data-fetching) — when requests run on server vs client
- [TanStack Table](https://tanstack.com/table/latest) — if you want the headless engine rather than a config protocol
