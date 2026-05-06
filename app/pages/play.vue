<script setup lang="ts">
definePageMeta({
  layout: false
})
</script>

<template>
  <NuxtLayout name="with-sidebar">
    <div class="playground">
      <SectionLabel label="Style Playground" />

      <!-- Inline Code Options -->
      <h2 class="section-title">
        Inline Code Styles
      </h2>

      <div class="option-group">
        <h3 class="option-label">
          A — "Drafting Paper"
        </h3>
        <p class="demo-text">
          Use the <code class="code-a">useAsyncData</code> composable to fetch from <code class="code-a">queryCollection</code> in your page.
        </p>
      </div>

      <div class="option-group">
        <h3 class="option-label">
          B — "Blueprint Label"
        </h3>
        <p class="demo-text">
          Use the <code class="code-b">useAsyncData</code> composable to fetch from <code class="code-b">queryCollection</code> in your page.
        </p>
      </div>

      <div class="option-group">
        <h3 class="option-label">
          C — "Pencil Underline"
        </h3>
        <p class="demo-text">
          Use the <code class="code-c">useAsyncData</code> composable to fetch from <code class="code-c">queryCollection</code> in your page.
        </p>
      </div>

      <!-- Pre/Code Block Options -->
      <h2 class="section-title">
        Code Block Styles
      </h2>

      <div class="option-group">
        <h3 class="option-label">
          A — "Dark Modern" (VS Code dark-plus)
        </h3>
        <div class="pre-a">
          <div class="pre-header">
            <span class="pre-lang">typescript</span>
            <button class="pre-copy">⎘ copy</button>
          </div>
          <pre v-pre class="pre-content"><code><span class="hl-keyword">export function</span> <span class="hl-fn">useFlip</span>(containerRef: <span class="hl-type">Ref</span>&lt;<span class="hl-type">HTMLElement</span>&gt;) {
  <span class="hl-keyword">const</span> positions = <span class="hl-keyword">new</span> <span class="hl-type">Map</span>&lt;<span class="hl-type">string</span>, <span class="hl-type">DOMRect</span>&gt;()
  <span class="hl-keyword">return</span> { recordPositions, playAnimations }
}</code></pre>
        </div>
      </div>

      <div class="option-group">
        <h3 class="option-label">
          B — "Light Spec Sheet"
        </h3>
        <div class="pre-b">
          <div class="pre-header pre-header--light">
            <span class="pre-lang pre-lang--light">typescript</span>
            <button class="pre-copy pre-copy--light">⎘ copy</button>
          </div>
          <pre v-pre class="pre-content pre-content--light"><code><span class="hl-keyword-l">export function</span> <span class="hl-fn-l">useFlip</span>(containerRef: <span class="hl-type-l">Ref</span>&lt;<span class="hl-type-l">HTMLElement</span>&gt;) {
  <span class="hl-keyword-l">const</span> positions = <span class="hl-keyword-l">new</span> <span class="hl-type-l">Map</span>&lt;<span class="hl-type-l">string</span>, <span class="hl-type-l">DOMRect</span>&gt;()
  <span class="hl-keyword-l">return</span> { recordPositions, playAnimations }
}</code></pre>
        </div>
      </div>

      <div class="option-group">
        <h3 class="option-label">
          C — "Ink on Paper" (monochrome)
        </h3>
        <div class="pre-c">
          <div class="pre-header">
            <span class="pre-lang">typescript</span>
            <button class="pre-copy">⎘ copy</button>
          </div>
          <pre v-pre class="pre-content pre-content--mono"><code>export function useFlip(containerRef: Ref&lt;HTMLElement&gt;) {
  const positions = new Map&lt;string, DOMRect&gt;()
  return { recordPositions, playAnimations }
}</code></pre>
        </div>
      </div>
    </div>

    <template #sidebar>
      <div class="sidebar-header">
        Style Reference
      </div>
      <div class="sidebar-section">
        <div class="sidebar-label">
          INLINE CODE
        </div>
        <div class="sidebar-item">
          A: Drafting Paper
        </div>
        <div class="sidebar-item">
          B: Blueprint Label
        </div>
        <div class="sidebar-item">
          C: Pencil Underline
        </div>
      </div>
      <div class="sidebar-section">
        <div class="sidebar-label">
          CODE BLOCKS
        </div>
        <div class="sidebar-item">
          A: Dark Modern
        </div>
        <div class="sidebar-item">
          B: Light Spec Sheet
        </div>
        <div class="sidebar-item">
          C: Ink on Paper
        </div>
      </div>
    </template>
  </NuxtLayout>
