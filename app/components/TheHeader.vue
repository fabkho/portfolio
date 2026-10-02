<script setup lang="ts">
import HeaderLogo from '~/components/header/HeaderLogo.vue'
import HeaderNav from '~/components/header/HeaderNav.vue'
import HeaderSubtitle from '~/components/header/HeaderSubtitle.vue'

// One row of hairline cells: name over the route subtitle | location and
// GitHub | the four tabs side by side on the WaveRipple hatch. Phones get
// the `~ fabkho_` logo and four hairline tabs in a single 44px row.
</script>

<template>
  <header class="strip">
    <div class="strip-cell strip-title">
      <NuxtLink
        to="/"
        class="strip-name"
      >
        Fabian Kirchhoff
      </NuxtLink>
      <HeaderLogo class="strip-logo" />
      <HeaderSubtitle class="strip-subtitle" />
    </div>

    <div class="strip-cell strip-meta">
      <span class="strip-meta__location">Cologne, DE</span>
      <a
        href="https://github.com/fabkho"
        target="_blank"
        rel="noopener noreferrer"
        class="strip-meta__link"
      >
        GitHub <span aria-hidden="true">↗</span>
      </a>
    </div>

    <HeaderNav class="strip-cell strip-nav" />
  </header>
</template>

<style scoped>
.strip {
  position: relative;
  grid-column: 1 / -1;
  display: flex;
  align-items: stretch;
  border: 1px solid var(--color-ink);
  overflow: hidden;
}

/* Accent scan along the top border */
.strip::after {
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
  animation: strip-border-scan 5.6s ease-in-out 1s infinite;
}

@keyframes strip-border-scan {
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

.strip-cell {
  border-right: 1px solid var(--color-ink);
}

.strip-cell:last-child {
  border-right: none;
}

.strip-title {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.2rem;
  padding: 0.6rem 1.5rem;
}

.strip-name {
  font-family: var(--font-sans);
  font-size: 1.35rem;
  font-weight: 300;
  line-height: 1.1;
  letter-spacing: -0.01em;
  text-transform: uppercase;
  color: var(--color-ink);
  text-decoration: none;
  white-space: nowrap;
}

.strip-name:hover {
  color: var(--color-accent);
}

/* Parent rules on child component roots: prefixed with .strip so they beat
   the child's own equally specific scoped rules regardless of CSS order */
.strip .strip-logo {
  display: none;
}

.strip .strip-subtitle {
  font-size: var(--text-xs);
}

.strip-meta {
  min-width: 135px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.2rem;
  padding: 0.6rem 1rem;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  text-transform: uppercase;
}

.strip-meta__location {
  color: var(--color-ink-muted);
}

.strip-meta__link {
  color: var(--color-ink);
  text-decoration: none;
  transition: color 0.2s;
}

.strip-meta__link:hover {
  color: var(--color-accent);
}

.strip-nav {
  padding: 0.6rem 1rem;
}

@media (prefers-reduced-motion: reduce) {
  .strip::after {
    animation: none;
  }
}

@media (max-width: 1180px) {
  .strip-meta {
    display: none;
  }
}

@media (max-width: 1024px) {
  .strip {
    border-left: none;
    border-right: none;
    border-top: none;
  }
}

/* Phones: logo + segmented tabs in one 44px row */
@media (max-width: 768px) {
  .strip-title {
    flex: 0 0 auto;
    padding: 0 0.75rem 0 1rem;
  }

  .strip-name,
  .strip .strip-subtitle {
    display: none;
  }

  .strip .strip-logo {
    display: inline-flex;
    font-size: 1.1rem;
    min-height: 2.75rem;
  }

  .strip-nav {
    flex: 1;
    padding: 0;
  }

  .strip-title {
    border-right: none;
  }
}
</style>
