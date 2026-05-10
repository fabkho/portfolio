<script setup lang="ts">
import { useEventListener } from '@vueuse/core'

const props = defineProps<{
  target: HTMLElement | null | undefined
}>()

const focusedEl = ref<HTMLElement | null>(null)
const lastKey = ref<string | null>(null)
let keyTimeout: ReturnType<typeof setTimeout> | null = null

const focusedInfo = computed(() => {
  const el = focusedEl.value
  if (!el) return null
  return {
    tag: el.tagName.toLowerCase(),
    role: el.getAttribute('role') ?? undefined,
    text: el.textContent?.trim().slice(0, 40) || el.getAttribute('aria-label') || '—',
    tabindex: el.getAttribute('tabindex') ?? '(not set)'
  }
})

useEventListener(() => props.target, 'focusin', (e: FocusEvent) => {
  focusedEl.value = e.target as HTMLElement
})

useEventListener(() => props.target, 'focusout', (e: FocusEvent) => {
  // Only clear if focus left the container entirely
  if (!props.target?.contains(e.relatedTarget as Node)) {
    focusedEl.value = null
  }
})

useEventListener(() => props.target, 'keydown', (e: KeyboardEvent) => {
  const keyLabels: Record<string, string> = {
    'ArrowLeft': '←',
    'ArrowRight': '→',
    'ArrowUp': '↑',
    'ArrowDown': '↓',
    'Enter': '↵ Enter',
    ' ': '␣ Space',
    'Escape': 'Esc',
    'Tab': '⇥ Tab',
    'Home': 'Home',
    'End': 'End'
  }
  lastKey.value = keyLabels[e.key] ?? e.key

  if (keyTimeout) clearTimeout(keyTimeout)
  keyTimeout = setTimeout(() => {
    lastKey.value = null
  }, 1000)
})

onUnmounted(() => {
  if (keyTimeout) clearTimeout(keyTimeout)
})
</script>

<template>
  <div
    class="kb-viz"
    :class="{ 'kb-viz--active': !!focusedInfo }"
  >
    <div class="kb-viz__row">
      <div class="kb-viz__cell">
        <span class="kb-viz__label">focused</span>
        <span
          v-if="focusedInfo"
          class="kb-viz__value"
        >
          <code class="kb-viz__tag">{{ focusedInfo.tag }}<span v-if="focusedInfo.role">[role={{ focusedInfo.role }}]</span></code>
          {{ focusedInfo.text }}
        </span>
        <span
          v-else
          class="kb-viz__empty"
        >— click into the demo —</span>
      </div>

      <div class="kb-viz__cell kb-viz__cell--key">
        <span class="kb-viz__label">key</span>
        <Transition name="kb-key">
          <span
            v-if="lastKey"
            :key="lastKey"
            class="kb-viz__key"
          >{{ lastKey }}</span>
          <span
            v-else
            class="kb-viz__empty"
          >—</span>
        </Transition>
      </div>
    </div>

    <div
      v-if="focusedInfo"
      class="kb-viz__row kb-viz__row--secondary"
    >
      <span class="kb-viz__label">tabindex</span>
      <code class="kb-viz__value">{{ focusedInfo.tabindex }}</code>
    </div>
  </div>
</template>

<style scoped>
.kb-viz {
  border-top: 1px dashed var(--color-ink-faint);
  padding: 0.65rem 1rem;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  background: rgba(44, 44, 42, 0.02);
  transition: background 0.2s;
}

.kb-viz--active {
  background: rgba(44, 44, 42, 0.05);
}

.kb-viz__row {
  display: flex;
  align-items: baseline;
  gap: 1.5rem;
}

.kb-viz__row--secondary {
  margin-top: 0.3rem;
  gap: 0.75rem;
}

.kb-viz__cell {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  min-width: 0;
}

.kb-viz__cell--key {
  margin-left: auto;
  flex-shrink: 0;
}

.kb-viz__label {
  color: var(--color-ink-muted);
  flex-shrink: 0;
}

.kb-viz__value {
  color: var(--color-ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.kb-viz__tag {
  color: var(--color-accent);
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  margin-right: 0.25rem;
}

.kb-viz__empty {
  color: var(--color-ink-faint);
}

.kb-viz__key {
  display: inline-block;
  background: var(--color-ink);
  color: var(--color-bg);
  padding: 0.1rem 0.4rem;
  font-size: var(--text-2xs);
  letter-spacing: 0.05em;
  min-width: 1.5rem;
  text-align: center;
}

/* key flash animation */
.kb-key-enter-active {
  transition: none;
}
.kb-key-enter-from {
  background: var(--color-accent);
}
</style>
