import { mountSuspended } from '@nuxt/test-utils/runtime'
import { BlogArticle, BlogSidebar, ProsePre } from '#components'
import { describe, expect, it } from 'vitest'

describe('BlogArticle', () => {
  it('renders content inside the article shell', async () => {
    const wrapper = await mountSuspended(BlogArticle, {
      props: {
        value: {
          title: 'Example memo',
          body: { type: 'root', children: [] }
        }
      },
      global: {
        stubs: {
          ContentRenderer: {
            props: ['value'],
            template: '<div data-test="content-renderer">{{ value.title }}</div>'
          }
        }
      }
    })

    expect(wrapper.find('article.blog-article').exists()).toBe(true)
    expect(wrapper.get('[data-test="content-renderer"]').text()).toBe('Example memo')
  })
})

describe('BlogSidebar', () => {
  it('renders metadata and table-of-contents links', async () => {
    const wrapper = await mountSuspended(BlogSidebar, {
      props: {
        author: 'Fabian Kirchhoff',
        date: '2026-05-06',
        status: 'published',
        toc: [
          { id: 'intro', text: 'Intro', depth: 2 },
          { id: 'details', text: 'Details', depth: 3 }
        ]
      }
    })

    expect(wrapper.text()).toContain('AUTHOR: FABIAN KIRCHHOFF')
    expect(wrapper.text()).toContain('STATUS: PUBLISHED')
    expect(wrapper.get('nav').attributes('aria-label')).toBe('Table of contents')
    expect(wrapper.get('a[href="#intro"]').text()).toBe('Intro')
    expect(wrapper.get('a[href="#details"]').classes()).toContain('toc-link--nested')
  })
})

describe('ProsePre', () => {
  it('exposes an accessible copy control', async () => {
    const wrapper = await mountSuspended(ProsePre, {
      props: {
        code: 'const answer = 42',
        language: 'ts'
      },
      slots: {
        default: '<code>const answer = 42</code>'
      }
    })

    expect(wrapper.get('.code-lang').text()).toBe('ts')
    expect(wrapper.get('button.copy-btn').attributes('aria-label')).toMatch(/Copy/)
    expect(wrapper.get('pre').text()).toContain('const answer = 42')
  })
})
