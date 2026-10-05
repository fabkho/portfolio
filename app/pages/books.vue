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

/* Phone. The filters are a row under the header (default layout); the pile gets
   the screen below them, less a strip of page (the sidebar's "Bookshelf" header)
   to swipe the page from: a drag on the 3D scrolls the pile, not the page. The
   count and the list start below the fold. */
@media (max-width: 1024px) {
  .books-page__stage {
    flex: none;
    /* edge to edge: the pile gets the full width */
    margin: 0 -1rem;
    /* header row + the main area's bottom padding */
    min-height: calc(100svh - 2.85rem - var(--books-filters, 0px) - 1rem - 3rem);
  }
}
</style>
