<script setup lang="ts">
const props = defineProps<{
  code?: string
  language?: string
  filename?: string
  highlights?: number[]
  class?: string
}>()

const copied = ref(false)

async function copyCode() {
  const text = props.code || ''
  await navigator.clipboard.writeText(text)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}
</script>

<template>
  <div class="code-block">
    <div class="code-header">
      <span class="code-lang">{{ filename || language || '' }}</span>
      <button
        class="copy-btn"
        :aria-label="copied ? 'Copied' : 'Copy code'"
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
  background: #24292e;
}

.code-lang {
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 0.05em;
}

.copy-btn {
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.4);
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
  background: #24292e;
  color: #e1e4e8;
}

.code-block :deep(pre code .line span) {
  color: var(--shiki-dark) !important;
  font-style: var(--shiki-dark-font-style) !important;
  font-weight: var(--shiki-dark-font-weight) !important;
  text-decoration: var(--shiki-dark-text-decoration) !important;
}
</style>
