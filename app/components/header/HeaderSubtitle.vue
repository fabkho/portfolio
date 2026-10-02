<script setup lang="ts">
// The route subtitle with a scan transition on route change: a clip-path wipe
// plus an accent underline sweep.
const subtitle = useRouteSubtitle()
</script>

<template>
  <span class="header-subtitle">
    <Transition
      name="header-subtitle-scan"
      mode="out-in"
      appear
    >
      <span
        :key="subtitle"
        class="header-subtitle__text"
      >{{ subtitle }}</span>
    </Transition>
  </span>
</template>

<style scoped>
.header-subtitle {
  display: block;
  min-width: 0;
}

.header-subtitle__text {
  position: relative;
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  vertical-align: bottom;
  color: var(--color-ink);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.header-subtitle__text::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 42%;
  height: 1px;
  background: var(--color-accent);
  opacity: 0;
  transform: translateX(-110%);
  animation: header-subtitle-underline 0.85s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.header-subtitle-scan-enter-active,
.header-subtitle-scan-leave-active {
  transition:
    opacity 0.28s ease,
    transform 0.28s ease,
    clip-path 0.28s ease;
}

.header-subtitle-scan-enter-from {
  opacity: 0;
  clip-path: inset(0 100% 0 0);
  transform: translateY(0.15rem);
}

.header-subtitle-scan-leave-to {
  opacity: 0;
  clip-path: inset(0 0 0 100%);
  transform: translateY(-0.15rem);
}

@keyframes header-subtitle-underline {
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

@media (prefers-reduced-motion: reduce) {
  .header-subtitle__text::after {
    animation: none;
  }

  .header-subtitle-scan-enter-active,
  .header-subtitle-scan-leave-active {
    transition: none;
  }
}
</style>
