export function useActiveSection() {
  const activeId = ref<string>('')

  onMounted(() => {
    const headings = document.querySelectorAll('article h2[id], article h3[id]')
    if (!headings.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            activeId.value = entry.target.id
          }
        }
      },
      {
        rootMargin: '-80px 0px -60% 0px',
        threshold: 0
      }
    )

    headings.forEach((heading) => observer.observe(heading))

    onUnmounted(() => observer.disconnect())
  })

  return activeId
}
