<script setup lang="ts">
interface Column {
  key: string
  header: string
  width: number
  align?: 'right'
}

/** What the bundle falls back to when it has to render before the config lands. */
const GUESSED_COLUMNS: Column[] = [
  { key: 'customer', header: 'Customer', width: 0 },
  { key: 'service', header: 'Service', width: 0 },
  { key: 'date', header: 'Date', width: 0 },
  { key: 'status', header: 'Status', width: 0 },
  { key: 'total', header: 'Total', width: 0 }
]

/** What this tenant's config actually says: no service column, total moved up. */
const CONFIGURED_COLUMNS: Column[] = [
  { key: 'customer', header: 'Customer', width: 200 },
  { key: 'total', header: 'Total', width: 110, align: 'right' },
  { key: 'date', header: 'Date', width: 130 },
  { key: 'status', header: 'Status', width: 100 }
]

const ROWS = [
  { customer: 'Marta Feld', service: 'Studio A', date: '12 Aug, 09:00', status: 'Confirmed', total: '120.00' },
  { customer: 'Jonas Weiler', service: 'Meeting Room 2', date: '12 Aug, 11:30', status: 'Pending', total: '45.00' },
  { customer: 'Aylin Kaya', service: 'Studio A', date: '12 Aug, 14:00', status: 'Confirmed', total: '120.00' },
  { customer: 'Petra Lang', service: 'Workshop Bay', date: '13 Aug, 08:00', status: 'Cancelled', total: '0.00' }
]

// Stretched from real numbers (~40ms / ~220ms) so the reflow is watchable.
const FIRST_PAINT = 0
const CONFIG_ARRIVES = 1200
const ROWS_ARRIVE = 2000
const DURATION = 2400

const reducedMotion = usePreferredReducedMotion()
const prefersReduced = computed(() => reducedMotion.value === 'reduce')

// ─── Playback ───

const mode = ref<'client' | 'server'>('client')
const elapsed = ref(DURATION)
const isPlaying = ref(false)

let frame = 0
let startedAt = 0

function tick(now: number) {
  elapsed.value = Math.min(now - startedAt, DURATION)
  if (elapsed.value < DURATION) {
    frame = requestAnimationFrame(tick)
    return
  }
  isPlaying.value = false
}

function replay() {
  cancelAnimationFrame(frame)
  if (prefersReduced.value) {
    elapsed.value = DURATION
    isPlaying.value = false
    return
  }
  elapsed.value = 0
  isPlaying.value = true
  startedAt = performance.now()
  frame = requestAnimationFrame(tick)
}

function selectMode(next: 'client' | 'server') {
  mode.value = next
  replay()
}

onBeforeUnmount(() => cancelAnimationFrame(frame))

// ─── The two things a table waits for ───

/**
 * Structure is columns, widths and order. Server-driven, it is part of the HTML
 * document, so it is ready before the browser paints anything. Rows are fetched
 * from the client either way — that never changes.
 */
const structureReadyAt = computed(() => (mode.value === 'server' ? FIRST_PAINT : CONFIG_ARRIVES))

const hasStructure = computed(() => elapsed.value >= structureReadyAt.value)
const hasRows = computed(() => elapsed.value >= ROWS_ARRIVE)

const columns = computed(() => (hasStructure.value ? CONFIGURED_COLUMNS : GUESSED_COLUMNS))

const progress = computed(() => (elapsed.value / DURATION) * 100)

function percent(ms: number) {
  return (ms / DURATION) * 100
}

const BARS = computed(() => [
  {
    key: 'structure',
    label: 'Structure',
    detail: 'columns · widths · order',
    readyAt: structureReadyAt.value,
    ready: hasStructure.value
  },
  {
    key: 'rows',
    label: 'Rows',
    detail: 'always fetched on the client',
    readyAt: ROWS_ARRIVE,
    ready: hasRows.value
  }
])
</script>

