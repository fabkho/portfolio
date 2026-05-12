<script setup lang="ts">
const { data: allProjects } = await useAsyncData('all-home-projects', () =>
  queryCollection('projects')
    .order('order', 'ASC')
    .all()
)

const featuredProjects = computed(() =>
  allProjects.value?.filter(p => p.featured) ?? []
)

const { data: contributions } = await useAsyncData('home-contributions', () =>
  queryCollection('contributions')
    .all()
)

const { data: allPosts } = await useAsyncData('all-home-posts', () =>
  queryCollection('blog')
    .where('status', '=', 'published')
    .order('order', 'ASC')
    .all()
)

const featuredPosts = computed(() =>
  allPosts.value?.filter(p => p.featured) ?? []
)

useSeoMeta({
  title: 'Fabian Kirchhoff',
  description: 'Full-stack developer portfolio featuring Vue, Nuxt, TypeScript, accessibility, and open-source work.',
  ogTitle: 'Fabian Kirchhoff',
  ogDescription: 'Full-stack developer portfolio featuring Vue, Nuxt, TypeScript, accessibility, and open-source work.'
})
</script>

<template>
  <NuxtLayout name="default">
    <div>
      <SectionLabel label="Selected Works" />
      <ContentGrid staggered>
        <TheCard
          v-for="(project, index) in featuredProjects"
          :key="project.id"
          :tag="project.tag"
          :label="project.label"
          :title="project.title"
          :description="project.description"
          :specs="project.specs"
          :url="project.url"
          :variant="index % 2 === 0 ? 'hatched' : 'default'"
        />
      </ContentGrid>

      <div
        v-if="contributions?.length"
        class="mt-16"
      >
        <SectionLabel label="Open Source Contributions" />
        <LazyContributionList
          :contributions="contributions"
        />
      </div>

      <div class="mt-16">
        <SectionLabel label="Selected Articles" />
        <ContentGrid v-if="featuredPosts?.length">
          <TheCard
            v-for="post in featuredPosts"
            :key="post.path"
            :tag="post.tag"
            :title="post.title"
            :description="post.description"
            :specs="post.specs"
            :url="post.path"
          />
        </ContentGrid>
        <ContentGrid v-else>
          <TheCard
            tag="BLOG"
            title="Coming soon"
            description="Technical articles on Vue, accessibility, and performance."
            :specs="['BLOG']"
          />
        </ContentGrid>
      </div>
    </div>
  </NuxtLayout>
</template>
