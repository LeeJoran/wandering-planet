<script setup lang="ts">
// 共赴天空：两人共同点亮的 20 个星座（非常见黄道十二宫）。
// 与单人同样的机制：选星座 → 共赴在轨积累能量 → 弦月态 → 完全点亮 → 连线 → 全部点亮后虚影。
// 双人规则：任一方在线会话继续；双方同在 ×1.5；互发的表达归到星上（标注我/对方）。
import { computed, onUnmounted, ref, watch } from 'vue'
import type { Constellation, StarEnergy } from '../../core/constellations'
import { progressOf } from '../../core/constellations'
import { requiredEnergyFor } from '../../core/energy'
import { PAIR_CONSTELLATIONS, getPairConstellation } from '../../core/pairConstellations'
import { pairBackend, type PairEntry, type PairGalaxy } from '../../platform/pair'
import ConstellationCatalog from '../components/ConstellationCatalog.vue'
import Meteors from '../components/Meteors.vue'
import PairStarPanel from '../components/PairStarPanel.vue'
import StarField from '../components/StarField.vue'
import { formatMs } from '../format'

const props = defineProps<{ galaxy: PairGalaxy }>()
const emit = defineEmits<{ back: []; changed: [] }>()

const selectedId = ref<string | null>(null)
const catalogOpen = ref(false)
const openStarId = ref<string | null>(null)
const entries = ref<PairEntry[]>([])
const entriesLoading = ref(false)
const orbitError = ref('')
const notice = ref('')
let noticeTimer: number | null = null

function showNotice(text: string, ms = 3000) {
  notice.value = text
  if (noticeTimer) clearTimeout(noticeTimer)
  noticeTimer = window.setTimeout(() => (notice.value = ''), ms)
}

// 星 id → 能量状态
const energyMap = computed(() => {
  const m = new Map<string, StarEnergy>()
  for (const s of props.galaxy.stars) m.set(s.starId, { energy: s.energy, required: s.required })
  return m
})

const constellation = computed<Constellation | null>(() => getPairConstellation(selectedId.value ?? '') ?? null)

const progress = computed(() => (constellation.value ? progressOf(constellation.value, energyMap.value) : null))

// 默认选中第一个未完成的星座
watch(
  () => props.galaxy.stars,
  () => {
    if (selectedId.value && getPairConstellation(selectedId.value)) return
    const complete = (c: Constellation) => progressOf(c, energyMap.value).complete
    selectedId.value = (PAIR_CONSTELLATIONS.find((c) => !complete(c)) ?? PAIR_CONSTELLATIONS[0]).id
  },
  { immediate: true },
)

const catalogRows = computed(() =>
  PAIR_CONSTELLATIONS.map((c) => {
    const p = progressOf(c, energyMap.value)
    return {
      id: c.id,
      name: c.name,
      symbol: c.symbol,
      lit: p.lit,
      total: p.total,
      partial: p.partial,
      percent: p.percent,
      complete: p.complete,
    }
  }),
)

const myActive = computed(() => {
  const o = props.galaxy.orbit
  if (!o) return false
  return props.galaxy.iAmA ? o.aActive : o.bActive
})

const orbitStar = computed(() => {
  if (!props.galaxy.orbit) return null
  return props.galaxy.stars.find((s) => s.id === props.galaxy.orbit?.starId) ?? null
})

const orbitStarName = computed(() => {
  const os = orbitStar.value
  if (!os) return ''
  return getPairConstellation(os.constellationId)?.stars.find((s) => s.id === os.starId)?.name ?? ''
})

const linePoints = computed(() => {
  if (!constellation.value) return ''
  const pts: string[] = []
  for (const s of constellation.value.stars) {
    const e = energyMap.value.get(s.id)
    if (e && e.energy >= e.required) pts.push(`${s.x},${s.y}`)
    else break
  }
  return pts.join(' ')
})

const statusLine = computed(() => {
  if (props.galaxy.status === 'dimmed') return '这段共赴已黯淡'
  const o = props.galaxy.orbit
  if (!o) {
    if (progress.value?.complete) return '这个星座已全部点亮'
    return props.galaxy.partnerOnline ? '对方在线' : '对方不在'
  }
  if (myActive.value && props.galaxy.partnerInOrbit) return '两人同在 · 同频加成中'
  if (myActive.value) return '只有你在场 · 共赴仍在继续'
  return props.galaxy.partnerInOrbit ? '对方正在共赴' : ''
})

