// Draws the WaveRipple hatch: 45° lines that bend away from expanding
// ripple rings. Plain data in, pixels out, so it runs the same in the
// worker (OffscreenCanvas) and on the main thread (fallback).

export interface WaveOptions {
  spacing: number
  amplitude: number
  lifetime: number
  maxRipples: number
  alternateEvery: number
  color: string
  alternateColor: string
}

export interface Ripple {
  x: number
  y: number
  age: number
}

type Context2D = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D

const COS = Math.SQRT1_2
const SIN = Math.SQRT1_2
// Unit normal of the lines: every line sits at `index * spacing` along it.
const NX = -SIN
const NY = COS
const WAVE_SPEED = 160
const WAVE_HALF_WIDTH = 50

export function drawWaveHatch(
  ctx: Context2D,
  width: number,
  height: number,
  dpr: number,
  options: WaveOptions,
  ripples: readonly Ripple[]
) {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, width, height)
  if (width <= 0 || height <= 0) return

  const { spacing, amplitude, lifetime, alternateEvery, color, alternateColor } = options

  // Rings still visible this frame, with their radius and faded strength
  const rings: { x: number, y: number, radius: number, strength: number, offset: number }[] = []
  for (const ripple of ripples) {
    const fade = 1 - ripple.age / lifetime
    if (fade <= 0) continue
    rings.push({
      x: ripple.x,
      y: ripple.y,
      radius: (ripple.age / 1000) * WAVE_SPEED,
      strength: fade * amplitude,
      offset: ripple.x * NX + ripple.y * NY
    })
  }

  const diag = Math.hypot(width, height)
  const lineCount = Math.ceil(diag / spacing) * 2
  const steps = Math.max(30, Math.ceil(diag / 8))
  const lineLen = diag * 1.6
  const startX = -lineLen * 0.3
  const stepSize = lineLen / steps

  // Only the lines that can reach the canvas: its corners project onto the
  // normal between -width·½√2 and height·½√2, plus room for displacement.
  const margin = Math.ceil((amplitude * Math.max(1, rings.length)) / spacing) + 1
  const first = Math.max(-lineCount, Math.floor((-width * SIN) / spacing) - margin)
  const last = Math.min(lineCount - 1, Math.ceil((height * COS) / spacing) + margin)

  // Undisturbed lines are straight and never cross, so they share one path
  // per colour. Lines a ring passes over are stroked one by one, as before.
  const straight: number[] = []
  const straightAlt: number[] = []
  const bent: number[] = []

  for (let i = first; i <= last; i++) {
    const lineOffset = i * spacing
    let touched = false
    for (const ring of rings) {
      if (Math.abs(ring.offset - lineOffset) <= ring.radius + WAVE_HALF_WIDTH) {
        touched = true
        break
      }
    }
    if (touched) bent.push(i)
    else if (alternateColor && (i + lineCount) % alternateEvery === 0) straightAlt.push(i)
    else straight.push(i)
  }

  ctx.lineWidth = 1
  const strokeStraight = (lines: number[], style: string) => {
    if (lines.length === 0) return
    ctx.strokeStyle = style
    ctx.beginPath()
    for (const i of lines) {
      const ox = i * spacing * NX
      const oy = i * spacing * NY
      ctx.moveTo(startX * COS + ox, startX * SIN + oy)
      ctx.lineTo((startX + lineLen) * COS + ox, (startX + lineLen) * SIN + oy)
    }
    ctx.stroke()
  }
  strokeStraight(straight, color)
  strokeStraight(straightAlt, alternateColor)

  for (const i of bent) {
    const ox = i * spacing * NX
    const oy = i * spacing * NY
    ctx.strokeStyle = (alternateColor && (i + lineCount) % alternateEvery === 0) ? alternateColor : color
    ctx.beginPath()
    for (let s = 0; s <= steps; s++) {
      const along = startX + s * stepSize
      let px = along * COS + ox
      let py = along * SIN + oy

      let displacement = 0
      for (const ring of rings) {
        const toWave = Math.hypot(px - ring.x, py - ring.y) - ring.radius
        if (toWave > WAVE_HALF_WIDTH || toWave < -WAVE_HALF_WIDTH) continue
        displacement += Math.sin((toWave / WAVE_HALF_WIDTH) * Math.PI) * ring.strength
      }
      if (displacement !== 0) {
        px += NX * displacement
        py += NY * displacement
      }

      if (s === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.stroke()
  }
}
