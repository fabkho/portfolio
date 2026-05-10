import { useIntersectionObserver, usePreferredReducedMotion } from '@vueuse/core'
import type { MaybeRefOrGetter } from 'vue'

/**
 * Stagger-reveal children of a container when it enters the viewport.
 * Adds `.reveal-visible` to each child with a staggered delay.
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

  const { stop } = useIntersectionObserver(
    container,
    ([entry]) => {
      if (!entry?.isIntersecting) return
      if (!(entry.target instanceof HTMLElement)) return
      reveal(entry.target)
      stop()
    },
    { threshold, immediate: true }
  )

  function reveal(el: HTMLElement) {
    const children = el.querySelectorAll(selector)

    if (reducedMotion.value === 'reduce') {
      children.forEach(child => child.classList.add('reveal-visible'))
    } else {
      children.forEach((child, i) => {
        const htmlChild = child as HTMLElement
        htmlChild.style.transitionDelay = `${i * delay}ms`
        // Double-rAF ensures the browser has painted the initial hidden
        // state before triggering the transition. On fast edge servers
        // (e.g. Cloudflare) a single rAF can fire before first paint,
        // causing the browser to batch both states and skip the animation.
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            htmlChild.classList.add('reveal-visible')
          })
        })
        htmlChild.addEventListener('transitionend', () => {
          htmlChild.style.transitionDelay = ''
        }, { once: true })
      })
    }
  }
}
