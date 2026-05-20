<script setup lang="ts">
const props = defineProps<{
  index: number
}>()

const itemDelay = computed(() => `calc(var(--section-delay) + ${props.index * 220}ms)`)
</script>

<template>
  <div
    class="content-grid__item"
    :style="{ '--item-delay': itemDelay }"
  >
    <slot />
  </div>
</template>
