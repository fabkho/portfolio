<script setup lang="ts">
interface Column {
  key: string
  header: string
  width: number
  align?: 'right'
}

const COLUMNS: Column[] = [
  { key: 'customer', header: 'Customer', width: 165 },
  { key: 'service', header: 'Service', width: 140 },
  { key: 'date', header: 'Date', width: 125 },
  { key: 'status', header: 'Status', width: 95 },
  { key: 'total', header: 'Total', width: 85, align: 'right' }
]

const ROWS = [
  { customer: 'Marta Feld', service: 'Studio A', date: '12 Aug, 09:00', status: 'Confirmed', total: '120.00' },
  { customer: 'Jonas Weiler', service: 'Meeting Room 2', date: '12 Aug, 11:30', status: 'Pending', total: '45.00' },
  { customer: 'Aylin Kaya', service: 'Studio A', date: '12 Aug, 14:00', status: 'Confirmed', total: '120.00' },
  { customer: 'Petra Lang', service: 'Workshop Bay', date: '13 Aug, 08:00', status: 'Cancelled', total: '0.00' }
]

const VIEWS = ['All bookings', 'Today', 'Awaiting payment']
const ACTIVE_VIEW = 'Today'

// Real-world numbers are ~40ms/220ms; stretched so the reflow is watchable.
const TIMELINE = [
  { at: 0, key: 'html', label: 'HTML painted' },
  { at: 900, key: 'hydrated', label: 'Hydrated' },
  { at: 1800, key: 'config', label: 'Config response' },
  { at: 2400, key: 'done', label: 'Interactive' }
] as const

type Phase = (typeof TIMELINE)[number]['key']

const DURATION: number = TIMELINE[TIMELINE.length - 1]!.at

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

const phase = computed<Phase>(() => {
  let current: Phase = 'html'
  for (const step of TIMELINE) {
    if (elapsed.value >= step.at) current = step.key
  }
  return current
})

// ─── What the browser can show at each phase ───

/**
 * The client-fetched table has no column list until its request resolves, so
 * everything downstream of the catalog — widths, view tabs, filters — is blank
 * too. The server-driven one ships all of it inside the same HTML document.
 */
const hasConfig = computed(() =>
  mode.value === 'server' || phase.value === 'config' || phase.value === 'done'
)

const shiftCount = computed(() => (mode.value === 'server' ? 0 : 1))

const progress = computed(() => (elapsed.value / DURATION) * 100)
</script>

<template>
  <DemoWrapper
    label="Hydration timeline"
    :tag="mode === 'server' ? 'server-driven' : 'client-fetched'"
    description="Same table, same data. The only difference is where the column config is resolved."
  >
    <div class="hydration">
      <div class="hydration__controls">
        <div
          class="hydration__modes"
          role="radiogroup"
          aria-label="Config source"
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
            {{ option === 'client' ? 'Client fetch' : 'Server-driven' }}
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

      <div class="hydration__timeline">
        <div
          class="hydration__track"
          :style="{ '--progress': `${progress}%` }"
        >
          <span
            v-for="step in TIMELINE"
            :key="step.key"
            class="hydration__marker"
            :class="{
              'hydration__marker--reached': elapsed >= step.at,
              'hydration__marker--payoff': step.key === 'config' && mode === 'client'
            }"
            :style="{ left: `${(step.at / DURATION) * 100}%` }"
          >
            <span class="hydration__marker-label">{{ step.label }}</span>
          </span>
        </div>
      </div>

      <div class="hydration__viewport">
        <div
          v-if="hasConfig"
          class="hydration__chrome"
        >
          <div class="hydration__views">
            <span
              v-for="view in VIEWS"
              :key="view"
              class="hydration__view"
              :class="{ 'hydration__view--active': view === ACTIVE_VIEW }"
            >{{ view }}</span>
          </div>
          <span class="hydration__filter">status: confirmed, pending</span>
        </div>
        <div
          v-else
          class="hydration__chrome hydration__chrome--empty"
        >
          <span class="hydration__skeleton hydration__skeleton--chrome" />
        </div>

        <table
          class="hydration__table"
          :class="{ 'hydration__table--static': prefersReduced }"
        >
          <caption class="hydration__caption">
            Bookings — {{ hasConfig ? 'rendered from config' : 'waiting for column config' }}
          </caption>
          <colgroup>
            <col
              v-for="column in COLUMNS"
              :key="column.key"
              :style="{ width: hasConfig ? `${column.width}px` : `${100 / COLUMNS.length}%` }"
            >
          </colgroup>
          <thead>
            <tr>
              <th
                v-for="column in COLUMNS"
                :key="column.key"
                scope="col"
                :class="{ 'hydration__cell--right': column.align === 'right' }"
              >
                <template v-if="hasConfig">
                  {{ column.header }}
                </template>
                <span
                  v-else
                  class="hydration__skeleton"
                />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, index) in ROWS"
              :key="index"
            >
              <td
                v-for="column in COLUMNS"
                :key="column.key"
                :class="{ 'hydration__cell--right': column.align === 'right' }"
              >
                <template v-if="hasConfig">
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
        <span class="hydration__verdict-count">{{ shiftCount }}</span>
        {{ shiftCount === 1 ? 'layout shift' : 'layout shifts' }} —
        {{ mode === 'server'
          ? 'the first paint is the final paint'
          : 'columns, widths and view tabs all arrive after hydration' }}
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
  margin-bottom: 1.25rem;
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

