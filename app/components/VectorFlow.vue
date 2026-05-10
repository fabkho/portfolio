<script setup lang="ts">
import { useMediaQuery, usePreferredReducedMotion, useRafFn, useResizeObserver } from '@vueuse/core'

type FlowVariant
  = | 'horizontal' | 'diagonal' | 'radial' | 'convergent' | 'wave'
    | 'crosshatch' | 'pulse' | 'spiral' | 'scatter' | 'quantized'
    | 'shimmer' | 'tide' | 'flicker' | 'gravity' | 'constellation'

const props = withDefaults(
  defineProps<{
    variant?: FlowVariant
    spacing?: number
    radius?: number
    activeColor?: string
    restColor?: string
  }>(),
  {
    variant: 'horizontal',
    spacing: 25,
    radius: 140,
    activeColor: '#D44D3A',
    restColor: 'rgba(44, 44, 42, 0.2)'
  }
)

const canvasRef = ref<HTMLCanvasElement>()
const containerRef = ref<HTMLElement>()
let time = 0
const mouse = reactive({ x: -1000, y: -1000 })

const reducedMotion = usePreferredReducedMotion()
const isCoarsePointer = useMediaQuery('(pointer: coarse)')
const useStaticFallback = computed(() => reducedMotion.value === 'reduce' || isCoarsePointer.value)

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

useResizeObserver(containerRef, () => {
  if (!useStaticFallback.value) resize()
})

function getInfluence(x: number, y: number) {
  const dist = Math.hypot(mouse.x - x, mouse.y - y)
  return mouse.x > 0 ? Math.max(0, 1 - dist / props.radius) : 0
}

function getDist(x: number, y: number) {
  return Math.hypot(mouse.x - x, mouse.y - y)
}

function pseudoRandom(x: number, y: number) {
  const seed = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return seed - Math.floor(seed)
}

// --- STATIC EFFECTS ---

