<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  text?: string
}>()

const textToType = props.text || 'fabkho'
const displayText = ref(textToType)
const isTyping = ref(false)
</script>

<template>
  <div class="logo">
    <span class="prefix">~ </span>
    <span class="text">{{ displayText }}</span>
    <span
      class="cursor"
      :class="{ blinking: !isTyping }"
    >_</span>
  </div>
</template>

<style scoped>
.logo {
  font-family: var(--font-mono);
  font-size: inherit;
  font-weight: 500;
  color: var(--color-ink);
  display: flex;
  align-items: center;
}

.prefix {
  color: var(--color-accent);
  margin-right: 0.5rem;
}

.cursor {
  display: inline-block;
  width: 10px;
  color: var(--color-accent);
  margin-left: 2px;
}

.blinking {
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
</style>
