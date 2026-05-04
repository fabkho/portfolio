<script setup lang="ts">
const { data: projects } = await useAsyncData('all-projects', () =>
  queryCollection('projects')
    .order('order', 'ASC')
    .all()
)

const { data: contributions } = await useAsyncData('contributions', () =>
  queryCollection('contributions')
    .all()
)
</script>

<template>
  <div>
    <SectionLabel label="Constructed Mechanisms" />
    <ContentGrid>
      <TheCard
        v-for="project in projects"
        :key="project.id"
        :tag="project.tag"
        :label="project.label"
        :title="project.title"
        :description="project.description"
        :specs="project.specs"
        :url="project.url"
      />
    </ContentGrid>

    <div class="mt-16">
      <SectionLabel label="Open Source Contributions" />
      <ContributionList
        v-if="contributions"
        :contributions="contributions"
      />
    </div>
  </div>
</template>
