<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core'

defineProps<{
  label: string
  tag?: 'h2' | 'h3'
}>()

const elRef = ref<HTMLElement>()
const visible = ref(false)

const { stop } = useIntersectionObserver(
  elRef,
  ([entry]) => {
    if (!entry?.isIntersecting) return
    visible.value = true
    stop()
  },
  { threshold: 0.1 }
)
</script>

<template>
  <component
    :is="tag || 'h2'"
    ref="elRef"
    class="section-label"
    :class="{ 'section-label--visible': visible }"
  >
    {{ label }}
  </component>
</template>

<style scoped>
.section-label {
  font-family: var(--font-sans);
  font-size: var(--text-xl);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-ink);
  margin-bottom: 2rem;
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.section-label--visible {
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .section-label {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>
