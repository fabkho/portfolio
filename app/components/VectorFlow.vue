<script setup lang="ts">
type FlowVariant = 'attractor' | 'repulsor' | 'magnifier' | 'swirl' | 'quantized'

const props = withDefaults(
  defineProps<{
    variant?: FlowVariant
    spacing?: number
    radius?: number
    color?: string
    restColor?: string
  }>(),
  {
    variant: 'attractor',
    spacing: 25,
    radius: 120,
    color: '#D44D3A',
    restColor: 'rgba(44, 44, 42, 0.2)'
  }
)

const canvasRef = ref<HTMLCanvasElement>()
const containerRef = ref<HTMLElement>()
let raf = 0
let time = 0
const mouse = reactive({ x: -1000, y: -1000 })

const prefersReducedMotion = ref(false)
const isCoarsePointer = ref(false)
const useStaticFallback = computed(() => prefersReducedMotion.value || isCoarsePointer.value)

function resize() {
  const canvas = canvasRef.value
  const container = containerRef.value
  if (!canvas || !container) return
  const rect = container.getBoundingClientRect()
  const dpr = window.devicePixelRatio
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  canvas.style.width = rect.width + 'px'
  canvas.style.height = rect.height + 'px'
}

function drawAttractor(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const lineLen = 8
  for (let x = props.spacing / 2; x < w; x += props.spacing) {
    for (let y = props.spacing / 2; y < h; y += props.spacing) {
      let angle = Math.PI / 4
      const dist = Math.hypot(mouse.x - x, mouse.y - y)
      const influenced = mouse.x > 0 && dist < props.radius

      if (influenced) {
        angle = Math.atan2(mouse.y - y, mouse.x - x)
        ctx.strokeStyle = props.color
      } else {
        ctx.strokeStyle = props.restColor
      }

      ctx.lineWidth = 1.5
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(angle)
      ctx.beginPath()
      ctx.moveTo(-lineLen / 2, 0)
      ctx.lineTo(lineLen / 2, 0)
      if (influenced) {
        ctx.lineTo(lineLen / 2 - 3, -3)
        ctx.moveTo(lineLen / 2, 0)
        ctx.lineTo(lineLen / 2 - 3, 3)
      }
      ctx.stroke()
      ctx.restore()
    }
  }
}

function drawRepulsor(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const lineLen = 10
  for (let x = props.spacing / 2; x < w; x += props.spacing) {
    for (let y = props.spacing / 2; y < h; y += props.spacing) {
      let angle = Math.PI / 2
      const dist = Math.hypot(mouse.x - x, mouse.y - y)
      const influence = Math.max(0, 1 - dist / props.radius)

      if (mouse.x > 0 && influence > 0) {
        angle = Math.atan2(mouse.y - y, mouse.x - x) + Math.PI
        ctx.strokeStyle = props.color
        ctx.lineWidth = 1.5 + influence * 1.5
      } else {
        ctx.strokeStyle = props.restColor
        ctx.lineWidth = 1.5
      }

      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(angle)
      ctx.beginPath()
      ctx.moveTo(-lineLen / 2, 0)
      ctx.lineTo(lineLen / 2, 0)
      ctx.stroke()
      ctx.restore()
    }
  }
}

function drawMagnifier(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const baseLen = 4
  for (let x = props.spacing / 2; x < w; x += props.spacing) {
    for (let y = props.spacing / 2; y < h; y += props.spacing) {
      const dist = Math.hypot(mouse.x - x, mouse.y - y)
      const influence = mouse.x > 0 ? Math.max(0, 1 - dist / (props.radius * 1.25)) : 0
      const len = baseLen + influence * 18

      if (influence > 0) {
        ctx.strokeStyle = props.color
        ctx.lineWidth = 1.5 + influence
      } else {
        ctx.strokeStyle = props.restColor
        ctx.lineWidth = 1.5
      }

      ctx.save()
      ctx.translate(x, y)
      ctx.beginPath()
      ctx.moveTo(-len / 2, 0)
      ctx.lineTo(len / 2, 0)
      ctx.stroke()
      ctx.restore()
    }
  }
}

