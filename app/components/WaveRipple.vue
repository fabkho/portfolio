<script setup lang="ts">
import { useDevicePixelRatio, useElementVisibility, useIntervalFn, useMediaQuery, useMouseInElement, usePreferredReducedMotion, useRafFn, useResizeObserver, useThrottleFn } from '@vueuse/core'

const props = withDefaults(
  defineProps<{
    mode?: 'click' | 'hover' | 'both'
    spacing?: number
    amplitude?: number
    maxRipples?: number
    lifetime?: number
    stillThreshold?: number
    color?: string
    alternateColor?: string
    alternateEvery?: number
    tag?: string
  }>(),
  {
    mode: 'hover',
    spacing: 6,
    amplitude: 10,
    maxRipples: 6,
    lifetime: 1800,
    stillThreshold: 150,
    alternateEvery: 4,
    tag: 'div'
  }
)

const wrapperRef = ref<HTMLElement>()
const canvasRef = ref<HTMLCanvasElement>()
const patternId = useId()
const tileSize = computed(() => props.spacing * Math.SQRT2)
const waveRippleStyle = computed(() => ({
  '--wave-ripple-line-color': props.color || undefined
}))
const ripples = ref<{ x: number, y: number, time: number }[]>([])
const canvasReady = ref(false)
const reducedMotion = usePreferredReducedMotion()
const isTouch = useMediaQuery('(pointer: coarse)')
const isWrapperVisible = useElementVisibility(wrapperRef)
const { pixelRatio } = useDevicePixelRatio()
const { elementX, elementY, elementWidth, elementHeight, isOutside } = useMouseInElement(wrapperRef)
const shouldSkipMotion = computed(() => reducedMotion.value === 'reduce')

