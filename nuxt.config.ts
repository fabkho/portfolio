import tailwindcss from '@tailwindcss/vite'

const isTest = process.env.NODE_ENV === 'test'

// Regal (3D bookshelf for /books) as a Nuxt layer. Local checkout when
// REGAL_LAYER is set (e.g. REGAL_LAYER=/Users/fabkho/code/regal), otherwise
// from the private GitHub repo (GIGET_AUTH holds the token), pinned to a tag:
// Regal's main changes without the portfolio noticing, so a new Regal reaches
// /books only when this ref is bumped (after checking /books against it).
const regalRef = 'portfolio-v1'
const regalLayer = process.env.REGAL_LAYER ? process.env.REGAL_LAYER.replace(/\/?$/, '/') : undefined

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  extends: [
    regalLayer ?? [`github:fabkho/regal#${regalRef}`, { install: true, auth: process.env.GIGET_AUTH }]
  ],

  modules: [
    '@nuxt/eslint',
    '@nuxt/content',
    '@nuxt/fonts',
    '@nuxt/image',
    // '@nuxt/a11y',
    // '@nuxt/hints',
    '@nuxtjs/seo',
    '@nuxthub/core',
    '@vueuse/nuxt',
    'nuxt-studio',
    ...(isTest ? ['@nuxt/test-utils/module'] : [])
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  site: {
    url: 'https://fabkho.dev',
    name: 'Fabian Kirchhoff',
    description: 'I build things that help developers build things — Nuxt modules, CLI tools, and open-source packages.'
  },

  content: {
    build: {
      markdown: {
        highlight: {
          theme: {
            default: 'github-dark',
            dark: 'github-dark'
          },
          langs: ['php', 'json']
        }
      }
    }
  },

  runtimeConfig: {
    public: {
      // /books data lives in R2 (pnpm books:publish), not in the repo.
      // Offline dev: pnpm books:sync, then
      // NUXT_PUBLIC_REGAL_LIBRARY_SRC=/books-data/library.json NUXT_PUBLIC_REGAL_ASSETS_BASE=/books-data/
      regal: {
        mode: 'embed',
        librarySrc: 'https://books.fabkho.dev/library.json',
        assetsBase: 'https://books.fabkho.dev/'
      }
    }
  },

  routeRules: {
    '/': { prerender: true },
    '/projects': { prerender: true },
    '/blog': { prerender: true },
    // '/blog/**': { prerender: true },
    '/feed.xml': { prerender: true },
    // Rendered per request: the Library comes from R2 (books.fabkho.dev),
    // which the daily books job updates. Prerendering (crawlLinks reaches it
    // from the nav) would bake the Library in at build time.
    '/books': { prerender: false }
  },

  experimental: {
    viewTransition: true,
    // Replaced by plugins/navigation-repaint.client.ts: Nuxt's version waits
    // for a frame that never comes while a view transition is running (the
    // page is frozen until its 100ms fallback timeout on every navigation)
    navigationRepaint: false,
    defaults: {
      nuxtLink: {
        prefetchOn: { interaction: true }
      }
    }
  },
  compatibilityDate: '2025-01-15',

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/blog', '/projects', '/feed.xml']
    }
  },

  // Page-view counter (server/api/views.post.ts). Local SQLite in dev, D1 on
  // Cloudflare — the D1 binding itself is declared in wrangler.jsonc.
  hub: {
    db: 'sqlite',
    // Keep e2e runs from writing into the local dev database.
    dir: isTest ? '.data/test' : '.data'
  },

  vite: {
    plugins: [tailwindcss()]
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  fonts: {
    families: [
      {
        name: 'IBM Plex Mono',
        weights: [400, 500, 600, 700]
      },
      {
        name: 'Inter',
        weights: [300, 400, 500, 600, 700],
        preload: true,
        global: true
      }
    ]
  },

  ogImage: {
    zeroRuntime: true
  },

  robots: {
    allow: '/',
    sitemap: 'https://fabkho.dev/sitemap.xml'
  },

  sitemap: {
    enabled: true
  },

  studio: false
})