const now = ref(Date.now())
let clock: number | null = null
let heartbeatTimer: number | null = null

const elapsedMs = computed(() => {
  if (!props.galaxy.orbit) return 0
  return now.value - new Date(props.galaxy.orbit.startedAt).getTime()
})

// 对方传来的表达：检测新条目并提示
const seenKey = computed(() => `wp-pair-seen-${props.galaxy.id}`)

function seenIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(seenKey.value) ?? '[]') as string[]
  } catch {
    return []
  }
}

function saveSeen(ids: string[]) {
  localStorage.setItem(seenKey.value, JSON.stringify(ids))
}

async function openStar(dbStarId: string) {
  openStarId.value = dbStarId
  await reloadEntries()
}

async function reloadEntries() {
  if (!openStarId.value) return
  entriesLoading.value = true
  try {
    const list = await pairBackend.loadEntries(openStarId.value)
    const seen = new Set(seenIds())
    const fresh = list.filter((e) => !seen.has(e.id) && e.author !== pairBackend.myUserId())
    if (fresh.length) {
      const words = fresh.map((e) => (e.type === 'text' ? '一句话' : e.type === 'voice' ? '一段声音' : '一张照片'))
      showNotice(fresh.length === 1 ? `对方传来了${words[0]}` : `对方传来了 ${fresh.length} 条心意`)
    }
    saveSeen(list.map((e) => e.id))
    entries.value = list
  } catch {
    entries.value = []
  } finally {
    entriesLoading.value = false
  }
}

async function addEntry(type: 'text' | 'voice' | 'image', text?: string, media?: string) {
  if (!openStarId.value) return
  try {
    await pairBackend.addEntry(props.galaxy.id, openStarId.value, type, text, media)
    await reloadEntries()
    emit('changed')
  } catch (e) {
    orbitError.value = e instanceof Error ? e.message : '发送失败'
  }
}

async function startOrbit() {
  const target = progress.value?.next
  if (!target || !constellation.value) return
  try {
    const dbStarId = await pairBackend.ensureSharedStar(
      props.galaxy.id,
      constellation.value.id,
      target.id,
      requiredEnergyFor(target.massSolar),
    )
    const sessionId = await pairBackend.startOrbit(props.galaxy.id, dbStarId)
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

// 星系数据变化 → 打开的面板跟着刷新
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
        pairBackend
          .heartbeatOrbit(orbitId, true)
          .then(() => emit('changed'))
          .catch(() => {})
      }, 10000)
    }
  },
  { immediate: true },
)

type DotState = 'full' | 'partial' | 'unlit'

function stateOf(s: { id: string }): DotState {
  const e = energyMap.value.get(s.id)
  if (!e) return 'unlit'
  return e.energy >= e.required ? 'full' : 'partial'
}

function dotStyle(s: { id: string; x: number; y: number }, st: DotState): Record<string, string> {
  const e = energyMap.value.get(s.id)
  if (st === 'partial' && e) {
    const pct = Math.round((e.energy / e.required) * 100)
    return {
      left: `calc(${s.x}% - 5px)`,
      top: `calc(${s.y}% - 5px)`,
      background: `conic-gradient(from 0deg, #ffd98a 0% ${pct}%, rgba(205, 214, 232, 0.35) ${pct}% 100%)`,
    }
  }
  const off = st === 'full' ? 4.5 : 2.5
  return { left: `calc(${s.x}% - ${off}px)`, top: `calc(${s.y}% - ${off}px)` }
}

function tapStar(s: { id: string }) {
  const dbStar = props.galaxy.stars.find((x) => x.starId === s.id)
  if (dbStar) void openStar(dbStar.id)
}

onUnmounted(() => {
  if (clock) clearInterval(clock)
  if (heartbeatTimer) clearInterval(heartbeatTimer)
  if (noticeTimer) clearTimeout(noticeTimer)
})
</script>

