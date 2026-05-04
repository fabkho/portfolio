<template>
  <footer class="flex items-center justify-between border border-ink p-4 mt-8">
    <div class="flex items-center gap-2">
      <span class="accent-dot" />
      <span class="text-xs uppercase">INDICATES ACTIVE SYSTEM / PRIMARY FOCUS</span>
    </div>
    <a
      href="https://github.com/fabkho"
      target="_blank"
      rel="noopener noreferrer"
      class="text-xs uppercase hover:text-accent transition-colors"
    >
      INITIATE EXTERNAL LINK: GITHUB
    </a>
  </footer>
</template>

<style scoped>
.accent-dot {
  width: 12px;
  height: 12px;
  background-color: var(--color-accent);
  border-radius: 50%;
  flex-shrink: 0;
}
</style>
