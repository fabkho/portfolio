import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

import { readPublishedBlogPaths, toContentPath } from '../../modules/view-paths/blog-paths'
import { createViewSalt, normalizeViewPath, shouldCountView, viewDay, visitorHash } from '../../server/utils/views'

const BROWSER_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'

const REAL_BROWSERS = [
  BROWSER_UA,
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:131.0) Gecko/20100101 Firefox/131.0',
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36 Edg/130.0',
  'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/26.0 Chrome/122.0 Mobile Safari/537.36'
]

// AI crawlers, assistants, and agents, as their token appears in a
// `compatible; …` user agent. Several don't contain "bot" at all.
const AI_AGENTS = [
  'GPTBot', 'ChatGPT-User', 'OAI-SearchBot', 'ClaudeBot', 'Claude-User', 'Claude-SearchBot',
  'PerplexityBot', 'Perplexity-User', 'MistralAI-User', 'meta-externalagent', 'Google-Agent',
  'Gemini-Deep-Research', 'cohere-ai', 'NovaAct', 'Bytespider', 'CCBot', 'Amazonbot', 'Applebot'
]
const compatibleUa = (token: string) => `Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ${token}/1.0)`

describe('normalizeViewPath', () => {
  it('keeps the root and strips trailing slashes elsewhere', () => {
    expect(normalizeViewPath('/')).toBe('/')
    expect(normalizeViewPath('/blog/')).toBe('/blog')
    expect(normalizeViewPath('/blog/foo//')).toBe('/blog/foo')
  })

  it('drops query strings and hashes', () => {
    expect(normalizeViewPath('/blog/foo?ref=x')).toBe('/blog/foo')
    expect(normalizeViewPath('/blog/foo#section')).toBe('/blog/foo')
  })

  it('rejects anything that is not a same-site path', () => {
    expect(normalizeViewPath(undefined)).toBeNull()
    expect(normalizeViewPath(42)).toBeNull()
    expect(normalizeViewPath('blog/foo')).toBeNull()
    expect(normalizeViewPath('https://evil.example/')).toBeNull()
    expect(normalizeViewPath('//evil.example/')).toBeNull()
    expect(normalizeViewPath(`/${'a'.repeat(250)}`)).toBeNull()
  })
})

describe('shouldCountView', () => {
  it('counts a same-origin browser request', () => {
    expect(shouldCountView({ userAgent: BROWSER_UA, secFetchSite: 'same-origin' })).toBe(true)
  })

  it('does not count bots, headless browsers, or missing user agents', () => {
    expect(shouldCountView({ userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1)' })).toBe(false)
    expect(shouldCountView({ userAgent: 'Mozilla/5.0 HeadlessChrome/130.0' })).toBe(false)
    expect(shouldCountView({ userAgent: 'curl/8.7.1' })).toBe(false)
    expect(shouldCountView({ userAgent: null })).toBe(false)
  })

  it('does not count requests another site makes on its visitors behalf', () => {
    expect(shouldCountView({ userAgent: BROWSER_UA, secFetchSite: 'cross-site' })).toBe(false)
  })

  it.each(AI_AGENTS)('does not count %s', (token) => {
    expect(shouldCountView({ userAgent: compatibleUa(token) })).toBe(false)
  })

  it('does not count agents that sign requests with Web Bot Auth', () => {
    // ChatGPT Agent drives a real Chrome; only this header gives it away.
    expect(shouldCountView({ userAgent: BROWSER_UA, signatureAgent: '"https://chatgpt.com"' })).toBe(false)
  })

  it.each(REAL_BROWSERS)('still counts a real browser: %s', (userAgent) => {
    expect(shouldCountView({ userAgent })).toBe(true)
  })
})

describe('toContentPath', () => {
  it('maps markdown files to Nuxt Content paths', () => {
    expect(toContentPath('foo.md')).toBe('/blog/foo')
    expect(toContentPath('1.foo.md')).toBe('/blog/foo')
    expect(toContentPath('series/2.part-two.md')).toBe('/blog/series/part-two')
    expect(toContentPath('series/index.md')).toBe('/blog/series')
  })
})

describe('readPublishedBlogPaths', () => {
  it('lists published articles and leaves drafts out', async () => {
    const paths = await readPublishedBlogPaths(resolve(__dirname, '../../content/blog'))

    expect(paths).toContain('/blog/keyboard-navigation-composite-widgets')
    expect(paths).toContain('/blog/where-to-fetch-server-or-client')
    // `status: draft` in its frontmatter
    expect(paths).not.toContain('/blog/vue-transition-vs-flip')
    expect(paths.every(path => path.startsWith('/blog/'))).toBe(true)
  })
})

describe('viewDay', () => {
  it('uses the UTC calendar day', () => {
    expect(viewDay(new Date('2026-10-02T23:30:00-02:00'))).toBe('2026-10-03')
    expect(viewDay(new Date('2026-10-02T00:00:00Z'))).toBe('2026-10-02')
  })
})

describe('createViewSalt', () => {
  it('returns a fresh 128-bit hex salt each time', () => {
    const a = createViewSalt()
    expect(a).toMatch(/^[0-9a-f]{32}$/)
    expect(createViewSalt()).not.toBe(a)
  })
})

describe('visitorHash', () => {
  const visit = { salt: 'salt', ip: '203.0.113.7', userAgent: BROWSER_UA, path: '/blog/foo' }

  it('is stable for the same visitor, page, and salt', async () => {
    const hash = await visitorHash(visit)
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
    expect(await visitorHash({ ...visit })).toBe(hash)
  })

  it('changes with the salt, so days can not be linked', async () => {
    expect(await visitorHash({ ...visit, salt: 'tomorrow' })).not.toBe(await visitorHash(visit))
  })

  it('tells visitors and pages apart', async () => {
    const base = await visitorHash(visit)
    expect(await visitorHash({ ...visit, ip: '203.0.113.8' })).not.toBe(base)
    expect(await visitorHash({ ...visit, userAgent: `${BROWSER_UA} Edg/130.0` })).not.toBe(base)
    expect(await visitorHash({ ...visit, path: '/blog/bar' })).not.toBe(base)
  })

  it('does not let fields run into each other', async () => {
    const a = await visitorHash({ ...visit, ip: '1.2.3.4', userAgent: '5' })
    const b = await visitorHash({ ...visit, ip: '1.2.3.45', userAgent: '' })
    expect(a).not.toBe(b)
  })
})
