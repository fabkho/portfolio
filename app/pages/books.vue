<script setup lang="ts">
useSeoMeta({
  title: 'Books',
  description: 'What Fabian Kirchhoff has been reading: a 3D bookshelf of finished books with ratings.',
  ogTitle: 'Books | Fabian Kirchhoff',
  ogDescription: 'What Fabian Kirchhoff has been reading: a 3D bookshelf of finished books with ratings.'
})
</script>

<template>
  <div class="books-page">
    <h1 class="sr-only">
      Books
    </h1>
    <RegalBooksStage class="books-page__stage" />
  </div>
</template>

<style scoped>
.books-page {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.books-page__stage {
  flex: 1;
  min-height: 32rem;
}

@media (max-width: 1024px) {
  .books-page__stage {
    min-height: 70vh;
  }
}
</style>
