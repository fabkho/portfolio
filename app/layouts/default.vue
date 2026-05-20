<script setup lang="ts">
const route = useRoute()
const isBlogRoute = computed(() => route.path.startsWith('/blog'))
const reducedMotion = usePreferredReducedMotion()
const aboutText = 'I build things that help developers build things — Nuxt modules, CLI tools, and open-source packages. When not coding, I\'m at the gym or lost in a book.'
const aboutTokens = buildAboutTokens(aboutText)
const aboutVisibleCharacters = ref(0)
const aboutTypingDone = useState('about-bio-typing-done', () => false)

function buildAboutTokens(text: string) {
  let cursor = 0
  return (text.match(/\S+\s*/g) ?? []).map((token) => {
    const start = cursor
    const characters = [...token]
    cursor += characters.length
    return { start, characters }
  })
}

function isAboutCharacterVisible(index: number) {
  return index < aboutVisibleCharacters.value
}

const { pause: pauseAboutTyping, resume: resumeAboutTyping } = useIntervalFn(() => {
  aboutVisibleCharacters.value++

  if (aboutVisibleCharacters.value >= aboutText.length) {
    aboutVisibleCharacters.value = aboutText.length
    pauseAboutTyping()
  }
}, 18, { immediate: false })

onMounted(async () => {
  if (reducedMotion.value === 'reduce' || aboutTypingDone.value) {
    aboutVisibleCharacters.value = aboutText.length
    return
  }

  let shouldAnimate = false
  await callOnce('about-bio-typewriter', () => {
    shouldAnimate = true
    aboutTypingDone.value = true
  })

  if (!shouldAnimate) {
    aboutVisibleCharacters.value = aboutText.length
    return
  }

  aboutVisibleCharacters.value = 0
  resumeAboutTyping()
})
</script>

<template>
  <div class="drafting-board paper-texture">
    <TheHeader />
    <main
      id="main-content"
      class="schematic-area"
    >
      <div class="relative z-10">
        <slot />
      </div>
    </main>
    <aside class="data-sidebar">
      <div
        id="sidebar-target"
        :class="isBlogRoute ? 'sidebar-sticky' : 'sidebar-default'"
      >
        <slot name="sidebar">
          <div class="sidebar-header">
            About
          </div>
          <div class="data-section">
            <p
              class="sidebar-bio"
              :aria-label="aboutText"
            >
              <span
                v-for="(token, tokenIndex) in aboutTokens"
                :key="tokenIndex"
                class="sidebar-bio__word"
              ><span
                v-for="(character, characterIndex) in token.characters"
                :key="characterIndex"
                :class="[
                  'sidebar-bio__char',
                  { 'sidebar-bio__char--hidden': !isAboutCharacterVisible(token.start + characterIndex) }
                ]"
              >{{ character }}</span></span>
            </p>
          </div>
          <div class="data-section data-section--grow" />
        </slot>
      </div>
    </aside>
    <TheFooter />
  </div>
</template>

<style scoped>
.drafting-board {
  max-width: var(--max-width-board);
  margin: 0 auto;
  border: 1px solid var(--color-ink);
  padding: 1rem;
  display: grid;
  grid-template-columns: 1fr var(--sidebar-width);
  grid-template-rows: auto 1fr auto;
  min-height: calc(100vh - 4rem);
  gap: 1rem;
}

.schematic-area {
  grid-column: 1 / 2;
  border: 1px solid var(--color-ink);
  position: relative;
  padding: 2rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.data-sidebar {
  grid-column: 2 / 3;
  border: 1px solid var(--color-ink);
  display: flex;
  flex-direction: column;
}

.sidebar-default {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.sidebar-sticky {
  position: sticky;
  top: 0.5rem;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 4rem);
  overflow-y: auto;
  scrollbar-width: none;
  width: 100%;
}

.sidebar-sticky::-webkit-scrollbar {
  display: none;
}

.sidebar-header {
  padding: 0.5rem 1rem;
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

/* Sidebar stagger reveal — CSS-only so first paint starts with header/nav */
.sidebar-default :deep(.sidebar-reveal-item),
.sidebar-sticky :deep(.sidebar-reveal-item) {
  animation: sidebar-stagger-reveal 0.65s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.sidebar-default :deep(.sidebar-reveal-item:nth-child(2)),
.sidebar-sticky :deep(.sidebar-reveal-item:nth-child(2)) { animation-delay: 80ms; }
.sidebar-default :deep(.sidebar-reveal-item:nth-child(3)),
.sidebar-sticky :deep(.sidebar-reveal-item:nth-child(3)) { animation-delay: 140ms; }
.sidebar-default :deep(.sidebar-reveal-item:nth-child(4)),
.sidebar-sticky :deep(.sidebar-reveal-item:nth-child(4)) { animation-delay: 200ms; }
.sidebar-default :deep(.sidebar-reveal-item:nth-child(5)),
.sidebar-sticky :deep(.sidebar-reveal-item:nth-child(5)) { animation-delay: 260ms; }
.sidebar-default :deep(.sidebar-reveal-item:nth-child(6)),
.sidebar-sticky :deep(.sidebar-reveal-item:nth-child(6)) { animation-delay: 320ms; }
.sidebar-default :deep(.sidebar-reveal-item:nth-child(7)),
.sidebar-sticky :deep(.sidebar-reveal-item:nth-child(7)) { animation-delay: 380ms; }
.sidebar-default :deep(.sidebar-reveal-item:nth-child(8)),
.sidebar-sticky :deep(.sidebar-reveal-item:nth-child(8)) { animation-delay: 440ms; }
.sidebar-default :deep(.sidebar-reveal-item:nth-child(9)),
.sidebar-sticky :deep(.sidebar-reveal-item:nth-child(9)) { animation-delay: 500ms; }
.sidebar-default :deep(.sidebar-reveal-item:nth-child(10)),
.sidebar-sticky :deep(.sidebar-reveal-item:nth-child(10)) { animation-delay: 560ms; }

@keyframes sidebar-stagger-reveal {
  from {
    opacity: 0;
    transform: translateY(0.5rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .sidebar-default :deep(.sidebar-reveal-item),
  .sidebar-sticky :deep(.sidebar-reveal-item) {
    animation: none;
  }
}

.data-label {
  font-size: var(--text-2xs);
  color: var(--color-ink-subtle);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
}

.sidebar-record {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  border-bottom: 1px dotted var(--color-ink-faint);
  padding: 0.5rem 0;
  font-family: var(--font-sans);
  font-size: var(--text-base);
}

.sidebar-bio {
  position: relative;
  font-family: var(--font-sans);
  font-size: var(--text-base);
  line-height: 1.5;
}

.sidebar-bio__word {
  display: inline-block;
  white-space: pre;
}

.sidebar-bio__char {
  opacity: 1;
}

.sidebar-bio__char--hidden {
  opacity: 0;
}

.sidebar-link {
  display: block;
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--color-ink);
  text-decoration: none;
  padding: 0.3rem 0;
  transition: color 0.2s;
}

.sidebar-link:hover {
  color: var(--color-accent);
}

@media (max-width: 1024px) {
  .drafting-board {
    grid-template-columns: 1fr;
    min-height: 100vh;
    border: none;
    padding: 0;
    gap: 0;
  }

  .schematic-area {
    grid-column: 1 / -1;
    padding: 1rem;
    border: none;
  }

  .data-sidebar {
    grid-column: 1 / -1;
    border: none;
  }

  .data-section:not(.wave-ripple) {
    border-bottom: none;
  }

  .sidebar-sticky {
    position: static;
    max-height: none;
  }
}
</style>
