<script setup lang="ts">
defineProps<{
  label: string
  tag?: 'h2' | 'h3'
}>()
</script>

<template>
  <component
    :is="tag || 'h2'"
    class="section-label"
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
  animation: section-label-reveal 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
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
  animation: section-label-scan 4.8s ease-in-out 0.4s infinite;
}

@keyframes section-label-reveal {
  from {
    opacity: 0;
    transform: translateY(0.5rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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

@media (max-width: 768px) {
  .section-label {
    margin-bottom: 1.5rem;
    animation-duration: 0.3s;
  }

  .section-label::after {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .section-label,
  .section-label::after {
    animation: none;
  }
}
</style>
