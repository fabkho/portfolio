<script setup lang="ts">
defineProps<{
  projectCount: number
  stack: string[]
}>()
</script>

<template>
  <div class="projects-sidebar">
    <div class="sidebar-header">
      Overview
    </div>
    <WaveRipple
      mode="hover"
      color="var(--color-accent-faint)"
      class="data-section"
      :spacing="8"
      :amplitude="8"
      :lifetime="2000"
      :still-threshold="200"
    >
      <div class="data-section__inner">
        <div class="data-section__value">
          {{ projectCount }}
        </div>
        <div class="data-section__label">
          PROJECTS LOGGED
        </div>
      </div>
    </WaveRipple>
    <div class="data-section">
      <div class="data-label">
        STACK (FROM PROJECTS)
      </div>
      <div
        v-for="tech in stack"
        :key="tech"
        class="sidebar-record"
      >
        <span>{{ tech }}</span>
      </div>
    </div>
    <div class="data-section data-section--grow" />
  </div>
</template>

<style scoped>
.projects-sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sidebar-header {
  padding: 1rem;
  border-bottom: 1px solid var(--color-ink);
  font-weight: bold;
  text-transform: uppercase;
  text-align: center;
  font-size: var(--text-sm);
}

.data-section {
  padding: 1rem;
  border-bottom: 1px solid var(--color-ink);
}

.data-section:last-child {
  border-bottom: none;
}

.data-section--grow {
  flex-grow: 1;
}

.data-section__inner {
  background: var(--color-bg);
  border: 1px solid var(--color-ink);
  padding: 0.5rem;
  text-align: center;
}

.data-section__value {
  font-size: var(--text-2xl);
  font-family: var(--font-sans);
  font-weight: 300;
  color: var(--color-accent);
}

.data-section__label {
  font-size: var(--text-2xs);
  color: var(--color-accent);
}

.data-label {
  font-size: var(--text-2xs);
  color: var(--color-ink-subtle);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
}

.sidebar-record {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  border-bottom: 1px dotted var(--color-ink-faint);
  padding: 0.5rem 0;
  font-family: var(--font-sans);
  font-size: var(--text-base);
}
</style>
