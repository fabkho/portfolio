<script setup lang="ts">
const { data: featuredProjects } = await useAsyncData('featured-projects', () =>
  queryCollection('projects')
    .where('featured', '=', true)
    .order('order', 'ASC')
    .all()
)

const { data: contributions } = await useAsyncData('home-contributions', () =>
  queryCollection('contributions')
    .all()
)

const { data: latestPost } = await useAsyncData('latest-post', () =>
  queryCollection('blog')
    .where('status', '=', 'published')
    .order('date', 'DESC')
    .first()
)
</script>

<template>
  <div>
    <SectionLabel label="Selected Works" />
    <ContentGrid>
      <TheCard
        v-for="(project, index) in featuredProjects"
        :key="project.id"
        :tag="project.tag"
        :label="project.label"
        :title="project.title"
        :description="project.description"
        :specs="project.specs"
        :url="project.url"
        :variant="index === 1 ? 'hatched' : 'default'"
        :class="{ 'translate-y-8': index === 1 }"
      />
    </ContentGrid>

    <div
      v-if="contributions?.length"
      class="mt-16"
    >
      <SectionLabel label="Open Source Contributions" />
      <ContributionList :contributions="contributions" />
    </div>

    <div class="mt-16">
      <SectionLabel label="Recent Memos" />
      <ContentGrid>
        <TheCard
          v-if="latestPost"
          :tag="latestPost.tag"
          :title="latestPost.title"
          :description="latestPost.description"
          :specs="latestPost.specs"
          :url="latestPost.path"
        />
        <TheCard
          v-else
          tag="MEMO // BLOG"
          title="Coming soon"
          description="Technical articles on Vue, accessibility, and performance."
          :specs="['BLOG']"
        />
      </ContentGrid>
    </div>
  </div>
</template>
