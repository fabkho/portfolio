<script setup lang="ts">
import { cloneVNode, defineComponent, onBeforeUpdate, onUpdated, ref } from 'vue'
import type { VNode } from 'vue'
import { FlipGroup } from '~/utils/FlipGroup'

/**
 * StableFlipWidth
 *
 * Animates width of the visual child, but pins the parent [data-flip-id]
 * wrapper to the FINAL width during the animation.
 *
 * This is the missing structure for flex-wrap:
 * - outer shell participates in layout at final size immediately
 * - FlipGroup animates shell position old → final
 * - inner visual animates old width → new width without changing layout
 */
const StableFlipWidth = defineComponent({
  name: 'StableFlipWidth',
  props: {
    duration: { type: Number, default: 350 },
    easing: { type: String, default: 'cubic-bezier(0.4, 0, 0.2, 1)' }
  },
  setup(props, { slots }) {
    const elRef = ref<HTMLElement | null>(null)
    let oldWidth: number | null = null

    function getElement(): HTMLElement | null {
      return elRef.value
    }

    onBeforeUpdate(() => {
      const el = getElement()
      if (!el) return
      oldWidth = el.getBoundingClientRect().width
    })

    onUpdated(() => {
      const el = getElement()
      if (!el || oldWidth === null) return

      const newWidth = el.getBoundingClientRect().width
      const previousWidth = oldWidth
      oldWidth = null

      if (Math.abs(previousWidth - newWidth) < 1) return

      const shell = el.closest<HTMLElement>('[data-flip-id]')

      // Keep layout at final size while the visual child animates.
      // This prevents flex-wrap from recalculating line breaks mid-animation.
      if (shell) {
        shell.style.width = `${newWidth}px`
        shell.style.overflow = 'hidden'
      }

      const animation = el.animate(
        [
          { width: `${previousWidth}px`, overflow: 'hidden' },
          { width: `${newWidth}px`, overflow: 'hidden' }
        ],
        { duration: props.duration, easing: props.easing }
      )

      animation.finished.finally(() => {
        if (shell) {
          shell.style.width = ''
          shell.style.overflow = ''
        }
      })
    })

    return () => {
      const child = slots.default?.()[0] as VNode | undefined
      if (!child) return null
      return cloneVNode(child, { ref: elRef })
    }
  }
})

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
const flipGroupRef = ref<{ captureRects: () => void, playFlip: () => void } | null>(null)

async function toggle(id: string) {
  // Manual FLIP order:
  // 1. capture old shell rects before any state change
  flipGroupRef.value?.captureRects()

  // 2. update state → Vue patches DOM → StableFlipWidth pins shell to final width
  const next = new Set(selected.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  selected.value = next

  // 3. play shell move animation after DOM + child updated hooks settled
  await nextTick()
  flipGroupRef.value?.playFlip()
}
</script>

<template>
  <DemoWrapper
    label="Stable shell + FlipGroup"
    tag="EXPERIMENT"
    description="Outer shell jumps to final layout size immediately; inner chip animates width visually. This supports flex line wraps."
  >
    <FlipGroup
      ref="flipGroupRef"
      tag="div"
      class="chip-list"
      :duration="350"
      :disabled="true"
    >
      <div
        v-for="chip in chips"
        :key="chip.id"
        :data-flip-id="chip.id"
        class="chip-shell"
      >
        <StableFlipWidth :duration="350">
          <button
            type="button"
            class="chip"
            :class="{ 'chip--active': selected.has(chip.id) }"
            @click="toggle(chip.id)"
          >
            <span>{{ chip.label }}</span>
            <span
              v-if="selected.has(chip.id)"
              class="chip__x"
              aria-hidden="true"
            >✕</span>
          </button>
        </StableFlipWidth>
      </div>
    </FlipGroup>
  </DemoWrapper>
</template>

<style scoped>
.chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  max-width: 26rem;
}

.chip-shell {
  display: inline-flex;
  min-width: 0;
  will-change: transform;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
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

.chip__x {
  font-size: var(--text-2xs);
  opacity: 0.6;
}
</style>
