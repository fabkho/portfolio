import { mountSuspended } from '@nuxt/test-utils/runtime'
import { TheCard } from '#components'
import { describe, expect, it } from 'vitest'

describe('TheCard', () => {
  it('renders external links with safe target attributes', async () => {
    const wrapper = await mountCard({ url: 'https://example.com/project' })
    const link = wrapper.get('a.the-card__link')

    expect(link.attributes('href')).toBe('https://example.com/project')
    expect(link.attributes('target')).toBe('_blank')
    expect(link.attributes('rel')).toBe('noopener noreferrer')
  })

  it('renders inert cards without link-only attributes when no url is provided', async () => {
    const wrapper = await mountCard({ url: undefined })
    const root = wrapper.get('.the-card__link')

    expect(root.element.tagName).toBe('DIV')
    expect(root.attributes('href')).toBeUndefined()
    expect(root.attributes('to')).toBeUndefined()
  })
})

function mountCard(overrides: { url?: string } = {}) {
  return mountSuspended(TheCard, {
    props: {
      tag: 'OPEN SOURCE',
      title: 'Example Project',
      description: 'A tested project card.',
      specs: ['NUXT'],
      ...overrides
    }
  })
}
