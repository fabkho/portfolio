import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({

  modules: [
    '@nuxt/eslint',
    '@nuxt/content',
    '@nuxt/fonts',
    '@nuxt/image',
    '@nuxt/a11y',
    '@nuxt/hints',
    '@nuxtjs/seo',
    '@nuxthub/core',
    '@vueuse/nuxt',
    'nuxt-studio',
    '@nuxt/test-utils/module'
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
          }
        }
      }
    }
  },

  routeRules: {
    '/': { prerender: true },
    '/projects': { prerender: true },
    '/blog': { prerender: true },
    '/blog/**': { prerender: true },
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
        weights: [300, 400, 500, 600, 700]
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

  studio: {
    repository: {
      provider: 'github',
      owner: 'fabkho',
      repo: 'portfolio',
      branch: 'main'
    }
  }
})
