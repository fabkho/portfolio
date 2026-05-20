<script setup lang="ts">
defineProps<{
  staggered?: boolean
}>()

const gridRef = ref<HTMLElement>()

useStaggerReveal(gridRef, { delay: 220 })
</script>

<template>
  <div
    ref="gridRef"
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
  /* Remove !important from initial transform so animation can override it */
  .content-grid--staggered :deep(> *:nth-child(even)) {
    transform: translateY(2.5rem);
  }

  .content-grid--staggered :deep(> *:nth-child(4n + 3)) {
    transform: translateY(1.25rem);
  }
}

/* Children start hidden, composable adds .reveal-visible */
.content-grid :deep(> *) {
  opacity: 0;
  visibility: hidden;
  transform: translateY(1.25rem) scale(0.985);
  transform-origin: center top;
  filter: blur(6px);
}

@keyframes card-reveal {
  0% {
    opacity: 0;
    visibility: visible;
    transform: translateY(1.75rem) scale(0.985);
    filter: blur(6px);
  }
  58% {
    opacity: 1;
    filter: blur(0);
  }
  100% {
    opacity: 1;
    visibility: visible;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}

@keyframes card-reveal-shifted {
  0% {
    opacity: 0;
    visibility: visible;
    transform: translateY(4rem) scale(0.985);
    filter: blur(6px);
  }
  58% {
    opacity: 1;
    filter: blur(0);
  }
  100% {
    opacity: 1;
    visibility: visible;
    transform: translateY(2rem) scale(1);
    filter: blur(0);
  }
}

@keyframes card-reveal-soft-shifted {
  0% {
    opacity: 0;
    visibility: visible;
    transform: translateY(2.75rem) scale(0.985);
    filter: blur(6px);
  }
  58% {
    opacity: 1;
    filter: blur(0);
  }
  100% {
    opacity: 1;
    visibility: visible;
    transform: translateY(1.25rem) scale(1);
    filter: blur(0);
  }
}

.content-grid :deep(> .reveal-visible) {
  animation: card-reveal 1.15s cubic-bezier(0.16, 1, 0.3, 1) var(--reveal-delay, 0ms) forwards !important;
}

@media (min-width: 769px) {
  .content-grid--staggered :deep(> .reveal-visible:nth-child(even)) {
    animation: card-reveal-shifted 1.15s cubic-bezier(0.16, 1, 0.3, 1) var(--reveal-delay, 0ms) forwards !important;
  }

  .content-grid--staggered :deep(> .reveal-visible:nth-child(4n + 3)) {
    animation: card-reveal-soft-shifted 1.15s cubic-bezier(0.16, 1, 0.3, 1) var(--reveal-delay, 0ms) forwards !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  .content-grid :deep(> *) {
    opacity: 1;
    visibility: visible;
    transform: none !important;
  }

  .content-grid :deep(> .reveal-visible) {
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
    transform: translateY(8px) !important;
  }
  .content-grid--staggered :deep(> .reveal-visible) {
    animation: card-reveal 1.15s cubic-bezier(0.16, 1, 0.3, 1) var(--reveal-delay, 0ms) forwards;
  }
}
</style>
