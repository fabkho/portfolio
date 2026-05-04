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
  font-family: var(--font-sans);
  font-size: var(--text-xl);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-ink);
  margin-bottom: 2rem;
}
</style>
