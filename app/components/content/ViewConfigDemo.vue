<script setup lang="ts">
interface CatalogColumn {
  key: string
  header: string
  type: 'text' | 'date' | 'currency' | 'badge'
  align?: 'right'
}

/** The backend catalog: every column this entity can render, for this org, in this locale. */
const CATALOG: CatalogColumn[] = [
  { key: 'reference', header: 'Ref', type: 'text' },
  { key: 'customer', header: 'Customer', type: 'text' },
  { key: 'service', header: 'Service', type: 'text' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'status', header: 'Status', type: 'badge' },
  { key: 'total', header: 'Total', type: 'currency', align: 'right' }
]

interface ViewConfig {
  sort: { column: string, direction: 'asc' | 'desc' }[]
  columnOrder: string[]
  columnWidths: Record<string, number>
  columnVisibility: Record<string, boolean>
}

interface SavedView {
  id: string
  name: string
  filter: Record<string, string>
  config: ViewConfig
}

const VIEWS: SavedView[] = [
  {
    id: 'all',
    name: 'All bookings',
    filter: {},
    config: {
      sort: [{ column: 'date', direction: 'asc' }],
      columnOrder: ['customer', 'service', 'date', 'status', 'total'],
      columnWidths: { customer: 180, service: 150, date: 130, status: 100, total: 90 },
      columnVisibility: { reference: false }
    }
  },
  {
    id: 'today',
    name: 'Today',
    filter: { date: '2026-08-12' },
    config: {
      sort: [{ column: 'date', direction: 'asc' }],
      columnOrder: ['customer', 'service', 'date', 'status'],
      columnWidths: { customer: 220, service: 200, date: 130, status: 110 },
      columnVisibility: { reference: false, total: false }
    }
  },
  {
    id: 'unpaid',
    name: 'Awaiting payment',
    filter: { status: 'Pending' },
    config: {
      sort: [{ column: 'total', direction: 'desc' }],
      columnOrder: ['reference', 'customer', 'total', 'date', 'status'],
      columnWidths: { reference: 90, customer: 200, total: 120, date: 130, status: 110 },
      columnVisibility: {}
    }
  }
]

interface Row {
  reference: string
  customer: string
  service: string
  date: string
  status: string
  total: number
}

const ROWS: Row[] = [
  { reference: 'B-1041', customer: 'Marta Feld', service: 'Studio A', date: '2026-08-12', status: 'Confirmed', total: 120 },
  { reference: 'B-1042', customer: 'Jonas Weiler', service: 'Meeting Room 2', date: '2026-08-12', status: 'Pending', total: 45 },
  { reference: 'B-1043', customer: 'Aylin Kaya', service: 'Studio A', date: '2026-08-12', status: 'Confirmed', total: 120 },
  { reference: 'B-1044', customer: 'Petra Lang', service: 'Workshop Bay', date: '2026-08-13', status: 'Pending', total: 310 },
  { reference: 'B-1045', customer: 'Deniz Aydın', service: 'Meeting Room 1', date: '2026-08-14', status: 'Pending', total: 75 }
]

// ─── Applying a view ───

const activeViewId = ref(VIEWS[0]!.id)
const activeView = computed(() => VIEWS.find(v => v.id === activeViewId.value)!)

const catalogByKey = new Map(CATALOG.map(column => [column.key, column]))

const columns = computed(() => {
  const { columnOrder, columnVisibility, columnWidths } = activeView.value.config
  return columnOrder
    .filter(key => columnVisibility[key] !== false)
    .map(key => ({ ...catalogByKey.get(key)!, width: columnWidths[key] ?? 150 }))
})

const rows = computed(() => {
  const { filter, config } = activeView.value
  const filtered = ROWS.filter(row =>
    Object.entries(filter).every(([key, value]) => String(row[key as keyof Row]) === value)
  )

  const [primary] = config.sort
  if (!primary) return filtered

  const direction = primary.direction === 'asc' ? 1 : -1
  return [...filtered].sort((a, b) => {
    const left = a[primary.column as keyof Row]
    const right = b[primary.column as keyof Row]
    if (left === right) return 0
    return (left > right ? 1 : -1) * direction
  })
})

const configJson = computed(() =>
  JSON.stringify({ filter: activeView.value.filter, config: activeView.value.config }, null, 2)
)

