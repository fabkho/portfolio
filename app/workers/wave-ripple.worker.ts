import { WaveEngine, type WaveMessage, type WaveReady } from './wave-ripple-engine'

// Dedicated worker that draws every WaveRipple canvas (handed over with
// transferControlToOffscreen), so the hatch keeps animating while the main
// thread is busy with a page navigation or the /books 3D scene.

// Typed by hand: the "webworker" lib clashes with "dom" in the app tsconfig
interface WorkerScope {
  onmessage: ((event: MessageEvent<WaveMessage>) => void) | null
  postMessage: (message: WaveReady) => void
  requestAnimationFrame?: (callback: (now: number) => void) => number
}

const scope = self as unknown as WorkerScope

const requestFrame = typeof scope.requestAnimationFrame === 'function'
  ? (callback: (now: number) => void) => { scope.requestAnimationFrame!(callback) }
  : (callback: (now: number) => void) => { setTimeout(() => callback(performance.now()), 16) }

const engine = new WaveEngine(requestFrame, id => scope.postMessage({ type: 'ready', id }))

scope.onmessage = event => engine.handle(event.data)