<template>
  <DemoWrapper
    label="What the browser is waiting for"
    :tag="mode === 'server' ? 'server-driven' : 'client-fetched'"
    description="Rows load on the client in both modes. The question is whether the table's structure is settled before they arrive."
  >
    <div class="hydration">
      <div class="hydration__controls">
        <div
          class="hydration__modes"
          role="radiogroup"
          aria-label="Where the table config is resolved"
        >
          <button
            v-for="option in (['client', 'server'] as const)"
            :key="option"
            type="button"
            role="radio"
            :aria-checked="mode === option"
            class="hydration__mode"
            :class="{ 'hydration__mode--active': mode === option }"
            @click="selectMode(option)"
          >
            {{ option === 'client' ? 'Config on client' : 'Config on server' }}
          </button>
        </div>

        <button
          type="button"
          class="hydration__replay"
          @click="replay"
        >
          {{ isPlaying ? 'Playing…' : 'Replay' }}
        </button>
      </div>

      <div class="hydration__bars">
        <div
          v-for="bar in BARS"
          :key="bar.key"
          class="hydration__bar"
        >
          <span class="hydration__bar-label">
            {{ bar.label }}
            <em>{{ bar.detail }}</em>
          </span>
          <div class="hydration__track">
            <span
              class="hydration__pending"
              :style="{ width: `${Math.min(progress, percent(bar.readyAt))}%` }"
            />
            <span
              class="hydration__ready"
              :style="{
                left: `${percent(bar.readyAt)}%`,
                width: `${Math.max(0, progress - percent(bar.readyAt))}%`
              }"
            />
          </div>
          <span
            class="hydration__bar-state"
            :class="{ 'hydration__bar-state--ready': bar.ready }"
          >{{ bar.ready ? 'ready' : 'waiting' }}</span>
        </div>

        <p class="hydration__axis">
          <span :style="{ left: '0%' }">First paint</span>
          <span
            v-if="mode === 'client'"
            :style="{ left: `${percent(CONFIG_ARRIVES)}%` }"
          >Config</span>
          <span :style="{ left: `${percent(ROWS_ARRIVE)}%` }">Rows</span>
        </p>
      </div>

      <div class="hydration__viewport">
        <table class="hydration__table">
          <colgroup>
            <col
              v-for="column in columns"
              :key="column.key"
              :style="{ width: hasStructure ? `${column.width}px` : `${100 / columns.length}%` }"
            >
          </colgroup>
          <thead>
            <tr>
              <th
                v-for="column in columns"
                :key="column.key"
                scope="col"
                :class="{ 'hydration__cell--right': column.align === 'right' }"
              >
                {{ column.header }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, index) in ROWS"
              :key="index"
            >
              <td
                v-for="column in columns"
                :key="column.key"
                :class="{ 'hydration__cell--right': column.align === 'right' }"
              >
                <template v-if="hasRows">
                  <span
                    v-if="column.key === 'status'"
                    class="hydration__status"
                    :class="`hydration__status--${row.status.toLowerCase()}`"
                  >{{ row.status }}</span>
                  <template v-else-if="column.key === 'total'">
                    €{{ row.total }}
                  </template>
                  <template v-else>
                    {{ row[column.key as keyof typeof row] }}
                  </template>
                </template>
                <span
                  v-else
                  class="hydration__skeleton"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p
        class="hydration__verdict"
        aria-live="polite"
      >
        <template v-if="mode === 'server'">
          <span class="hydration__verdict-count">0</span>
          layout shifts — the skeleton rows sit in the real columns, so the data
          drops into a table that never moves.
        </template>
        <template v-else>
          <span class="hydration__verdict-count">1</span>
          layout shift — the bundle guesses five even columns. The config drops
          Service, moves Total up and resets every width, before a single row exists.
        </template>
      </p>
    </div>
  </DemoWrapper>
</template>

<style scoped>
.hydration {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
}

.hydration__controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.hydration__modes {
  display: flex;
  border: 1px solid var(--color-ink-faint);
}

.hydration__mode,
.hydration__replay {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 0.35rem 0.75rem;
  background: none;
  border: none;
  color: var(--color-ink-muted);
  cursor: pointer;
}

.hydration__mode + .hydration__mode {
  border-left: 1px solid var(--color-ink-faint);
}

.hydration__mode--active {
  background: var(--color-ink);
  color: var(--color-bg);
}

.hydration__replay {
  border: 1px solid var(--color-accent-faint);
  color: var(--color-accent);
}

.hydration__bars {
  margin-bottom: 2rem;
}

.hydration__bar {
  display: grid;
  grid-template-columns: 13rem minmax(0, 1fr) 4.5rem;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.hydration__bar-label {
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  line-height: 1.3;
}

.hydration__bar-label em {
  display: block;
  font-style: normal;
  font-size: var(--text-2xs);
  text-transform: none;
  letter-spacing: 0;
  color: var(--color-ink-muted);
}

.hydration__track {
  position: relative;
  height: 10px;
  background: rgba(44, 44, 42, 0.06);
  overflow: hidden;
}

.hydration__pending {
  position: absolute;
  inset: 0 auto 0 0;
  background-image: repeating-linear-gradient(
    -45deg,
    rgba(44, 44, 42, 0.22) 0 3px,
    transparent 3px 7px
  );
}

.hydration__ready {
  position: absolute;
  top: 0;
  bottom: 0;
  background: var(--color-accent);
}

.hydration__bar-state {
  font-size: var(--text-2xs);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-ink-muted);
}

.hydration__bar-state--ready {
  color: var(--color-accent);
}

.hydration__axis {
  position: relative;
  height: 1rem;
  margin: 0.25rem 0 0 13.75rem;
  padding-right: 5.25rem;
}

.hydration__axis span {
  position: absolute;
  top: 0;
  transform: translateX(-50%);
  white-space: nowrap;
  font-size: var(--text-2xs);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-ink-muted);
}

.hydration__axis span:first-child {
  transform: none;
}

.hydration__viewport {
  border: 1px solid var(--color-ink-faint);
  overflow-x: auto;
}

.hydration__table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  min-width: 610px;
  margin: 0;
  font-family: var(--font-mono);
}

/* Doubled class selectors: the article's prose `:deep(th)` / `:deep(td)` rules
   otherwise win on equal specificity and repaint the header bar. */
.hydration .hydration__table th,
.hydration .hydration__table td {
  text-align: left;
  padding: 0.45rem 0.75rem;
  border-bottom: 1px solid rgba(44, 44, 42, 0.12);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: none;
}

.hydration .hydration__table th {
  font-size: var(--text-2xs);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-ink-muted);
  font-weight: 600;
}

.hydration__cell--right {
  text-align: right;
}

.hydration__status {
  font-size: var(--text-2xs);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.hydration__status--confirmed {
  color: var(--color-ink);
}

.hydration__status--pending {
  color: var(--color-accent);
}

.hydration__status--cancelled {
  color: var(--color-ink-faint);
}

.hydration__skeleton {
  display: block;
  height: 0.7rem;
  background: rgba(44, 44, 42, 0.12);
}

.hydration__verdict {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin: 1rem 0 0;
  font-size: var(--text-xs);
  line-height: 1.6;
  color: var(--color-ink-muted);
  max-width: 62ch;
}

.hydration__verdict-count {
  font-size: var(--text-lg);
  color: var(--color-accent);
}
</style>
