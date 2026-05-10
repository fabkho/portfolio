<script setup lang="ts">
type FlowVariant
  = | 'horizontal' | 'diagonal' | 'radial' | 'convergent' | 'wave'
    | 'crosshatch' | 'pulse' | 'spiral' | 'scatter' | 'quantized'
    | 'shimmer' | 'tide' | 'flicker' | 'gravity' | 'constellation'

interface VectorFlowInstance {
  setMouse: (x: number, y: number) => void
  onMouseLeave: () => void
}

const variants: { key: FlowVariant, label: string, desc: string }[] = [
  { key: 'diagonal', label: 'DIAGONAL', desc: 'Fixed 45° vectors. Length and thickness scale with proximity — schematic blueprint feel.' }
]

const flowRefs = Object.fromEntries(
  variants.map(v => [v.key, ref<VectorFlowInstance | null>(null)])
) as Record<FlowVariant, Ref<VectorFlowInstance | null>>

const cardRefs = Object.fromEntries(
  variants.map(v => [v.key, ref<HTMLElement>()])
) as Record<FlowVariant, Ref<HTMLElement | undefined>>

function onCardMouseMove(key: FlowVariant, e: MouseEvent) {
  const card = cardRefs[key]?.value
  const flow = flowRefs[key]?.value
  if (!card || !flow) return
  const cardRect = card.getBoundingClientRect()
  const header = card.querySelector('.demo-card__header') as HTMLElement | null
  const headerHeight = header?.offsetHeight ?? cardRect.height
  const x = e.clientX - cardRect.left
  const cardY = e.clientY - cardRect.top
  const normalizedY = cardY / cardRect.height
  const y = normalizedY * headerHeight
  flow.setMouse(x, y)
}

function onCardMouseLeave(key: FlowVariant) {
  flowRefs[key]?.value?.onMouseLeave()
}
</script>

<template>
  <div class="effects-page">
    <h1 class="page-title">
      Card Effect Variations
    </h1>
    <p class="description">
      10 vector flow effects in dark header. Hover anywhere on card — effect maps to header position.
    </p>

    <div
      v-for="v in variants"
      :key="v.key"
      class="row"
    >
      <h2 class="row-label">
        {{ v.label }}
      </h2>
      <div class="row-grid">
        <!-- WaveRipple reference card -->
        <TheCard
          tag="AGENT TOOLING"
          label="PI-MULTIREPO"
          title="Pi Multirepo"
          description="Pi extension for multi-repo bugfixing — ClickUp to MR in one command."
          :specs="['TYPESCRIPT', 'PI', 'GIT']"
          variant="hatched"
        />

        <!-- VectorFlow card -->
        <article
          :ref="(el: any) => { cardRefs[v.key].value = el?.$el ?? el }"
          class="demo-card"
          @mousemove="(e: MouseEvent) => onCardMouseMove(v.key, e)"
          @mouseleave="() => onCardMouseLeave(v.key)"
        >
          <div class="demo-card__header">
            <VectorFlow
              :ref="(el: any) => { flowRefs[v.key].value = el }"
              :variant="v.key"
              :spacing="10"
              :radius="250"
              active-color="rgba(245, 242, 235, 0.5)"
              rest-color="rgba(245, 242, 235, 0.12)"
            >
              <span class="demo-card__tag">NUXT MODULE</span>
              <span class="demo-card__tag">I18N-KIT</span>
            </VectorFlow>
          </div>
          <div class="demo-card__body">
            <h3 class="demo-card__title">
              The I18n Kit
            </h3>
            <p class="demo-card__desc">
              {{ v.desc }}
            </p>
            <div class="demo-card__specs">
              <SpecBadge label="NUXT" />
              <SpecBadge label="TYPESCRIPT" />
              <SpecBadge label="AI" />
            </div>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<style scoped>
.effects-page {
  padding: 2rem;
  max-width: 1100px;
  margin: 0 auto;
}

.page-title {
  font-family: var(--font-sans);
  font-size: var(--text-3xl);
  font-weight: 300;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.description {
  font-size: var(--text-sm);
  color: var(--color-ink-muted);
  margin-bottom: 2rem;
}

.row {
  margin-bottom: 3rem;
}

.row-label {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 1rem;
  color: var(--color-ink-muted);
}

.row-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

/* VectorFlow demo card — mirrors TheCard default */
.demo-card {
  border: 1px solid var(--color-ink);
  background: var(--color-bg);
  display: flex;
  flex-direction: column;
  transition: border-color 0.2s ease;
}

.demo-card:hover {
  border-color: var(--color-accent);
}

.demo-card__header {
  background-color: var(--color-ink);
  border-bottom: 1px solid var(--color-ink);
}

.demo-card__tag {
  color: var(--color-bg);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  text-transform: uppercase;
  padding: 0.5rem 1rem;
}

.demo-card__body {
  padding: 1.5rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.demo-card__title {
  font-family: var(--font-serif);
  font-size: var(--text-2xl);
  font-style: italic;
  margin-bottom: 1rem;
}

.demo-card__desc {
  font-family: var(--font-sans);
  font-size: var(--text-md);
  line-height: 1.5;
  margin-bottom: 1.5rem;
  flex-grow: 1;
}

.demo-card__specs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-ink-faint);
}

@media (max-width: 768px) {
  .row-grid {
    grid-template-columns: 1fr;
  }
}
</style>
