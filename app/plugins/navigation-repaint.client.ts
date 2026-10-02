// Nuxt's navigation-repaint plugin, aware of view transitions.
//
// Before the route resolves it lets the browser paint once (the pressed
// link, the loading indicator), which keeps clicks responsive when the new
// page is heavy. But while a view transition is running the browser doesn't
// paint at all until the new page is in place, so that frame never comes and
// Nuxt's version sat out its 100ms fallback, with the page frozen, on every
// navigation. Here the wait is skipped during a view transition.
export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter()
  let activeTransition: ViewTransition | undefined

  nuxtApp.hook('page:view-transition:start', (transition) => {
    activeTransition = transition
    transition.finished.catch(() => {}).finally(() => {
      if (activeTransition === transition) activeTransition = undefined
    })
  })

  onNuxtReady(() => {
    router.beforeResolve(async () => {
      if (activeTransition) return
      await new Promise<void>((resolve) => {
        setTimeout(resolve, 100)
        requestAnimationFrame(() => setTimeout(resolve, 0))
      })
    })
  })
})
