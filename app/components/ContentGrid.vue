<script setup lang="ts">
const gridRef = ref<HTMLElement>()

useStaggerReveal(gridRef)
</script>

<template>
  <div
    ref="gridRef"
    class="content-grid"
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

/* Children start hidden, composable adds .reveal-visible */
.content-grid :deep(> *) {
  opacity: 0;
  visibility: hidden;
  transform: translateY(8px);
}

@keyframes stagger-reveal {
  to {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
}

.content-grid :deep(> .reveal-visible) {
  animation: stagger-reveal 0.6s ease forwards;
}

@media (prefers-reduced-motion: reduce) {
  .content-grid :deep(> *) {
    opacity: 1;
    visibility: visible;
    transform: none;
  }

  .content-grid :deep(> .reveal-visible) {
    animation: none;
  }
}

@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}
</style>
