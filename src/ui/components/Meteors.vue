<script setup lang="ts">
// 天空动态：流星（低频，7~16s 随机出现）与彗星（极低频，40~80s 随机出现）。
import { onUnmounted, ref } from 'vue'

interface Effect {
  id: number
  kind: 'meteor' | 'comet'
  x: number
  y: number
  dir: 1 | -1
  duration: number
}

const items = ref<Effect[]>([])
let idSeq = 0
let meteorTimer: number | null = null
let cometTimer: number | null = null

function spawn(kind: 'meteor' | 'comet') {
  const m: Effect = {
    id: idSeq++,
    kind,
    x: 15 + Math.random() * 70,
    y: 4 + Math.random() * 30,
    dir: Math.random() > 0.5 ? 1 : -1,
    duration: kind === 'meteor' ? 1100 + Math.random() * 600 : 2600 + Math.random() * 1200,
  }
  items.value.push(m)
  window.setTimeout(() => {
    items.value = items.value.filter((i) => i.id !== m.id)
  }, m.duration + 200)
}

function scheduleMeteor() {
  meteorTimer = window.setTimeout(() => {
    spawn('meteor')
    scheduleMeteor()
  }, 7000 + Math.random() * 9000)
}

function scheduleComet() {
  cometTimer = window.setTimeout(() => {
    spawn('comet')
    scheduleComet()
  }, 40000 + Math.random() * 40000)
}

scheduleMeteor()
scheduleComet()

onUnmounted(() => {
  if (meteorTimer) clearTimeout(meteorTimer)
  if (cometTimer) clearTimeout(cometTimer)
})
</script>

<template>
  <div class="sky-effects" aria-hidden="true">
    <div
      v-for="m in items"
      :key="m.id"
      class="fx"
      :class="m.kind"
      :style="{
        left: m.x + '%',
        top: m.y + '%',
        '--dir': m.dir,
        animationDuration: m.duration + 'ms',
      }"
    ></div>
  </div>
</template>

<style scoped>
.sky-effects {
  position: fixed;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  overflow: hidden;
}

.fx {
  position: absolute;
  border-radius: 999px;
  animation-name: shoot;
}

.fx.meteor {
  width: 70px;
  height: 2px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.85));
  transform: rotate(30deg);
  animation-timing-function: ease-in;
}

.fx.meteor::before {
  content: '';
  position: absolute;
  right: -2px;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 6px 2px rgba(255, 255, 255, 0.7);
}

.fx.comet {
  width: 150px;
  height: 3px;
  background: linear-gradient(90deg, rgba(150, 200, 255, 0), rgba(190, 225, 255, 0.75));
  transform: rotate(14deg);
  animation-timing-function: linear;
}

.fx.comet::before {
  content: '';
  position: absolute;
  right: -3px;
  top: 50%;
  transform: translateY(-50%);
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #cfe6ff;
  box-shadow: 0 0 10px 4px rgba(180, 220, 255, 0.6);
}

@keyframes shoot {
  0% {
    opacity: 0;
    translate: 0 0;
  }
  12% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    translate: calc(var(--dir) * 52vw) 46vh;
  }
}
</style>
