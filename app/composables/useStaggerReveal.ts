import { usePreferredReducedMotion } from '@vueuse/core'
import type { MaybeRefOrGetter } from 'vue'

/**
 * Stagger-reveal children of a container when it enters the viewport.
 * Adds `.reveal-visible` to each child with a staggered delay.
 *
 * Uses CSS keyframe animations (not transitions) so child components'
 * own `transition` properties can't override the reveal effect.
 *
 * @param container - ref to the parent element
 * @param options.selector - CSS selector for children to animate (default: ':scope > *')
 * @param options.delay - delay between each child in ms (default: 80)
 * @param options.threshold - IntersectionObserver threshold (default: 0.1)
 */
export function useStaggerReveal(
  container: MaybeRefOrGetter<HTMLElement | null | undefined>,
  options: {
    selector?: string
    delay?: number
    threshold?: number
  } = {}
) {
  const {
    selector = ':scope > *',
    delay = 80,
    threshold = 0.1
  } = options

  const reducedMotion = usePreferredReducedMotion()
  let observer: IntersectionObserver | undefined

  onMounted(() => {
    const el = toValue(container)
    if (!el) return

    observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        if (!(entry.target instanceof HTMLElement)) return
        reveal(entry.target)
        observer?.disconnect()
      },
      { threshold: 0 }
    )
    observer.observe(el)
  })

  onUnmounted(() => observer?.disconnect())

  function reveal(el: HTMLElement) {
    const children = el.querySelectorAll(selector)

    if (reducedMotion.value === 'reduce') {
      children.forEach(child => child.classList.add('reveal-visible'))
    } else {
      children.forEach((child, i) => {
        const htmlChild = child as HTMLElement
        htmlChild.style.animationDelay = `${i * delay}ms`
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            htmlChild.classList.add('reveal-visible')
          })
        })
      })
    }
  }
}