function drawLines(canvas: HTMLCanvasElement, now: number) {
  const ctx = canvas.getContext('2d')!
  const dpr = pixelRatio.value
  const w = canvas.width / dpr
  const h = canvas.height / dpr
  const angle = Math.PI / 4
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  const nx = -sin
  const ny = cos

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, w, h)
  let baseColor = props.color || ''
  if (baseColor.startsWith('var(')) {
    const varName = baseColor.slice(4, -1).trim()
    baseColor = getComputedStyle(canvas).getPropertyValue(varName).trim()
  }
  baseColor = baseColor
    || getComputedStyle(canvas).getPropertyValue('--line-color').trim()
    || 'rgba(0,0,0,0.12)'

  let altColor = props.alternateColor || ''
  if (altColor.startsWith('var(')) {
    const varName = altColor.slice(4, -1).trim()
    altColor = getComputedStyle(canvas).getPropertyValue(varName).trim()
  }

  ctx.lineWidth = 1

  const diag = Math.hypot(w, h)
  const lineCount = Math.ceil(diag / props.spacing) * 2
  const steps = Math.max(30, Math.ceil(diag / 8))
  const lineLen = diag * 1.6
  const startX = -lineLen * 0.3
  const stepSize = lineLen / steps
  const arr = ripples.value

  for (let i = -lineCount; i < lineCount; i++) {
    const ox = i * props.spacing * nx
    const oy = i * props.spacing * ny

    const lineIndex = i + lineCount
    ctx.strokeStyle = (altColor && lineIndex % props.alternateEvery === 0)
      ? altColor
      : baseColor

    ctx.beginPath()
    for (let s = 0; s <= steps; s++) {
      const along = startX + s * stepSize
      let px = along * cos + ox
      let py = along * sin + oy

      let totalDisp = 0
      for (let r = 0; r < arr.length; r++) {
        const ripple = arr[r]!
        const elapsed = (now - ripple.time) / 1000
        const dist = Math.hypot(px - ripple.x, py - ripple.y)
        const distToWave = dist - elapsed * 160
        if (distToWave > 50 || distToWave < -50) continue
        const fade = 1 - (now - ripple.time) / props.lifetime
        if (fade <= 0) continue
        totalDisp += Math.sin((distToWave / 50) * Math.PI) * fade * props.amplitude
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

const { pause, resume } = useRafFn(({ timestamp }) => {
  const canvas = canvasRef.value
  if (!canvas) {
    pause()
    return
  }
  ripples.value = ripples.value.filter(r => timestamp - r.time < props.lifetime)
  drawLines(canvas, timestamp)
  if (ripples.value.length === 0) pause()
}, { immediate: false })

function spawnRipple(x: number, y: number) {
  if (shouldSkipMotion.value) return
  ripples.value.push({ x, y, time: performance.now() })
  if (ripples.value.length > props.maxRipples) ripples.value.shift()
  resume()
}

function initCanvas() {
  if (shouldSkipMotion.value) {
    canvasReady.value = false
    return
  }
  const canvas = canvasRef.value
  const wrapper = wrapperRef.value
  if (!canvas || !wrapper) return
  const rect = wrapper.getBoundingClientRect()
  canvas.width = rect.width * pixelRatio.value
  canvas.height = rect.height * pixelRatio.value
  canvas.style.width = rect.width + 'px'
  canvas.style.height = rect.height + 'px'
  drawLines(canvas, 0)
  canvasReady.value = true
}

useResizeObserver(wrapperRef, () => initCanvas())

const spawnHoverRipple = useThrottleFn(() => {
  if (isOutside.value) return
  spawnRipple(elementX.value, elementY.value)
}, props.stillThreshold, false, true)

function onMouseMove() {
  if (props.mode !== 'hover' && props.mode !== 'both') return
  spawnHoverRipple()
}

function onClick() {
  if (props.mode !== 'click' && props.mode !== 'both') return
  if (isOutside.value) return
  spawnRipple(elementX.value, elementY.value)
}

// Randomly trigger ripples for mobile devices
const { pause: pauseRandom, resume: resumeRandom } = useIntervalFn(() => {
  if (!wrapperRef.value || !isTouch.value || shouldSkipMotion.value || !isWrapperVisible.value) return

  // 30% chance to skip a beat so it feels more organic
  if (Math.random() > 0.7) return

  const x = Math.random() * elementWidth.value
  const y = Math.random() * elementHeight.value
  spawnRipple(x, y)
}, 1250, { immediate: false })

onMounted(() => {
  if (isTouch.value) resumeRandom()
  initCanvas()
})

watch([pixelRatio, shouldSkipMotion], () => initCanvas())
watch(isTouch, (touch) => {
  if (touch) resumeRandom()
  else pauseRandom()
})

onUnmounted(() => {
  pauseRandom()
})
</script>

<template>
  <component
    :is="tag"
    ref="wrapperRef"
    class="wave-ripple"
    :class="{ 'wave-ripple--canvas-ready': canvasReady }"
    :style="waveRippleStyle"
    @mousemove="onMouseMove"
    @click="onClick"
  >
    <svg
      class="wave-ripple__fallback"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <pattern
          :id="patternId"
          patternUnits="userSpaceOnUse"
          :width="tileSize"
          :height="tileSize"
        >
          <path
            :d="`M ${-tileSize} 0 L 0 ${tileSize} M 0 0 L ${tileSize} ${tileSize} M ${tileSize} 0 L ${tileSize * 2} ${tileSize}`"
            stroke="var(--wave-ripple-line-color)"
            stroke-width="1"
            fill="none"
            vector-effect="non-scaling-stroke"
          />
        </pattern>
      </defs>
      <rect
        width="100%"
        height="100%"
        :fill="`url(#${patternId})`"
      />
    </svg>
    <canvas
      ref="canvasRef"
      class="wave-ripple__canvas"
    />
    <div class="wave-ripple__content">
      <slot />
    </div>
  </component>
</template>

<style scoped>
.wave-ripple {
  --wave-ripple-line-color: var(--color-ink-faint, rgba(0, 0, 0, 0.12));
  position: relative;
  overflow: hidden;
}

.wave-ripple__fallback,
.wave-ripple__canvas {
  position: absolute;
  inset: 0;
  z-index: 0;
  display: block;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.wave-ripple__canvas {
  --line-color: var(--wave-ripple-line-color);
}

.wave-ripple--canvas-ready .wave-ripple__fallback {
  display: none;
}

/* Static hatched fallback for coarse pointers (touch) and reduced motion */
@media (pointer: coarse), (prefers-reduced-motion: reduce) {
  .wave-ripple__canvas {
    /* Kept visible for coarse, but hidden if explicitly preferring reduced motion via JS logic */
  }
}

.wave-ripple__content {
  position: relative;
  z-index: 1;
  display: inherit;
  flex-direction: inherit;
  align-items: inherit;
  justify-content: inherit;
  gap: inherit;
  flex-grow: 1;
}
</style>
