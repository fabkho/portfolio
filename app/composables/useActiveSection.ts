export function useActiveSection() {
  const activeId = ref<string>('')

  onMounted(() => {
    const scrollContainer = document.querySelector('.scroll-content')
    const headings = document.querySelectorAll('article h2[id], article h3[id]')
    if (!headings.length) return

    // Use scroll event for accurate tracking within the scroll container
    const root = scrollContainer || window

    function updateActive() {
      const container = scrollContainer as HTMLElement | null
      const scrollTop = container ? container.scrollTop : window.scrollY
      const offset = 100

      let current = ''
      for (const heading of headings) {
        const el = heading as HTMLElement
        const top = container
          ? el.offsetTop - container.offsetTop
          : el.getBoundingClientRect().top + window.scrollY

        if (scrollTop >= top - offset) {
          current = el.id
        }
      }

      if (current) {
        activeId.value = current
      }
    }

    root.addEventListener('scroll', updateActive, { passive: true })
    updateActive()

    onUnmounted(() => {
      root.removeEventListener('scroll', updateActive)
    })
  })

  return activeId
}
