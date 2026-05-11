<script setup lang="ts">
const { data: projects } = await useAsyncData('layout-project-count', () =>
  queryCollection('projects')
    .all()
)

const projectCount = computed(() => projects.value?.length ?? 0)
const route = useRoute()
const isBlogRoute = computed(() => route.path.startsWith('/blog'))
const { sidebarState } = useLayoutSidebar()
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
      <SchematicBackground />
      <div class="relative z-10">
        <slot />
      </div>
    </main>
    <aside class="data-sidebar">
      <div
        ref="sidebarRef"
        :class="isBlogRoute ? 'sidebar-sticky' : 'sidebar-default'"
      >
        <component
          :is="sidebarState.component"
          v-if="sidebarState.component"
          v-bind="sidebarState.props"
        />
        <template v-else>
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
              CURRENT STACK
            </div>
            <div class="sidebar-record">
              <span>Vue / Nuxt / TypeScript</span>
            </div>
            <div class="sidebar-record">
              <span>Node / Laravel</span>
            </div>
          </div>
          <div class="data-section data-section--grow" />
        </template>
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
