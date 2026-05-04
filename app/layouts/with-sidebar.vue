<template>
  <div class="drafting-board paper-texture">
    <TheHeader />
    <main id="main-content" class="schematic-area">
      <SchematicBackground />
      <div class="relative z-10">
        <slot />
      </div>
    </main>
    <aside class="data-sidebar">
      <slot name="sidebar" />
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

.data-sidebar {
  grid-column: 2 / 3;
  border: 1px solid var(--color-ink);
  display: flex;
  flex-direction: column;
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
}
</style>
