<script setup lang="ts">
const { data: featuredProjects } = await useAsyncData('featured-projects', () =>
  queryCollection('projects')
    .where('featured', '=', true)
    .order('order', 'ASC')
    .all()
)
</script>

<template>
  <div class="py-8">
    <SectionLabel label="Selected Works" />
    <ContentGrid>
      <TheCard
        v-for="project in featuredProjects"
        :key="project.id"
        :tag="project.tag"
        :title="project.title"
        :description="project.description"
        :specs="project.specs"
        :url="project.url"
      />
    </ContentGrid>

    <div class="mt-16">
      <SectionLabel label="Recent Memos" />
      <ContentGrid>
        <TheCard
          tag="MEMO // BLOG"
          title="Coming soon"
          description="Technical articles on Vue, accessibility, and performance."
          :specs="['BLOG']"
          variant="hatched"
        />
      </ContentGrid>
    </div>
  </div>
</template>
