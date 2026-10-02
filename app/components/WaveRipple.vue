<script setup lang="ts">
import { useDevicePixelRatio, useElementVisibility, useIntervalFn, useMediaQuery, usePreferredReducedMotion, useResizeObserver } from '@vueuse/core'
import { attachWaveCanvas, type WaveSurface } from '~/workers/wave-ripple-client'
import type { WaveOptions } from '~/workers/wave-ripple-draw'

// A hatch of 45° lines that ripples under the pointer. The static hatch is
// an SVG pattern; the animated one is a canvas drawn by a shared worker
// (OffscreenCanvas), so it never competes with the main thread. Without
// OffscreenCanvas the same engine runs on the main thread.
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
    /** Ripples survive an unmount/remount with the same key (e.g. across pages) */
    persistKey?: string
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

const canvasReady = ref(false)
const reducedMotion = usePreferredReducedMotion()
const isTouch = useMediaQuery('(pointer: coarse)')
const isWrapperVisible = useElementVisibility(wrapperRef)
const { pixelRatio } = useDevicePixelRatio()
const shouldSkipMotion = computed(() => reducedMotion.value === 'reduce')

// Not reactive: the canvas belongs to the wave engine once attached
let surface: WaveSurface | undefined
let width = 0
let height = 0
let lastHoverRipple = -Infinity

function resolveColor(canvas: HTMLCanvasElement, value: string | undefined) {
  if (!value?.startsWith('var(')) return value || ''
  return getComputedStyle(canvas).getPropertyValue(value.slice(4, -1).trim()).trim()
}

// Read once per attach/prop change, never per frame
function readOptions(canvas: HTMLCanvasElement): WaveOptions {
  return {
    spacing: props.spacing,
    amplitude: props.amplitude,
    lifetime: props.lifetime,
    maxRipples: props.maxRipples,
    alternateEvery: props.alternateEvery,
    color: resolveColor(canvas, props.color)
      || getComputedStyle(canvas).getPropertyValue('--line-color').trim()
      || 'rgba(0,0,0,0.12)',
    alternateColor: resolveColor(canvas, props.alternateColor)
  }
}

function attach() {
  const canvas = canvasRef.value
  if (surface || !canvas || shouldSkipMotion.value || width === 0 || height === 0) return
  surface = attachWaveCanvas(
    canvas,
    { width, height, dpr: pixelRatio.value, options: readOptions(canvas), persistKey: props.persistKey },
    () => { canvasReady.value = !shouldSkipMotion.value }
  )
}

// The wrapper's padding box is what the absolutely positioned canvas covers
useResizeObserver(wrapperRef, () => {
  const wrapper = wrapperRef.value
  if (!wrapper) return
  width = wrapper.clientWidth
  height = wrapper.clientHeight
  if (surface) surface.resize(width, height, pixelRatio.value)
  else attach()
})

watch(pixelRatio, (dpr) => {
  surface?.resize(width, height, dpr)
})

watch(() => [props.spacing, props.amplitude, props.lifetime, props.maxRipples, props.alternateEvery, props.color, props.alternateColor], () => {
  if (surface && canvasRef.value) surface.setOptions(readOptions(canvasRef.value))
})

// Reduced motion: back to the static SVG hatch (a transferred canvas can't
// be handed over again, so the surface stays and is just hidden)
watch(shouldSkipMotion, (skip) => {
  if (skip) canvasReady.value = false
  else if (surface) canvasReady.value = true
  else attach()
})

function spawnRipple(x: number, y: number) {
  if (shouldSkipMotion.value || !canvasReady.value) return
  surface?.ripple(x, y)
}

function spawnAtPointer(event: MouseEvent) {
  const wrapper = wrapperRef.value
  if (!wrapper) return
  const rect = wrapper.getBoundingClientRect()
  spawnRipple(event.clientX - rect.left - wrapper.clientLeft, event.clientY - rect.top - wrapper.clientTop)
}

// Leading-edge throttle: one ripple, then nothing for stillThreshold ms
function onMouseMove(event: MouseEvent) {
  if (props.mode !== 'hover' && props.mode !== 'both') return
  if (event.timeStamp - lastHoverRipple < props.stillThreshold) return
  lastHoverRipple = event.timeStamp
  spawnAtPointer(event)
}

function onClick(event: MouseEvent) {
  if (props.mode !== 'click' && props.mode !== 'both') return
  spawnAtPointer(event)
}

// Randomly trigger ripples for mobile devices
const { pause: pauseRandom, resume: resumeRandom } = useIntervalFn(() => {
  if (!isTouch.value || !isWrapperVisible.value) return

  // 30% chance to skip a beat so it feels more organic
  if (Math.random() > 0.7) return

  spawnRipple(Math.random() * width, Math.random() * height)
}, 1250, { immediate: false })

onMounted(() => {
  if (isTouch.value) resumeRandom()
})

watch(isTouch, (touch) => {
  if (touch) resumeRandom()
  else pauseRandom()
})

onUnmounted(() => {
  pauseRandom()
  surface?.dispose()
  surface = undefined
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

/* Until the engine has drawn (and again under reduced motion) the SVG shows */
.wave-ripple:not(.wave-ripple--canvas-ready) .wave-ripple__canvas {
  visibility: hidden;
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
