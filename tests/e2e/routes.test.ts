import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'

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
})
