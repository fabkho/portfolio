import { drawWaveHatch, type Ripple, type WaveOptions } from './wave-ripple-draw'

// Owns every WaveRipple canvas on the page and animates them in one frame
// loop that only runs while some ripple is alive. Runs inside the worker
// (with OffscreenCanvas) or, where that isn't supported, on the main thread.

type WaveCanvas = HTMLCanvasElement | OffscreenCanvas
type WaveContext = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D

export type WaveMessage
  = | { type: 'init', id: number, canvas: WaveCanvas, width: number, height: number, dpr: number, options: WaveOptions, persistKey?: string }
    | { type: 'resize', id: number, width: number, height: number, dpr: number }
    | { type: 'options', id: number, options: WaveOptions }
    | { type: 'ripple', id: number, x: number, y: number }
    | { type: 'dispose', id: number }

export interface WaveReady { type: 'ready', id: number }

interface Surface {
  canvas: WaveCanvas
  ctx: WaveContext
  width: number
  height: number
  dpr: number
  options: WaveOptions
  ripples: Ripple[]
  persistKey?: string
}

// Longest frame step: after a stall, ripples jump at most this far ahead
const MAX_FRAME_DELTA = 34

export class WaveEngine {
  private surfaces = new Map<number, Surface>()
  // Ripples of a disposed persistKey surface, picked up by the next one
  private parked = new Map<string, { ripples: Ripple[], at: number }>()
  private running = false
  private lastFrame = 0

  constructor(
    private requestFrame: (callback: (now: number) => void) => void,
    private onReady: (id: number) => void
  ) {}

  handle(message: WaveMessage) {
    switch (message.type) {
      case 'init': return this.init(message)
      case 'resize': return this.resize(message.id, message.width, message.height, message.dpr)
      case 'options': return this.setOptions(message.id, message.options)
      case 'ripple': return this.addRipple(message.id, message.x, message.y)
      case 'dispose': return this.dispose(message.id)
    }
  }

  private init(message: Extract<WaveMessage, { type: 'init' }>) {
    const ctx = message.canvas.getContext('2d') as WaveContext | null
    if (!ctx) return
    const surface: Surface = {
      canvas: message.canvas,
      ctx,
      width: 0,
      height: 0,
      dpr: 1,
      options: message.options,
      ripples: this.unpark(message.persistKey, message.options.lifetime),
      persistKey: message.persistKey
    }
    this.surfaces.set(message.id, surface)
    this.resize(message.id, message.width, message.height, message.dpr)
    this.onReady(message.id)
    if (surface.ripples.length > 0) this.start()
  }

  private resize(id: number, width: number, height: number, dpr: number) {
    const surface = this.surfaces.get(id)
    if (!surface) return
    surface.width = width
    surface.height = height
    surface.dpr = dpr
    surface.canvas.width = Math.max(1, Math.ceil(width * dpr))
    surface.canvas.height = Math.max(1, Math.ceil(height * dpr))
    this.draw(surface)
  }

  private setOptions(id: number, options: WaveOptions) {
    const surface = this.surfaces.get(id)
    if (!surface) return
    surface.options = options
    this.draw(surface)
  }

  private addRipple(id: number, x: number, y: number) {
    const surface = this.surfaces.get(id)
    if (!surface) return
    surface.ripples.push({ x, y, age: 0 })
    if (surface.ripples.length > surface.options.maxRipples) surface.ripples.shift()
    this.start()
  }

  private dispose(id: number) {
    const surface = this.surfaces.get(id)
    if (!surface) return
    this.surfaces.delete(id)
    if (surface.persistKey && surface.ripples.length > 0) {
      this.parked.set(surface.persistKey, { ripples: surface.ripples, at: performance.now() })
    }
  }

  private unpark(persistKey: string | undefined, lifetime: number): Ripple[] {
    const parked = persistKey ? this.parked.get(persistKey) : undefined
    if (!parked) return []
    this.parked.delete(persistKey!)
    const gone = performance.now() - parked.at
    return parked.ripples
      .map(ripple => ({ ...ripple, age: ripple.age + gone }))
      .filter(ripple => ripple.age < lifetime)
  }

  private draw(surface: Surface) {
    drawWaveHatch(surface.ctx, surface.width, surface.height, surface.dpr, surface.options, surface.ripples)
  }

  private start() {
    if (this.running) return
    this.running = true
    this.lastFrame = 0
    this.requestFrame(this.tick)
  }

  private tick = (now: number) => {
    const delta = this.lastFrame ? Math.min(now - this.lastFrame, MAX_FRAME_DELTA) : 16
    this.lastFrame = now
    let alive = false
    for (const surface of this.surfaces.values()) {
      if (surface.ripples.length === 0) continue
      for (const ripple of surface.ripples) ripple.age += delta
      surface.ripples = surface.ripples.filter(ripple => ripple.age < surface.options.lifetime)
      // Draws once more after the last ripple dies, leaving straight lines
      this.draw(surface)
      if (surface.ripples.length > 0) alive = true
    }
    if (alive) this.requestFrame(this.tick)
    else this.running = false
  }
}
