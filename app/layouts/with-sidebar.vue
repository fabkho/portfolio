<template>
  <div class="drafting-board paper-texture mx-auto max-w-(--max-width-board) border border-ink p-8 min-h-[100dvh]">
    <TheHeader />
    <div class="sidebar-grid">
      <main id="main-content">
        <slot />
      </main>
      <aside>
        <slot name="sidebar" />
      </aside>
    </div>
    <TheFooter />
  </div>
</template>

<style scoped>
.sidebar-grid {
  display: grid;
  grid-template-columns: 1fr var(--sidebar-width);
  gap: 2rem;
}

@media (max-width: 1024px) {
  .sidebar-grid {
    grid-template-columns: 1fr;
  }
}
</style>
