<template>
  <div
    v-once
    aria-hidden="true"
    class="schematic"
  >
    <div class="circle circle-sm" />
    <div class="circle circle-md" />
    <div class="circle circle-lg" />
    <div class="axis axis-h" />
    <div class="axis axis-v" />
    <div class="axis axis-d1" />
    <div class="axis axis-d2" />
  </div>
</template>

<style scoped>
.schematic {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  height: 80%;
  pointer-events: none;
  opacity: 0.15;
  z-index: 0;
  overflow: hidden;
}

.circle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border: 1px solid var(--color-ink);
}

.circle-sm {
  width: 300px;
  height: 300px;
}

.circle-md {
  width: 500px;
  height: 500px;
}

.circle-lg {
  width: 700px;
  height: 700px;
  border-style: dashed;
}

.axis {
  position: absolute;
  top: 50%;
  left: 50%;
  background-color: var(--color-ink);
}

.axis-h {
  width: 100%;
  height: 1px;
  transform: translate(-50%, -50%);
}

.axis-v {
  width: 1px;
  height: 100%;
  transform: translate(-50%, -50%);
}

.axis-d1 {
  width: 141%;
  height: 1px;
  transform: translate(-50%, -50%) rotate(45deg);
}

.axis-d2 {
  width: 141%;
  height: 1px;
  transform: translate(-50%, -50%) rotate(-45deg);
}
</style>
