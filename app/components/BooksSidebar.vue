<script setup lang="ts">
// Sidebar for /books: Regal's sidebar (count, sort & filters, Books as records,
// linked to the 3D Stack in the page body), restyled in the portfolio's
// sidebar idiom (sidebar-header, data-section, records).
</script>

<template>
  <div class="books-sidebar">
    <RegalBooksSidebar
      heading="Bookshelf"
      count-label="Books read"
    />
  </div>
</template>

<style scoped>
.books-sidebar {
  --color-line: var(--color-ink-faint);
  --color-accent-tint: rgba(185, 62, 46, 0.08);

  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.books-sidebar > :deep(.regal-books-sidebar) {
  flex: 1;
}

/* Header: like the other sidebars' .sidebar-header */
.books-sidebar :deep(.sidebar__header) {
  font-weight: bold;
  letter-spacing: normal;
}

/* Count: like .data-section + .data-section__inner ("ARTICLES PUBLISHED") */
.books-sidebar :deep(.sidebar__stat) {
  position: relative;
  padding: 1.5rem 1rem;
  /* Static version of the WaveRipple hatch behind the other sidebars' counts */
  background: repeating-linear-gradient(45deg, var(--color-accent-faint) 0 1px, transparent 1px 8px);
}

.books-sidebar :deep(.sidebar__stat)::before {
  content: '';
  position: absolute;
  inset: 1rem;
  background: var(--color-bg);
  border: 1px solid var(--color-ink);
}

.books-sidebar :deep(.sidebar__value),
.books-sidebar :deep(.sidebar__label) {
  position: relative;
  color: var(--color-accent);
}

.books-sidebar :deep(.sidebar__value) {
  font-family: var(--font-sans);
  font-size: var(--text-2xl);
  font-weight: 300;
  line-height: 1.5;
}

.books-sidebar :deep(.sidebar__label) {
  margin-top: 0;
  font-size: var(--text-2xs);
  letter-spacing: normal;
}

/* Filters and list labels: like .data-label */
.books-sidebar :deep(.controls) {
  letter-spacing: normal;
}

.books-sidebar :deep(.controls__label),
.books-sidebar :deep(.records__count) {
  color: var(--color-ink-subtle);
  font-size: var(--text-2xs);
  letter-spacing: normal;
}

/* Records: like .sidebar-record / .record-title / .record-date */
.books-sidebar :deep(.records__item) {
  padding: 0.5rem 0;
  border-bottom: 1px dotted var(--color-ink-faint);
  transition: color 0.2s;
}

.books-sidebar :deep(.records__item:hover),
.books-sidebar :deep(.records__item[aria-pressed='true']) {
  color: var(--color-accent);
  background: transparent;
}

.books-sidebar :deep(.records__title) {
  font-family: var(--font-sans);
  font-size: var(--text-base);
}

.books-sidebar :deep(.records__meta) {
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
}
</style>
