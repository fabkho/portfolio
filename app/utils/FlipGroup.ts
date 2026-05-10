import { cloneVNode, defineComponent, h, nextTick, onBeforeUpdate, onUpdated, provide, ref } from 'vue'
import type { PropType, VNode } from 'vue'
import { flipGroupContextKey } from './flipContext'

type FlipAnimation = Keyframe[] | ((el: HTMLElement) => Animation)

interface FlipRect {
  left: number
  top: number
  width: number
  height: number
}

/**
 * FlipGroup - Automatic FLIP animations for layout changes
 *
 * Wraps children and animates position/size changes using the FLIP technique.
 * Children must have a `data-flip-id` attribute for tracking.
 *
 * FLIP = First, Last, Invert, Play
 * - Captures element positions before Vue updates (onBeforeUpdate)
 * - After update, animates from old positions to new positions (onUpdated)
 *
 * Enter/Leave support:
 * - New elements (present after update but not before) get an enter animation
 * - Removed elements are re-inserted at their last known position as `position: absolute`,
 *   animated out, then truly removed from DOM. This technique (inspired by @formkit/auto-animate)
 *   ensures remaining elements reflow to final positions immediately, so FLIP measurements are correct.
 *
 * Why FlipGroup instead of TransitionGroup?
 * - TG's invert step sets `transitionDuration = '0s'` on every moved element, killing all
 *   concurrent CSS transitions (e.g. `flex-basis` on the resizing item) for the duration.
 * - FlipGroup uses the Web Animations API, which is layered on top of CSS and does not
 *   interfere with running CSS transitions.
 *
 * ⚠️ CSS transition conflict — the critical rule:
 * If the element changing size has a CSS transition (e.g. `flex-basis`, `width`), that
 * transition runs concurrently with the FLIP translate on its siblings. The flexbox keeps
 * shifting siblings for the full transition duration, pulling them in two directions at once
 * and breaking the animation. To avoid this:
 * - Do NOT put CSS transitions on layout properties (flex-basis, width, height) of items.
 * - Let size changes be instant. FLIP animates the siblings; the resized item just snaps.
 * - Use `excludeIds` to exclude the item currently changing size so it snaps without a
 *   competing translate on top of the layout shift.
 *
 * @example
 * ```vue
 * <FlipGroup tag="div" class="grid" :duration="300" :exclude-ids="excludeIds">
 *   <div
 *     v-for="item in items"
 *     :key="item.id"
 *     :data-flip-id="item.id"
 *   >
 *     {{ item.name }}
 *   </div>
 * </FlipGroup>
 * ```
 *
 * @example Custom enter/leave animations
 * ```vue
 * <FlipGroup
 *   :enter="[{ opacity: 0, transform: 'scale(0.9)' }, { opacity: 1, transform: 'scale(1)' }]"
 *   :leave="[{ opacity: 1 }, { opacity: 0 }]"
 * >
 * ```
 *
 * @example Full control via callback
 * ```vue
 * <FlipGroup
 *   :enter="(el) => el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500 })"
 * >
 * ```
 */
