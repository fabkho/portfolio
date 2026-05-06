<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps<{
  error: NuxtError
}>()

const handleClearError = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="error-page paper-texture">
    <div class="error-board">
      <div class="error-header">
        <span>ERROR {{ error.statusCode }}</span>
        <span>SYSTEM FAULT</span>
      </div>
      <div class="error-body">
        <h1 class="error-code">
          {{ error.statusCode }}
        </h1>
        <p class="error-message">
          {{ error.message || 'An unexpected error occurred' }}
        </p>
        <button
          class="error-btn"
          @click="handleClearError"
        >
          ← Return to Home
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
  padding: 2rem;
}

.error-board {
  border: 1px solid var(--color-ink);
  max-width: 600px;
  width: 100%;
}

.error-header {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  background: var(--color-ink);
  color: var(--color-bg);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  text-transform: uppercase;
}

.error-body {
  padding: 3rem 2rem;
  text-align: center;
}

.error-code {
  font-family: var(--font-sans);
  font-weight: 300;
  font-size: 6rem;
  color: var(--color-accent);
  margin-bottom: 1rem;
}

.error-message {
  font-family: var(--font-mono);
  font-size: var(--text-md);
  color: var(--color-ink-muted);
  margin-bottom: 2rem;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.error-btn {
  font-family: var(--font-sans);
  font-size: var(--text-md);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.5rem 1.5rem;
  border: 1px solid var(--color-ink);
  background: var(--color-bg);
  color: var(--color-ink);
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.error-btn:hover {
  background: var(--color-ink);
  color: var(--color-bg);
}
</style>
