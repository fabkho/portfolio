<script setup lang="ts">
defineProps<{
  tag: string
  label?: string
  stars?: number
  title: string
  description: string
  specs?: string[]
  url?: string
  variant?: 'default' | 'hatched'
  viewTransitionName?: string
}>()

const NuxtLinkComp = resolveComponent('NuxtLink')
</script>

<template>
  <article
    class="the-card"
    :class="{ 'the-card--has-url': !!url }"
  >
    <component
      :is="url?.startsWith('/') ? NuxtLinkComp : url ? 'a' : 'div'"
      :href="url && !url.startsWith('/') ? url : undefined"
      :to="url?.startsWith('/') ? url : undefined"
      :target="url && !url.startsWith('/') ? '_blank' : undefined"
      :rel="url && !url.startsWith('/') ? 'noopener noreferrer' : undefined"
      class="the-card__link"
    >
      <div
        class="the-card__header"
        :class="{ 'the-card__header--light': variant === 'hatched' }"
      >
        <span class="the-card__tag">{{ tag }}</span>
        <span
          v-if="label"
          class="the-card__tag"
        >{{ label }}</span>
      </div>
      <WaveRipple
        v-if="variant === 'hatched'"
        mode="hover"
        class="the-card__body"
        :spacing="8"
        :amplitude="8"
        :lifetime="2000"
        :still-threshold="180"
      >
        <div class="the-card__body-inner">
          <h3
            class="the-card__title"
            :style="viewTransitionName ? { viewTransitionName } : undefined"
          >
            {{ title }}
          </h3>
          <p class="the-card__description">
            {{ description }}
          </p>
          <div
            class="the-card__footer"
          >
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
            <span
              v-if="stars"
              class="the-card__stars"
            >★ {{ stars }}</span>
          </div>
        </div>
      </WaveRipple>
      <div
        v-else
        class="the-card__body"
      >
        <h3
          class="the-card__title"
          :style="viewTransitionName ? { viewTransitionName } : undefined"
        >
          {{ title }}
        </h3>
        <p class="the-card__description">
          {{ description }}
        </p>
        <div
          class="the-card__footer"
        >
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
          <span
            v-if="stars"
            class="the-card__stars"
          >★ {{ stars }}</span>
        </div>
      </div>
    </component>
  </article>
</template>

<style scoped>
.the-card {
  border: 1px solid var(--color-ink);
  background: var(--color-bg);
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
  display: flex;
  flex-direction: column;
  height: 100%;
  text-decoration: none;
  color: inherit;
}

.the-card__link:focus-visible {
  outline: none;
}

.the-card__header {
  display: flex;
  justify-content: space-between;
  background-color: var(--color-ink);
  padding: 0.5rem 1rem;
  border-bottom: 1px solid var(--color-ink);
}

.the-card__header--light {
  background-color: var(--color-bg);
  border-bottom: 1px solid var(--color-ink);
}

.the-card__header--light .the-card__tag {
  color: var(--color-ink);
}

.the-card__tag {
  color: var(--color-bg);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  text-transform: uppercase;
}

.the-card__body {
  padding: 1.5rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.the-card__body.wave-ripple {
  display: flex;
  flex-direction: column;
}

.the-card__body-inner {
  background: var(--color-bg);
  padding: 1rem;
  border: 1px solid var(--color-ink);
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.the-card__title {
  font-family: var(--font-serif);
  font-size: var(--text-2xl);
  font-style: italic;
  margin-bottom: 1rem;
}

.the-card__description {
  font-family: var(--font-sans);
  font-size: var(--text-md);
  line-height: 1.5;
  margin-bottom: 1.5rem;
  flex-grow: 1;
}

.the-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid var(--color-ink-faint);
  gap: 1rem;
}

.the-card__specs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.the-card__stars {
  font-family: var(--font-mono);
  font-size: var(--text-xs, 0.75rem);
  color: var(--color-ink);
  opacity: 0.7;
  white-space: nowrap;
}
</style>
