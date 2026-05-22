<script setup lang="ts">
const route = useRoute()
const slug = computed(() => {
  const parts = route.params.slug
  return Array.isArray(parts) ? parts.join('/') : parts
})

const { data: post } = await useAsyncData(
  () => `blog-${slug.value}`,
  () => queryCollection('blog')
    .where('status', '=', 'published')
    .path(`/blog/${slug.value}`)
    .first(),
  { watch: [slug] }
)

if (!post.value) {
  throw createError({ statusCode: 404, message: 'Post not found' })
}

const viewTransitionName = computed(() => {
  const parts = route.params.slug
  const last = Array.isArray(parts) ? parts[parts.length - 1] : parts
  return `blog-title-${last}`
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
  <BlogArticle
    v-if="post"
    :value="post"
    :view-transition-name="viewTransitionName"
  />
</template>
