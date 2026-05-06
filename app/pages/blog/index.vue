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
</script>

<template>
  <NuxtLayout name="with-sidebar">
    <div>
      <SectionLabel label="Technical Memos" />
      <ContentGrid>
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
    </div>

    <template #sidebar>
      <BlogIndexSidebar
        v-if="posts?.length"
        :posts="posts.map(p => ({ path: p.path, title: p.title, date: p.date }))"
      />
    </template>
  </NuxtLayout>
</template>
