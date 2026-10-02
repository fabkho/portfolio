<script setup lang="ts">
import WaveRipple from '~/components/WaveRipple.vue'
import { isRouteActive, NAV_ITEMS } from '~/utils/navigation'

// The primary nav: the four tabs side by side on the WaveRipple hatch. On
// phones (<=768px) it turns into a bar of equal, hairline-divided cells
// without the hatch.
const route = useRoute()
</script>

<template>
  <WaveRipple
    mode="hover"
    tag="nav"
    class="header-nav"
    aria-label="Primary"
    :spacing="8"
    :amplitude="12"
    :lifetime="1500"
    :still-threshold="120"
    persist-key="header-nav"
  >
    <NuxtLink
      v-for="link in NAV_ITEMS"
      :key="link.to"
      :to="link.to"
      class="header-nav__link"
      :aria-current="isRouteActive(route.path, link.to) ? 'page' : undefined"
    >
      {{ link.label }}
    </NuxtLink>
  </WaveRipple>
</template>

<style scoped>
.header-nav {
  display: flex;
  align-items: center;
}

.header-nav :deep(.wave-ripple__content) {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  width: 100%;
}

.header-nav__link {
  position: relative;
  z-index: 10;
  display: block;
  padding: 0.25rem 0.7rem;
  border: 1px solid var(--color-ink);
  background: var(--color-bg);
  color: var(--color-ink);
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  text-decoration: none;
  text-align: center;
  white-space: nowrap;
  transition: color 0.2s, border-color 0.2s, background 0.2s;
}

.header-nav__link:hover {
  color: var(--color-bg);
  background: var(--color-ink);
}

.header-nav__link:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.header-nav__link[aria-current='page'] {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.header-nav__link[aria-current='page']:hover {
  color: var(--color-bg);
  background: var(--color-accent);
}

/* Phones: equal cells sharing hairlines, no hatch */
@media (max-width: 768px) {
  .header-nav {
    background: transparent;
  }

  .header-nav :deep(.wave-ripple__fallback),
  .header-nav :deep(.wave-ripple__canvas) {
    display: none;
  }

  .header-nav :deep(.wave-ripple__content) {
    gap: 0;
    height: 100%;
    align-items: stretch;
  }

  .header-nav__link {
    flex: 1 1 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 0.45rem;
    border: none;
    border-left: 1px solid var(--color-ink);
    background: transparent;
    font-size: var(--text-xs);
    letter-spacing: 0.03em;
  }

  .header-nav__link[aria-current='page'] {
    color: var(--color-accent);
    box-shadow: inset 0 -2px 0 var(--color-accent);
  }

  .header-nav__link[aria-current='page']:hover {
    color: var(--color-bg);
    background: var(--color-ink);
  }
}
</style>
