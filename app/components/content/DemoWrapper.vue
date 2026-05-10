<script setup lang="ts">
const reducedMotion = usePreferredReducedMotion()
const prefersReduced = computed(() => reducedMotion.value === 'reduce')

defineProps<{
  label: string
  tag?: string
  description?: string
}>()
</script>

<template>
  <div class="demo-wrapper">
    <div class="demo-header">
      <span class="demo-label">{{ label }}</span>
      <span
        v-if="tag"
        class="demo-tag"
      >{{ tag }}</span>
    </div>

    <p
      v-if="description"
      class="demo-description"
    >
      {{ description }}
    </p>

    <div class="demo-content">
      <slot />
    </div>

    <div
      v-if="prefersReduced"
      class="demo-reduced-motion"
    >
      <span class="demo-reduced-motion__icon">⚠</span>
      Reduced motion enabled — animations are disabled.
    </div>
  </div>
</template>

<style scoped>
.demo-wrapper {
  border: 1px solid var(--color-ink-faint);
  margin: 2rem 0;
  font-family: var(--font-sans);
}

.demo-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid var(--color-ink-faint);
  background: rgba(44, 44, 42, 0.04);
}

.demo-label {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-ink-muted);
}

.demo-tag {
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-accent);
  border: 1px solid var(--color-accent-faint);
  padding: 0.1rem 0.4rem;
}

.demo-description {
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  color: var(--color-ink-muted);
  padding: 0.75rem 1rem 0;
  margin: 0;
}

.demo-content {
  padding: 1.5rem 1rem;
}

.demo-reduced-motion {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-top: 1px solid var(--color-ink-faint);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--color-ink-muted);
  background: rgba(44, 44, 42, 0.02);
}

.demo-reduced-motion__icon {
  color: var(--color-accent);
}
</style>