function drawHorizontal(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const baseLen = 2
  for (let x = props.spacing / 2; x < w; x += props.spacing) {
    for (let y = props.spacing / 2; y < h; y += props.spacing) {
      const influence = getInfluence(x, y)
      const len = baseLen + influence * 8
      ctx.strokeStyle = influence > 0 ? props.activeColor : props.restColor
      ctx.lineWidth = 1 + influence * 0.8
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

function drawDiagonal(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const baseLen = 2
  const angle = Math.PI / 4
  for (let x = props.spacing / 2; x < w; x += props.spacing) {
    for (let y = props.spacing / 2; y < h; y += props.spacing) {
      const influence = getInfluence(x, y)
      const len = baseLen + influence * 8
      ctx.strokeStyle = influence > 0 ? props.activeColor : props.restColor
      ctx.lineWidth = 1 + influence * 0.8
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(angle)
      ctx.beginPath()
      ctx.moveTo(-len / 2, 0)
      ctx.lineTo(len / 2, 0)
      ctx.stroke()
      ctx.restore()
    }
  }
}

function drawRadial(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const baseLen = 2
  for (let x = props.spacing / 2; x < w; x += props.spacing) {
    for (let y = props.spacing / 2; y < h; y += props.spacing) {
      const influence = getInfluence(x, y)
      const len = baseLen + influence * 7
      const angle = influence > 0 ? Math.atan2(y - mouse.y, x - mouse.x) : 0
      ctx.strokeStyle = influence > 0 ? props.activeColor : props.restColor
      ctx.lineWidth = 1 + influence * 0.8
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(angle)
      ctx.beginPath()
      ctx.moveTo(-len / 2, 0)
      ctx.lineTo(len / 2, 0)
      ctx.stroke()
      ctx.restore()
    }
  }
}

function drawConvergent(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const baseLen = 2
  for (let x = props.spacing / 2; x < w; x += props.spacing) {
    for (let y = props.spacing / 2; y < h; y += props.spacing) {
      const influence = getInfluence(x, y)
      const len = baseLen + influence * 7
      const angle = influence > 0 ? Math.atan2(mouse.y - y, mouse.x - x) : 0
      ctx.strokeStyle = influence > 0 ? props.activeColor : props.restColor
      ctx.lineWidth = 1 + influence * 0.5
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(angle)
      ctx.beginPath()
      ctx.moveTo(-len / 2, 0)
      ctx.lineTo(len / 2, 0)
      if (influence > 0.3) {
        ctx.lineTo(len / 2 - 2, -1.5)
        ctx.moveTo(len / 2, 0)
        ctx.lineTo(len / 2 - 2, 1.5)
      }
      ctx.stroke()
      ctx.restore()
    }
  }
}

function drawWave(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const baseLen = 2
  for (let x = props.spacing / 2; x < w; x += props.spacing) {
    for (let y = props.spacing / 2; y < h; y += props.spacing) {
      const dist = getDist(x, y)
      const influence = getInfluence(x, y)
      const len = baseLen + influence * 7
      const rippleAngle = influence > 0
        ? Math.sin(dist * 0.08 - time * 3) * influence * 0.6
        : 0
      ctx.strokeStyle = influence > 0 ? props.activeColor : props.restColor
      ctx.lineWidth = 1 + influence * 0.8
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(rippleAngle)
      ctx.beginPath()
      ctx.moveTo(-len / 2, 0)
      ctx.lineTo(len / 2, 0)
      ctx.stroke()
      ctx.restore()
    }
  }
}

function drawCrosshatch(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const baseLen = 2
  const angles = [Math.PI / 4, -Math.PI / 4]
  for (const angle of angles) {
    for (let x = props.spacing / 2; x < w; x += props.spacing) {
      for (let y = props.spacing / 2; y < h; y += props.spacing) {
        const influence = getInfluence(x, y)
        const len = baseLen + influence * 6
        ctx.strokeStyle = influence > 0 ? props.activeColor : props.restColor
        ctx.lineWidth = 0.8 + influence * 0.6
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(angle)
        ctx.beginPath()
        ctx.moveTo(-len / 2, 0)
        ctx.lineTo(len / 2, 0)
        ctx.stroke()
        ctx.restore()
      }
    }
  }
}

function drawPulse(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const baseLen = 2
  for (let x = props.spacing / 2; x < w; x += props.spacing) {
    for (let y = props.spacing / 2; y < h; y += props.spacing) {
      const dist = getDist(x, y)
      const influence = getInfluence(x, y)
      const ringPhase = Math.sin(dist * 0.06 - time * 4)
      const ringInfluence = influence * Math.max(0, ringPhase)
      const len = baseLen + ringInfluence * 8
      ctx.strokeStyle = ringInfluence > 0.1 ? props.activeColor : props.restColor
      ctx.lineWidth = 1 + ringInfluence * 0.8
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

function drawSpiral(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const baseLen = 2
  for (let x = props.spacing / 2; x < w; x += props.spacing) {
    for (let y = props.spacing / 2; y < h; y += props.spacing) {
      const influence = getInfluence(x, y)
      const len = baseLen + influence * 7
      const angle = influence > 0
        ? Math.atan2(y - mouse.y, x - mouse.x) + Math.PI / 2
        : 0
      ctx.strokeStyle = influence > 0 ? props.activeColor : props.restColor
      ctx.lineWidth = 1 + influence * 0.8
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(angle)
      ctx.beginPath()
      ctx.moveTo(-len / 2, 0)
      ctx.lineTo(len / 2, 0)
      ctx.stroke()
      ctx.restore()
    }
  }
}

function drawScatter(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const baseLen = 2
  for (let x = props.spacing / 2; x < w; x += props.spacing) {
    for (let y = props.spacing / 2; y < h; y += props.spacing) {
      const influence = getInfluence(x, y)
      const len = baseLen + influence * 7
      const restAngle = pseudoRandom(x, y) * Math.PI * 2
      const targetAngle = Math.atan2(mouse.y - y, mouse.x - x)
      const angle = influence > 0
        ? restAngle * (1 - influence) + targetAngle * influence
        : restAngle
      ctx.strokeStyle = influence > 0 ? props.activeColor : props.restColor
      ctx.lineWidth = 1 + influence * 0.5
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(angle)
      ctx.beginPath()
      ctx.moveTo(-len / 2, 0)
      ctx.lineTo(len / 2, 0)
      ctx.stroke()
      ctx.restore()
    }
  }
}

function drawQuantized(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const baseLen = 2
  for (let x = props.spacing / 2; x < w; x += props.spacing) {
    for (let y = props.spacing / 2; y < h; y += props.spacing) {
      const influence = getInfluence(x, y)
      const len = baseLen + influence * 7
      let angle = 0
      if (influence > 0) {
        const rawAngle = Math.atan2(mouse.y - y, mouse.x - x)
        const segment = Math.PI / 2
        angle = Math.round(rawAngle / segment) * segment
      }
      ctx.strokeStyle = influence > 0 ? props.activeColor : props.restColor
      ctx.lineWidth = 1 + influence * 0.6
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(angle)
      ctx.beginPath()
      ctx.moveTo(-len / 2, 0)
      ctx.lineTo(len / 2, 0)
      if (influence > 0.2) {
        ctx.moveTo(len / 2, -1.5)
        ctx.lineTo(len / 2, 1.5)
      }
      ctx.stroke()
      ctx.restore()
    }
  }
}

// --- SUBTLE ANIMATED EFFECTS ---

function drawShimmer(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const baseLen = 2
  for (let x = props.spacing / 2; x < w; x += props.spacing) {
    for (let y = props.spacing / 2; y < h; y += props.spacing) {
      const influence = getInfluence(x, y)
      const phase = pseudoRandom(x, y) * Math.PI * 2
      const shimmer = Math.sin(time * 1.2 + phase) * 0.5 + 0.5
      const len = baseLen + influence * 6 + shimmer * influence * 3
      ctx.strokeStyle = influence > 0 ? props.activeColor : props.restColor
      ctx.lineWidth = 1 + influence * 0.5
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

function drawTide(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const baseLen = 2
  for (let x = props.spacing / 2; x < w; x += props.spacing) {
    for (let y = props.spacing / 2; y < h; y += props.spacing) {
      const influence = getInfluence(x, y)
      const wave = (Math.sin(x * 0.03 - time * 0.8) + 1) / 2
      const combined = wave * 0.3 + influence * 0.7
      const len = baseLen + combined * 7
      ctx.strokeStyle = combined > 0.25 ? props.activeColor : props.restColor
      ctx.lineWidth = 1 + combined * 0.5
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

function drawFlicker(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const baseLen = 2
  for (let x = props.spacing / 2; x < w; x += props.spacing) {
    for (let y = props.spacing / 2; y < h; y += props.spacing) {
      const influence = getInfluence(x, y)
      const phase = pseudoRandom(x, y) * Math.PI * 2
      const flicker = (Math.sin(time * 0.7 + phase) + 1) / 2
      const opacity = influence > 0
        ? influence + (1 - influence) * flicker * 0.4
        : flicker * 0.5
      if (opacity < 0.15) continue
      const len = baseLen + influence * 7
      ctx.globalAlpha = opacity
      ctx.strokeStyle = influence > 0.1 ? props.activeColor : props.restColor
      ctx.lineWidth = 1 + influence * 0.5
      ctx.save()
      ctx.translate(x, y)
      ctx.beginPath()
      ctx.moveTo(-len / 2, 0)
      ctx.lineTo(len / 2, 0)
      ctx.stroke()
      ctx.restore()
      ctx.globalAlpha = 1
    }
  }
}

function drawGravity(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const baseLen = 2
  for (let x = props.spacing / 2; x < w; x += props.spacing) {
    for (let y = props.spacing / 2; y < h; y += props.spacing) {
      const influence = getInfluence(x, y)
      const len = baseLen + influence * 7
      const phase = pseudoRandom(x, y) * Math.PI * 2
      const sway = Math.sin(time * 0.4 + phase) * 0.08
      const restAngle = Math.PI / 2 + sway
      const targetAngle = influence > 0
        ? Math.atan2(mouse.y - y, mouse.x - x)
        : restAngle
      const angle = restAngle * (1 - influence) + targetAngle * influence
      ctx.strokeStyle = influence > 0 ? props.activeColor : props.restColor
      ctx.lineWidth = 1 + influence * 0.5
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(angle)
      ctx.beginPath()
      ctx.moveTo(-len / 2, 0)
      ctx.lineTo(len / 2, 0)
      ctx.stroke()
      ctx.restore()
    }
  }
}

function drawConstellation(ctx: CanvasRenderingContext2D, w: number, h: number) {
  for (let x = props.spacing / 2; x < w; x += props.spacing) {
    for (let y = props.spacing / 2; y < h; y += props.spacing) {
      const influence = getInfluence(x, y)
      const restAngle = pseudoRandom(x, y) * Math.PI * 2
      const drift = Math.sin(time * 0.3 + restAngle) * 0.05
      const angle = restAngle + drift
      if (influence < 0.05) {
        ctx.fillStyle = props.restColor
        ctx.beginPath()
        ctx.arc(x, y, 0.8, 0, Math.PI * 2)
        ctx.fill()
      } else {
        const len = influence * 8
        ctx.strokeStyle = props.activeColor
        ctx.lineWidth = 0.8 + influence * 0.5
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(angle)
        ctx.beginPath()
        ctx.moveTo(-len / 2, 0)
        ctx.lineTo(len / 2, 0)
        ctx.stroke()
        ctx.restore()
      }
    }
  }
}

const drawFns: Record<FlowVariant, (ctx: CanvasRenderingContext2D, w: number, h: number) => void> = {
  horizontal: drawHorizontal,
  diagonal: drawDiagonal,
  radial: drawRadial,
  convergent: drawConvergent,
  wave: drawWave,
  crosshatch: drawCrosshatch,
  pulse: drawPulse,
  spiral: drawSpiral,
  scatter: drawScatter,
  quantized: drawQuantized,
  shimmer: drawShimmer,
  tide: drawTide,
  flicker: drawFlicker,
  gravity: drawGravity,
  constellation: drawConstellation
}

function draw({ delta }: { delta: number }) {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')!
  const dpr = window.devicePixelRatio
  const w = canvas.width / dpr
  const h = canvas.height / dpr

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, w, h)

  time += delta / 1000

  drawFns[props.variant](ctx, w, h)
}

const { pause, resume } = useRafFn(draw, { immediate: false })

watch(useStaticFallback, (isFallback) => {
  if (isFallback) {
    pause()
  } else {
    nextTick(() => {
      resize()
      resume()
    })
  }
})

function onMouseMove(e: MouseEvent) {
  const container = containerRef.value
  if (!container) return
  const rect = container.getBoundingClientRect()
  mouse.x = e.clientX - rect.left
  mouse.y = e.clientY - rect.top
}

function setMouse(x: number, y: number) {
  mouse.x = x
  mouse.y = y
}

function onMouseLeave() {
  mouse.x = -1000
  mouse.y = -1000
}

onMounted(() => {
  if (!useStaticFallback.value) {
    resize()
    resume()
  }
})

defineExpose({ onMouseMove, onMouseLeave, setMouse })
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
