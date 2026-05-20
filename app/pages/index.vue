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
      <section class="home-section">
        <SectionLabel label="Selected Works" />
        <ContentGrid staggered>
          <ContentGridItem
            v-for="(project, index) in featuredProjects"
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
              :variant="index % 2 === 0 ? 'hatched' : 'default'"
            />
          </ContentGridItem>
        </ContentGrid>
      </section>

      <section class="home-section mt-16">
        <SectionLabel
          label="Selected Articles"
          :delay-base="600"
        />
        <ContentGrid
          v-if="featuredPosts?.length"
          :delay-base="600"
        >
          <ContentGridItem
            v-for="(post, index) in featuredPosts"
            :key="post.path"
            :index="index"
          >
            <TheCard
              :tag="post.tag"
              :title="post.title"
              :description="post.description"
              :specs="post.specs"
              :url="post.path"
              :view-transition-name="`blog-title-${post.path?.split('/')?.pop() || ''}`"
            />
          </ContentGridItem>
        </ContentGrid>
        <ContentGrid
          v-else
          :delay-base="600"
        >
          <ContentGridItem :index="0">
            <TheCard
              tag="BLOG"
              title="Coming soon"
              description="Technical articles on Vue, accessibility, and performance."
              :specs="['BLOG']"
            />
          </ContentGridItem>
        </ContentGrid>
      </section>

      <section
        v-if="majorContributions.length"
        class="home-section mt-16"
      >
        <SectionLabel
          label="Open Source Contributions"
          :delay-base="1200"
        />
        <LazyContributionList
          :contributions="majorContributions"
        />
      </section>
    </div>
  </NuxtLayout>
</template>
