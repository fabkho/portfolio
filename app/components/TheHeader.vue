<script setup>
const subtitle = useRouteSubtitle()
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
        GitHub
      </a>
      <a
        href="https://linkedin.com/in/fabkho"
        target="_blank"
        rel="noopener noreferrer"
        class="meta-link"
      >
        LinkedIn
      </a>
      <a
        href="mailto:hello@fabkho.dev"
        class="meta-link"
      >
        Contact
      </a>
    </div>

    <nav class="header-cell nav-cell">
      <NuxtLink
        v-for="(link, index) in [
          { to: '/', label: 'Home' },
          { to: '/projects', label: 'Projects' },
          { to: '/blog', label: 'Blog' },
          { to: '/books', label: 'Books' }
        ]"
        :key="link.to"
        :to="link.to"
        class="nav-link"
        :style="{ animationDelay: `${index * 0.08}s` }"
        :aria-current="$route.path === link.to ? 'page' : undefined"
      >
        {{ link.label }}
      </NuxtLink>
    </nav>
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
  min-width: 120px;
  font-size: var(--text-xs);
  text-transform: uppercase;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.4rem;
}

.meta-link {
  color: var(--color-ink);
  text-decoration: none;
  border-bottom: 1px solid var(--color-ink-faint);
  padding-bottom: 0.1rem;
  transition: color 0.2s, border-color 0.2s;
}

.meta-link:hover {
  color: var(--color-accent);
  border-color: var(--color-accent);
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

.nav-cell::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  right: -50%;
  bottom: -50%;
  background-image: repeating-linear-gradient(
    45deg,
    var(--color-ink-faint),
    var(--color-ink-faint) 1px,
    transparent 1px,
    transparent 6px
  );
  z-index: 0;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  transform-origin: center center;
}

.nav-cell:hover::before {
  transform: scale(1.2) rotate(-15deg) skewX(25deg) skewY(-5deg);
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
