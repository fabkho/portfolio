<script setup lang="ts">
const wide = ref(false)
const transitioning = ref(false)

async function toggle() {
  if (transitioning.value) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!document.startViewTransition || reduce) {
    wide.value = !wide.value
    return
  }
  transitioning.value = true
  const update = async () => {
    wide.value = !wide.value
    await nextTick()
  }
  let vt: ViewTransition
  try {
    vt = document.startViewTransition({ update, types: ['mb-demo'] })
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
    label="startViewTransition"
    tag="LIVE"
    description="Resize both cards — one view transition, slowed to 900ms. Left is the browser default; right gets the three-line fix."
  >
    <div class="mb">
      <button
        class="mb__btn"
        @click="toggle"
      >
        resize both cards
      </button>
      <div class="mb__row">
        <div class="mb__side">
          <div class="mb__stage">
            <div
              class="mb__card mb__card--naive"
              :class="{ 'mb__card--wide': wide }"
            >
              <span class="mb__text">Invoice #1042<br>Northwind Traders</span>
            </div>
          </div>
          <span class="mb__caption">❌ default — the <b>snapshot image</b> is stretched to the new box: text warps &amp; blurs</span>
        </div>
        <div class="mb__side">
          <div class="mb__stage">
            <div
              class="mb__card mb__card--clip"
              :class="{ 'mb__card--wide': wide }"
            >
              <span class="mb__text">Invoice #1042<br>Northwind Traders</span>
            </div>
          </div>
          <span class="mb__caption">✅ natural-size snapshot + <b>clipping group box</b>: the box morphs, text never scales</span>
        </div>
      </div>
    </div>
  </DemoWrapper>
</template>

<style scoped>
.mb__btn {
  margin-bottom: 0.6rem;
  padding: 0.25rem 0.9rem;
  border: 1px solid rgb(0 0 0 / 12%);
  border-radius: 999px;
  background: white;
  font-size: 0.75rem;
  color: rgb(0 0 0 / 65%);
  cursor: pointer;
  transition: background 0.2s ease;
}

.mb__btn:hover {
  background: rgb(0 0 0 / 5%);
}

.mb__row {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.mb__side {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
  min-width: 14rem;
}

.mb__stage {
  height: 8rem;
  padding: 0.7rem;
  border-radius: 0.7rem;
  background: rgb(0 0 0 / 4%);
}

.mb__card {
  display: flex;
  align-items: center;
  width: 9rem;
  height: 6.6rem;
  padding: 0.7rem;
  border: 1px solid rgb(0 0 0 / 10%);
  border-radius: 0.6rem;
  background: white;
  box-shadow: 0 6px 16px rgb(0 0 0 / 8%);
}

.mb__card--wide {
  width: 100%;
  height: 3.4rem;
}

.mb__card--naive {
  view-transition-name: mb-naive;
}

.mb__card--clip {
  view-transition-name: mb-clip;
}

.mb__text {
  font-size: 0.8rem;
  font-weight: 600;
  line-height: 1.35;
  white-space: nowrap;
}

.mb__caption {
  font-size: 0.72rem;
  opacity: 0.65;
  line-height: 1.4;
}
</style>

<style>
/* VT pseudos live on the document root — must be unscoped.
   Slowed to 900ms on purpose: this demo exists to make the artifact visible. */
::view-transition-group(mb-naive),
::view-transition-group(mb-clip) {
  animation-duration: 900ms;
  animation-timing-function: cubic-bezier(0.32, 0.72, 0, 1);
}

/* naive card: browser default — old & new snapshots are IMAGES stretched to
   the interpolating group box, so the text visibly warps */

/* fixed card: natural-size snapshot, the group box becomes a clipping reveal
   window, text stays crisp the whole way */
::view-transition-group(mb-clip) {
  overflow: clip;
}

::view-transition-old(mb-clip) {
  animation: none;
  opacity: 0;
}

::view-transition-new(mb-clip) {
  animation: none;
  opacity: 1;
  width: auto;
  height: auto;
}

/* keep the rest of the page calm during THIS demo's transition only — an
   unscoped rule would retime every view transition on the page */
html:active-view-transition-type(mb-demo)::view-transition-old(root),
html:active-view-transition-type(mb-demo)::view-transition-new(root) {
  animation-duration: 150ms;
}
</style>
