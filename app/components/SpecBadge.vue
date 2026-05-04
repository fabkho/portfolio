<script setup lang="ts">
defineProps<{
  label: string
}>()
</script>

<template>
  <span class="spec-badge">{{ label }}</span>
</template>

<style scoped>
.spec-badge {
  display: inline-block;
  border: 1px solid var(--color-ink);
  padding: 0.2rem 0.5rem;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  text-transform: uppercase;
}
</style>
