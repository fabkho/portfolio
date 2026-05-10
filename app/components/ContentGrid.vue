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
  transform: translateY(8px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.content-grid :deep(> .reveal-visible) {
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .content-grid :deep(> *) {
    opacity: 1;
    transform: none;
    transition: none;
  }
}

@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}
</style>
