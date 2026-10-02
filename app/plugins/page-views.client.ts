import type { PageViewsResponse } from '~/composables/usePageViews'

/**
 * Counts a view on the initial load and on every client-side navigation to a
 * different path (hash changes from the TOC don't count). Pages are
 * prerendered, so this has to run in the browser; it also means crawlers that
 * don't execute JS are never counted.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const pageViews = usePageViews()
  const router = useRouter()
  let latestRequest = 0

  async function track(path: string) {
    const request = ++latestRequest

    try {
      const result = await $fetch<PageViewsResponse>('/api/views', {
        method: 'POST',
        body: { path }
      })

      pageViews.value.byPath[result.path] = result.views
      // A slower response from an earlier navigation mustn't overwrite a newer total.
      if (request === latestRequest) pageViews.value.total = result.total
    } catch {
      // Uncounted pages (404s, /effects) and outages leave the counts as they were.
    }
  }

  // Not `app:mounted`: the layout is an async component and hydrates after it.
  // A count landing mid-hydration makes the client render differ from the
  // server's placeholder — a mismatch Vue reports but never repairs.
  onNuxtReady(() => {
    track(router.currentRoute.value.path)
  })

  router.afterEach((to, from) => {
    if (nuxtApp.isHydrating || to.path === from.path) return
    track(to.path)
  })
})
