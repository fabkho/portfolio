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

const { data: featuredPosts } = await useAsyncData('featured-posts', () =>
  queryCollection('blog')
    .where('status', '=', 'published')
    .where('featured', '=', true)
    .order('order', 'ASC')
    .all()
)

const { getVariant } = useGridVariant()

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
          :variant="getVariant(index)"
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
        <ContentGrid
          v-if="featuredPosts?.length"
          staggered
        >
          <TheCard
            v-for="(post, index) in featuredPosts"
            :key="post.path"
            :tag="post.tag"
            :title="post.title"
            :description="post.description"
            :specs="post.specs"
            :url="post.path"
            :variant="getVariant(index)"
          />
        </ContentGrid>
        <ContentGrid
          v-else
          staggered
        >
          <TheCard
            tag="BLOG"
            title="Coming soon"
            description="Technical articles on Vue, accessibility, and performance."
            :specs="['BLOG']"
            variant="hatched"
          />
        </ContentGrid>
      </div>
    </div>
  </NuxtLayout>
</template>
