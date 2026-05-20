<script setup lang="ts">
import { isRouteActive, NAV_ITEMS } from '~/utils/navigation'

const subtitle = useRouteSubtitle()
const navItems = NAV_ITEMS
const navAnimated = useState('nav-animated', () => false)
const skipAnimation = ref(navAnimated.value)
const subtitleAnimationKey = ref(0)

watch(subtitle, () => {
  subtitleAnimationKey.value++
}, { immediate: true })

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
      <p class="site-title hidden-mobile">
        Fabian Kirchhoff
      </p>
      <div class="mobile-logo">
        <TypewriterLogo text="fabkho" />
      </div>
      <Transition
        name="subtitle-scan"
        mode="out-in"
      >
        <div
          :key="`${subtitle}-${subtitleAnimationKey}`"
          class="text-base uppercase tracking-[0.1em] mt-1 subtitle-text"
        >
          {{ subtitle }}
        </div>
      </Transition>
    </div>

    <div class="header-cell meta">
      <span class="meta-location">Cologne, DE</span>
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
  position: relative;
  overflow: hidden;
  grid-column: 1 / -1;
  display: flex;
  border: 1px solid var(--color-ink);
}

.header::after {
  content: '';
  position: absolute;
  top: -1px;
  left: 0;
  z-index: 20;
  width: 18%;
  height: 1px;
  pointer-events: none;
  background: var(--color-accent);
  opacity: 0;
  transform: translateX(-120%);
  animation: header-border-scan 5.6s ease-in-out 1s infinite;
}

@keyframes header-border-scan {
  0%,
  76% {
    opacity: 0;
    transform: translateX(-120%);
  }
  82%,
  90% {
    opacity: 0.7;
  }
  100% {
    opacity: 0;
    transform: translateX(660%);
  }
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

.site-title {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: var(--text-4xl);
  font-weight: 300;
  letter-spacing: -0.02em;
  line-height: 1;
  text-transform: uppercase;
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

.meta-location {
  color: var(--color-ink-muted, var(--color-ink));
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

.subtitle-text {
  position: relative;
  display: inline-block;
  overflow: hidden;
  color: var(--color-ink);
}

.subtitle-text::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 42%;
  height: 1px;
  background: var(--color-accent);
  opacity: 0;
  transform: translateX(-110%);
  animation: subtitle-underline-scan 0.85s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.subtitle-scan-enter-active,
.subtitle-scan-leave-active {
  transition:
    opacity 0.28s ease,
    transform 0.28s ease,
    clip-path 0.28s ease;
}

.subtitle-scan-enter-from {
  opacity: 0;
  clip-path: inset(0 100% 0 0);
  transform: translateY(0.15rem);
}

.subtitle-scan-leave-to {
  opacity: 0;
  clip-path: inset(0 0 0 100%);
  transform: translateY(-0.15rem);
}

@keyframes subtitle-underline-scan {
  0% {
    opacity: 0;
    transform: translateX(-110%);
  }
  25%,
  72% {
    opacity: 0.75;
  }
  100% {
    opacity: 0;
    transform: translateX(240%);
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

@media (prefers-reduced-motion: reduce) {
  .header::after,
  .subtitle-text::after {
    animation: none;
  }

  .subtitle-scan-enter-active,
  .subtitle-scan-leave-active {
    transition: none;
  }
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

  .site-title.hidden-mobile {
    display: none;
  }

  .mobile-logo {
    display: flex;
    align-items: center;
    font-size: 1.5rem;
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
