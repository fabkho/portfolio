<script setup lang="ts">
const props = defineProps<{
  target: HTMLElement | null | undefined
  attrs: string[]
}>()

const attrValues = ref<Record<string, string | null>>({})

let observer: MutationObserver | null = null

function readAttrs() {
  const el = props.target
  if (!el) return
  const values: Record<string, string | null> = {}
  for (const attr of props.attrs) {
    values[attr] = el.getAttribute(attr)
  }
  attrValues.value = values
}

function observe(el: HTMLElement | null | undefined) {
  observer?.disconnect()
  if (!el) return
  readAttrs()
  observer = new MutationObserver(readAttrs)
  observer.observe(el, { attributes: true, attributeFilter: props.attrs })
}

watch(() => props.target, observe, { immediate: true })

onUnmounted(() => observer?.disconnect())
</script>

<template>
  <div class="aria-inspector">
    <div class="aria-inspector__header">
      ARIA
    </div>
    <div class="aria-inspector__rows">
      <div
        v-for="attr in attrs"
        :key="attr"
        class="aria-inspector__row"
        :class="{ 'aria-inspector__row--set': attrValues[attr] !== null }"
      >
        <span class="aria-inspector__attr">{{ attr }}</span>
        <span class="aria-inspector__value">
          <Transition
            name="aria-val"
            mode="out-in"
          >
            <span :key="attrValues[attr] ?? '__null__'">
              {{ attrValues[attr] ?? '—' }}
            </span>
          </Transition>
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.aria-inspector {
  border-top: 1px dashed var(--color-ink-faint);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
}

.aria-inspector__header {
  padding: 0.4rem 1rem;
  font-size: var(--text-2xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-accent);
  background: rgba(44, 44, 42, 0.02);
  border-bottom: 1px dashed var(--color-ink-faint);
}

.aria-inspector__rows {
  padding: 0.5rem 0;
}

.aria-inspector__row {
  display: flex;
  align-items: baseline;
  gap: 1rem;
  padding: 0.2rem 1rem;
  transition: background 0.15s;
}

.aria-inspector__row--set {
  background: rgba(185, 62, 46, 0.04);
}

.aria-inspector__attr {
  color: var(--color-ink-muted);
  flex: 0 0 auto;
  width: 14rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.aria-inspector__value {
  color: var(--color-ink);
  font-weight: 500;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.aria-inspector__row--set .aria-inspector__value {
  color: var(--color-accent);
}

/* value change flash */
.aria-val-enter-active,
.aria-val-leave-active {
  transition: opacity 0.15s, transform 0.15s;
}
.aria-val-enter-from {
  opacity: 0;
  transform: translateY(-4px);
}
.aria-val-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
