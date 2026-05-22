<script setup lang="ts">
const [
  { data: allProjects },
  { data: contributions }
] = await Promise.all([
  useAsyncData('all-projects', () =>
    queryCollection('projects')
      .all()
  ),
  useAsyncData('contributions', () =>
    queryCollection('contributions')
      .all()
  )
])

const projects = computed(() =>
  [...(allProjects.value ?? [])]
    .filter(project => !project.hidden)
    .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
)

useSeoMeta({
  title: 'Projects',
  description: 'Open-source projects and developer tools by Fabian Kirchhoff.',
  ogTitle: 'Projects | Fabian Kirchhoff',
  ogDescription: 'Open-source projects and developer tools by Fabian Kirchhoff.'
})
</script>

<template>
  <div>
    <SectionLabel label="All Projects" />
    <ContentGrid
      v-if="projects?.length"
      staggered
    >
      <ContentGridItem
        v-for="(project, index) in projects"
        :key="project.id"
        :index="index"
      >
        <TheCard
          :tag="project.tag"
          :label="project.label"
          :title="project.title"
          :description="project.description"
          :specs="project.specs"
          :url="project.url"
          :stars="project.stars"
        />
      </ContentGridItem>
    </ContentGrid>
    <p
      v-else
      class="empty-state"
    >
      No projects logged yet.
    </p>

    <div
      v-if="contributions?.length"
      class="mt-16"
    >
      <SectionLabel label="Open Source Contributions" />
      <LazyContributionList
        hydrate-on-visible
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
