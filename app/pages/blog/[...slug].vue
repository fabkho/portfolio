<script setup lang="ts">
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

interface TocLink {
  id: string
  text: string
  children?: TocLink[]
}

function flattenToc(links: TocLink[], depth = 2): { id: string, text: string, depth: number }[] {
  const result: { id: string, text: string, depth: number }[] = []
  for (const link of links) {
    result.push({ id: link.id, text: link.text, depth })
    if (link.children) {
      result.push(...flattenToc(link.children, depth + 1))
    }
  }
  return result
}

useHead({
  title: post.value?.title
})
</script>

<template>
  <NuxtLayout name="with-sidebar">
    <article class="blog-article">
      <ContentRenderer
        v-if="post"
        :value="post"
      />
    </article>

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

<style scoped>
.blog-article {
  max-width: 700px;
}

.blog-article :deep(h1) {
  font-family: var(--font-sans);
  font-weight: 300;
  font-size: var(--text-3xl);
  text-transform: uppercase;
  letter-spacing: -0.02em;
  margin-bottom: 2rem;
}

.blog-article :deep(h2) {
  font-family: var(--font-sans);
  font-size: var(--text-xl);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 2.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-ink-faint);
}

.blog-article :deep(h3) {
  font-family: var(--font-sans);
  font-size: var(--text-lg);
  margin-top: 2rem;
  margin-bottom: 0.75rem;
}

.blog-article :deep(p) {
  font-family: var(--font-serif);
  font-size: 1.1rem;
  line-height: 1.7;
  margin-bottom: 1.5rem;
}

.blog-article :deep(a) {
  color: var(--color-ink);
  text-decoration: underline;
  text-underline-offset: 2px;
  transition: color 0.2s;
}

.blog-article :deep(a:hover) {
  color: var(--color-accent);
}

.blog-article :deep(pre) {
  background: #24292e;
  padding: 1.5rem;
  font-family: var(--font-mono);
  font-size: var(--text-base);
  overflow-x: auto;
  margin: 0;
  border: none;
}

.blog-article :deep(code) {
  font-family: var(--font-mono);
  font-size: 0.9em;
}

.blog-article :deep(:not(pre) > code) {
  background: rgba(44, 44, 42, 0.06);
  border: 1px solid var(--color-ink-faint);
  padding: 0.1rem 0.4rem;
  border-radius: 0;
}

.blog-article :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1.5rem;
  font-family: var(--font-sans);
  font-size: var(--text-md);
}

.blog-article :deep(th) {
  background: var(--color-ink);
  color: var(--color-bg);
  padding: 0.5rem 1rem;
  text-align: left;
  font-size: var(--text-xs);
  text-transform: uppercase;
}

.blog-article :deep(td) {
  padding: 0.5rem 1rem;
  border-bottom: 1px dotted var(--color-ink-faint);
}

.blog-article :deep(strong) {
  font-weight: 600;
}

.blog-article :deep(ul),
.blog-article :deep(ol) {
  font-family: var(--font-serif);
  font-size: 1.1rem;
  line-height: 1.7;
  margin-bottom: 1.5rem;
  padding-left: 1.5rem;
}

.blog-article :deep(li) {
  margin-bottom: 0.5rem;
}

.blog-article :deep(blockquote) {
  border-left: 2px solid var(--color-accent);
  padding-left: 1rem;
  font-style: italic;
  color: var(--color-ink-muted);
  margin-bottom: 1.5rem;
}
</style>