.hydration__timeline {
  /* Inset so the first and last marker labels stay inside the demo box. */
  margin: 0 3.5rem 2.5rem;
}

.hydration__track {
  position: relative;
  height: 2px;
  background: var(--color-ink-faint);
}

.hydration__track::after {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: var(--progress);
  background: var(--color-accent);
}

.hydration__marker {
  position: absolute;
  top: -3px;
  width: 8px;
  height: 8px;
  margin-left: -4px;
  border-radius: 50%;
  background: var(--color-bg);
  border: 1px solid var(--color-ink-faint);
}

.hydration__marker--reached {
  background: var(--color-ink);
  border-color: var(--color-ink);
}

.hydration__marker--payoff.hydration__marker--reached {
  background: var(--color-accent);
  border-color: var(--color-accent);
}

.hydration__marker-label {
  position: absolute;
  top: 12px;
  left: 0;
  transform: translateX(-50%);
  white-space: nowrap;
  font-size: var(--text-2xs);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-ink-muted);
}

.hydration__marker:first-child .hydration__marker-label {
  transform: translateX(-35%);
}

.hydration__marker:last-child .hydration__marker-label {
  transform: translateX(-65%);
}

.hydration__viewport {
  border: 1px solid var(--color-ink-faint);
  overflow-x: auto;
}

.hydration__chrome {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--color-ink-faint);
  min-height: 2.25rem;
}

.hydration__views {
  display: flex;
  gap: 1rem;
}

.hydration__view {
  font-size: var(--text-xs);
  color: var(--color-ink-muted);
  padding-bottom: 2px;
  border-bottom: 2px solid transparent;
}

.hydration__view--active {
  color: var(--color-ink);
  border-bottom-color: var(--color-accent);
}

.hydration__filter {
  font-size: var(--text-2xs);
  color: var(--color-accent);
  border: 1px solid var(--color-accent-faint);
  padding: 0.1rem 0.4rem;
}

.hydration__table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  min-width: 610px;
  margin: 0;
  font-family: var(--font-mono);
}

.hydration__caption {
  caption-side: top;
  text-align: left;
  padding: 0.5rem 0.75rem;
  font-size: var(--text-2xs);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-ink-muted);
}

.hydration__table col {
  transition: width 0.35s ease;
}

.hydration__table--static col {
  transition: none;
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

.hydration__skeleton--chrome {
  width: 40%;
}

.hydration__verdict {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin: 1rem 0 0;
  font-size: var(--text-xs);
  color: var(--color-ink-muted);
}

.hydration__verdict-count {
  font-size: var(--text-lg);
  color: var(--color-accent);
}
</style>
