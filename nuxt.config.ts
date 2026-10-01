import tailwindcss from '@tailwindcss/vite'

const isTest = process.env.NODE_ENV === 'test'

// Regal (3D bookshelf for /books) as a Nuxt layer. Local checkout when
// REGAL_LAYER is set (e.g. REGAL_LAYER=/Users/fabkho/code/regal), otherwise
// from the private GitHub repo (GIGET_AUTH holds the token).
const regalLayer = process.env.REGAL_LAYER ? process.env.REGAL_LAYER.replace(/\/?$/, '/') : undefined

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  extends: [
    regalLayer ?? ['github:fabkho/regal#feat/reading-tracker-pipeline', { install: true, auth: process.env.GIGET_AUTH }]
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
      regal: {
        mode: 'embed',
        librarySrc: '/books-data/library.json',
        assetsBase: '/books-data/'
      }
    }
  },

  routeRules: {
    '/': { prerender: true },
    '/projects': { prerender: true },
    '/blog': { prerender: true },
    // '/blog/**': { prerender: true },
    '/feed.xml': { prerender: true }
  },

  experimental: {
    viewTransition: true,
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
