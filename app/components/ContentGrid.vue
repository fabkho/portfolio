<script setup lang="ts">
defineProps<{
  staggered?: boolean
}>()
</script>

<template>
  <div
    class="content-grid"
    :class="{ 'content-grid--staggered': staggered }"
  >
    <slot />
  </div>
</template>

<style scoped>
.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

@media (min-width: 769px) {
  .content-grid--staggered :deep(> *:nth-child(even)) {
    transform: translateY(2.5rem);
  }

  .content-grid--staggered :deep(> *:nth-child(4n + 3)) {
    transform: translateY(1.25rem);
  }
}

/* CSS-only reveal so first paint starts with header/nav */
.content-grid :deep(> *) {
  transform-origin: center top;
  animation: card-reveal 1.15s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.content-grid :deep(> *:nth-child(2)) { animation-delay: 220ms; }
.content-grid :deep(> *:nth-child(3)) { animation-delay: 440ms; }
.content-grid :deep(> *:nth-child(4)) { animation-delay: 660ms; }
.content-grid :deep(> *:nth-child(5)) { animation-delay: 880ms; }
.content-grid :deep(> *:nth-child(6)) { animation-delay: 1100ms; }
.content-grid :deep(> *:nth-child(7)) { animation-delay: 1320ms; }
.content-grid :deep(> *:nth-child(8)) { animation-delay: 1540ms; }
.content-grid :deep(> *:nth-child(9)) { animation-delay: 1760ms; }
.content-grid :deep(> *:nth-child(10)) { animation-delay: 1980ms; }
.content-grid :deep(> *:nth-child(11)) { animation-delay: 2200ms; }
.content-grid :deep(> *:nth-child(12)) { animation-delay: 2420ms; }

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

@keyframes card-reveal-shifted {
  0% {
    opacity: 0;
    visibility: visible;
    transform: translateY(4rem) scale(0.985);
  }
  58% {
    opacity: 1;
  }
  100% {
    opacity: 1;
    visibility: visible;
    transform: translateY(2rem) scale(1);
  }
}

@keyframes card-reveal-soft-shifted {
  0% {
    opacity: 0;
    visibility: visible;
    transform: translateY(2.75rem) scale(0.985);
  }
  58% {
    opacity: 1;
  }
  100% {
    opacity: 1;
    visibility: visible;
    transform: translateY(1.25rem) scale(1);
  }
}

@media (min-width: 769px) {
  .content-grid--staggered :deep(> *:nth-child(even)) {
    animation-name: card-reveal-shifted;
  }

  .content-grid--staggered :deep(> *:nth-child(4n + 3)) {
    animation-name: card-reveal-soft-shifted;
  }
}

@media (prefers-reduced-motion: reduce) {
  .content-grid :deep(> *) {
    opacity: 1;
    visibility: visible;
    transform: none !important;
    animation: none;
  }

  @media (min-width: 769px) {
    .content-grid--staggered :deep(> *:nth-child(even)) {
      transform: translateY(2rem) !important;
    }
  }
}

@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .content-grid--staggered :deep(> *) {
    animation-name: card-reveal;
  }
}
</style>
