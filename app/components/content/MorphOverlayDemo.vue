<script setup lang="ts">
type Mode = 'slideover' | 'modal' | 'fullscreen'

const mode = ref<Mode>('slideover')
const transitioning = ref(false)
// labels on by default — seeing WHAT is named is the whole lesson
const showNames = ref(true)

async function switchTo(target: Mode) {
  if (target === mode.value || transitioning.value) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!document.startViewTransition || reduce) {
    mode.value = target
    return
  }
  transitioning.value = true
  const update = async () => {
    mode.value = target
    await nextTick()
  }
  let vt: ViewTransition
  try {
    vt = document.startViewTransition({ update, types: ['mo-demo'] })
  }
  catch {
    vt = document.startViewTransition(update)
  }
  try {
    await vt.finished
  }
  finally {
    transitioning.value = false
  }
}
</script>

<template>
  <DemoWrapper
    label="document.startViewTransition"
    tag="LIVE"
    description="The real API, running in this page. Switch layouts — the panel morphs, the title stays crisp."
  >
    <div class="mo">
      <div class="mo__controls">
        <button
          v-for="m in (['slideover', 'modal', 'fullscreen'] as const)"
          :key="m"
          class="mo__ctrl"
          :class="{ 'mo__ctrl--active': mode === m }"
          @click="switchTo(m)"
        >
          {{ m }}
        </button>
        <button
          class="mo__ctrl mo__ctrl--names"
          :class="{ 'mo__ctrl--names-on': showNames }"
          @click="showNames = !showNames"
        >
          view-transition-names
        </button>
      </div>

      <div class="mo__stage">
        <!-- fake list page behind the overlay -->
        <div class="mo__page">
          <div class="mo__pagebar" />
          <div
            v-for="i in 5"
            :key="i"
            class="mo__row"
          />
        </div>

        <div
          v-if="mode === 'modal'"
          class="mo__mask"
        />

        <div
          class="mo__panel"
          :class="[`mo__panel--${mode}`, { 'mo__panel--named': showNames }]"
        >
          <span
            v-if="showNames"
            class="mo__tag mo__tag--panel"
          >mo-panel</span>
          <div class="mo__head">
            <span class="mo__titlewrap">
              <span
                class="mo__title"
                :class="{ 'mo__title--named': showNames }"
              >Invoice #1042</span>
              <span
                v-if="showNames"
                class="mo__tag mo__tag--title"
              >mo-title</span>
            </span>
            <span class="mo__close">✕</span>
          </div>
          <div class="mo__body">
            <div
              class="mo__line"
              style="width: 70%"
            />
            <div
              class="mo__line"
              style="width: 45%"
            />
            <div
              class="mo__line"
              style="width: 60%"
            />
          </div>
        </div>
      </div>
    </div>
  </DemoWrapper>
</template>

<style scoped>
.mo__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 0.6rem;
}

.mo__ctrl {
  padding: 0.25rem 0.8rem;
  border: 1px solid rgb(0 0 0 / 12%);
  border-radius: 999px;
  font-size: 0.72rem;
  background: white;
  cursor: pointer;
  transition:
    background 0.2s ease,
    color 0.2s ease;
}

.mo__ctrl--active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.mo__stage {
  position: relative;
  height: 15rem;
  overflow: hidden;
  border: 1px solid rgb(0 0 0 / 10%);
  border-radius: 0.6rem;
  background: #f7f8fa;
}

.mo__page {
  padding: 0.7rem;
}

.mo__pagebar {
  height: 1.1rem;
  width: 40%;
  margin-bottom: 0.7rem;
  border-radius: 0.3rem;
  background: rgb(0 0 0 / 10%);
}

.mo__row {
  height: 0.9rem;
  margin-bottom: 0.45rem;
  border-radius: 0.3rem;
  background: rgb(0 0 0 / 6%);
}

.mo__mask {
  position: absolute;
  inset: 0;
  background: rgb(0 0 0 / 25%);
}

.mo__panel {
  position: absolute;
  display: flex;
  flex-direction: column;
  border: 1px solid rgb(0 0 0 / 8%);
  background: white;
  view-transition-name: mo-panel;
}

.mo__panel--slideover {
  top: 0.5rem;
  right: 0.5rem;
  bottom: 0.5rem;
  width: 38%;
  border-radius: 0.5rem;
}

.mo__panel--modal {
  top: 14%;
  left: 22%;
  right: 22%;
  bottom: 14%;
  border-radius: 0.7rem;
}

.mo__panel--fullscreen {
  inset: 0;
  border-radius: 0;
  border: none;
}

.mo__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.7rem;
  border-bottom: 1px solid rgb(0 0 0 / 7%);
}

.mo__titlewrap {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.mo__title {
  font-size: 0.75rem;
  font-weight: 600;
  view-transition-name: mo-title;
}

.mo__close {
  font-size: 0.7rem;
  opacity: 0.4;
}

.mo__body {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  padding: 0.7rem;
}

.mo__line {
  height: 0.7rem;
  border-radius: 0.3rem;
  background: rgb(59 130 246 / 15%);
}

/* ── name inspection overlay ── */
.mo__ctrl--names {
  margin-left: auto;
  font-family: monospace;
  font-size: 0.64rem;
}

.mo__ctrl--names-on {
  background: #8b5cf6;
  border-color: #8b5cf6;
  color: white;
}

.mo__panel--named {
  outline: 1.5px solid #8b5cf6;
  outline-offset: 2px;
}

.mo__title--named {
  outline: 1.5px solid #ec4899;
  outline-offset: 3px;
  border-radius: 2px;
}

.mo__tag {
  padding: 0.1rem 0.4rem;
  border-radius: 999px;
  font-family: monospace;
  font-size: 0.55rem;
  font-weight: 400;
  line-height: 1.4;
  color: white;
  white-space: nowrap;
}

/* tucked into the panel's bottom-right corner — clear of title, close & border */
.mo__tag--panel {
  position: absolute;
  right: 0.5rem;
  bottom: 0.4rem;
  z-index: 1;
  background: #8b5cf6;
}

/* inline chip next to the title — no overlap with outlines */
.mo__tag--title {
  background: #ec4899;
}
</style>

<style>
/* VT pseudos live on the document root — must be unscoped */
::view-transition-group(mo-panel),
::view-transition-group(mo-title) {
  animation-duration: 340ms;
  animation-timing-function: linear(
    0,
    0.04 4%,
    0.134 8%,
    0.255 12%,
    0.384 16%,
    0.508 20%,
    0.62 24%,
    0.717 28%,
    0.814 33%,
    0.899 39%,
    0.962 46%,
    0.998 54%,
    1.013 63%,
    1.014 74%,
    1.009 86%,
    1
  );
}

/* panel chrome is a flat surface — stretch freely */
::view-transition-old(mo-panel),
::view-transition-new(mo-panel) {
  width: 100%;
  height: 100%;
}

/* content-identical pair: kill the cross-fade, keep the title crisp */
::view-transition-old(mo-title) {
  animation: none;
  opacity: 0;
}

::view-transition-new(mo-title) {
  animation: none;
  opacity: 1;
  width: auto;
  height: auto;
}

/* keep the rest of the page calm during THIS demo's transition only */
html:active-view-transition-type(mo-demo)::view-transition-old(root),
html:active-view-transition-type(mo-demo)::view-transition-new(root) {
  animation-duration: 150ms;
}
</style>
