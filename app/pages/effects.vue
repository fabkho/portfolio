<script setup lang="ts">
const canvas1Ref = ref<HTMLCanvasElement>()
const ripples1 = ref<{ x: number, y: number, time: number }[]>([])
let raf1: number

const canvas2Ref = ref<HTMLCanvasElement>()
const ripples2 = ref<{ x: number, y: number, time: number }[]>([])
let raf2: number
let mouseStill2 = true
let stillTimer2: ReturnType<typeof setTimeout>

const MAX_RIPPLES = 6
const RIPPLE_LIFETIME = 1800
const STILL_THRESHOLD = 150

const flowRefs = {
  attractor: ref<InstanceType<typeof import('~/components/VectorFlow.vue').default>>(),
  repulsor: ref<InstanceType<typeof import('~/components/VectorFlow.vue').default>>(),
  magnifier: ref<InstanceType<typeof import('~/components/VectorFlow.vue').default>>(),
  swirl: ref<InstanceType<typeof import('~/components/VectorFlow.vue').default>>(),
  quantized: ref<InstanceType<typeof import('~/components/VectorFlow.vue').default>>()
}

const flowVariants = [
  { key: 'attractor' as const, tag: 'FIG 1.0', label: 'ATTRACTOR', title: 'Attractor', desc: 'Vectors rest at 45° and rotate smoothly to point directly at cursor within their radius.' },
  { key: 'repulsor' as const, tag: 'FIG 1.1', label: 'REPULSOR', title: 'Repulsor', desc: 'Vectors rest vertically. On cursor proximity, they aggressively rotate to point away — a magnetic shield.' },
  { key: 'magnifier' as const, tag: 'FIG 1.2', label: 'MAGNIFIER', title: 'Magnifier', desc: 'Angle stays locked horizontal. Influence scales length and thickness, creating a magnifying ripple.' },
  { key: 'swirl' as const, tag: 'FIG 1.3', label: 'SWIRL', title: 'Swirl', desc: 'Flowing sine-wave stream. Cursor acts as obstruction, rotating vectors orthogonally into a whirlpool.' },
  { key: 'quantized' as const, tag: 'FIG 1.4', label: 'QUANTIZED', title: 'Quantized', desc: 'Digital sensor grid. Vectors snap rigidly to nearest 45° increment instead of rotating smoothly.' }
]

function onFlowMouseMove(key: keyof typeof flowRefs, e: MouseEvent) {
  flowRefs[key].value?.onMouseMove(e)
}

function onFlowMouseLeave(key: keyof typeof flowRefs) {
  flowRefs[key].value?.onMouseLeave()
}

