<script setup lang="ts">
const SIDES = [
  {
    key: 'server',
    question: 'Decides the layout',
    examples: 'column count · widths · order',
    verdict: 'Server',
    note: 'Ships inside the HTML document',
    filled: false
  },
  {
    key: 'client',
    question: 'Fills the layout',
    examples: 'rows · values · counts',
    verdict: 'Client',
    note: 'Arrives after hydration',
    filled: true
  }
]

const MOCK_WIDTHS = ['34%', '22%', '26%', '18%']
</script>

<template>
  <figure class="rule">
    <div
      v-for="side in SIDES"
      :key="side.key"
      class="rule__side"
      :class="`rule__side--${side.key}`"
    >
      <p class="rule__question">
        {{ side.question }}
      </p>
      <p class="rule__examples">
        {{ side.examples }}
      </p>

      <div
        class="rule__mock"
        aria-hidden="true"
      >
        <div class="rule__mock-head">
          <span
            v-for="(width, i) in MOCK_WIDTHS"
            :key="i"
            :style="{ width }"
          />
        </div>
        <div
          v-for="row in 3"
          :key="row"
          class="rule__mock-row"
        >
          <span
            v-for="(width, i) in MOCK_WIDTHS"
            :key="i"
            :class="{ 'rule__mock-cell--filled': side.filled }"
            :style="{ width }"
          />
        </div>
      </div>

      <p class="rule__verdict">
        {{ side.verdict }}
      </p>
      <p class="rule__note">
        {{ side.note }}
      </p>
    </div>
  </figure>
</template>

<style scoped>
.rule {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  margin: 2rem 0;
  background: var(--color-ink-faint);
  border: 1px solid var(--color-ink-faint);
  font-family: var(--font-mono);
}

@media (max-width: 640px) {
  .rule {
    grid-template-columns: 1fr;
  }
}

.rule__side {
  background: var(--color-bg);
  padding: 1.25rem 1.25rem 1rem;
}

.rule .rule__question {
  margin: 0;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-ink);
}

.rule .rule__examples {
  margin: 0.3rem 0 0;
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  color: var(--color-ink-muted);
}

.rule__mock {
  margin: 1.1rem 0;
}

.rule__mock-head,
.rule__mock-row {
  display: flex;
  gap: 6px;
  margin-bottom: 6px;
}

.rule__mock-head span {
  height: 6px;
  background: var(--color-ink);
}

.rule__mock-row span {
  height: 6px;
  border: 1px dashed var(--color-ink-faint);
}

.rule__mock-cell--filled {
  border-color: transparent;
  background: var(--color-accent);
  opacity: 0.55;
}

.rule .rule__verdict {
  margin: 0;
  font-family: var(--font-sans);
  font-size: var(--text-xl);
  font-weight: 300;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  line-height: 1.1;
}

.rule__side--server .rule__verdict {
  color: var(--color-accent);
}

.rule .rule__note {
  margin: 0.2rem 0 0;
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  color: var(--color-ink-muted);
}
</style>
