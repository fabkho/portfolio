<script setup lang="ts">
defineProps<{
  tag: string
  label?: string
  stars?: number
  title: string
  description: string
  specs?: string[]
  url?: string
  variant?: 'default' | 'hatched' | 'vectorflow'
}>()

interface VectorFlowInstance {
  onMouseMove: (e: MouseEvent) => void
  onMouseLeave: () => void
  setMouse: (x: number, y: number) => void
}

const NuxtLinkComp = resolveComponent('NuxtLink')
const vectorFlowRef = ref<VectorFlowInstance | null>(null)
const cardRef = ref<HTMLElement>()

function onCardMouseMove(e: MouseEvent) {
  const card = cardRef.value
  const flow = vectorFlowRef.value
  if (!card || !flow) return
  const cardRect = card.getBoundingClientRect()
  const header = card.querySelector('.the-card__header') as HTMLElement | null
  const headerHeight = header?.offsetHeight ?? cardRect.height
  const x = e.clientX - cardRect.left
  const cardY = e.clientY - cardRect.top
  const normalizedY = cardY / cardRect.height
  const y = normalizedY * headerHeight
  flow.setMouse(x, y)
}

function onCardMouseLeave() {
  vectorFlowRef.value?.onMouseLeave()
}
</script>

<template>
  <article
    ref="cardRef"
    class="the-card"
    :class="{ 'the-card--has-url': !!url }"
    @mousemove="variant === 'vectorflow' ? onCardMouseMove($event) : undefined"
    @mouseleave="variant === 'vectorflow' ? onCardMouseLeave() : undefined"
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
        :class="{
          'the-card__header--light': variant === 'hatched',
          'the-card__header--flush': variant === 'vectorflow'
        }"
      >
        <VectorFlow
          v-if="variant === 'vectorflow'"
          ref="vectorFlowRef"
          variant="diagonal"
          :spacing="10"
          :radius="250"
          active-color="rgba(245, 242, 235, 0.5)"
          rest-color="rgba(245, 242, 235, 0.12)"
        >
          <span class="the-card__tag">{{ tag }}</span>
          <span
            v-if="stars"
            class="the-card__stars"
          >★ {{ stars }}</span>
          <span
            v-if="label"
            class="the-card__tag"
          >{{ label }}</span>
        </VectorFlow>
        <template v-else>
          <span class="the-card__tag">{{ tag }}</span>
          <span
            v-if="stars"
            class="the-card__stars"
          >★ {{ stars }}</span>
          <span
            v-if="label"
            class="the-card__tag"
          >{{ label }}</span>
        </template>
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
      </WaveRipple>
      <div
        v-else-if="variant === 'vectorflow'"
        class="the-card__body"
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
      <div
        v-else
        class="the-card__body"
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

.the-card__header--flush {
  padding: 0;
}

.the-card__header--flush .the-card__tag {
  padding: 0.5rem 1rem;
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

.the-card__stars {
  font-family: var(--font-mono);
  font-size: var(--text-xs, 0.75rem);
  color: var(--color-ink-muted, #999);
  opacity: 0.7;
}

.the-card__header--light .the-card__stars {
  color: var(--color-ink-muted, #999);
}

.the-card__body {
  padding: 1.5rem;
  flex-grow: 1;
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

.the-card__specs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-ink-faint);
}
</style>
