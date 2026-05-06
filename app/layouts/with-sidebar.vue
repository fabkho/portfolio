<template>
  <div class="drafting-board paper-texture">
    <TheHeader />
    <main id="main-content" class="schematic-area">
      <SchematicBackground />
      <div class="main-content">
        <slot />
      </div>
    </main>
    <aside class="data-sidebar">
      <div class="sidebar-sticky">
        <slot name="sidebar" />
      </div>
    </aside>
    <TheFooter />
  </div>
</template>

<style scoped>
.drafting-board {
  max-width: var(--max-width-board);
  margin: 0 auto;
  border: 1px solid var(--color-ink);
  padding: 1rem;
  display: grid;
  grid-template-columns: 1fr var(--sidebar-width);
  grid-template-rows: auto 1fr auto;
  min-height: calc(100vh - 4rem);
  gap: 1rem;
}

.schematic-area {
  grid-column: 1 / 2;
  border: 1px solid var(--color-ink);
  position: relative;
  padding: 2rem;
  overflow: hidden;
}

.main-content {
  position: relative;
  z-index: 10;
}

.data-sidebar {
  grid-column: 2 / 3;
  border: 1px solid var(--color-ink);
}

.sidebar-sticky {
  position: sticky;
  top: 2rem;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 4rem);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--color-ink-faint) transparent;
}

.sidebar-sticky::-webkit-scrollbar {
  width: 4px;
}

.sidebar-sticky::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-sticky::-webkit-scrollbar-thumb {
  background-color: var(--color-ink-faint);
}

@media (max-width: 1024px) {
  .drafting-board {
    grid-template-columns: 1fr;
  }

  .schematic-area {
    grid-column: 1 / -1;
  }

  .data-sidebar {
    grid-column: 1 / -1;
  }

  .sidebar-sticky {
    position: static;
    max-height: none;
  }
}
</style>
