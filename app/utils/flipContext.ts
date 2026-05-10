import type { InjectionKey } from 'vue'

export interface FlipGroupContext {
  captureForCycle: () => void
  schedulePlay: () => void | Promise<void>
}

export const flipGroupContextKey = Symbol.for('portfolio.flipGroupContext') as InjectionKey<FlipGroupContext>
