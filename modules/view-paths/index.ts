import { resolve } from 'node:path'
// `nuxt/kit`, not `@nuxt/kit`: the latter isn't a direct dependency, so pnpm
// doesn't hoist it and TypeScript can't resolve it.
import { addServerTemplate, addTypeTemplate, defineNuxtModule } from 'nuxt/kit'
import { NAV_ITEMS } from '../../app/utils/navigation'
import { readPublishedBlogPaths } from './blog-paths'

/**
 * Builds the allowlist of paths `/api/views` will count, at build time.
 *
 * The counter validates against this list instead of querying Nuxt Content on
 * the server. On Cloudflare, the first server-side content query imports the
 * whole content dump into D1 — too much work to put in front of every page
 * view on a Worker's CPU budget.
 *
 * The list is generated once per server build; in dev, restart to pick up a
 * newly published article.
 */
export default defineNuxtModule({
  meta: { name: 'view-paths' },
  setup(_options, nuxt) {
    const blogDir = resolve(nuxt.options.rootDir, 'content/blog')

    addServerTemplate({
      filename: '#view-paths',
      async getContents() {
        const paths = [
          ...NAV_ITEMS.map(item => item.to),
          ...await readPublishedBlogPaths(blogDir)
        ]
        return `export const viewPaths = new Set(${JSON.stringify(paths)})\n`
      }
    })

    // Declared for the app project too, not just Nitro: the typed-$fetch route
    // map pulls server handlers — and their imports — into the app project.
    addTypeTemplate({
      filename: 'types/view-paths.d.ts',
      getContents: () => `declare module '#view-paths' {\n  export const viewPaths: Set<string>\n}\n`
    }, { nitro: true, nuxt: true })
  }
})
