<script setup lang="ts">
// 天空屏 = 唯一背景视角。星座区三态：未点亮（暗点）/ 点亮中（弦月态，按能量比例填充）/ 完全点亮（金色光点）。
// 完全点亮的星按形状顺序连线；星座全部点亮后虚影淡显。
import { computed } from 'vue'
import type { Constellation, ConstellationStar, StarEnergy } from '../../core/constellations'
import type { Star } from '../../core/models'
import StarField from '../components/StarField.vue'
import { formatMs } from '../format'

const props = defineProps<{
  stars: Star[]
  constellation: Constellation
  starEnergy: Map<string, StarEnergy>
  complete: boolean
  percent: number
  targetName: string
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
  openConstellation: []
}>()

// 星座星 id → 星记录 id（有记录的：点亮中/完全点亮，都可点开）
const starIdByConst = computed(() => {
  const m = new Map<string, string>()
  for (const s of props.stars) if (s.constellationStarId) m.set(s.constellationStarId, s.id)
  return m
})

// 连线：完全点亮的星按形状顺序串起来（顺序点亮，所以永远是前缀）
const linePoints = computed(() => {
  const pts: string[] = []
  for (const s of props.constellation.stars) {
    const e = props.starEnergy.get(s.id)
    if (e && e.energy >= e.required) pts.push(`${s.x},${s.y}`)
    else break
  }
  return pts.join(' ')
})

// 由 id 哈希出 0~2.5s 的闪烁错相位，让亮星此起彼伏
function twinkleDelay(id: string): string {
  let h = 0
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 9973
  return `${(h % 25) / 10}s`
}

// 自由星（旧数据）
const freeStars = computed(() => props.stars.filter((s) => !s.constellationStarId))

type DotState = 'full' | 'partial' | 'unlit'

function stateOf(s: ConstellationStar): DotState {
  const e = props.starEnergy.get(s.id)
  if (!e) return 'unlit'
  return e.energy >= e.required ? 'full' : 'partial'
}

function tapConstStar(s: ConstellationStar) {
  const starId = starIdByConst.value.get(s.id)
  if (starId) emit('openStar', starId)
  else emit('openStarInfo', props.constellation.id, s.id)
}

// 点亮/未点亮的光点大小不同，用 calc 抵消偏移；弦月态用 conic-gradient 按比例填充
function dotStyle(s: ConstellationStar, st: DotState): Record<string, string> {
  const e = props.starEnergy.get(s.id)
  if (st === 'partial' && e) {
    const pct = Math.round((e.energy / e.required) * 100)
    return {
      left: `calc(${s.x}% - 5px)`,
      top: `calc(${s.y}% - 5px)`,
      background: `conic-gradient(from 0deg, #ffd98a 0% ${pct}%, rgba(205, 214, 232, 0.35) ${pct}% 100%)`,
    }
  }
  const off = st === 'full' ? 4.5 : 2.5
  return {
    left: `calc(${s.x}% - ${off}px)`,
    top: `calc(${s.y}% - ${off}px)`,
    ...(st === 'full' ? { animationDelay: twinkleDelay(s.id) } : {}),
  }
}

// 自由星的散落坐标（由 id 哈希，刷新不跳动）
function freeStarStyle(id: string): Record<string, string> {
  let h = 0
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 9973
  return {
    left: `${8 + (h % 76)}%`,
    top: `${14 + (Math.floor(h / 77) % 42)}%`,
    animationDelay: twinkleDelay(id),
  }
}
</script>

<template>
  <div class="screen sky">
    <StarField />
    <div class="glow" />

    <div class="top-bar">
      <button class="c-label" @click="emit('openCatalog')">
        {{ constellation.symbol }} {{ constellation.name }} ·
        {{ complete ? '全部点亮' : '已点亮 ' + percent + '%' }}
      </button>
      <button v-if="complete" class="c-label learn" @click="emit('openConstellation')">
        了解{{ constellation.name }}
      </button>
    </div>

    <p v-if="!orbiting" class="phrase">{{ stars.length === 0 ? '这里还没有星' : '你的天空' }}</p>
    <div v-else class="timer-chip">{{ formatMs(elapsedMs) }}</div>

    <p v-if="orbiting && targetName" class="target">正在点亮 · {{ targetName }}</p>

    <p v-if="notice" class="notice">{{ notice }}</p>

    <div class="const-area">
      <svg v-if="complete" class="silhouette" viewBox="0 0 100 100" preserveAspectRatio="none">
        <g v-html="constellation.silhouette" />
      </svg>
      <svg class="lines" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline v-if="linePoints" :points="linePoints" />
      </svg>
      <button
        v-for="s in constellation.stars"
        :key="s.id"
        class="c-star"
        :class="stateOf(s)"
        :style="dotStyle(s, stateOf(s))"
        @click="tapConstStar(s)"
      ></button>
    </div>

    <button
      v-for="s in freeStars"
      :key="s.id"
      class="star free-star"
      :style="freeStarStyle(s.id)"
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
  top: 34%;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  opacity: 0.75;
  white-space: nowrap;
}

.timer-chip {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 6px 18px;
  border: 1px solid rgba(205, 214, 232, 0.2);
  border-radius: 999px;
  background: rgba(10, 15, 30, 0.6);
  font-size: 14px;
  letter-spacing: 2px;
  font-variant-numeric: tabular-nums;
}

.target {
  position: absolute;
  top: 64px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  opacity: 0.6;
  white-space: nowrap;
}

.top-bar {
  position: absolute;
  top: 20px;
  left: 16px;
  right: 16px;
  display: flex;
  gap: 8px;
  z-index: 2;
}

.c-label {
  padding: 6px 12px;
  border: 1px solid rgba(205, 214, 232, 0.2);
  border-radius: 999px;
  background: rgba(10, 15, 30, 0.6);
  font-size: 13px;
  letter-spacing: 1px;
  opacity: 0.85;
  white-space: nowrap;
}

.c-label.learn {
  border-color: rgba(255, 240, 200, 0.45);
  color: #ffe9b8;
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

.silhouette {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  animation: fadein 2.5s ease-out both;
}

.silhouette :deep(path) {
  fill: none;
  stroke: rgba(190, 210, 255, 0.2);
  stroke-width: 0.8;
  stroke-linejoin: round;
  stroke-linecap: round;
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

/* 弦月态：按能量比例填充 */
.c-star.partial {
  width: 10px;
  height: 10px;
  border: 1px solid rgba(255, 217, 138, 0.35);
}

/* 完全点亮的星：明显闪烁，比背景星尘更亮眼 */
.c-star.full {
  width: 9px;
  height: 9px;
  background: #fff6dd;
  animation: twinkle 2.6s ease-in-out infinite;
}

/* 自由星（旧数据）：同样闪烁 */
.star {
  position: absolute;
  width: 8px;
  height: 8px;
  padding: 0;
  border-radius: 50%;
  background: #fff6dd;
  animation: twinkle 3.2s ease-in-out infinite;
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

@keyframes twinkle {
  0%,
  100% {
    opacity: 1;
    box-shadow: 0 0 12px 5px rgba(255, 240, 200, 0.55);
  }
  50% {
    opacity: 0.4;
    box-shadow: 0 0 3px 1px rgba(255, 240, 200, 0.15);
  }
}

@keyframes fadein {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
