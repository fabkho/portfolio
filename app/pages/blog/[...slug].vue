<script setup lang="ts">
import { flattenToc } from '~/utils/flattenToc'

definePageMeta({
  layout: false
})

const route = useRoute()
const slug = computed(() => {
  const parts = route.params.slug
  return Array.isArray(parts) ? parts.join('/') : parts
})

const { data: post } = await useAsyncData(`blog-${slug.value}`, () =>
  queryCollection('blog')
    .path(`/blog/${slug.value}`)
    .first()
)

if (!post.value) {
  throw createError({ statusCode: 404, message: 'Post not found' })
}

const tocItems = computed(() => {
  if (!post.value?.body?.toc?.links) return []
  return flattenToc(post.value.body.toc.links)
})

useSeoMeta({
  title: post.value?.title,
  description: post.value?.description,
  ogTitle: post.value?.title,
  ogDescription: post.value?.description,
  articleAuthor: post.value?.author ? [post.value.author] : undefined,
  articlePublishedTime: post.value?.date
})
</script>

<template>
  <NuxtLayout name="with-sidebar">
    <BlogArticle
      v-if="post"
      :value="post"
    />

    <template #sidebar>
      <BlogSidebar
        v-if="post"
        :author="post.author || 'Unknown'"
        :date="post.date || ''"
        :status="post.status || 'published'"
        :toc="tocItems"
      />
    </template>
  </NuxtLayout>
</template>
