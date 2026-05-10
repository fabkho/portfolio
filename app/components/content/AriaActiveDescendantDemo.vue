<script setup lang="ts">
const cities = [
  { id: 'option-amsterdam', label: 'Amsterdam' },
  { id: 'option-berlin', label: 'Berlin' },
  { id: 'option-copenhagen', label: 'Copenhagen' },
  { id: 'option-dublin', label: 'Dublin' },
  { id: 'option-edinburgh', label: 'Edinburgh' },
  { id: 'option-florence', label: 'Florence' }
]

const containerRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
const listboxRef = ref<HTMLUListElement | null>(null)

const query = ref('')
const activeIndex = ref(0)
const selectedId = ref<string | null>(null)

const filtered = computed(() => {
  const q = query.value.toLowerCase().trim()
  if (!q) return cities
  return cities.filter(c => c.label.toLowerCase().includes(q))
})

const activeDescendant = computed(() => {
  const item = filtered.value[activeIndex.value]
  return item?.id ?? undefined
})

function _clampIndex() {
  if (filtered.value.length === 0) {
    activeIndex.value = 0
    return
  }
  if (activeIndex.value >= filtered.value.length) {
    activeIndex.value = filtered.value.length - 1
  }
  if (activeIndex.value < 0) {
    activeIndex.value = 0
  }
}

watch(filtered, () => {
  activeIndex.value = 0
})

function scrollActiveIntoView() {
  const id = activeDescendant.value
  if (!id || !listboxRef.value) return
  const el = listboxRef.value.querySelector(`#${id}`)
  el?.scrollIntoView({ block: 'nearest' })
}

function onKeydown(e: KeyboardEvent) {
  const len = filtered.value.length
  if (len === 0) return

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      activeIndex.value = (activeIndex.value + 1) % len
      nextTick(scrollActiveIntoView)
      break
    case 'ArrowUp':
      e.preventDefault()
      activeIndex.value = (activeIndex.value - 1 + len) % len
      nextTick(scrollActiveIntoView)
      break
    case 'Home':
      e.preventDefault()
      activeIndex.value = 0
      nextTick(scrollActiveIntoView)
      break
    case 'End':
      e.preventDefault()
      activeIndex.value = len - 1
      nextTick(scrollActiveIntoView)
      break
    case 'Enter':
      e.preventDefault()
      selectCurrent()
      break
  }
}

function selectCurrent() {
  const item = filtered.value[activeIndex.value]
  if (!item) return
  selectedId.value = item.id
  query.value = item.label
}
</script>

<template>
  <DemoWrapper
    label="aria-activedescendant"
    tag="INTERACTIVE"
    description="Focus stays on the input. Arrow keys change which option is announced to screen readers."
  >
    <div
      ref="containerRef"
      class="combobox-container"
    >
      <input
        ref="inputRef"
        v-model="query"
        role="combobox"
        aria-expanded="true"
        aria-controls="aad-listbox"
        aria-autocomplete="list"
        :aria-activedescendant="activeDescendant"
        placeholder="Search a city…"
        class="combobox-input"
        @keydown="onKeydown"
      >

      <ul
        id="aad-listbox"
        ref="listboxRef"
        role="listbox"
        aria-label="Cities"
        class="listbox"
      >
        <li
          v-for="(option, i) in filtered"
          :id="option.id"
          :key="option.id"
          role="option"
          :aria-selected="i === activeIndex"
          :class="['listbox-option', { active: i === activeIndex, selected: selectedId === option.id }]"
          @pointerenter="activeIndex = i"
          @click="activeIndex = i; selectCurrent(); inputRef?.focus()"
        >
          <span class="option-label">{{ option.label }}</span>
          <span
            v-if="selectedId === option.id"
            class="checkmark"
            aria-hidden="true"
          >✓</span>
        </li>
        <li
          v-if="filtered.length === 0"
          class="listbox-empty"
          role="presentation"
        >
          No results
        </li>
      </ul>
    </div>

    <KeyboardVisualizer :target="containerRef" />
    <AriaInspector
      :target="inputRef"
      :attrs="['role', 'aria-activedescendant', 'aria-expanded', 'aria-controls']"
    />
  </DemoWrapper>
</template>

<style scoped>
.combobox-container {
  display: flex;
  flex-direction: column;
  gap: 0;
  font-family: var(--font-sans);
  width: 100%;
  max-width: 280px;
}

.combobox-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
  font-family: var(--font-sans);
  color: var(--color-ink);
  background: var(--color-bg);
  border: 1px solid var(--color-ink-faint);
  border-radius: 6px 6px 0 0;
  outline: none;
  transition: border-color 0.15s;
}

.combobox-input:focus {
  border-color: var(--color-accent);
}

.combobox-input::placeholder {
  color: var(--color-ink-muted);
}

.listbox {
  list-style: none;
  margin: 0;
  padding: 0;
  border: 1px solid var(--color-ink-faint);
  border-top: none;
  border-radius: 0 0 6px 6px;
  max-height: 180px;
  overflow-y: auto;
  background: var(--color-bg);
}

.listbox-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.45rem 0.75rem;
  font-size: 0.875rem;
  color: var(--color-ink);
  cursor: default;
  transition: background 0.1s;
}

.listbox-option.active {
  background: rgba(from var(--color-accent) r g b / 0.15);
}

.listbox-option.selected .option-label {
  font-weight: 600;
}

.checkmark {
  color: var(--color-accent);
  font-size: 0.8rem;
  margin-left: 0.5rem;
}

.listbox-empty {
  padding: 0.5rem 0.75rem;
  font-size: 0.85rem;
  color: var(--color-ink-muted);
  font-style: italic;
}
</style>
