<script setup lang="ts">
defineProps<{
  tag: string
  title: string
  description: string
  specs?: string[]
  url?: string
  variant?: 'default' | 'hatched'
}>()
</script>

<template>
  <article
    class="the-card"
    :class="{ 'the-card--has-url': !!url }"
  >
    <component
      :is="url?.startsWith('/') ? resolveComponent('NuxtLink') : url ? 'a' : 'div'"
      :href="url && !url.startsWith('/') ? url : undefined"
      :to="url?.startsWith('/') ? url : undefined"
      :target="url && !url.startsWith('/') ? '_blank' : undefined"
      :rel="url && !url.startsWith('/') ? 'noopener noreferrer' : undefined"
      class="the-card__link"
    >
      <div class="the-card__header">
        <span class="the-card__tag">{{ tag }}</span>
      </div>
      <div
        class="the-card__body"
        :class="{ 'hatch-ink': variant === 'hatched' }"
      >
        <h3 class="the-card__title">
          {{ title }}
        </h3>
        <p class="the-card__description">
          {{ description }}
        </p>
        <div
          v-if="specs?.length"
          class="the-card__specs"
        >
          <SpecBadge
            v-for="spec in specs"
            :key="spec"
            :label="spec"
          />
        </div>
      </div>
    </component>
  </article>
</template>

<style scoped>
.the-card {
  border: 1px solid var(--color-ink);
  transition: border-color 0.2s ease;
}

.the-card--has-url:hover {
  border-color: var(--color-accent);
}

.the-card--has-url:focus-within {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.the-card__link {
  display: block;
  text-decoration: none;
  color: inherit;
}

.the-card__link:focus-visible {
  outline: none;
}

.the-card__header {
  background-color: var(--color-ink);
  padding: 0.5rem 1rem;
}

.the-card__tag {
  color: var(--color-bg);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  text-transform: uppercase;
}

.the-card__body {
  padding: 1.5rem 1rem;
}

.the-card__title {
  font-family: var(--font-serif);
  font-size: var(--text-2xl);
  font-style: italic;
  margin-bottom: 0.75rem;
}

.the-card__description {
  font-family: var(--font-sans);
  font-size: var(--text-md);
  line-height: 1.5;
  margin-bottom: 1rem;
}

.the-card__specs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-ink);
}
</style>
