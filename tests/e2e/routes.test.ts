import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'

describe('published routes', async () => {
  await setup({
    setupTimeout: 120_000
  })

  for (const route of ['/', '/projects', '/blog', '/blog/vue-transition-vs-flip']) {
    it(`renders ${route}`, async () => {
      const html = await $fetch(route)

      expect(html).toContain('Fabian Kirchhoff')
    })
  }
})
