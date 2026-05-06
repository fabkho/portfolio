export function useActiveSection() {
  const activeId = ref<string>('')

  onMounted(() => {
    const headings = document.querySelectorAll('article h2[id], article h3[id]')
    if (!headings.length) return

    function updateActive() {
      const scrollTop = window.scrollY
      const offset = 120

      let current = ''
      for (const heading of headings) {
        const el = heading as HTMLElement
        const top = el.getBoundingClientRect().top + window.scrollY

        if (scrollTop >= top - offset) {
          current = el.id
        }
      }

      if (current) {
        activeId.value = current
      }
    }

    window.addEventListener('scroll', updateActive, { passive: true })
    updateActive()

    onUnmounted(() => {
      window.removeEventListener('scroll', updateActive)
    })
  })

  return activeId
}
