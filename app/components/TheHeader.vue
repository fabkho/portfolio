<script setup>
const subtitle = useRouteSubtitle()
</script>

<template>
  <header class="header">
    <div class="header-cell title-main">
      <h1 class="font-sans font-light text-3xl uppercase tracking-[-0.02em]">
        Fabian Kirchhoff
      </h1>
      <div class="text-xs uppercase tracking-[0.1em] text-ink-muted">
        {{ subtitle }}
      </div>
    </div>

    <div class="header-cell meta">
      <span class="text-xs uppercase">FABKHO // GERMANY</span>
      <a
        href="https://github.com/fabkho"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub"
        class="github-link"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
          <path d="M9 18c-4.51 2-5-2-7-2" />
        </svg>
      </a>
    </div>

    <nav class="header-cell nav-cell hatch-ink">
      <NuxtLink
        v-for="link in [
          { to: '/', label: 'Home' },
          { to: '/projects', label: 'Projects' },
          { to: '/blog', label: 'Blog' },
          { to: '/books', label: 'Books' }
        ]"
        :key="link.to"
        :to="link.to"
        class="nav-link"
        :aria-current="$route.path === link.to ? 'page' : undefined"
      >
        {{ link.label }}
      </NuxtLink>
    </nav>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  border: 1px solid var(--color-ink);
  margin-bottom: 2rem;
}

.header-cell {
  padding: 1rem;
  border-right: 1px solid var(--color-ink);
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.25rem;
}

.header-cell:last-child {
  border-right: none;
}

.title-main {
  flex: 1;
}

.meta {
  align-items: center;
  gap: 0.5rem;
}

.github-link {
  color: var(--color-ink);
  transition: color 0.2s;
}

.github-link:hover {
  color: var(--color-accent);
}

.nav-cell {
  position: relative;
  flex-direction: row;
  align-items: center;
  gap: 0;
  padding: 0;
}

.nav-cell::before {
  content: '';
  position: absolute;
  inset: 0;
  background: inherit;
  transition: transform 0.3s ease;
  z-index: 0;
}

.nav-cell:hover::before {
  transform: scale(1.02) rotate(0.5deg) skew(0.5deg);
}

.nav-link {
  position: relative;
  z-index: 1;
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  text-transform: uppercase;
  padding: 1rem 1.25rem;
  border-right: 1px solid var(--color-ink);
  background-color: var(--color-bg);
  color: var(--color-ink);
  text-decoration: none;
  transition: background-color 0.2s, color 0.2s;
}

.nav-link:last-child {
  border-right: none;
}

.nav-link:hover {
  background-color: var(--color-ink);
  color: var(--color-bg);
}

.nav-link[aria-current='page'] {
  background-color: var(--color-ink);
  color: var(--color-bg);
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
    flex-wrap: wrap;
  }
}
</style>
