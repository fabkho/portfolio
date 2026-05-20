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
  position: relative;
  overflow: hidden;
  font-family: var(--font-sans);
  font-size: var(--text-xl);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-ink);
  margin-bottom: 2rem;
  opacity: 0;
  visibility: hidden;
  transform: translateY(8px);
  transition: opacity 0.6s ease, transform 0.6s ease, visibility 0s;
}

.section-label::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 28%;
  height: 1px;
  background: var(--color-accent);
  opacity: 0;
  transform: translateX(-120%);
}

.section-label--visible::after {
  animation: section-label-scan 4.8s ease-in-out 0.4s infinite;
}

@keyframes section-label-scan {
  0%,
  72% {
    opacity: 0;
    transform: translateX(-120%);
  }
  78%,
  86% {
    opacity: 0.65;
  }
  100% {
    opacity: 0;
    transform: translateX(360%);
  }
}

.section-label--visible {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .section-label {
    opacity: 1;
    visibility: visible;
    transform: none;
    transition: none;
  }

  .section-label--visible::after {
    animation: none;
  }
}
</style>
