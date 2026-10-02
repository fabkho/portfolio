import type { PageViewsResponse } from '~/composables/usePageViews'

const OPT_OUT_KEY = 'views:ignore'

/**
 * Counts a view on the initial load and on every client-side navigation to a
 * different path (hash changes from the TOC don't count). Pages are
 * prerendered, so this has to run in the browser; it also means crawlers that
 * don't execute JS are never counted. The server counts each visitor once per
 * page per day.
 *
 * Owner opt-out: visiting any page with `?views=off` stops this browser from
 * being counted (it still sees the counts); `?views=on` undoes it.
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
        body: isOptedOut() ? { path, count: false } : { path }
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
  onNuxtReady(async () => {
    await applyOptOutParam()
    track(router.currentRoute.value.path)
  })

  router.afterEach((to, from) => {
    if (nuxtApp.isHydrating || to.path === from.path) return
    track(to.path)
  })

  async function applyOptOutParam() {
    const { query } = router.currentRoute.value
    const choice = query.views
    if (choice !== 'off' && choice !== 'on') return

    try {
      if (choice === 'off') localStorage.setItem(OPT_OUT_KEY, '1')
      else localStorage.removeItem(OPT_OUT_KEY)
      console.info(choice === 'off'
        ? '[views] This browser is no longer counted. Undo with ?views=on'
        : '[views] This browser is counted again.')
    } catch {
      // Storage blocked (some private modes): nothing to remember.
    }

    // Drop the parameter so it isn't bookmarked or shared by accident.
    const { views: _views, ...rest } = query
    await router.replace({ query: rest, hash: router.currentRoute.value.hash })
  }
})

function isOptedOut() {
  try {
    return localStorage.getItem(OPT_OUT_KEY) === '1'
  } catch {
    return false
  }
}
