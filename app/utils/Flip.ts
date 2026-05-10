import { cloneVNode, defineComponent, h, inject, onBeforeUpdate, onUpdated, ref } from 'vue'
import type { PropType } from 'vue'
import { flipGroupContextKey } from './flipContext'

type FlipAxis = 'width' | 'height' | 'both'
type FlipElementRef = HTMLElement | { $el?: HTMLElement } | null

/**
 * Flip — Automatic FLIP size animation for a single element.
 *
 * Wraps a single child and animates its width/height when content changes.
 * Works like Vue's `<Transition>` but for content-driven size changes
 * (e.g. text changing, children added/removed) rather than enter/leave.
 *
 * Uses the FLIP technique:
 * - Captures element size before Vue updates (onBeforeUpdate)
 * - After update, animates from old size to new size via Web Animations API
 *
 * The animation uses `overflow: hidden` during playback so content doesn't
 * overflow while the size catches up.
 *
 * @example Basic usage — animate width changes
 * ```vue
 * <Flip>
 *   <span>{{ dynamicText }}</span>
 * </Flip>
 * ```
 *
 * @example Animate height
 * ```vue
 * <Flip axis="height">
 *   <div>{{ expandingContent }}</div>
 * </Flip>
 * ```
 *
 * @example Both axes with custom duration
 * ```vue
 * <Flip axis="both" :duration="300">
 *   <div>{{ content }}</div>
 * </Flip>
 * ```
 *
 * @example Inline element (renders as span)
 * ```vue
 * <Flip tag="span">
 *   <span>{{ label }}</span>
 * </Flip>
 * ```
 */
export const Flip = defineComponent({
  name: 'Flip',
  inheritAttrs: false,

  props: {
    /** HTML tag for wrapper element. Default: no wrapper (renders child directly). */
    tag: {
      type: String as PropType<string | null>,
      default: null
    },
    /** Which axis to animate */
    axis: {
      type: String as PropType<FlipAxis>,
      default: 'width'
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
    /**
     * When Flip is inside a FlipGroup item (`[data-flip-id]`), pin that parent
     * shell to the final size during the visual width/height animation.
     * This keeps flex/grid wrapping stable while the child animates.
     */
    stabilizeLayout: {
      type: Boolean,
      default: true
    }
  },

  setup(props, { slots, attrs }) {
    const elRef = ref<FlipElementRef>(null)
    const flipGroup = inject(flipGroupContextKey, null)

    let savedWidth: number | null = null
    let savedHeight: number | null = null

    function getElement(): HTMLElement | null {
      const value = elRef.value
      if (value instanceof HTMLElement) return value
      return value?.$el instanceof HTMLElement ? value.$el : null
    }

    onBeforeUpdate(() => {
      if (props.disabled) return
      // If this Flip lives inside a FlipGroup, the group must capture sibling
      // positions before this element's content/size update changes layout.
      flipGroup?.captureForCycle()

      const el = getElement()
      if (!el) return

      const rect = el.getBoundingClientRect()
      savedWidth = rect.width
      savedHeight = rect.height
    })

    onUpdated(() => {
      if (props.disabled) return
      const el = getElement()
      if (!el) return
      if (savedWidth === null && savedHeight === null) return

      const rect = el.getBoundingClientRect()
      const newWidth = rect.width
      const newHeight = rect.height
      const oldWidth = savedWidth
      const oldHeight = savedHeight
      savedWidth = null
      savedHeight = null

      const animateWidth = (props.axis === 'width' || props.axis === 'both')
        && oldWidth !== null && Math.abs(oldWidth - newWidth) >= 1
      const animateHeight = (props.axis === 'height' || props.axis === 'both')
        && oldHeight !== null && Math.abs(oldHeight - newHeight) >= 1

      if (!animateWidth && !animateHeight) return

      const from: Keyframe = { overflow: 'hidden' }
      const to: Keyframe = { overflow: 'hidden' }

      if (animateWidth) {
        from.width = `${oldWidth}px`
        to.width = `${newWidth}px`
      }
      if (animateHeight) {
        from.height = `${oldHeight}px`
        to.height = `${newHeight}px`
      }

      const shell = props.stabilizeLayout
        ? el.parentElement?.closest<HTMLElement>('[data-flip-id]')
        : null

      if (shell) {
        if (animateWidth) shell.style.width = `${newWidth}px`
        if (animateHeight) shell.style.height = `${newHeight}px`
        // Do not set overflow:hidden on the shell.
        // On shrink, the visual child must be allowed to overflow the final-size
        // shell while it animates from old width → new width. The child itself
        // owns overflow:hidden for its internal content clipping.
      }

      // If the element is a flex item inside the stabilized shell, default
      // flex-shrink: 1 can force it down to the shell's final (smaller) width
      // during shrink, making the animation look like a snap. Pin it visually
      // for the duration of the animation.
      const previousFlexShrink = el.style.flexShrink
      el.style.flexShrink = '0'

      const animation = el.animate([from, to], {
        duration: props.duration,
        easing: props.easing
      })

      // Shell has been pinned now; let the group measure final shell positions
      // and play sibling movement. This makes nested size changes observable
      // without requiring external `trigger` / `data-state` props.
      flipGroup?.schedulePlay()

      animation.finished.finally(() => {
        el.style.flexShrink = previousFlexShrink
        if (shell) {
          if (animateWidth) shell.style.width = ''
          if (animateHeight) shell.style.height = ''
        }
      })
    })

    return () => {
      const children = slots.default?.() ?? []

      if (props.tag) {
        return h(props.tag, { ref: elRef, ...attrs }, children)
      }

      // No wrapper tag — attach ref to the single child VNode
      const child = children[0]
      if (!child) return null

      if (typeof child === 'object' && 'type' in child) {
        return cloneVNode(child, { ref: elRef, ...attrs })
      }

      return child
    }
  }
})

export default Flip
