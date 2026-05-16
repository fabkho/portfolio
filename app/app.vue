<script setup>
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' },
    { rel: 'alternate', type: 'application/rss+xml', title: 'Fabian Kirchhoff - Blog', href: '/feed.xml' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})
</script>

<template>
  <SkipLink />
  <NuxtPage />
</template>
