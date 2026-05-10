<script setup lang="ts">
defineProps<{
  contributions: { project: string, pr: string, url: string }[]
}>()

const listRef = ref<HTMLElement>()

useStaggerReveal(listRef, { selector: ':scope > li', delay: 40 })
</script>

<template>
  <ul
    ref="listRef"
    class="contribution-list"
  >
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
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.contribution-list__item.reveal-visible {
  opacity: 1;
  transform: translateY(0);
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

@media (prefers-reduced-motion: reduce) {
  .contribution-list__item {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>
