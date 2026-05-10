<script setup lang="ts">
const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'features', label: 'Features' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'support', label: 'Support' }
] as const

type TabId = (typeof tabs)[number]['id']

const panelContent: Record<TabId, string> = {
  overview: 'A high-level summary of the product and its core value proposition.',
  features: 'Key capabilities: keyboard navigation, screen reader support, focus management.',
  pricing: 'Free for personal use. Teams start at $9/month per seat.',
  support: 'Docs, community forum, and priority email support for paid plans.'
}

const activeTab = ref<TabId>('overview')
const focusedTab = ref<TabId>('overview')
const containerRef = ref<HTMLElement | null>(null)
const tabRefs = ref<HTMLButtonElement[]>([])

const focusedTabEl = computed(() => {
  const idx = tabs.findIndex(t => t.id === focusedTab.value)
  return tabRefs.value[idx] ?? null
})

function focusTab(id: TabId) {
  focusedTab.value = id
  const idx = tabs.findIndex(t => t.id === id)
  tabRefs.value[idx]?.focus()
}

function activateTab(id: TabId) {
  activeTab.value = id
}

function onKeydown(e: KeyboardEvent) {
  const idx = tabs.findIndex(t => t.id === focusedTab.value)
  let nextIdx: number | null = null

  switch (e.key) {
    case 'ArrowRight':
      nextIdx = (idx + 1) % tabs.length
      break
    case 'ArrowLeft':
      nextIdx = (idx - 1 + tabs.length) % tabs.length
      break
    case 'Home':
      nextIdx = 0
      break
    case 'End':
      nextIdx = tabs.length - 1
      break
    case 'Enter':
    case ' ':
      e.preventDefault()
      activateTab(focusedTab.value)
      return
    default:
      return
  }

  e.preventDefault()
  focusTab(tabs[nextIdx]!.id)
}
</script>

<template>
  <DemoWrapper
    label="Roving Tabindex"
    tag="INTERACTIVE"
    description="Arrow keys move focus between tabs. Only the active tab is in the tab order."
  >
    <div ref="containerRef">
      <div
        role="tablist"
        aria-label="Demo navigation"
        class="tablist"
        @keydown="onKeydown"
      >
        <button
          v-for="(tab, i) in tabs"
          :id="`tab-${tab.id}`"
          :key="tab.id"
          :ref="(el) => { tabRefs[i] = el as HTMLButtonElement }"
          role="tab"
          :aria-selected="activeTab === tab.id"
          :aria-controls="`panel-${tab.id}`"
          :tabindex="focusedTab === tab.id ? 0 : -1"
          class="tab"
          :class="{
            'tab--active': activeTab === tab.id,
            'tab--focused': focusedTab === tab.id
          }"
          @click="activateTab(tab.id); focusTab(tab.id)"
          @focus="focusedTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <div
        :id="`panel-${activeTab}`"
        role="tabpanel"
        :aria-labelledby="`tab-${activeTab}`"
        class="panel"
        tabindex="0"
      >
        {{ panelContent[activeTab] }}
      </div>
    </div>

    <KeyboardVisualizer :target="containerRef" />
    <AriaInspector
      :target="focusedTabEl"
      :attrs="['role', 'aria-selected', 'tabindex']"
    />
  </DemoWrapper>
</template>

<style scoped>
.tablist {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--color-ink-faint);
}

.tab {
  position: relative;
  padding: 0.5rem 1rem;
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--color-ink-muted);
  background: none;
  border: none;
  cursor: pointer;
  outline: none;
  transition: color 0.15s;
}

.tab::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: transparent;
  transition: background 0.15s;
}

.tab:hover {
  color: var(--color-ink);
}

.tab--active {
  color: var(--color-ink);
}

.tab--active::after {
  background: var(--color-accent);
}

.tab:focus-visible {
  outline: 1.5px solid var(--color-accent);
  outline-offset: -1.5px;
}

.panel {
  padding: 1rem 0.25rem;
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  color: var(--color-ink-muted);
  min-height: 3rem;
  outline: none;
}

.panel:focus-visible {
  outline: 1.5px solid var(--color-ink-faint);
  outline-offset: 2px;
}
</style>
