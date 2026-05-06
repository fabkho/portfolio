import { describe, expect, it } from 'vitest'

import { getActiveHeadingId } from '../../app/composables/useActiveSection'
import { flattenToc } from '../../app/utils/flattenToc'
import { getRouteSubtitle, isRouteActive, NAV_ITEMS } from '../../app/utils/navigation'

describe('flattenToc', () => {
  it('flattens nested Nuxt Content toc links with depth metadata', () => {
    expect(flattenToc([
      {
        id: 'intro',
        text: 'Intro',
        children: [
          { id: 'scope', text: 'Scope' }
        ]
      },
      { id: 'finish', text: 'Finish' }
    ])).toEqual([
      { id: 'intro', text: 'Intro', depth: 2 },
      { id: 'scope', text: 'Scope', depth: 3 },
      { id: 'finish', text: 'Finish', depth: 2 }
    ])
  })
})

describe('getRouteSubtitle', () => {
  it('keeps navigation subtitles in sync with exported nav items', () => {
    for (const item of NAV_ITEMS) {
      expect(getRouteSubtitle(item.to)).toBe(item.subtitle)
    }
  })

  it('uses a blog-detail subtitle instead of falling back to home', () => {
    expect(getRouteSubtitle('/blog/vue-transition-vs-flip')).toBe('Technical Memo')
  })

  it('normalizes trailing slashes', () => {
    expect(getRouteSubtitle('/projects/')).toBe('Index of Constructed Mechanisms')
  })
})

describe('isRouteActive', () => {
  it('keeps parent navigation active for nested routes', () => {
    expect(isRouteActive('/blog/vue-transition-vs-flip', '/blog')).toBe(true)
    expect(isRouteActive('/blog/vue-transition-vs-flip', '/')).toBe(false)
  })
})

describe('getActiveHeadingId', () => {
  it('returns the last heading above the scroll offset', () => {
    const headings = [
      heading('intro', 20, 260),
      heading('middle', 180, 260),
      heading('later', 420, 260)
    ]

    expect(getActiveHeadingId(headings, 260, 120)).toBe('middle')
  })

  it('returns an empty id when no heading has crossed the offset', () => {
    expect(getActiveHeadingId([heading('intro', 300, 100)], 100, 120)).toBe('')
  })
})

function heading(id: string, absoluteTop: number, scrollY: number) {
  const el = document.createElement('h2')
  el.id = id
  el.getBoundingClientRect = () => ({
    top: absoluteTop - scrollY,
    right: 0,
    bottom: 0,
    left: 0,
    width: 0,
    height: 0,
    x: 0,
    y: absoluteTop - scrollY,
    toJSON: () => undefined
  })

  return el
}
