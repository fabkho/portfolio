<script setup lang="ts">
import type { Component } from 'vue'

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

const { setSidebar, clearSidebar } = useLayoutSidebar()

watchEffect((onCleanup) => {
  if (projects.value) {
    setSidebar(
      resolveComponent('ProjectsSidebar') as Component,
      { projectCount: projects.value.length, stack: stack.value }
    )
  }

  onCleanup(() => {
    clearSidebar()
  })
})

useSeoMeta({
  title: 'Projects',
  description: 'Selected full-stack projects and open-source work by Fabian Kirchhoff.',
  ogTitle: 'Projects | Fabian Kirchhoff',
  ogDescription: 'Selected full-stack projects and open-source work by Fabian Kirchhoff.'
})
</script>

<template>
  <div>
    <SectionLabel label="All Projects" />
    <ContentGrid
      v-if="projects?.length"
      staggered
    >
      <TheCard
        v-for="(project, index) in projects"
        :key="project.id"
        :tag="project.tag"
        :label="project.label"
        :title="project.title"
        :description="project.description"
        :specs="project.specs"
        :url="project.url"
        :stars="project.stars"
        :variant="index % 2 !== 0 ? 'hatched' : 'default'"
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
</template>

<style scoped>
.empty-state {
  border: 1px dashed var(--color-ink-faint);
  color: var(--color-ink-muted);
  font-family: var(--font-sans);
  padding: 1rem;
}
</style>
