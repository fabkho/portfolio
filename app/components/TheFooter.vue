<template>
  <footer class="footer">
    <span class="footer-copy">© {{ new Date().getFullYear() }} Fabian Kirchhoff</span>
    <a
      href="https://github.com/fabkho"
      target="_blank"
      rel="noopener noreferrer"
      class="footer-link"
    >
      GitHub <span aria-hidden="true">↗</span>
    </a>
  </footer>
</template>

<style scoped>
.footer {
  grid-column: 1 / -1;
  border: 1px solid var(--color-ink);
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--text-sm);
  text-transform: uppercase;
}

.footer-copy {
  font-family: var(--font-mono);
  color: var(--color-ink-faint);
}

.footer-link {
  color: var(--color-ink);
  text-decoration: none;
  border-bottom: 1px solid var(--color-ink);
  transition: color 0.2s;
}

.footer-link:hover {
  color: var(--color-accent);
  border-color: var(--color-accent);
}
</style>
