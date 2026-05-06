import { useThrottleFn, useWindowScroll } from '@vueuse/core'
import { onMounted, ref, watch } from 'vue'

export interface ActiveSectionOptions {
  selector?: string
  offset?: number
  throttleMs?: number
}

export function getActiveHeadingId(headings: Iterable<Element>, scrollY: number, offset = 120) {
  let current = ''

  for (const heading of headings) {
    const el = heading as HTMLElement
    const top = el.getBoundingClientRect().top + scrollY

    if (scrollY >= top - offset) {
      current = el.id
    }
  }

  return current
}

export function useActiveSection(options: ActiveSectionOptions = {}) {
  const { selector = 'article h2[id], article h3[id]', offset = 120, throttleMs = 100 } = options
  const activeId = ref<string>('')
  const { y } = useWindowScroll()

  const updateActive = () => {
    if (typeof document === 'undefined') return

    activeId.value = getActiveHeadingId(document.querySelectorAll(selector), y.value, offset)
  }

  const throttledUpdate = useThrottleFn(updateActive, throttleMs, true, true)

  watch(y, () => throttledUpdate(), { immediate: true })
  onMounted(updateActive)

  return activeId
}
