<script setup lang="ts">
defineProps<{
  author: string
  date: string
  status: string
  toc: { id: string, text: string, depth: number }[]
}>()

const activeId = useActiveSection()
</script>

<template>
  <div class="blog-sidebar">
    <div class="sidebar-header">
      Document Info
    </div>

    <div class="data-section">
      <div class="meta-item">
        AUTHOR: {{ author.toUpperCase() }}
      </div>
      <div class="meta-item">
        DATE: {{ date }}
      </div>
      <div class="meta-item">
        STATUS: <span class="status-value">{{ status.toUpperCase() }}</span>
      </div>
    </div>

    <div class="data-section data-section--grow">
      <div class="data-label">
        TABLE OF CONTENTS
      </div>
      <nav aria-label="Table of contents">
        <a
          v-for="item in toc"
          :key="item.id"
          :href="`#${item.id}`"
          class="toc-link"
          :class="{
            'toc-link--active': activeId === item.id,
            'toc-link--nested': item.depth > 2
          }"
        >
          {{ item.text }}
        </a>
      </nav>
    </div>
  </div>
</template>

<style scoped>
.blog-sidebar {
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

.data-label {
  font-size: var(--text-2xs);
  color: var(--color-ink-faint);
  margin-bottom: 0.75rem;
  text-transform: uppercase;
}

.meta-item {
  font-size: var(--text-sm);
  color: var(--color-ink-faint);
  margin-bottom: 0.4rem;
  font-family: var(--font-mono);
}

.status-value {
  color: var(--color-accent);
}

.toc-link {
  display: block;
  font-family: var(--font-sans);
  font-size: var(--text-base);
  color: var(--color-ink-faint);
  text-decoration: none;
  padding: 0.4rem 0;
  padding-left: 0.5rem;
  border-left: 1px solid var(--color-ink-faint);
  margin-bottom: 0.25rem;
  transition: color 0.2s, border-color 0.2s;
}

.toc-link--nested {
  padding-left: 1.25rem;
  font-size: var(--text-xs);
}

.toc-link--active {
  color: var(--color-accent);
  border-left-color: var(--color-accent);
}

.toc-link:hover {
  color: var(--color-ink);
}
</style>
