<script setup lang="ts">
import { useMediaQuery, usePreferredReducedMotion, useRafFn, useResizeObserver } from '@vueuse/core'

const props = withDefaults(
  defineProps<{
    mode?: 'click' | 'hover' | 'both'
    spacing?: number
    amplitude?: number
    maxRipples?: number
    lifetime?: number
    stillThreshold?: number
    color?: string
  }>(),
  {
    mode: 'hover',
    spacing: 6,
    amplitude: 10,
    maxRipples: 6,
    lifetime: 1800,
    stillThreshold: 150
  }
)

const wrapperRef = ref<HTMLElement>()
const canvasRef = ref<HTMLCanvasElement>()
const ripples = ref<{ x: number, y: number, time: number }[]>([])
let mouseStill = true
let stillTimer: ReturnType<typeof setTimeout>

const reducedMotion = usePreferredReducedMotion()
const isCoarsePointer = useMediaQuery('(pointer: coarse)')
const useStaticFallback = computed(() => reducedMotion.value === 'reduce' || isCoarsePointer.value)

function drawLines(canvas: HTMLCanvasElement, now: number) {
  const ctx = canvas.getContext('2d')!
  const dpr = window.devicePixelRatio
  const w = canvas.width / dpr
  const h = canvas.height / dpr
  const angle = Math.PI / 4
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  const nx = -sin
  const ny = cos

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, w, h)
  let color = props.color || ''
  if (color.startsWith('var(')) {
    const varName = color.slice(4, -1).trim()
    color = getComputedStyle(canvas).getPropertyValue(varName).trim()
  }
  ctx.strokeStyle = color
    || getComputedStyle(canvas).getPropertyValue('--line-color').trim()
    || 'rgba(0,0,0,0.12)'
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

watch(useStaticFallback, (isFallback) => {
  if (isFallback) {
    pause()
    ripples.value = []
  }
})

function spawnRipple(x: number, y: number) {
  if (useStaticFallback.value) return
  ripples.value.push({ x, y, time: performance.now() })
  if (ripples.value.length > props.maxRipples) ripples.value.shift()
  resume()
}

function initCanvas() {
  if (useStaticFallback.value) return
  const canvas = canvasRef.value
  const wrapper = wrapperRef.value
  if (!canvas || !wrapper) return
  const rect = wrapper.getBoundingClientRect()
  canvas.width = rect.width * window.devicePixelRatio
  canvas.height = rect.height * window.devicePixelRatio
  canvas.style.width = rect.width + 'px'
  canvas.style.height = rect.height + 'px'
  drawLines(canvas, 0)
}

useResizeObserver(wrapperRef, () => initCanvas())

function getLocalCoords(e: MouseEvent) {
  const rect = wrapperRef.value!.getBoundingClientRect()
  return { x: e.clientX - rect.left, y: e.clientY - rect.top }
}

function onMouseMove(e: MouseEvent) {
  if (props.mode !== 'hover' && props.mode !== 'both') return
  if (mouseStill) {
    mouseStill = false
    const { x, y } = getLocalCoords(e)
    spawnRipple(x, y)
  }
  clearTimeout(stillTimer)
  stillTimer = setTimeout(() => {
    mouseStill = true
  }, props.stillThreshold)
}

function onClick(e: MouseEvent) {
  if (props.mode !== 'click' && props.mode !== 'both') return
  const { x, y } = getLocalCoords(e)
  spawnRipple(x, y)
}

onMounted(() => initCanvas())

onUnmounted(() => clearTimeout(stillTimer))
</script>

<template>
  <div
    ref="wrapperRef"
    class="wave-ripple"
    :class="{ 'wave-ripple--static': useStaticFallback }"
    :style="useStaticFallback && color ? { '--wave-ripple-color': color } : undefined"
    @mousemove="onMouseMove"
    @click="onClick"
  >
    <canvas
      v-if="!useStaticFallback"
      ref="canvasRef"
      class="wave-ripple__canvas"
    />
    <div class="wave-ripple__content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.wave-ripple {
  position: relative;
  overflow: hidden;
}

.wave-ripple__canvas {
  --line-color: var(--color-ink-faint, rgba(0, 0, 0, 0.12));
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
  pointer-events: none;
}

.wave-ripple--static {
  background-image: repeating-linear-gradient(
    45deg,
    var(--wave-ripple-color, var(--color-ink-faint, rgba(0, 0, 0, 0.12))),
    var(--wave-ripple-color, var(--color-ink-faint, rgba(0, 0, 0, 0.12))) 1px,
    transparent 1px,
    transparent 6px
  );
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
