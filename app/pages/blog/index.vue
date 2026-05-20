<script setup lang="ts">
const { data: posts } = await useAsyncData('all-posts', () =>
  queryCollection('blog')
    .where('status', '=', 'published')
    .order('date', 'DESC')
    .all()
)

const sidebarPosts = computed(() =>
  posts.value?.map(post => ({ path: post.path, title: post.title, date: post.date })) ?? []
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
        v-if="sidebarPosts.length"
        :posts="sidebarPosts"
      />
    </template>

    <div>
      <SectionLabel label="Articles" />
      <ContentGrid
        v-if="posts?.length"
        staggered
      >
        <ContentGridItem
          v-for="(post, index) in posts"
          :key="post.path"
          :index="index"
        >
          <TheCard
            :tag="post.tag"
            :title="post.title"
            :description="post.description"
            :specs="post.specs"
            :url="post.path"
          />
        </ContentGridItem>
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
