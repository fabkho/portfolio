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

const stack = computed(() => {
  if (!projects.value) return []
  const all = projects.value.flatMap(p => p.stack || [])
  // Dedupe, preserve frequency order
  const counts = all.reduce((acc, tech) => {
    acc[tech] = (acc[tech] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name)
})

useSeoMeta({
  title: 'Projects',
  description: 'Open-source projects and developer tools by Fabian Kirchhoff.',
  ogTitle: 'Projects | Fabian Kirchhoff',
  ogDescription: 'Open-source projects and developer tools by Fabian Kirchhoff.'
})
</script>

<template>
  <NuxtLayout name="default">
    <template #sidebar>
      <ProjectsSidebar
        v-if="projects"
        :project-count="projects.length"
        :stack="stack"
      />
    </template>

    <div>
      <SectionLabel label="All Projects" />
      <ContentGrid
        v-if="projects?.length"
        staggered
      >
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
        No projects logged yet.
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
