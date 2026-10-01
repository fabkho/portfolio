import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

import { readPublishedBlogPaths, toContentPath } from '../../modules/view-paths/blog-paths'
import { normalizeViewPath, shouldCountView } from '../../server/utils/views'

const BROWSER_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'

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
