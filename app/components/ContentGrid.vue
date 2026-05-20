<script setup lang="ts">
defineProps<{
  staggered?: boolean
  delayBase?: number
}>()
</script>

<template>
  <div
    class="content-grid"
    :class="{ 'content-grid--staggered': staggered }"
    :style="delayBase ? { '--section-delay': `${delayBase}ms` } : undefined"
  >
    <slot />
  </div>
</template>

<style scoped>
.content-grid {
  --section-delay: 0ms;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

@media (min-width: 769px) {
  .content-grid--staggered :deep(> .content-grid__item:nth-child(even)) {
    margin-top: 2.5rem;
  }

  .content-grid--staggered :deep(> .content-grid__item:nth-child(4n + 3)) {
    margin-top: 1.25rem;
  }
}

.content-grid :deep(> .content-grid__item) {
  transform-origin: center top;
  animation: card-reveal 1.15s cubic-bezier(0.16, 1, 0.3, 1) var(--item-delay) both;
}

@keyframes card-reveal {
  0% {
    opacity: 0;
    visibility: visible;
    transform: translateY(1.75rem) scale(0.985);
  }
  58% {
    opacity: 1;
  }
  100% {
    opacity: 1;
    visibility: visible;
    transform: translateY(0) scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .content-grid :deep(> .content-grid__item) {
    opacity: 1;
    visibility: visible;
    transform: none !important;
    animation: none;
  }
}

@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}
</style>
