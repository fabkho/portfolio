<script setup lang="ts">
const route = useRoute()
const isBlogRoute = computed(() => route.path.startsWith('/blog'))
const sidebarRef = ref<HTMLElement>()
useSidebarReveal(sidebarRef)
</script>

<template>
  <div class="drafting-board paper-texture">
    <TheHeader />
    <main
      id="main-content"
      class="schematic-area"
    >
      <div class="relative z-10">
        <slot />
      </div>
    </main>
    <aside class="data-sidebar">
      <div
        id="sidebar-target"
        ref="sidebarRef"
        :class="isBlogRoute ? 'sidebar-sticky' : 'sidebar-default'"
      >
        <slot name="sidebar">
          <div class="sidebar-header">
            About
          </div>
          <div class="data-section">
            <p class="sidebar-bio">
              I build things that help developers build things — Nuxt modules, CLI tools, and open-source packages. When not coding, I'm at the gym or lost in a book.
            </p>
          </div>
          <div class="data-section data-section--grow" />
        </slot>
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
  display: flex;
  flex-direction: column;
}

.data-sidebar {
  grid-column: 2 / 3;
  border: 1px solid var(--color-ink);
  display: flex;
  flex-direction: column;
}

.sidebar-default {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.sidebar-sticky {
  position: sticky;
  top: 0.5rem;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 4rem);
  overflow-y: auto;
  scrollbar-width: none;
  align-self: flex-start;
}

.sidebar-sticky::-webkit-scrollbar {
  display: none;
}

.sidebar-header {
  padding: 0.5rem 1rem;
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

/* Sidebar stagger reveal — children start hidden */
.sidebar-default :deep(> *),
.sidebar-sticky :deep(> *) {
  opacity: 0;
  visibility: hidden;
  transform: translateY(8px);
}

@keyframes sidebar-stagger-reveal {
  to {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
}

.sidebar-default :deep(> .reveal-visible),
.sidebar-sticky :deep(> .reveal-visible) {
  animation: sidebar-stagger-reveal 0.6s ease forwards;
}

@media (prefers-reduced-motion: reduce) {
  .sidebar-default :deep(> *),
  .sidebar-sticky :deep(> *) {
    opacity: 1;
    visibility: visible;
    transform: none;
  }

  .sidebar-default :deep(> .reveal-visible),
  .sidebar-sticky :deep(> .reveal-visible) {
    animation: none;
  }
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

.sidebar-bio {
  font-family: var(--font-sans);
  font-size: var(--text-base);
  line-height: 1.5;
}

.sidebar-link {
  display: block;
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--color-ink);
  text-decoration: none;
  padding: 0.3rem 0;
  transition: color 0.2s;
}

.sidebar-link:hover {
  color: var(--color-accent);
}

@media (max-width: 1024px) {
  .drafting-board {
    grid-template-columns: 1fr;
    min-height: 100vh;
    border: none;
    padding: 0;
    gap: 0;
  }

  .schematic-area {
    grid-column: 1 / -1;
    padding: 1rem;
    border: none;
  }

  .data-sidebar {
    grid-column: 1 / -1;
    border: none;
  }

  .data-section:not(.wave-ripple) {
    border-bottom: none;
  }

  .sidebar-sticky {
    position: static;
    max-height: none;
  }
}
</style>
