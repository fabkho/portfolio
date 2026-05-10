<template>
  <DemoWrapper
    label="TransitionGroup"
    tag="BROKEN"
    description="Siblings glide — but the chip that grows snaps. Click any chip to see the difference."
  >
    <TransitionGroup
      name="chips"
      tag="div"
      class="chip-list"
    >
      <button
        v-for="chip in chips"
        :key="chip.id"
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
    </TransitionGroup>
  </DemoWrapper>
</template>

<script setup lang="ts">
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
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  selected.value = next
}
</script>

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

<!-- TransitionGroup injects .chips-move globally — scoped won't reach it -->
<style>
.chips-move {
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