function drawLines(
  canvas: HTMLCanvasElement,
  now: number,
  ripplesArr: { x: number, y: number, time: number }[]
) {
  const ctx = canvas.getContext('2d')!
  const dpr = window.devicePixelRatio
  const w = canvas.width / dpr
  const h = canvas.height / dpr
  const spacing = 10
  const angle = Math.PI / 4
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  const nx = -sin
  const ny = cos

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, w, h)
  ctx.strokeStyle
    = getComputedStyle(canvas).getPropertyValue('--line-color') || 'rgba(0,0,0,0.12)'
  ctx.lineWidth = 1

  const diag = Math.hypot(w, h)
  const lineCount = Math.ceil(diag / spacing) * 2
  const steps = 60
  const lineLen = diag * 1.6
  const startX = -lineLen * 0.3
  const stepSize = lineLen / steps

  for (let i = -lineCount; i < lineCount; i++) {
    const offset = i * spacing
    const ox = offset * nx
    const oy = offset * ny

    ctx.beginPath()

    for (let s = 0; s <= steps; s++) {
      const along = startX + s * stepSize
      let px = along * cos + ox
      let py = along * sin + oy

      let totalDisp = 0
      for (let r = 0; r < ripplesArr.length; r++) {
        const ripple = ripplesArr[r]!
        const elapsed = (now - ripple.time) / 1000
        const dist = Math.hypot(px - ripple.x, py - ripple.y)
        const waveRadius = elapsed * 160
        const distToWave = dist - waveRadius

        if (distToWave > 50 || distToWave < -50) continue

        const fade = 1 - (now - ripple.time) / RIPPLE_LIFETIME
        if (fade <= 0) continue

        const phase = (distToWave / 50) * Math.PI
        totalDisp += Math.sin(phase) * fade * 12
      }

      if (totalDisp !== 0) {
        px += nx * totalDisp
        py += ny * totalDisp
      }

      if (s === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.stroke()
  }
}

function initCanvas(canvas: HTMLCanvasElement) {
  const rect = canvas.parentElement!.getBoundingClientRect()
  canvas.width = rect.width * window.devicePixelRatio
  canvas.height = rect.height * window.devicePixelRatio
  canvas.style.width = rect.width + 'px'
  canvas.style.height = rect.height + 'px'
}

// Effect 1: Click
function loop1(now: number) {
  ripples1.value = ripples1.value.filter(r => now - r.time < RIPPLE_LIFETIME)
  if (ripples1.value.length > 0) {
    drawLines(canvas1Ref.value!, now, ripples1.value)
    raf1 = requestAnimationFrame(loop1)
  } else {
    drawLines(canvas1Ref.value!, now, [])
  }
}

function onClick1(e: MouseEvent) {
  const rect = canvas1Ref.value!.parentElement!.getBoundingClientRect()
  ripples1.value.push({ x: e.clientX - rect.left, y: e.clientY - rect.top, time: performance.now() })
  if (ripples1.value.length > MAX_RIPPLES) ripples1.value.shift()
  cancelAnimationFrame(raf1)
  raf1 = requestAnimationFrame(loop1)
}

// Effect 2: Hover
function loop2(now: number) {
  ripples2.value = ripples2.value.filter(r => now - r.time < RIPPLE_LIFETIME)
  if (ripples2.value.length > 0) {
    drawLines(canvas2Ref.value!, now, ripples2.value)
    raf2 = requestAnimationFrame(loop2)
  } else {
    drawLines(canvas2Ref.value!, now, [])
  }
}

function onMove2(e: MouseEvent) {
  if (mouseStill2) {
    mouseStill2 = false
    const now = performance.now()
    const rect = canvas2Ref.value!.parentElement!.getBoundingClientRect()
    ripples2.value.push({ x: e.clientX - rect.left, y: e.clientY - rect.top, time: now })
    if (ripples2.value.length > MAX_RIPPLES) ripples2.value.shift()
    cancelAnimationFrame(raf2)
    raf2 = requestAnimationFrame(loop2)
  }

  clearTimeout(stillTimer2)
  stillTimer2 = setTimeout(() => {
    mouseStill2 = true
  }, STILL_THRESHOLD)
}

onMounted(() => {
  if (canvas1Ref.value) {
    initCanvas(canvas1Ref.value)
    drawLines(canvas1Ref.value, 0, [])
  }
  if (canvas2Ref.value) {
    initCanvas(canvas2Ref.value)
    drawLines(canvas2Ref.value, 0, [])
  }
  window.addEventListener('resize', () => {
    if (canvas1Ref.value) {
      initCanvas(canvas1Ref.value)
      drawLines(canvas1Ref.value, 0, [])
    }
    if (canvas2Ref.value) {
      initCanvas(canvas2Ref.value)
      drawLines(canvas2Ref.value, 0, [])
    }
  })
})

onUnmounted(() => {
  cancelAnimationFrame(raf1)
  cancelAnimationFrame(raf2)
  clearTimeout(stillTimer2)
})
</script>

<template>
  <div class="effects-page">
    <h1 class="page-title">
      Line Effects Playground
    </h1>

    <section class="effect-section">
      <h2>1. Wave Ripple — Click</h2>
      <p class="description">
        Click to spawn ripples.
      </p>
      <div
        class="canvas-wrapper"
        @click="onClick1"
      >
        <canvas
          ref="canvas1Ref"
          class="effect-canvas"
        />
      </div>
    </section>

    <section class="effect-section">
      <h2>2. Wave Ripple — Hover Trail</h2>
      <p class="description">
        Stop mouse, then move — one ripple per pause. Max {{ MAX_RIPPLES }} active.
      </p>
      <div
        class="canvas-wrapper"
        @mousemove="onMove2"
      >
        <canvas
          ref="canvas2Ref"
          class="effect-canvas"
        />
      </div>
    </section>

    <h2 class="section-divider">
      Vector Flow Field Variations
    </h2>
    <p class="description">
      Hover anywhere on card — vectors in header react. 5 magnetic field prototypes.
    </p>

    <div class="flow-grid">
      <article
        v-for="v in flowVariants"
        :key="v.key"
        class="flow-card"
        :class="{ 'flow-card--wide': v.key === 'quantized' }"
        @mousemove="(e: MouseEvent) => onFlowMouseMove(v.key, e)"
        @mouseleave="() => onFlowMouseLeave(v.key)"
      >
        <div class="flow-card__header">
          <VectorFlow
            :ref="(el: any) => { flowRefs[v.key].value = el }"
            :variant="v.key"
            :spacing="25"
            :radius="120"
          >
            <span class="flow-card__tag">{{ v.tag }}</span>
            <span class="flow-card__tag">{{ v.label }}</span>
          </VectorFlow>
        </div>
        <div class="flow-card__body">
          <h3 class="flow-card__title">
            {{ v.title }}
          </h3>
          <p class="flow-card__desc">
            {{ v.desc }}
          </p>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>
.effects-page {
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
}

.page-title {
  font-family: var(--font-sans);
  font-size: var(--text-3xl);
  font-weight: 300;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 3rem;
}

.effect-section {
  margin-bottom: 4rem;
}

.effect-section h2 {
  font-family: var(--font-sans);
  font-size: var(--text-lg);
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.description {
  font-size: var(--text-sm);
  color: var(--color-ink-muted);
  margin-bottom: 1rem;
}

.canvas-wrapper {
  position: relative;
  width: 100%;
  height: 300px;
  border: 1px solid var(--color-ink);
  overflow: hidden;
  cursor: crosshair;
}

.effect-canvas {
  --line-color: var(--color-ink-faint, rgba(0, 0, 0, 0.12));
  display: block;
}

.section-divider {
  font-family: var(--font-sans);
  font-size: var(--text-xl);
  font-weight: 300;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--color-ink);
}

.flow-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-top: 2rem;
}

.flow-card {
  border: 1px solid var(--color-ink);
  background: var(--color-bg);
  display: flex;
  flex-direction: column;
  cursor: crosshair;
}

.flow-card--wide {
  grid-column: 1 / -1;
}

.flow-card__header {
  border-bottom: 1px solid var(--color-ink);
  height: 180px;
  position: relative;
  overflow: hidden;
  background: var(--color-bg);
}

.flow-card__tag {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  text-transform: uppercase;
  padding: 0.5rem 1rem;
}

.flow-card__body {
  padding: 1.5rem;
  flex-grow: 1;
}

.flow-card__title {
  font-family: var(--font-serif);
  font-size: var(--text-2xl);
  font-style: italic;
  margin-bottom: 1rem;
}

.flow-card__desc {
  font-family: var(--font-sans);
  font-size: var(--text-md);
  line-height: 1.5;
}

@media (max-width: 1024px) {
  .flow-grid {
    grid-template-columns: 1fr;
  }
}
</style>
