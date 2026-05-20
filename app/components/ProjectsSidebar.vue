<script setup lang="ts">
const props = defineProps<{
  projectCount: number
  stack: string[]
}>()

const countRef = ref<HTMLElement>()
const countTarget = ref(0)
const prefersReducedMotion = usePreferredReducedMotion()
const countVisible = useElementVisibility(countRef, { once: true })
const animatedCount = useTransition(countTarget, {
  duration: 1800,
  easing: [0.16, 1, 0.3, 1],
  disabled: computed(() => prefersReducedMotion.value === 'reduce')
})
const displayedProjectCount = computed(() => Math.round(animatedCount.value))

watch(countVisible, (visible) => {
  if (visible) countTarget.value = props.projectCount
}, { immediate: true })

watch(() => props.projectCount, (value) => {
  if (countVisible.value) countTarget.value = value
})
</script>

<template>
  <div class="projects-sidebar">
    <div class="sidebar-header">
      Overview
    </div>
    <WaveRipple
      mode="hover"
      color="var(--color-accent-faint)"
      class="data-section"
      :spacing="8"
      :amplitude="8"
      :lifetime="2000"
      :still-threshold="200"
    >
      <div
        ref="countRef"
        class="data-section__inner"
      >
        <div class="data-section__value">
          {{ displayedProjectCount }}
        </div>
        <div class="data-section__label">
          PROJECTS LOGGED
        </div>
      </div>
    </WaveRipple>
    <div class="data-section data-section--stack data-section--grow">
      <div class="data-label">
        STACK
      </div>
      <div
        v-for="tech in stack"
        :key="tech"
        class="sidebar-record sidebar-reveal-item"
      >
        <span>{{ tech }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.projects-sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sidebar-header {
  padding: 1rem;
  border-bottom: 1px solid var(--color-ink);
  font-weight: bold;
  text-transform: uppercase;
  text-align: center;
  font-size: var(--text-sm);
}

.data-section {
  padding: 1rem;
  border-bottom: 1px solid var(--color-ink);
}

.data-section:last-child,
.data-section--stack {
  border-bottom: none;
}

.data-section--grow {
  flex-grow: 1;
}

.data-section__inner {
  background: var(--color-bg);
  border: 1px solid var(--color-ink);
  padding: 0.5rem;
  text-align: center;
}

.data-section__value {
  font-size: var(--text-2xl);
  font-family: var(--font-sans);
  font-weight: 300;
  color: var(--color-accent);
}

.data-section__label {
  font-size: var(--text-2xs);
  color: var(--color-accent);
}

.data-label {
  font-size: var(--text-2xs);
  color: var(--color-ink-subtle);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
}

.sidebar-record {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  border-bottom: 1px dotted var(--color-ink-faint);
  padding: 0.5rem 0;
  font-family: var(--font-sans);
  font-size: var(--text-base);
}
</style>
