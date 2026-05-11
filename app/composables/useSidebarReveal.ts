import { usePreferredReducedMotion } from '@vueuse/core'
import type { MaybeRefOrGetter } from 'vue'

/**
 * Stagger-reveal sidebar children on every route change.
 * Same keyframe animation as useStaggerReveal but re-triggers
 * whenever the watched sources change (route, sidebar state).
 */
export function useSidebarReveal(
  container: MaybeRefOrGetter<HTMLElement | null | undefined>,
  options: {
    selector?: string
    delay?: number
  } = {}
) {
  const {
    selector = ':scope > *',
    delay = 80
  } = options

  const route = useRoute()
  const { sidebarState } = useLayoutSidebar()
  const reducedMotion = usePreferredReducedMotion()

  function reveal() {
    const el = toValue(container)
    if (!el) return

    const children = el.querySelectorAll(selector)

    // Reset previous animation state
    children.forEach((child) => {
      const htmlChild = child as HTMLElement
      htmlChild.classList.remove('reveal-visible')
      htmlChild.style.animationDelay = ''
    })

    // Force reflow so reset takes effect
    void el.offsetHeight

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

  // Reveal on mount
  onMounted(() => nextTick(reveal))

  // Re-reveal on route or sidebar content change
  watch(
    [() => route.path, () => sidebarState.value.component],
    () => nextTick(reveal)
  )
}
