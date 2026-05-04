<template>
  <div class="drafting-board paper-texture mx-auto max-w-[var(--max-width-board)] border border-ink p-8 min-h-[100dvh]">
    <TheHeader />
    <main id="main-content" class="relative">
      <SchematicBackground />
      <div class="relative z-10">
        <slot />
      </div>
    </main>
    <TheFooter />
  </div>
</template>
