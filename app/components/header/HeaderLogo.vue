<script setup lang="ts">
import TypewriterLogo from '~/components/TypewriterLogo.vue'

// `~ fabkho_` as a home link: the compact stand-in for the full name.
</script>

<template>
  <NuxtLink
    to="/"
    class="header-logo"
    aria-label="Fabian Kirchhoff, home"
  >
    <TypewriterLogo text="fabkho" />
  </NuxtLink>
</template>

<style scoped>
.header-logo {
  display: inline-flex;
  align-items: center;
  color: var(--color-ink);
  text-decoration: none;
  white-space: nowrap;
}

.header-logo:hover :deep(.text) {
  color: var(--color-accent);
}

.header-logo:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
}
</style>
