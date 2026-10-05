<script setup lang="ts">
// 天空屏 = 唯一背景视角：首屏、在轨（计时只是顶部小芯片）、星星随时可点，都发生在这片天空上。
import type { Star } from '../../core/models'
import StarField from '../components/StarField.vue'
import { formatMs } from '../format'

defineProps<{ stars: Star[]; orbiting: boolean; elapsedMs: number; notice: string }>()
const emit = defineEmits<{ light: []; openStar: [starId: string]; end: []; openInput: [] }>()

// 由 id 哈希出稳定的天空坐标，刷新不跳动
function posFor(id: string): { left: string; top: string } {
  let h = 0
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 9973
  return {
    left: `${8 + (h % 76)}%`,
    top: `${14 + (Math.floor(h / 77) % 42)}%`,
  }
}
</script>

<template>
  <div class="screen sky">
    <StarField />
    <div class="glow" />

    <p v-if="!orbiting" class="phrase">{{ stars.length === 0 ? '这里还没有星' : '你的天空' }}</p>
    <div v-else class="timer-chip">{{ formatMs(elapsedMs) }}</div>

    <p v-if="notice" class="notice">{{ notice }}</p>

    <button
      v-for="s in stars"
      :key="s.id"
      class="star"
      :style="posFor(s.id)"
      @click="emit('openStar', s.id)"
    ></button>

    <div v-if="orbiting" class="orbit-ctrls">
      <button class="btn" @click="emit('openInput')">记点什么</button>
      <button class="btn end-btn" @click="emit('end')">结束</button>
    </div>
    <button v-else class="btn light-btn" @click="emit('light')">点亮一颗星</button>
  </div>
</template>

<style scoped>
.phrase {
  position: absolute;
  top: 22%;
  font-size: 15px;
  letter-spacing: 4px;
  opacity: 0.75;
}

.notice {
  position: absolute;
  top: 33%;
  font-size: 12px;
  opacity: 0.6;
}

.timer-chip {
  position: absolute;
  top: 20px;
  padding: 6px 18px;
  border: 1px solid rgba(205, 214, 232, 0.2);
  border-radius: 999px;
  background: rgba(10, 15, 30, 0.6);
  font-size: 14px;
  letter-spacing: 2px;
  font-variant-numeric: tabular-nums;
}

.star {
  position: absolute;
  width: 10px;
  height: 10px;
  padding: 0;
  border-radius: 50%;
  background: #fff6dd;
  box-shadow: 0 0 14px 5px rgba(255, 240, 200, 0.5);
  animation: breathe 3.2s ease-in-out infinite;
}

/* 手机上的点击热区扩大 */
.star::after {
  content: '';
  position: absolute;
  inset: -10px;
}

.orbit-ctrls {
  position: absolute;
  bottom: 16%;
  display: flex;
  gap: 16px;
}

.light-btn {
  position: absolute;
  bottom: 16%;
}

.glow {
  position: fixed;
  inset: 0;
  background: radial-gradient(ellipse 70% 45% at 50% 42%, rgba(72, 92, 168, 0.16), transparent 70%);
  animation: breathe 6s ease-in-out infinite;
  pointer-events: none;
}

@keyframes breathe {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.12);
    opacity: 0.82;
  }
}
</style>
