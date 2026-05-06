<script setup lang="ts">
definePageMeta({
  layout: false
})

const { data: posts } = await useAsyncData('all-posts', () =>
  queryCollection('blog')
    .where('status', '=', 'published')
    .order('date', 'DESC')
    .all()
)

useSeoMeta({
  title: 'Technical Memos',
  description: 'Technical memos on Vue, Nuxt, accessibility, performance, and open-source engineering.',
  ogTitle: 'Technical Memos | Fabian Kirchhoff',
  ogDescription: 'Technical memos on Vue, Nuxt, accessibility, performance, and open-source engineering.'
})
</script>

<template>
  <NuxtLayout name="with-sidebar">
    <div>
      <SectionLabel label="Technical Memos" />
      <ContentGrid v-if="posts?.length">
        <TheCard
          v-for="post in posts"
          :key="post.path"
          :tag="post.tag"
          :title="post.title"
          :description="post.description"
          :specs="post.specs"
          :url="post.path"
        />
      </ContentGrid>
      <p
        v-else
        class="empty-state"
      >
        No technical memos are published yet.
      </p>
    </div>

    <template #sidebar>
      <BlogIndexSidebar
        v-if="posts?.length"
        :posts="posts.map(p => ({ path: p.path, title: p.title, date: p.date }))"
      />
    </template>
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
