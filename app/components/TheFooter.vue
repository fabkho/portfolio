<template>
  <footer class="footer">
    <div class="flex items-center gap-2">
      <span class="accent-dot" />
      <span class="text-sm uppercase">indicates active system / primary focus</span>
    </div>
    <a
      href="https://github.com/fabkho"
      target="_blank"
      rel="noopener noreferrer"
      class="footer-link"
    >
      initiate external link: github
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

.accent-dot {
  width: 12px;
  height: 12px;
  background-color: var(--color-accent);
  border-radius: 50%;
  flex-shrink: 0;
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
