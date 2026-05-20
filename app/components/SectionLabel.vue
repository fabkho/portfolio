<script setup lang="ts">
defineProps<{
  label: string
  tag?: 'h2' | 'h3'
  delayBase?: number
}>()
</script>

<template>
  <component
    :is="tag || 'h2'"
    class="section-label"
    :style="delayBase ? { '--section-delay': `${delayBase}ms` } : undefined"
  >
    {{ label }}
  </component>
</template>

<style scoped>
.section-label {
  --section-delay: 0ms;
  position: relative;
  overflow: hidden;
  font-family: var(--font-sans);
  font-size: var(--text-xl);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-ink);
  margin-bottom: 2rem;
  animation: section-label-reveal 0.6s ease var(--section-delay) both;
}

.section-label::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 1px;
  background: var(--color-accent);
  transform: translateX(-100%);
  animation: section-label-scan 5.2s ease-in-out calc(var(--section-delay) + 1.4s) infinite;
}

@keyframes section-label-reveal {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes section-label-scan {
  0%,
  72% {
    transform: translateX(-100%);
  }
  82%,
  88% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(100%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .section-label,
  .section-label::after {
    animation: none;
  }
}
</style>
