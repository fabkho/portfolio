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

    <div class="mt-16">
      <SectionLabel label="Open Source Contributions" />
      <ContributionList
        v-if="contributions"
        :contributions="contributions"
      />
    </div>

    <div class="mt-16">
      <SectionLabel label="Recent Memos" />
      <ContentGrid>
        <TheCard
          tag="MEMO // BLOG"
          title="Coming soon"
          description="Technical articles on Vue, accessibility, and performance."
          :specs="['BLOG']"
        />
      </ContentGrid>
    </div>
  </div>
</template>
