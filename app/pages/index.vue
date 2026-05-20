<script setup lang="ts">
const { data: allProjects } = await useAsyncData('all-home-projects', () =>
  queryCollection('projects')
    .all()
)

const featuredProjects = computed(() =>
  [...(allProjects.value ?? [])]
    .filter(project => project.featured && !project.hidden)
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
)

const { data: allContributions } = await useAsyncData('home-contributions', () =>
  queryCollection('contributions')
    .all()
)

const majorContributions = computed(() =>
  allContributions.value?.filter(contribution => contribution.major) ?? []
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
  description: 'Developer tools, Nuxt modules, and open-source packages by Fabian Kirchhoff.',
  ogTitle: 'Fabian Kirchhoff',
  ogDescription: 'Developer tools, Nuxt modules, and open-source packages by Fabian Kirchhoff.'
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
            :view-transition-name="`blog-title-${post.path.split('/').pop()}`"
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

      <div
        v-if="majorContributions.length"
        class="mt-16"
      >
        <SectionLabel label="Open Source Contributions" />
        <LazyContributionList
          :contributions="majorContributions"
        />
      </div>
    </div>
  </NuxtLayout>
</template>
