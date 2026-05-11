<script setup lang="ts">
const { data: posts } = await useAsyncData('all-posts', () =>
  queryCollection('blog')
    .where('status', '=', 'published')
    .order('date', 'DESC')
    .all()
)

const { setSidebar, clearSidebar } = useLayoutSidebar()

watchEffect((onCleanup) => {
  if (posts.value?.length) {
    setSidebar(
      resolveComponent('BlogIndexSidebar') as Component,
      { posts: posts.value.map(p => ({ path: p.path, title: p.title, date: p.date })) }
    )
  }

  onCleanup(() => {
    clearSidebar()
  })
})

useSeoMeta({
  title: 'Blog',
  description: 'Articles on Vue, Nuxt, accessibility, performance, and open-source engineering.',
  ogTitle: 'Blog | Fabian Kirchhoff',
  ogDescription: 'Articles on Vue, Nuxt, accessibility, performance, and open-source engineering.'
})
</script>

<template>
  <div>
    <SectionLabel label="Articles" />
    <ContentGrid
      v-if="posts?.length"
      staggered
    >
      <TheCard
        v-for="(post, index) in posts"
        :key="post.path"
        :tag="post.tag"
        :title="post.title"
        :description="post.description"
        :specs="post.specs"
        :url="post.path"
        :variant="index % 2 !== 0 ? 'hatched' : 'default'"
        :view-transition-name="`blog-title-${post.path.split('/').pop()}`"
      />
    </ContentGrid>
    <p
      v-else
      class="empty-state"
    >
      No articles published yet.
    </p>
  </div>
</template>

<style scoped>
.empty-state {
  border: 1px dashed var(--color-ink-faint);
  color: var(--color-ink-muted);
  font-family: var(--font-sans);
  padding: 1rem;
}
</style>