function formatCell(row: Row, column: CatalogColumn): string {
  if (column.type === 'currency') return `€${row.total.toFixed(2)}`
  if (column.type === 'date') {
    return new Date(row.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
  }
  return String(row[column.key as keyof Row])
}
</script>

<template>
  <DemoWrapper
    label="View config"
    tag="zero requests"
    description="One catalog, three saved views. Switching views applies a config object — no column is refetched."
  >
    <div class="viewconfig">
      <div
        class="viewconfig__tabs"
        role="tablist"
        aria-label="Saved views"
      >
        <button
          v-for="view in VIEWS"
          :key="view.id"
          type="button"
          role="tab"
          :aria-selected="view.id === activeViewId"
          class="viewconfig__tab"
          :class="{ 'viewconfig__tab--active': view.id === activeViewId }"
          @click="activeViewId = view.id"
        >
          {{ view.name }}
        </button>
      </div>

      <div class="viewconfig__split">
        <div class="viewconfig__table-pane">
          <table class="viewconfig__table">
            <colgroup>
              <col
                v-for="column in columns"
                :key="column.key"
                :style="{ width: `${column.width}px` }"
              >
            </colgroup>
            <thead>
              <tr>
                <th
                  v-for="column in columns"
                  :key="column.key"
                  scope="col"
                  :class="{ 'viewconfig__cell--right': column.align === 'right' }"
                >
                  {{ column.header }}
                  <span
                    v-if="activeView.config.sort[0]?.column === column.key"
                    class="viewconfig__sort"
                  >{{ activeView.config.sort[0]!.direction === 'asc' ? '↑' : '↓' }}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in rows"
                :key="row.reference"
              >
                <td
                  v-for="column in columns"
                  :key="column.key"
                  :class="{ 'viewconfig__cell--right': column.align === 'right' }"
                >
                  <span
                    v-if="column.type === 'badge'"
                    class="viewconfig__status"
                    :class="`viewconfig__status--${row.status.toLowerCase()}`"
                  >{{ row.status }}</span>
                  <template v-else>
                    {{ formatCell(row, column) }}
                  </template>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <pre class="viewconfig__json"><code>{{ configJson }}</code></pre>
      </div>

      <p class="viewconfig__hint">
        Column keys reference the catalog. Anything the catalog does not expose
        cannot be persisted into a view — which is what keeps saved views valid
        after a schema change.
      </p>
    </div>
  </DemoWrapper>
</template>

<style scoped>
.viewconfig {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
}

.viewconfig__tabs {
  display: flex;
  gap: 1.25rem;
  border-bottom: 1px solid var(--color-ink-faint);
  margin-bottom: 1.25rem;
}

.viewconfig__tab {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  padding: 0 0 0.4rem;
  margin-bottom: -1px;
  color: var(--color-ink-muted);
  cursor: pointer;
}

.viewconfig__tab--active {
  color: var(--color-ink);
  border-bottom-color: var(--color-accent);
}

.viewconfig__split {
  display: grid;
  gap: 1rem;
}

.viewconfig__table-pane {
  border: 1px solid var(--color-ink-faint);
  overflow-x: auto;
}

.viewconfig__table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  min-width: 560px;
  margin: 0;
  font-family: var(--font-mono);
}

/* Doubled class selectors: the article's prose `:deep(th)` / `:deep(td)` rules
   otherwise win on equal specificity and repaint the header bar. */
.viewconfig .viewconfig__table th,
.viewconfig .viewconfig__table td {
  text-align: left;
  padding: 0.45rem 0.7rem;
  border-bottom: 1px solid rgba(44, 44, 42, 0.12);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: none;
}

.viewconfig .viewconfig__table th {
  font-size: var(--text-2xs);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-ink-muted);
  font-weight: 600;
}

.viewconfig__cell--right {
  text-align: right;
}

.viewconfig__sort {
  color: var(--color-accent);
}

.viewconfig__status {
  font-size: var(--text-2xs);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.viewconfig__status--confirmed {
  color: var(--color-ink);
}

.viewconfig__status--pending {
  color: var(--color-accent);
}

/* Doubled class: the article's prose `:deep(pre)` sets 1.5rem padding and a
   larger font, which turns this side panel into a wall of code. */
.viewconfig .viewconfig__json {
  margin: 0;
  padding: 0.75rem 1rem;
  background: var(--color-code-bg);
  color: #e6edf3;
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  line-height: 1.5;
  max-height: 260px;
  overflow: auto;
}

.viewconfig .viewconfig__json code {
  font-size: inherit;
  background: none;
  border: none;
  padding: 0;
}

.viewconfig__hint {
  margin: 1rem 0 0;
  font-size: var(--text-xs);
  color: var(--color-ink-muted);
  max-width: 60ch;
}
</style>