function drawSwirl(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const lineLen = 10
  ctx.lineWidth = 1.5

  for (let x = props.spacing / 2; x < w; x += props.spacing) {
    for (let y = props.spacing / 2; y < h; y += props.spacing) {
      let angle = Math.sin(x * 0.01 + time) * Math.cos(y * 0.01 + time)
      const dist = Math.hypot(mouse.x - x, mouse.y - y)
      const influence = mouse.x > 0 ? Math.max(0, 1 - dist / props.radius) : 0

      if (influence > 0) {
        const targetAngle = Math.atan2(mouse.y - y, mouse.x - x) + Math.PI / 2
        angle = angle * (1 - influence) + targetAngle * influence
        ctx.strokeStyle = props.color
      } else {
        ctx.strokeStyle = props.restColor
      }

      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(angle)
      ctx.beginPath()
      ctx.moveTo(-lineLen / 2, 0)
      ctx.lineTo(lineLen / 2, 0)
      ctx.stroke()
      ctx.restore()
    }
  }
}

function drawQuantized(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const lineLen = 12
  ctx.lineWidth = 2

  for (let x = props.spacing / 2; x < w; x += props.spacing) {
    for (let y = props.spacing / 2; y < h; y += props.spacing) {
      let angle = 0
      const dist = Math.hypot(mouse.x - x, mouse.y - y)
      const influenced = mouse.x > 0 && dist < props.radius * 1.17

      if (influenced) {
        const rawAngle = Math.atan2(mouse.y - y, mouse.x - x)
        const segment = Math.PI / 4
        angle = Math.round(rawAngle / segment) * segment
        ctx.strokeStyle = props.color
      } else {
        ctx.strokeStyle = 'rgba(44, 44, 42, 0.15)'
      }

      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(angle)
      ctx.beginPath()
      ctx.moveTo(-lineLen / 2, 0)
      ctx.lineTo(lineLen / 2, 0)
      if (influenced) {
        ctx.moveTo(lineLen / 2, -3)
        ctx.lineTo(lineLen / 2, 3)
      }
      ctx.stroke()
      ctx.restore()
    }
  }
}

const drawFns: Record<FlowVariant, (ctx: CanvasRenderingContext2D, w: number, h: number) => void> = {
  attractor: drawAttractor,
  repulsor: drawRepulsor,
  magnifier: drawMagnifier,
  swirl: drawSwirl,
  quantized: drawQuantized
}

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')!
  const dpr = window.devicePixelRatio
  const w = canvas.width / dpr
  const h = canvas.height / dpr

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, w, h)

  if (props.variant === 'swirl') time += 0.02

  drawFns[props.variant](ctx, w, h)
  raf = requestAnimationFrame(draw)
}

function onMouseMove(e: MouseEvent) {
  const container = containerRef.value
  if (!container) return
  const rect = container.getBoundingClientRect()
  mouse.x = e.clientX - rect.left
  mouse.y = e.clientY - rect.top
}

function onMouseLeave() {
  mouse.x = -1000
  mouse.y = -1000
}

onMounted(() => {
  const motionMq = window.matchMedia('(prefers-reduced-motion: reduce)')
  prefersReducedMotion.value = motionMq.matches
  motionMq.addEventListener('change', e => prefersReducedMotion.value = e.matches)
  isCoarsePointer.value = window.matchMedia('(pointer: coarse)').matches

  if (!useStaticFallback.value) {
    resize()
    raf = requestAnimationFrame(draw)
    window.addEventListener('resize', resize)
  }
})

onUnmounted(() => {
  cancelAnimationFrame(raf)
  window.removeEventListener('resize', resize)
})

defineExpose({ onMouseMove, onMouseLeave })
</script>

<template>
  <div
    ref="containerRef"
    class="vector-flow"
  >
    <canvas
      v-if="!useStaticFallback"
      ref="canvasRef"
      class="vector-flow__canvas"
    />
    <div class="vector-flow__content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.vector-flow {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100%;
}

.vector-flow__canvas {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.vector-flow__content {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  width: 100%;
}
</style>
