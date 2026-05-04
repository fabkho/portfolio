<template>
  <div class="drafting-board paper-texture">
    <TheHeader />
    <main id="main-content" class="schematic-area">
      <SchematicBackground />
      <div class="scroll-content">
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
  height: calc(100vh - 4rem);
  gap: 1rem;
}

.schematic-area {
  grid-column: 1 / 2;
  border: 1px solid var(--color-ink);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.scroll-content {
  position: relative;
  z-index: 10;
  padding: 2rem;
  overflow-y: auto;
  flex: 1;

  /* Custom scrollbar */
  scrollbar-width: thin;
  scrollbar-color: var(--color-ink-faint) transparent;
}

.scroll-content::-webkit-scrollbar {
  width: 6px;
}

.scroll-content::-webkit-scrollbar-track {
  background: transparent;
}

.scroll-content::-webkit-scrollbar-thumb {
  background-color: var(--color-ink-faint);
  border-radius: 0;
  border: 1px solid var(--color-bg);
}

.scroll-content::-webkit-scrollbar-thumb:hover {
  background-color: var(--color-ink);
}

.data-sidebar {
  grid-column: 2 / 3;
  border: 1px solid var(--color-ink);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--color-ink-faint) transparent;
}

.data-sidebar::-webkit-scrollbar {
  width: 6px;
}

.data-sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.data-sidebar::-webkit-scrollbar-thumb {
  background-color: var(--color-ink-faint);
  border-radius: 0;
}

@media (max-width: 1024px) {
  .drafting-board {
    grid-template-columns: 1fr;
    height: auto;
    min-height: 100vh;
  }

  .schematic-area {
    grid-column: 1 / -1;
    overflow: visible;
  }

  .scroll-content {
    overflow-y: visible;
  }

  .data-sidebar {
    grid-column: 1 / -1;
  }
}
</style>
