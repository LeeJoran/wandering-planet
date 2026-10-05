<script setup lang="ts">
// 共赴天空：三颗双星（两颗互相绕转的星 = 双星），两人共同点亮。
// 在轨规则（PRD）：任一方在线就继续；双方都在 → ×1.5 同频加成；双方都离开 → 结算。
import { computed, onUnmounted, ref, watch } from 'vue'
import type { PairEntry, PairGalaxy, PairStar } from '../../platform/pair'
import { pairBackend } from '../../platform/pair'
import Meteors from '../components/Meteors.vue'
import PairStarPanel from '../components/PairStarPanel.vue'
import StarField from '../components/StarField.vue'
import { formatMs } from '../format'

const props = defineProps<{ galaxy: PairGalaxy }>()
const emit = defineEmits<{ back: []; changed: [] }>()

// 三颗共赴星的固定位置（三角）
const POS: Record<number, { x: number; y: number }> = {
  1: { x: 32, y: 30 },
  2: { x: 68, y: 30 },
  3: { x: 50, y: 66 },
}

const openStarId = ref<string | null>(null)
const entries = ref<PairEntry[]>([])
const entriesLoading = ref(false)
const orbitError = ref('')

const myActive = computed(() => {
  const o = props.galaxy.orbit
  if (!o) return false
  return props.galaxy.iAmA ? o.aActive : o.bActive
})

const targetStar = computed<PairStar | null>(() => {
  if (!props.galaxy.orbit) return null
  return props.galaxy.stars.find((s) => s.id === props.galaxy.orbit?.starId) ?? null
})

const nextStar = computed<PairStar | null>(() => {
  const st = [...props.galaxy.stars].sort((a, b) => a.seq - b.seq)
  return st.find((s) => !s.litAt) ?? null
})

const allLit = computed(() => props.galaxy.stars.every((s) => s.litAt))

const linePoints = computed(() => {
  const pts: string[] = []
  for (const s of [...props.galaxy.stars].sort((a, b) => a.seq - b.seq)) {
    if (s.litAt) pts.push(`${POS[s.seq].x},${POS[s.seq].y}`)
    else break
  }
  return pts.join(' ')
})

const now = ref(Date.now())
let clock: number | null = null
let heartbeatTimer: number | null = null

const elapsedMs = computed(() => {
  if (!props.galaxy.orbit) return 0
  return now.value - new Date(props.galaxy.orbit.startedAt).getTime()
})

const statusLine = computed(() => {
  if (props.galaxy.status === 'dimmed') return '这段共赴已黯淡'
  const o = props.galaxy.orbit
  if (!o) {
    if (allLit.value) return '你们的共赴星系已全部点亮'
    return props.galaxy.partnerOnline ? '对方在线' : '对方不在'
  }
  if (myActive.value && props.galaxy.partnerInOrbit) return '两人同在 · 同频加成中'
  if (myActive.value) return '只有你在场 · 共赴仍在继续'
  return props.galaxy.partnerInOrbit ? '对方正在共赴' : ''
})

async function openStar(s: PairStar) {
  openStarId.value = s.id
  await reloadEntries()
}

async function reloadEntries() {
  if (!openStarId.value) return
  entriesLoading.value = true
  try {
    entries.value = await pairBackend.loadEntries(openStarId.value)
  } catch {
    entries.value = []
  } finally {
    entriesLoading.value = false
  }
}

async function addEntry(type: 'text' | 'voice' | 'image', text?: string, media?: string) {
  const s = openStarId.value ? props.galaxy.stars.find((x) => x.id === openStarId.value) : null
  if (!s) return
  try {
    await pairBackend.addEntry(props.galaxy.id, s.id, type, text, media)
    entries.value = await pairBackend.loadEntries(s.id)
    emit('changed')
  } catch (e) {
    orbitError.value = e instanceof Error ? e.message : '发送失败'
  }
}

async function startOrbit() {
  const target = nextStar.value
  if (!target) return
  try {
    const sessionId = await pairBackend.startOrbit(props.galaxy.id, target.id)
    await pairBackend.heartbeatOrbit(sessionId, true)
    emit('changed')
  } catch (e) {
    orbitError.value = e instanceof Error ? e.message : '开始共赴失败'
  }
}

async function leaveOrbit() {
  const o = props.galaxy.orbit
  if (!o) return
  try {
    await pairBackend.heartbeatOrbit(o.id, false)
    emit('changed')
  } catch (e) {
    orbitError.value = e instanceof Error ? e.message : '结束失败'
  }
}

// 星系数据变化（实时/轮询刷新）时，面板里互发的表达跟着刷新
watch(
  () => props.galaxy,
  () => {
    if (openStarId.value) void reloadEntries()
  },
)

// 在轨时：时钟 + 每 10 秒心跳
watch(
  () => [props.galaxy.orbit?.id, myActive.value] as const,
  ([orbitId, active]) => {
    if (clock) clearInterval(clock)
    if (heartbeatTimer) clearInterval(heartbeatTimer)
    clock = null
    heartbeatTimer = null
    now.value = Date.now()
    if (orbitId && active) {
      clock = window.setInterval(() => (now.value = Date.now()), 1000)
      heartbeatTimer = window.setInterval(() => {
        pairBackend.heartbeatOrbit(orbitId, true).then(() => emit('changed')).catch(() => {})
      }, 10000)
    }
  },
  { immediate: true },
)

