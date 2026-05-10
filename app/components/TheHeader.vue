<script setup lang="ts">
import { isRouteActive, NAV_ITEMS } from '~/utils/navigation'

const subtitle = useRouteSubtitle()
const navItems = NAV_ITEMS
const navAnimated = useState('nav-animated', () => false)
const skipAnimation = ref(navAnimated.value)

onMounted(() => {
  if (!navAnimated.value) {
    setTimeout(() => {
      navAnimated.value = true
      skipAnimation.value = true
    }, 600)
  }
})
</script>

<template>
  <header class="header">
    <div class="header-cell title-main">
      <h1 class="font-sans font-light text-4xl uppercase tracking-[-0.02em] hidden-mobile">
        Fabian Kirchhoff
      </h1>
      <div class="mobile-logo">
        <TypewriterLogo />
      </div>
      <div class="text-base uppercase tracking-[0.1em] mt-1 subtitle-text">
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
    </div>

    <WaveRipple
      mode="hover"
      class="header-cell nav-cell"
      :spacing="8"
      :amplitude="12"
      :lifetime="1500"
      :still-threshold="120"
      tag="nav"
    >
      <NuxtLink
        v-for="(link, index) in navItems"
        :key="link.to"
        :to="link.to"
        class="nav-link"
        :class="{ 'nav-link--no-anim': skipAnimation }"
        :style="!skipAnimation ? { animationDelay: `${index * 0.08}s` } : undefined"
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

.mobile-logo {
  display: none;
}

.meta {
  min-width: 135px;
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

.nav-link--no-anim {
  animation: none;
}

.nav-link:hover {
  color: var(--color-bg);
  background: var(--color-ink);
}

.nav-link[aria-current='page'] {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

@media (max-width: 1024px) {
  .header {
    border-left: none;
    border-right: none;
    border-top: none;
  }
}

@media (max-width: 768px) {
  .header {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .header-cell {
    border-right: none;
    border-bottom: none;
  }

  .title-main {
    padding: 0.75rem 1rem;
    flex: 0 1 auto;
  }

  .title-main h1.hidden-mobile {
    display: none;
  }

  .mobile-logo {
    display: flex;
    align-items: center;
  }

  .title-main .subtitle-text {
    display: none;
  }

  .meta {
    display: none;
  }

  .nav-cell {
    width: auto;
    flex-direction: row;
    justify-content: flex-end;
    padding: 0.75rem 1rem;
    gap: 0.5rem;
    background: transparent !important;
  }
  
  /* Remove wave ripple on mobile */
  :deep(.wave-ripple) {
    background-image: none !important;
  }
  :deep(.wave-ripple__canvas) {
    display: none !important;
  }

  .nav-link {
    width: auto;
    font-size: var(--text-xs);
    padding: 0.25rem 0.5rem;
    text-align: center;
    animation: none;
  }
}
</style>
