<script setup lang="ts">
import { isRouteActive, NAV_ITEMS } from '~/utils/navigation'

const subtitle = useRouteSubtitle()
const navItems = NAV_ITEMS
</script>

<template>
  <header class="header">
    <div class="header-cell title-main">
      <h1 class="font-sans font-light text-4xl uppercase tracking-[-0.02em]">
        Fabian Kirchhoff
      </h1>
      <div class="text-base uppercase tracking-[0.1em] mt-1">
        {{ subtitle }}
      </div>
    </div>

    <div class="header-cell meta">
      <a
        href="https://github.com/fabkho"
        target="_blank"
        rel="noopener noreferrer"
        class="meta-link"
      >
        GitHub <span aria-hidden="true">↗</span>
      </a>
      <a
        href="https://x.com/fabkho"
        target="_blank"
        rel="noopener noreferrer"
        class="meta-link"
      >
        X / Twitter <span aria-hidden="true">↗</span>
      </a>
    </div>

    <WaveRipple
      mode="hover"
      class="header-cell nav-cell"
      tag="nav"
    >
      <NuxtLink
        v-for="(link, index) in navItems"
        :key="link.to"
        :to="link.to"
        class="nav-link"
        :style="{ animationDelay: `${index * 0.08}s` }"
        :aria-current="isRouteActive($route.path, link.to) ? 'page' : undefined"
      >
        {{ link.label }}
      </NuxtLink>
    </WaveRipple>
  </header>
</template>

<style scoped>
.header {
  grid-column: 1 / -1;
  display: flex;
  border: 1px solid var(--color-ink);
}

.header-cell {
  padding: 1rem;
  border-right: 1px solid var(--color-ink);
}

.header-cell:last-child {
  border-right: none;
}

.title-main {
  flex: 1;
  padding: 1rem 1.5rem;
}

.meta {
  min-width: 140px;
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  text-transform: uppercase;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 0.3rem;
}

.meta-link {
  color: var(--color-ink);
  text-decoration: none;
  transition: color 0.2s;
}

.meta-link:hover {
  color: var(--color-accent);
}

.nav-cell {
  position: relative;
  overflow: hidden;
  width: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.4rem;
  padding: 1rem 1.25rem;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.nav-link {
  position: relative;
  z-index: 10;
  text-decoration: none;
  color: var(--color-ink);
  font-family: var(--font-sans);
  font-size: var(--text-base);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: var(--color-bg);
  padding: 0.25rem 0.7rem;
  border: 1px solid var(--color-ink);
  display: block;
  width: 100%;
  text-align: right;
  transition: color 0.2s, border-color 0.2s, background 0.2s;
  animation: slideIn 0.4s ease both;
}

.nav-link:hover {
  color: var(--color-bg);
  background: var(--color-ink);
}

.nav-link[aria-current='page'] {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
  }

  .header-cell {
    border-right: none;
    border-bottom: 1px solid var(--color-ink);
  }

  .header-cell:last-child {
    border-bottom: none;
  }

  .nav-cell {
    width: auto;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-start;
  }

  .nav-link {
    width: auto;
  }
}
</style>
