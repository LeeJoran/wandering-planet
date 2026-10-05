<script setup lang="ts">
// 天空屏 = 唯一背景视角。星座区展示所选星座：暗点为未点亮，亮点+连线为已点亮（按形状顺序）。
// 自由星（旧数据，不属于任何星座）继续散落在天空上。
import { computed } from 'vue'
import type { Constellation, ConstellationStar } from '../../core/constellations'
import type { Star } from '../../core/models'
import StarField from '../components/StarField.vue'
import { formatMs } from '../format'

const props = defineProps<{
  stars: Star[]
  constellation: Constellation
  litConstStarIds: Set<string>
  remaining: number
  orbiting: boolean
  elapsedMs: number
  notice: string
}>()
const emit = defineEmits<{
  light: []
  openStar: [starId: string]
  openStarInfo: [constellationId: string, starId: string]
  end: []
  openInput: []
  openCatalog: []
}>()

// 已点亮的星座星 id → 星对象 id
const litStarIdByConst = computed(() => {
  const m = new Map<string, string>()
  for (const s of props.stars) if (s.constellationStarId) m.set(s.constellationStarId, s.id)
  return m
})

// 连线：按星座形状顺序串起已点亮的星（顺序点亮，所以永远是形状前缀）
const linePoints = computed(() =>
  props.constellation.stars
    .filter((s) => litStarIdByConst.value.has(s.id))
    .map((s) => `${s.x},${s.y}`)
    .join(' '),
)

// 自由星（旧数据）
const freeStars = computed(() => props.stars.filter((s) => !s.constellationStarId))

function tapConstStar(s: ConstellationStar) {
  const litId = litStarIdByConst.value.get(s.id)
  if (litId) emit('openStar', litId)
  else emit('openStarInfo', props.constellation.id, s.id)
}

// 点亮/未点亮的光点大小不同，用 calc 抵消偏移
function dotStyle(s: ConstellationStar, lit: boolean): { left: string; top: string } {
  const off = lit ? 4.5 : 2.5
  return { left: `calc(${s.x}% - ${off}px)`, top: `calc(${s.y}% - ${off}px)` }
}

// 自由星的散落坐标（由 id 哈希，刷新不跳动）
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

    <button class="c-label" @click="emit('openCatalog')">
      {{ constellation.symbol }} {{ constellation.name }} ·
      {{ remaining > 0 ? '还需 ' + remaining + ' 次' : '全部点亮' }}
    </button>

    <p v-if="!orbiting" class="phrase">{{ stars.length === 0 ? '这里还没有星' : '你的天空' }}</p>
    <div v-else class="timer-chip">{{ formatMs(elapsedMs) }}</div>

    <p v-if="notice" class="notice">{{ notice }}</p>

    <div class="const-area">
      <svg class="lines" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline v-if="linePoints" :points="linePoints" />
      </svg>
      <button
        v-for="s in constellation.stars"
        :key="s.id"
        class="c-star"
        :class="{ lit: litStarIdByConst.has(s.id) }"
        :style="dotStyle(s, litStarIdByConst.has(s.id))"
        @click="tapConstStar(s)"
      ></button>
    </div>

    <button
      v-for="s in freeStars"
      :key="s.id"
      class="star free-star"
      :style="posFor(s.id)"
      @click="emit('openStar', s.id)"
    ></button>

    <div v-if="orbiting" class="orbit-ctrls">
      <button class="btn" @click="emit('openInput')">记点什么</button>
      <button class="btn end-btn" @click="emit('end')">结束</button>
    </div>
    <div v-else class="idle-ctrls">
      <button class="btn ghost" @click="emit('openCatalog')">星座</button>
      <button class="btn light-btn" @click="emit('light')">点亮一颗星</button>
    </div>
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

.c-label {
  position: absolute;
  top: 20px;
  left: 16px;
  padding: 6px 12px;
  border: 1px solid rgba(205, 214, 232, 0.2);
  border-radius: 999px;
  background: rgba(10, 15, 30, 0.6);
  font-size: 13px;
  letter-spacing: 1px;
  opacity: 0.85;
}

/* 星座区：居中的正方形，形状不随屏幕变形 */
.const-area {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -52%);
  width: min(88vw, 340px);
  aspect-ratio: 1;
}

.lines {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.lines polyline {
  fill: none;
  stroke: rgba(255, 240, 200, 0.45);
  stroke-width: 0.5;
  stroke-linejoin: round;
}

.c-star {
  position: absolute;
  width: 5px;
  height: 5px;
  padding: 0;
  border-radius: 50%;
  background: rgba(205, 214, 232, 0.4);
}

.c-star::after {
  content: '';
  position: absolute;
  inset: -10px;
}

.c-star.lit {
  width: 9px;
  height: 9px;
  background: #fff6dd;
  box-shadow: 0 0 12px 4px rgba(255, 240, 200, 0.5);
  animation: breathe 3.2s ease-in-out infinite;
}

/* 自由星（旧数据） */
.star {
  position: absolute;
  width: 8px;
  height: 8px;
  padding: 0;
  border-radius: 50%;
  background: #fff6dd;
  box-shadow: 0 0 12px 4px rgba(255, 240, 200, 0.45);
  animation: breathe 4.2s ease-in-out infinite;
  opacity: 0.85;
}

.star::after {
  content: '';
  position: absolute;
  inset: -10px;
}

.orbit-ctrls,
.idle-ctrls {
  position: absolute;
  bottom: 14%;
  display: flex;
  gap: 16px;
}

.ghost {
  opacity: 0.65;
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
