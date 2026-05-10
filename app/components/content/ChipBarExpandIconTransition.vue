<script setup lang="ts">
/**
 * Experiment: TransitionExpand-style animation on the X icon itself.
 *
 * Instead of animating the whole chip width, animate the entering/leaving X
 * from width 0 → measured width. The chip's parent width changes gradually as
 * the child expands, so siblings reflow naturally frame-by-frame.
 *
 * TransitionGroup is present here mostly to prove it is not doing the important
 * work. In this structure, the inner expand transition is what drives layout.
 */
const chips = [
  { id: '1', label: 'Design' },
  { id: '2', label: 'Photography' },
  { id: '3', label: 'Music' },
  { id: '4', label: 'Travel' },
  { id: '5', label: 'Sports' },
  { id: '6', label: 'Food & Drinks' },
  { id: '7', label: 'Technology' }
]

const selected = ref(new Set<string>())

function toggle(id: string) {
  const next = new Set(selected.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  selected.value = next
}

const duration = 350
const easing = 'cubic-bezier(0.4, 0, 0.2, 1)'

function forceReflow(el: HTMLElement) {
  return el.offsetWidth
}

function beforeEnter(el: Element) {
  const node = el as HTMLElement
  node.style.width = '0px'
  node.style.opacity = '0'
  node.style.overflow = 'hidden'
}

function enter(el: Element, done: () => void) {
  const node = el as HTMLElement
  // scrollWidth includes the final padding-left from .chip__x, so the cleaned-up
  // natural width after enter exactly matches the animated target width.
  const targetWidth = node.scrollWidth
  forceReflow(node)
  node.style.transition = `width ${duration}ms ${easing}, opacity ${duration}ms ${easing}`
  node.style.width = `${targetWidth}px`
  node.style.opacity = '1'
  window.setTimeout(done, duration)
}

function afterEnter(el: Element) {
  const node = el as HTMLElement
  node.style.width = ''
  node.style.opacity = ''
  node.style.overflow = ''
  node.style.transition = ''
}

function beforeLeave(el: Element) {
  const node = el as HTMLElement
  node.style.width = `${node.getBoundingClientRect().width}px`
  node.style.opacity = '1'
  node.style.overflow = 'hidden'
}

function leave(el: Element, done: () => void) {
  const node = el as HTMLElement
  forceReflow(node)
  node.style.transition = `width ${duration}ms ${easing}, opacity ${duration}ms ${easing}`
  node.style.width = '0px'
  node.style.opacity = '0'
  window.setTimeout(done, duration)
}

function afterLeave(el: Element) {
  const node = el as HTMLElement
  node.style.width = ''
  node.style.opacity = ''
  node.style.overflow = ''
  node.style.transition = ''
}
</script>

<template>
  <DemoWrapper
    label="Expand icon + TransitionGroup"
    tag="EXPERIMENT"
    description="The X icon expands from width 0. Siblings move naturally as layout reflows; TransitionGroup is mostly unnecessary here."
  >
    <div
      class="chip-list"
    >
      <button
        v-for="chip in chips"
        :key="chip.id"
        type="button"
        class="chip"
        :class="{ 'chip--active': selected.has(chip.id) }"
        @click="toggle(chip.id)"
      >
        <span>{{ chip.label }}</span>
        <Transition
          :css="false"
          @before-enter="beforeEnter"
          @enter="enter"
          @after-enter="afterEnter"
          @before-leave="beforeLeave"
          @leave="leave"
          @after-leave="afterLeave"
        >
          <span
            v-if="selected.has(chip.id)"
            class="chip__x-shell"
            aria-hidden="true"
          >
            <span class="chip__x">✕</span>
          </span>
        </Transition>
      </button>
    </div>
  </DemoWrapper>
</template>

<style scoped>
.chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  max-width: 26rem;
}

.chip {
  display: inline-flex;
  align-items: center;
  height: 2.25rem;
  padding: 0 0.75rem;
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  background: transparent;
  border: 1px solid var(--color-ink-faint);
  color: var(--color-ink);
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
}

.chip--active {
  border-color: var(--color-ink);
  background: rgba(44, 44, 42, 0.06);
}

.chip__x-shell {
  display: inline-flex;
  flex-shrink: 0;
  overflow: hidden;
}

.chip__x {
  display: inline-flex;
  flex-shrink: 0;
  padding-left: 8px;
  font-size: var(--text-2xs);
  opacity: 0.6;
}
</style>

<style>
.expand-icon-move {
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
