<script setup lang="ts">
import { Flip } from '~/utils/Flip'
import { FlipGroup } from '~/utils/FlipGroup'

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
</script>

<template>
  <DemoWrapper
    label="Flip + FlipGroup"
    tag="WORKING"
    description="Both the chip's width and its neighbours' positions animate. Click any chip."
  >
    <!--
      Mirrors ResourceFilterBar exactly:
      - FlipGroup tracks wrapper divs by data-flip-id → animates POSITION of displaced siblings
      - Flip wraps each button → animates WIDTH when X icon appears/disappears
      - overflow:hidden on .chip clips content during width animation
        (without it, content forces min-width and the animation is invisible)
    -->
    <FlipGroup
      tag="div"
      class="chip-list"
      :duration="350"
    >
      <div
        v-for="chip in chips"
        :key="chip.id"
        :data-flip-id="chip.id"
        class="chip-shell"
      >
        <Flip :duration="350">
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
        </Flip>
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
