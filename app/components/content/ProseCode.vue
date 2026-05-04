<script setup lang="ts">
const props = defineProps<{
  code?: string
  language?: string
  filename?: string
}>()

const copied = ref(false)

async function copyCode() {
  const code = props.code || ''
  await navigator.clipboard.writeText(code)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}
</script>

<template>
  <div class="code-block">
    <div class="code-header">
      <span class="code-lang">{{ language || '' }}</span>
      <button
        class="copy-btn"
        :aria-label="copied ? 'Copied' : 'Copy code'"
        @click="copyCode"
      >
        <span v-if="copied">✓ copied</span>
        <span v-else>⎘ copy</span>
      </button>
    </div>
    <pre><slot /></pre>
  </div>
</template>

<style scoped>
.code-block {
  position: relative;
  margin-bottom: 1.5rem;
  border: 1px solid var(--color-ink);
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.3rem 1rem;
  border-bottom: 1px solid var(--color-ink-faint);
  background: var(--color-ink);
}

.code-lang {
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  text-transform: uppercase;
  color: var(--color-ink-faint);
  letter-spacing: 0.05em;
}

.copy-btn {
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  text-transform: uppercase;
  color: var(--color-ink-faint);
  background: none;
  border: 1px solid var(--color-ink-faint);
  padding: 0.15rem 0.5rem;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s;
}

.copy-btn:hover {
  color: var(--color-bg);
  border-color: var(--color-bg);
}

.code-block :deep(pre) {
  margin: 0 !important;
  border: none !important;
  padding: 1.5rem !important;
  overflow-x: auto;
  font-family: var(--font-mono);
  font-size: var(--text-base);
}
</style>
