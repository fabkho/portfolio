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

useSeoMeta({
  title: 'Projects',
  description: 'Constructed mechanisms and selected full-stack projects by Fabian Kirchhoff.',
  ogTitle: 'Projects | Fabian Kirchhoff',
  ogDescription: 'Constructed mechanisms and selected full-stack projects by Fabian Kirchhoff.'
})
</script>

<template>
  <div>
    <SectionLabel label="Constructed Mechanisms" />
    <ContentGrid v-if="projects?.length">
      <TheCard
        v-for="project in projects"
        :key="project.id"
        :tag="project.tag"
        :label="project.label"
        :title="project.title"
        :description="project.description"
        :specs="project.specs"
        :url="project.url"
        :stars="project.stars"
      />
    </ContentGrid>
    <p
      v-else
      class="empty-state"
    >
      No constructed mechanisms are logged yet.
    </p>

    <div
      v-if="contributions?.length"
      class="mt-16"
    >
      <SectionLabel label="Open Source Contributions" />
      <LazyContributionList
        :contributions="contributions"
      />
    </div>
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
