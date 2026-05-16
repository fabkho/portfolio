<script setup lang="ts">
import { useClipboard } from '@vueuse/core'

const props = defineProps<{
  code?: string
  language?: string
  filename?: string
  highlights?: number[]
  class?: string
}>()

const { copy, copied, isSupported } = useClipboard({ copiedDuring: 2000, legacy: true })

async function copyCode() {
  if (!isSupported.value) return
  await copy(props.code || '')
}
</script>

<template>
  <div class="code-block">
    <div class="code-header">
      <span class="code-lang">{{ filename || language || '' }}</span>
      <button
        class="copy-btn"
        :aria-label="!isSupported ? 'Copy unavailable' : copied ? 'Copied' : 'Copy code'"
        :disabled="!isSupported"
        @click="copyCode"
      >
        {{ copied ? '✓ copied' : '⎘ copy' }}
      </button>
    </div>
    <pre :class="$props.class"><slot /></pre>
  </div>
</template>

<style scoped>
.code-block {
  position: relative;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.3rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: var(--color-code-bg);
}

.code-lang {
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 0.05em;
}

.copy-btn {
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.6);
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.15rem 0.5rem;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s;
}

.copy-btn:hover {
  color: rgba(255, 255, 255, 0.9);
  border-color: rgba(255, 255, 255, 0.6);
}

.code-block pre {
  margin: 0;
  border: none;
  border-radius: 0;
  padding: 1.5rem;
  overflow-x: auto;
  font-family: var(--font-mono);
  font-size: var(--text-base);
  background: var(--color-code-bg);
  color: #e1e4e8;
}

.code-block :deep(pre code .line span) {
  color: var(--shiki-dark) !important;
  font-style: var(--shiki-dark-font-style) !important;
  font-weight: var(--shiki-dark-font-weight) !important;
  text-decoration: var(--shiki-dark-text-decoration) !important;
}
</style>
