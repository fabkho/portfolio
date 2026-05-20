<script setup lang="ts">
const props = defineProps<{
  text?: string
}>()

const textToType = props.text || 'fabkho'
const displayText = ref('')
const isTyping = ref(false)
const prefersReducedMotion = usePreferredReducedMotion()
const typingDone = useState(`typewriter-logo-${textToType}-done`, () => false)

const { pause, resume } = useIntervalFn(() => {
  const nextLength = displayText.value.length + 1
  displayText.value = textToType.slice(0, nextLength)

  if (nextLength >= textToType.length) {
    isTyping.value = false
    pause()
  }
}, 80, { immediate: false })

onMounted(async () => {
  if (prefersReducedMotion.value === 'reduce' || typingDone.value) {
    displayText.value = textToType
    return
  }

  let shouldAnimate = false
  await callOnce(`typewriter-logo-${textToType}`, () => {
    shouldAnimate = true
    typingDone.value = true
  })

  if (!shouldAnimate) {
    displayText.value = textToType
    return
  }

  displayText.value = ''
  isTyping.value = true
  resume()
})
</script>

<template>
  <div class="logo">
    <span class="prefix">~ </span>
    <span class="text">{{ displayText }}</span>
    <span
      class="cursor"
      :class="{ blinking: !isTyping }"
    >_</span>
  </div>
</template>

<style scoped>
.logo {
  font-family: var(--font-mono);
  font-size: inherit;
  font-weight: 500;
  color: var(--color-ink);
  display: flex;
  align-items: center;
}

.prefix {
  color: var(--color-accent);
  margin-right: 0.5rem;
}

.cursor {
  display: inline-block;
  width: 10px;
  color: var(--color-accent);
  margin-left: 2px;
}

.blinking {
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
</style>
