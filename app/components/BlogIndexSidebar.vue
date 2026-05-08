<script setup lang="ts">
defineProps<{
  posts: { path: string, title: string, date: string }[]
}>()
</script>

<template>
  <div class="blog-index-sidebar">
    <div class="sidebar-header">
      All Posts
    </div>

    <WaveRipple
      mode="hover"
      color="var(--color-accent-faint)"
      class="data-section"
      :spacing="8"
      :amplitude="8"
      :lifetime="2000"
      :still-threshold="200"
    >
      <div class="data-section__inner">
        <div class="data-section__value">
          {{ posts.length }}
        </div>
        <div class="data-section__label">
          MEMOS PUBLISHED
        </div>
      </div>
    </WaveRipple>

    <div class="data-section data-section--grow">
      <div class="data-label">
        ARCHIVE
      </div>
      <NuxtLink
        v-for="post in posts"
        :key="post.path"
        :to="post.path"
        class="sidebar-record"
      >
        <div>
          <div class="record-title">
            {{ post.title }}
          </div>
          <div class="record-date">
            {{ post.date }}
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.blog-index-sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sidebar-header {
  padding: 1rem;
  border-bottom: 1px solid var(--color-ink);
  font-weight: bold;
  text-transform: uppercase;
  text-align: center;
  font-size: var(--text-sm);
}

.data-section {
  padding: 1rem;
  border-bottom: 1px solid var(--color-ink);
}

.data-section:last-child {
  border-bottom: none;
}

.data-section--grow {
  flex-grow: 1;
}

.data-section__inner {
  background: var(--color-bg);
  border: 1px solid var(--color-ink);
  padding: 0.5rem;
  text-align: center;
}

.data-section__value {
  font-size: var(--text-2xl);
  font-family: var(--font-sans);
  font-weight: 300;
  color: var(--color-accent);
}

.data-section__label {
  font-size: var(--text-2xs);
  color: var(--color-accent);
}

.data-label {
  font-size: var(--text-2xs);
  color: var(--color-ink-faint);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
}

.sidebar-record {
  display: block;
  text-decoration: none;
  color: inherit;
  border-bottom: 1px dotted var(--color-ink-faint);
  padding: 0.5rem 0;
  transition: color 0.2s;
}

.sidebar-record:hover {
  color: var(--color-accent);
}

.record-title {
  font-family: var(--font-sans);
  font-size: var(--text-base);
}

.record-date {
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  color: var(--color-ink-faint);
}
</style>