function starStyle(s: PairStar): Record<string, string> {
  const p = POS[s.seq]
  const pct = Math.min(100, Math.floor((s.energy / s.required) * 100))
  const opacity = s.litAt ? 1 : 0.35 + (pct / 100) * 0.5
  return { left: `${p.x}%`, top: `${p.y}%`, opacity: String(opacity) }
}

onUnmounted(() => {
  if (clock) clearInterval(clock)
  if (heartbeatTimer) clearInterval(heartbeatTimer)
})
</script>

<template>
  <div class="screen sky pair">
    <StarField />
    <div class="glow" />
    <Meteors />

    <div class="top-bar">
      <button class="c-label" @click="emit('back')">← 返回星空</button>
      <button class="c-label">{{ galaxy.status === 'dimmed' ? '黯淡的共赴星系' : '共赴星系' }}</button>
    </div>

    <p class="status">{{ statusLine }}</p>

    <!-- 三颗双星：每颗 = 两颗互相绕转的星 -->
    <div class="pair-area">
      <svg class="lines" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline v-if="linePoints" :points="linePoints" />
      </svg>
      <button
        v-for="s in [...galaxy.stars].sort((a, b) => a.seq - b.seq)"
        :key="s.id"
        class="pair-star"
        :class="{ lit: s.litAt, dimmed: galaxy.status === 'dimmed' }"
        :style="starStyle(s)"
        @click="openStar(s)"
      >
        <span class="orbit-ring">
          <span class="body"></span>
          <span class="body opposite"></span>
        </span>
      </button>
    </div>

    <!-- 在轨状态 -->
    <template v-if="galaxy.orbit && myActive">
      <div class="timer-chip">{{ formatMs(elapsedMs) }}</div>
      <p v-if="targetStar" class="target">正在点亮 · {{ targetStar.name }}</p>
    </template>

    <p v-if="orbitError" class="hint error">{{ orbitError }}</p>

    <!-- 操作 -->
    <div v-if="galaxy.status === 'active'" class="ctrls">
      <template v-if="!myActive && !galaxy.partnerInOrbit">
        <button v-if="!allLit" class="btn" @click="startOrbit">开始共赴</button>
        <p v-else class="hint">全部点亮 · 这片天空是你们的了</p>
      </template>
      <template v-else-if="!myActive && galaxy.partnerInOrbit">
        <button class="btn" @click="startOrbit">加入对方的共赴</button>
      </template>
      <template v-else>
        <button class="btn" @click="leaveOrbit">结束共赴</button>
      </template>
    </div>

    <PairStarPanel
      v-if="openStarId && !entriesLoading"
      :star="galaxy.stars.find((s) => s.id === openStarId) ?? galaxy.stars[0]"
      :galaxy-name="'共赴星系'"
      :entries="entries"
      :my-user-id="pairBackend.myUserId()"
      :can-add="galaxy.status === 'active'"
      @add="addEntry"
      @close="openStarId = null"
    />
  </div>
</template>

<style scoped>
.pair {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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

.status {
  position: absolute;
  top: 64px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  opacity: 0.6;
  white-space: nowrap;
}

.pair-area {
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

.pair-star {
  position: absolute;
  width: 34px;
  height: 34px;
  padding: 0;
  background: none;
  border: none;
  transform: translate(-50%, -50%);
}

.pair-star::after {
  content: '';
  position: absolute;
  inset: -8px;
}

.pair-star.dimmed {
  filter: grayscale(0.8);
}

.orbit-ring {
  position: absolute;
  inset: 0;
  animation: spin 7s linear infinite;
}

.body {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 6px;
  height: 6px;
  margin: -3px 0 0 -3px;
  border-radius: 50%;
  background: #fff6dd;
  box-shadow: 0 0 8px 3px rgba(255, 240, 200, 0.6);
}

.pair-star.lit .body {
  width: 8px;
  height: 8px;
  margin: -4px 0 0 -4px;
  animation: twinkle 2.6s ease-in-out infinite;
}

.opposite {
  transform: translate(-14px, 0) rotate(0deg);
}

.orbit-ring .body:first-child {
  transform: translate(14px, 0);
}

.timer-chip {
  position: absolute;
  top: 96px;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 14px;
  border: 1px solid rgba(205, 214, 232, 0.2);
  border-radius: 999px;
  background: rgba(10, 15, 30, 0.6);
  font-size: 13px;
  letter-spacing: 2px;
  font-variant-numeric: tabular-nums;
}

.target {
  position: absolute;
  top: 136px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  opacity: 0.6;
  white-space: nowrap;
}

.ctrls {
  position: absolute;
  bottom: 14%;
  display: flex;
  gap: 16px;
}

.error {
  color: #e8a0a0;
  position: absolute;
  bottom: 26%;
  margin: 0;
}

.glow {
  position: fixed;
  inset: 0;
  background: radial-gradient(ellipse 70% 45% at 50% 42%, rgba(72, 92, 168, 0.16), transparent 70%);
  animation: breathe 6s ease-in-out infinite;
  pointer-events: none;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
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
</style>
