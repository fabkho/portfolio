<script setup lang="ts">
const { data: posts } = await useAsyncData('all-posts', () =>
  queryCollection('blog')
    .where('status', '=', 'published')
    .order('date', 'DESC')
    .all()
)

useSeoMeta({
  title: 'Blog',
  description: 'Articles on Vue, Nuxt, accessibility, performance, and open-source engineering.',
  ogTitle: 'Blog | Fabian Kirchhoff',
  ogDescription: 'Articles on Vue, Nuxt, accessibility, performance, and open-source engineering.'
})
</script>

<template>
  <NuxtLayout name="default">
    <template #sidebar>
      <BlogIndexSidebar
        v-if="posts?.length"
        :posts="posts.map(p => ({ path: p.path, title: p.title, date: p.date }))"
      />
    </template>

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
  </NuxtLayout>
</template>

<style scoped>
.empty-state {
  border: 1px dashed var(--color-ink-faint);
  color: var(--color-ink-muted);
  font-family: var(--font-sans);
  padding: 1rem;
}
</style>