</template>

<style scoped>
.playground {
  max-width: 800px;
}

.section-title {
  font-family: var(--font-sans);
  font-size: var(--text-xl);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 3rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-ink-faint);
}

.option-group {
  margin-bottom: 2.5rem;
}

.option-label {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  text-transform: uppercase;
  color: var(--color-ink-muted);
  margin-bottom: 0.75rem;
}

.demo-text {
  font-family: var(--font-serif);
  font-size: 1.1rem;
  line-height: 1.7;
}

/* === INLINE CODE OPTIONS === */

/* A: Drafting Paper */
.code-a {
  font-family: var(--font-mono);
  font-size: 0.9em;
  background: rgba(44, 44, 42, 0.06);
  border: 1px solid var(--color-ink-faint);
  padding: 0.1rem 0.4rem;
}

/* B: Blueprint Label */
.code-b {
  font-family: var(--font-mono);
  font-size: 0.9em;
  background: var(--color-ink);
  color: var(--color-bg);
  padding: 0.1rem 0.5rem;
}

/* C: Pencil Underline */
.code-c {
  font-family: var(--font-mono);
  font-size: 0.9em;
  background: none;
  border-bottom: 1px solid var(--color-ink);
  padding: 0 0.1rem;
}

/* === CODE BLOCK OPTIONS === */

/* Shared */
.pre-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.3rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: #1e1e1e;
}

.pre-header--light {
  background: var(--color-bg);
  border-bottom: 1px solid var(--color-ink);
}

.pre-lang {
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 0.05em;
}

.pre-lang--light {
  color: var(--color-ink-faint);
}

.pre-copy {
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.4);
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.15rem 0.5rem;
  cursor: pointer;
}

.pre-copy--light {
  color: var(--color-ink-faint);
  border-color: var(--color-ink-faint);
}

.pre-content {
  margin: 0;
  padding: 1.5rem;
  overflow-x: auto;
  font-family: var(--font-mono);
  font-size: var(--text-base);
  line-height: 1.6;
  background: #1e1e1e;
  color: #d4d4d4;
}

.pre-content--light {
  background: var(--color-bg);
  color: var(--color-ink);
  border: 1px solid var(--color-ink);
  border-top: none;
}

.pre-content--mono {
  color: var(--color-bg);
}

/* A: Dark Modern syntax highlights */
.pre-a {
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.hl-keyword { color: #569cd6; }
.hl-fn { color: #dcdcaa; }
.hl-type { color: #4ec9b0; }

/* B: Light syntax highlights */
.pre-b {
  border: 1px solid var(--color-ink);
}

.hl-keyword-l { color: #af00db; }
.hl-fn-l { color: #795e26; }
.hl-type-l { color: #267f99; }

/* C: Monochrome */
.pre-c {
  border: 1px solid rgba(255, 255, 255, 0.08);
}

/* Sidebar */
.sidebar-header {
  padding: 1rem;
  border-bottom: 1px solid var(--color-ink);
  font-weight: bold;
  text-transform: uppercase;
  text-align: center;
  font-size: var(--text-sm);
}

.sidebar-section {
  padding: 1rem;
  border-bottom: 1px solid var(--color-ink);
}

.sidebar-label {
  font-size: var(--text-2xs);
  color: var(--color-ink-faint);
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}

.sidebar-item {
  font-family: var(--font-sans);
  font-size: var(--text-base);
  padding: 0.3rem 0;
  border-bottom: 1px dotted var(--color-ink-faint);
}
</style>
