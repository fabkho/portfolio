<script setup lang="ts">
defineProps<{
  staggered?: boolean
}>()

const gridRef = ref<HTMLElement>()

useStaggerReveal(gridRef)
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
}

/* Children start hidden, composable adds .reveal-visible */
.content-grid :deep(> *) {
  opacity: 0;
  visibility: hidden;
  transform: translateY(8px);
}

@keyframes stagger-reveal {
  from {
    opacity: 0;
    visibility: visible;
    transform: translateY(1rem);
  }
  to {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
}

@keyframes stagger-reveal-shifted {
  from {
    opacity: 0;
    visibility: visible;
    transform: translateY(3rem);
  }
  to {
    opacity: 1;
    visibility: visible;
    transform: translateY(2rem);
  }
}

.content-grid :deep(> .reveal-visible) {
  animation: stagger-reveal 0.6s ease forwards !important;
}

@media (min-width: 769px) {
  .content-grid--staggered :deep(> .reveal-visible:nth-child(even)) {
    animation: stagger-reveal-shifted 0.6s ease forwards !important;
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
    animation: stagger-reveal 0.6s ease forwards;
  }
}
</style>
