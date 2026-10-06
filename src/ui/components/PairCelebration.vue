<script setup lang="ts">
// 整座星座点亮时的全屏庆祝弹层：祝贺文案 + 官方星图（星点连线 + 虚影），约 6 秒自动收起、点击任意处收起。
import type { Constellation } from '../../core/constellations'

defineProps<{ constellation: Constellation; who: string }>()
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <div class="celeb" @click="emit('close')">
    <div class="glow" />
    <p class="symbol">{{ constellation.symbol }}</p>
    <h2 class="name">{{ constellation.name }}</h2>
    <p class="msg">{{ who === '双方' ? '祝贺双方' : '祝贺大家' }}共同点亮了{{ constellation.name }}</p>

    <svg class="figure" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
      <g v-html="constellation.silhouette" />
      <polyline :points="constellation.stars.map((s) => `${s.x},${s.y}`).join(' ')" />
      <g class="dots">
        <circle
          v-for="(s, i) in constellation.stars"
          :key="s.id"
          :cx="s.x"
          :cy="s.y"
          r="1.6"
          :style="{ animationDelay: (i * 0.35) + 's' }"
        />
      </g>
    </svg>

    <p class="hint">这段光，是你们一起点亮的 · 点击收起</p>
  </div>
</template>

<style scoped>
.celeb {
  position: fixed;
  inset: 0;
  z-index: 30;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: rgba(5, 8, 20, 0.9);
  animation: darken 1.2s ease-out both;
  cursor: pointer;
}

.glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: min(120vw, 620px);
  aspect-ratio: 1;
  transform: translate(-50%, -52%);
  background: radial-gradient(circle, rgba(255, 226, 160, 0.14), rgba(90, 110, 190, 0.08) 45%, transparent 70%);
  animation: breathe 5s ease-in-out infinite;
  pointer-events: none;
}

.symbol {
  margin: 0;
  font-size: 34px;
  animation: fadein 1.6s ease-out both;
}

.name {
  margin: 0;
  font-weight: 400;
  font-size: 26px;
  letter-spacing: 8px;
  color: #ffe9b8;
  animation: fadein 1.8s 0.3s ease-out both;
}

.msg {
  margin: 0;
  font-size: 14px;
  letter-spacing: 2px;
  opacity: 0.8;
  animation: fadein 1.8s 0.6s ease-out both;
}

.figure {
  width: min(64vw, 260px);
  aspect-ratio: 1;
  margin-top: 8px;
  animation: fadein 2.2s 0.9s ease-out both;
}

.figure :deep(path) {
  fill: none;
  stroke: rgba(190, 210, 255, 0.35);
  stroke-width: 0.9;
  stroke-linejoin: round;
  stroke-linecap: round;
}

.figure polyline {
  fill: none;
  stroke: rgba(255, 240, 200, 0.7);
  stroke-width: 0.6;
  stroke-linejoin: round;
}

.figure circle {
  fill: #fff6dd;
  animation: twinkle 2.4s ease-in-out infinite;
}

.hint {
  position: absolute;
  bottom: calc(28px + env(safe-area-inset-bottom));
  margin: 0;
  font-size: 12px;
  letter-spacing: 2px;
  opacity: 0.45;
  animation: fadein 2s 1.6s ease-out both;
}

@keyframes darken {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadein {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes twinkle {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.35;
  }
}

@keyframes breathe {
  0%,
  100% {
    transform: translate(-50%, -52%) scale(1);
    opacity: 1;
  }
  50% {
    transform: translate(-50%, -52%) scale(1.15);
    opacity: 0.75;
  }
}
</style>