export const FlipGroup = defineComponent({
  name: 'FlipGroup',
  inheritAttrs: false,

  props: {
    /** HTML tag for wrapper element */
    tag: {
      type: String,
      default: 'div'
    },
    /** CSS selector for animated children */
    selector: {
      type: String,
      default: '[data-flip-id]'
    },
    /** Animation duration in ms */
    duration: {
      type: Number,
      default: 250
    },
    /** CSS easing function */
    easing: {
      type: String,
      default: 'cubic-bezier(0.4, 0, 0.2, 1)'
    },
    /** Disable animations */
    disabled: {
      type: Boolean,
      default: false
    },
    /** IDs to exclude from animation (they snap instantly) */
    excludeIds: {
      type: Set as PropType<Set<string>>,
      default: () => new Set()
    },
    /** Enter animation: Keyframe[] for declarative, or (el) => Animation for full control. Default: fade in. */
    enter: {
      type: [Array, Function] as PropType<FlipAnimation>,
      default: undefined
    },
    /** Leave animation: Keyframe[] for declarative, or (el) => Animation for full control. Default: fade out. */
    leave: {
      type: [Array, Function] as PropType<FlipAnimation>,
      default: undefined
    }
  },

  setup(props, { slots, expose, attrs }) {
    const containerRef = ref<HTMLElement | null>(null)

    // FLIP state — captured in onBeforeUpdate, consumed in onUpdated
    const savedRects = new Map<string, FlipRect>()
    const savedElements = new Map<string, HTMLElement>()
    const savedSiblings = new Map<string, [prev: Element | null, next: Element | null]>()

    // Tracks the FLIP animation we started on each element so we can cancel only ours
    const activeAnimations = new WeakMap<HTMLElement, Animation>()

    function resolveAnimation(
      el: HTMLElement,
      spec: FlipAnimation | undefined,
      fallbackKeyframes: Keyframe[]
    ): Animation | null {
      if (typeof spec === 'function') return spec(el)
      return el.animate(
        spec ?? fallbackKeyframes,
        { duration: props.duration, easing: props.easing }
      )
    }

    // Elements currently animating out (re-inserted as position:absolute)
    const leavingEls = new Map<string, HTMLElement>()

    /** Query tracked children, excluding elements that are animating out */
    function getTrackedItems(): HTMLElement[] {
      if (!containerRef.value) return []
      const leavingElSet = new Set(leavingEls.values())
      return Array.from(containerRef.value.querySelectorAll<HTMLElement>(props.selector))
        .filter(el => !leavingElSet.has(el))
    }

    function captureRects(): void {
      savedRects.clear()
      savedElements.clear()
      savedSiblings.clear()
      if (!containerRef.value) return

      const items = getTrackedItems()
      items.forEach((item) => {
        const id = item.dataset.flipId
        if (id) {
          const rect = item.getBoundingClientRect()
          savedRects.set(id, {
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height
          })
          savedElements.set(id, item)
          savedSiblings.set(id, [
            item.previousElementSibling,
            item.nextElementSibling
          ])
        }
      })
    }

    function playFlip(): void {
      if (!containerRef.value) return

      // ── Phase 1: Detect removed elements and re-insert for leave animation ──
      const newlyLeaving: Array<[string, HTMLElement]> = []
      const currentItems = getTrackedItems()
      const currentIds = new Set(
        currentItems.map(el => el.dataset.flipId).filter(Boolean) as string[]
      )

      // Cancel leave animations for elements that were re-added
      for (const [id, el] of [...leavingEls]) {
        if (currentIds.has(id)) {
          el.remove()
          leavingEls.delete(id)
        }
      }

      for (const [id, el] of savedElements) {
        if (currentIds.has(id) || leavingEls.has(id)) continue

        // Element was removed by Vue — re-insert as absolute for leave animation
        const container = containerRef.value!
        const [prev, next] = savedSiblings.get(id) ?? [null, null]

        // Re-insert at original DOM position
        if (next?.parentNode === container) {
          container.insertBefore(el, next)
        } else if (prev?.parentNode === container) {
          container.insertBefore(el, prev.nextSibling)
        } else {
          container.appendChild(el)
        }

        // Position absolutely at last known coordinates
        const rect = savedRects.get(id)!
        const parentRect = container.getBoundingClientRect()
        Object.assign(el.style, {
          position: 'absolute',
          top: `${rect.top - parentRect.top + container.scrollTop}px`,
          left: `${rect.left - parentRect.left + container.scrollLeft}px`,
          width: `${rect.width}px`,
          height: `${rect.height}px`,
          margin: '0',
          pointerEvents: 'none',
          zIndex: '0'
        })

        leavingEls.set(id, el)
        newlyLeaving.push([id, el])
      }

      // ── Phase 2: FLIP move animations on remaining elements ──
      // Re-query after Phase 1 (leaving elements are filtered out)
      const items = getTrackedItems()

      items.forEach((item) => {
        const id = item.dataset.flipId
        if (!id) return
        if (props.excludeIds.has(id)) return

        const oldRect = savedRects.get(id)
        if (!oldRect) return // new element — handled in Phase 3

        const newRect = item.getBoundingClientRect()
        const deltaX = oldRect.left - newRect.left
        const deltaY = oldRect.top - newRect.top

        if (Math.abs(deltaX) < 0.5 && Math.abs(deltaY) < 0.5) return

        activeAnimations.get(item)?.cancel()

        const animation = item.animate([
          { transform: `translate(${deltaX}px, ${deltaY}px)` },
          { transform: 'translate(0, 0)' }
        ], {
          duration: props.duration,
          easing: props.easing
        })
        activeAnimations.set(item, animation)
        animation.addEventListener('finish', () => activeAnimations.delete(item), { once: true })
        animation.addEventListener('cancel', () => activeAnimations.delete(item), { once: true })
      })

      // ── Phase 3: Enter animations for new elements ──
      items.forEach((item) => {
        const id = item.dataset.flipId
        if (!id || props.excludeIds.has(id)) return
        if (savedRects.has(id)) return // existing element, handled in Phase 2

        const animation = resolveAnimation(item, props.enter, [{ opacity: 0 }, { opacity: 1 }])
        if (animation) {
          activeAnimations.set(item, animation)
          animation.addEventListener('finish', () => activeAnimations.delete(item), { once: true })
          animation.addEventListener('cancel', () => activeAnimations.delete(item), { once: true })
        }
      })

      // ── Phase 4: Leave animations for newly re-inserted elements ──
      for (const [id, el] of newlyLeaving) {
        const cleanup = () => {
          el.remove()
          leavingEls.delete(id)
          activeAnimations.delete(el)
        }

        const animation = resolveAnimation(el, props.leave, [{ opacity: 1 }, { opacity: 0 }])
        if (animation) {
          activeAnimations.set(el, animation)
          animation.addEventListener('finish', cleanup, { once: true })
          animation.addEventListener('cancel', cleanup, { once: true })
        } else {
          cleanup()
        }
      }

      savedRects.clear()
      savedElements.clear()
      savedSiblings.clear()
    }

    let capturedForCycle = false
    let playScheduled = false

    function captureForCycle(): void {
      if (props.disabled) return
      if (capturedForCycle) return
      capturedForCycle = true
      captureRects()
    }

    async function schedulePlay(): Promise<void> {
      if (props.disabled) return
      if (playScheduled) return
      playScheduled = true
      await nextTick()
      playFlip()
      capturedForCycle = false
      playScheduled = false
    }

    provide(flipGroupContextKey, {
      captureForCycle,
      schedulePlay
    })

    // Capture positions before FlipGroup itself updates (items added/removed,
    // props/attrs changed, etc.).
    onBeforeUpdate(captureForCycle)

    // Play after FlipGroup itself updated and child Flip components had a chance
    // to pin their `[data-flip-id]` shells to final size.
    onUpdated(schedulePlay)

    // Expose methods and element for manual control
    expose({
      captureRects,
      playFlip,
      $el: containerRef
    })

    return () => {
      const children = slots.default?.() ?? []

      const augmented = children.map((vnode: VNode) => {
        if (typeof vnode !== 'object') return vnode

        const existingBeforeUpdate = vnode.props?.onVnodeBeforeUpdate
        const existingUpdated = vnode.props?.onVnodeUpdated

        return cloneVNode(vnode, {
          onVnodeBeforeUpdate(vnode, oldVnode) {
            if (typeof existingBeforeUpdate === 'function') existingBeforeUpdate(vnode, oldVnode)
            captureForCycle()
          },
          onVnodeUpdated(vnode, oldVnode) {
            if (typeof existingUpdated === 'function') existingUpdated(vnode, oldVnode)
            schedulePlay()
          }
        })
      })

      return h(
        props.tag,
        { ref: containerRef, ...attrs },
        augmented
      )
    }
  }
})

export default FlipGroup
