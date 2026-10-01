import { $fetch, fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'

import { NAV_ITEMS } from '../../app/utils/navigation'

const BROWSER_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'

interface ViewsResponse {
  path: string
  views: number
  total: number
}

describe('published routes', async () => {
  await setup({
    setupTimeout: 120_000
  })

  const routes = [
    { path: '/', text: 'Selected Works' },
    { path: '/projects', text: 'All Projects' },
    { path: '/blog', text: 'Keyboard Navigation in Composite Widgets' },
    { path: '/blog/keyboard-navigation-composite-widgets', text: 'Keyboard Navigation in Composite Widgets' }
  ]

  for (const route of routes) {
    it(`renders ${route.path}`, async () => {
      const html = await $fetch(route.path)

      expect(html).toContain('Fabian Kirchhoff')
      expect(html).toContain(route.text)
    })
  }

  // Shares the build above. The test database persists between runs
  // (.data/test), so assertions compare against the previous count.
  describe('POST /api/views', () => {
    const article = '/blog/use-announcer-nuxt'

    function postView(path: unknown, userAgent = BROWSER_UA, extraHeaders: Record<string, string> = {}) {
      return $fetch<ViewsResponse>('/api/views', {
        method: 'POST',
        body: { path },
        headers: { 'user-agent': userAgent, ...extraHeaders }
      })
    }

    it('counts a view and returns the page count and site total', async () => {
      const first = await postView(article)
      const second = await postView(`${article}/?utm_source=test`)

      expect(second.path).toBe(article)
      expect(second.views).toBe(first.views + 1)
      expect(second.total).toBe(first.total + 1)
      expect(second.total).toBeGreaterThanOrEqual(second.views)
    })

    it('reports but does not count bots and cross-site requests', async () => {
      const before = await postView(article)

      const bot = await postView(article, 'Mozilla/5.0 (compatible; Googlebot/2.1)')
      const crossSite = await postView(article, BROWSER_UA, { 'sec-fetch-site': 'cross-site' })

      expect(bot.views).toBe(before.views)
      expect(crossSite.views).toBe(before.views)
      expect(crossSite.total).toBe(before.total)
    })

    it('counts every page in the main navigation', async () => {
      for (const item of NAV_ITEMS) {
        const result = await postView(item.to)
        expect(result.path).toBe(item.to)
      }
    })

    it('rejects drafts and unknown pages without creating rows', async () => {
      const draft = await fetch('/api/views', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'user-agent': BROWSER_UA },
        body: JSON.stringify({ path: '/blog/vue-transition-vs-flip' })
      })
      const unknown = await fetch('/api/views', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'user-agent': BROWSER_UA },
        body: JSON.stringify({ path: '/definitely-not-a-page' })
      })

      expect(draft.status).toBe(404)
      expect(unknown.status).toBe(404)
    })

    it('rejects a request without a path', async () => {
      const response = await fetch('/api/views', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'user-agent': BROWSER_UA },
        body: JSON.stringify({})
      })

      expect(response.status).toBe(400)
    })
  })
})
