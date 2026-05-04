<script setup lang="ts">
defineProps<{
  contributions: { project: string, pr: string, url: string }[]
}>()
</script>

<template>
  <ul class="contribution-list">
    <li
      v-for="item in contributions"
      :key="item.url"
      class="contribution-list__item"
    >
      <span class="contribution-list__project">{{ item.project }}</span>
      <a
        :href="item.url"
        target="_blank"
        rel="noopener noreferrer"
        class="contribution-list__link"
      >
        {{ item.pr }}
      </a>
    </li>
  </ul>
</template>

<style scoped>
.contribution-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.contribution-list__item {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.5rem;
  padding: 0.75rem 0;
  border-bottom: 1px dotted var(--color-ink-muted);
  font-size: var(--text-sm);
}

.contribution-list__project {
  font-family: var(--font-mono);
  font-weight: 700;
}

.contribution-list__link {
  color: var(--color-ink);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.contribution-list__link:hover {
  color: var(--color-accent);
}
</style>