<template>
  <div class="screen sky pair">
    <StarField />
    <div class="glow" />
    <Meteors />

    <div class="top-bar">
      <button class="c-label" @click="emit('back')">← 返回星空</button>
      <!-- 双星徽记：两颗互绕的星 = 这段关系的象征 + 对方在线状态 -->
      <button class="c-label twin" @click="openStarId = null">
        <span class="twin-orbit"><span class="twin-body"></span><span class="twin-body b"></span></span>
        {{ galaxy.partnerOnline ? '对方在线' : '对方不在' }}
      </button>
    </div>

    <template v-if="constellation">
      <div class="top-bar2">
        <button class="c-label" @click="catalogOpen = true">
          {{ constellation.symbol }} {{ constellation.name }} ·
          {{ progress?.complete ? '全部点亮' : '已点亮 ' + progress?.percent + '%' }}
        </button>
      </div>

      <p class="status">{{ statusLine }}</p>

      <div class="const-area">
        <svg v-if="progress?.complete" class="silhouette" viewBox="0 0 100 100" preserveAspectRatio="none">
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
          @click="tapStar(s)"
        ></button>
      </div>
    </template>

    <template v-if="galaxy.orbit && myActive">
      <div class="timer-chip">{{ formatMs(elapsedMs) }}</div>
      <p v-if="orbitStarName" class="target">正在点亮 · {{ orbitStarName }}</p>
    </template>

    <p v-if="notice" class="notice">{{ notice }}</p>
    <p v-if="orbitError" class="hint error">{{ orbitError }}</p>

    <div v-if="galaxy.status === 'active'" class="ctrls">
      <template v-if="!myActive && !galaxy.partnerInOrbit">
        <button v-if="!progress?.complete" class="btn" @click="startOrbit">开始共赴</button>
        <p v-else class="hint">这个星座已全部点亮，换个星座吧</p>
      </template>
      <template v-else-if="!myActive && galaxy.partnerInOrbit">
        <button class="btn" @click="startOrbit">加入对方的共赴</button>
      </template>
      <template v-else>
        <button class="btn" @click="leaveOrbit">结束共赴</button>
      </template>
    </div>

    <ConstellationCatalog
      v-if="catalogOpen"
      :rows="catalogRows"
      :selected-id="selectedId ?? ''"
      :hint="''"
      :show-free-row="false"
      :foot="'你们共同点亮的星座，全在这里'"
      @select="(id) => { selectedId = id; catalogOpen = false }"
      @close="catalogOpen = false"
    />

    <PairStarPanel
      v-if="openStarId && !entriesLoading"
      :star="props.galaxy.stars.find((s) => s.id === openStarId) ?? props.galaxy.stars[0]"
      galaxy-name="共赴星系"
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

.top-bar,
.top-bar2 {
  position: absolute;
  left: 16px;
  right: 16px;
  display: flex;
  gap: 8px;
  z-index: 2;
}

.top-bar {
  top: 20px;
}

.top-bar2 {
  top: 62px;
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

.c-label.twin {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.twin-orbit {
  position: relative;
  display: inline-block;
  width: 14px;
  height: 14px;
  animation: spin 4s linear infinite;
}

.twin-body {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 4px;
  height: 4px;
  margin: -2px 0 0 5px;
  border-radius: 50%;
  background: #ffe9b8;
  box-shadow: 0 0 5px 2px rgba(255, 233, 184, 0.5);
}

.twin-body.b {
  margin-left: -9px;
  background: #cfe6ff;
  box-shadow: 0 0 5px 2px rgba(190, 220, 255, 0.5);
}

.status {
  position: absolute;
  top: 108px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  opacity: 0.6;
  white-space: nowrap;
}

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

.c-star.partial {
  width: 10px;
  height: 10px;
  border: 1px solid rgba(255, 217, 138, 0.35);
}

.c-star.full {
  width: 9px;
  height: 9px;
  background: #fff6dd;
  animation: twinkle 2.6s ease-in-out infinite;
}

.notice {
  position: absolute;
  top: 132px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  opacity: 0.75;
  white-space: nowrap;
  color: #ffe9b8;
}

.timer-chip {
  position: absolute;
  top: 132px;
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
  top: 168px;
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

@keyframes fadein {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
