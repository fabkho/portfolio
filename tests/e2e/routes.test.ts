import { randomUUID } from 'node:crypto'

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

    // Every request here comes from localhost, and the server counts each
    // visitor once per page per day — so each new visitor needs its own user
    // agent. Random per run, because the test database outlives the run.
    function visitorUa(base = BROWSER_UA) {
      return `${base} e2e/${randomUUID()}`
    }

    function postView(path: unknown, userAgent: string, extra: { headers?: Record<string, string>, count?: boolean } = {}) {
      return $fetch<ViewsResponse>('/api/views', {
        method: 'POST',
        body: extra.count === undefined ? { path } : { path, count: extra.count },
        headers: { 'user-agent': userAgent, ...extra.headers }
      })
    }

    it('counts a new visitor and returns the page count and site total', async () => {
      const first = await postView(article, visitorUa())
      const second = await postView(`${article}/?utm_source=test`, visitorUa())

      expect(second.path).toBe(article)
      expect(second.views).toBe(first.views + 1)
      expect(second.total).toBe(first.total + 1)
      expect(second.total).toBeGreaterThanOrEqual(second.views)
    })

    it('counts the same visitor once per page per day, however often they reload', async () => {
      const ua = visitorUa()
      const first = await postView(article, ua)
      for (let i = 0; i < 5; i++) await postView(article, ua)
      const afterReloads = await postView(article, ua)

      expect(afterReloads.views).toBe(first.views)
      expect(afterReloads.total).toBe(first.total)

      // Another page is a separate count for the same visitor.
      const otherPage = await postView('/blog/nuxt-server-side-auth', ua)
      expect(otherPage.total).toBe(afterReloads.total + 1)
    })

    it('does not count a browser that opted out, but still returns the counts', async () => {
      const ua = visitorUa()
      const before = await postView(article, visitorUa(), { count: false })
      const optedOut = await postView(article, ua, { count: false })

      expect(optedOut.views).toBe(before.views)
      expect(optedOut.total).toBe(before.total)

      // The same visitor without the opt-out is new, so the opt-out — not
      // dedupe — is what kept the count flat.
      const counted = await postView(article, ua)
      expect(counted.views).toBe(before.views + 1)
    })

    // Each case is a brand-new visitor, so dedupe can't hide a broken check.
    it('reports but does not count bots, AI agents, and cross-site requests', async () => {
      const before = await postView(article, visitorUa(), { count: false })

      const bot = await postView(article, visitorUa('Mozilla/5.0 (compatible; Googlebot/2.1)'))
      const crossSite = await postView(article, visitorUa(), { headers: { 'sec-fetch-site': 'cross-site' } })
      // No "bot" anywhere in it — the original pattern counted this one.
      const aiFetcher = await postView(article, visitorUa('Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Claude-User/1.0)'))
      const signedAgent = await postView(article, visitorUa(), { headers: { 'signature-agent': '"https://chatgpt.com"' } })

      for (const result of [bot, crossSite, aiFetcher, signedAgent]) {
        expect(result.views).toBe(before.views)
        expect(result.total).toBe(before.total)
      }
    })

    it('counts every page in the main navigation', async () => {
      for (const item of NAV_ITEMS) {
        const result = await postView(item.to, visitorUa())
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
