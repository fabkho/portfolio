import type { WaveOptions } from './wave-ripple-draw'
import { WaveEngine, type WaveMessage, type WaveReady } from './wave-ripple-engine'

// Main-thread side of WaveRipple's drawing. With OffscreenCanvas support every
// canvas goes to one shared worker; otherwise the same engine runs here.

export interface WaveSurface {
  resize: (width: number, height: number, dpr: number) => void
  setOptions: (options: WaveOptions) => void
  ripple: (x: number, y: number) => void
  dispose: () => void
}

interface Backend {
  offscreen: boolean
  post: (message: WaveMessage, transfer?: Transferable[]) => void
}

let backend: Backend | undefined
let nextId = 1
const readyCallbacks = new Map<number, () => void>()

function onReady(id: number) {
  readyCallbacks.get(id)?.()
  readyCallbacks.delete(id)
}

function createWorkerBackend(): Backend | undefined {
  if (typeof Worker === 'undefined' || !('transferControlToOffscreen' in HTMLCanvasElement.prototype)) return
  try {
    const worker = new Worker(new URL('./wave-ripple.worker.ts', import.meta.url), { type: 'module', name: 'wave-ripple' })
    worker.addEventListener('message', (event: MessageEvent<WaveReady>) => onReady(event.data.id))
    return { offscreen: true, post: (message, transfer = []) => worker.postMessage(message, transfer) }
  } catch {
    return undefined
  }
}

function getBackend(): Backend {
  if (!backend) {
    backend = createWorkerBackend() ?? (() => {
      const engine = new WaveEngine(callback => requestAnimationFrame(callback), onReady)
      return { offscreen: false, post: message => engine.handle(message) }
    })()
  }
  return backend
}

/**
 * Hands a canvas to the wave engine. In the worker case the canvas belongs
 * to the worker from here on and can't be drawn on from the main thread.
 * `onReady` runs once the first frame with the static hatch is drawn.
 */
export function attachWaveCanvas(
  canvas: HTMLCanvasElement,
  init: { width: number, height: number, dpr: number, options: WaveOptions, persistKey?: string },
  onReady: () => void
): WaveSurface {
  const { offscreen, post } = getBackend()
  const id = nextId++
  readyCallbacks.set(id, onReady)
  if (offscreen) {
    const target = canvas.transferControlToOffscreen()
    post({ type: 'init', id, canvas: target, ...init }, [target])
  } else {
    post({ type: 'init', id, canvas, ...init })
  }
  return {
    resize: (width, height, dpr) => post({ type: 'resize', id, width, height, dpr }),
    setOptions: options => post({ type: 'options', id, options }),
    ripple: (x, y) => post({ type: 'ripple', id, x, y }),
    dispose: () => {
      readyCallbacks.delete(id)
      post({ type: 'dispose', id })
    }
  }
}
