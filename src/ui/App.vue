<script setup lang="ts">
// 单一"天空"视角：首屏、在轨（计时以小芯片存在）、留言面板、星座目录、星座回顾都在天空上展开。
// 能量系统：在轨时长 + 文字/语音/图片 → 能量 → 星从"未亮"到"弦月态"到"完全点亮"。
// 星座全部点亮后：虚影淡显 + 提示几秒后消失 + "了解XX座"回顾按钮。
import { computed, reactive, ref } from 'vue'
import {
  CONSTELLATIONS,
  findConstellationStar,
  getConstellation,
  progressOf,
  type ConstellationStar,
  type StarEnergy,
} from '../core/constellations'
import { ENERGY, requiredEnergyFor, sessionEnergy } from '../core/energy'
import type { OrbitRecord, Star, StarEntry } from '../core/models'
import type { OrbitSession, OrbitTarget } from '../core/orbit'
import { startOrbit } from '../core/orbit'
import { SessionRepo } from '../core/sessionRepo'
import { newStarId, StarRepo } from '../core/starRepo'
import { webLifecycle } from '../platform/web/lifecycle'
import { webStorage } from '../platform/web/storage'
import ConstellationCatalog from './components/ConstellationCatalog.vue'
import ConstellationPanel from './components/ConstellationPanel.vue'
import MessagePanel from './components/MessagePanel.vue'
import { formatMs } from './format'
import SkyScreen from './screens/SkyScreen.vue'

const repo = new StarRepo(webStorage)
const sessionRepo = new SessionRepo(webStorage)

type Panel =
  | { kind: 'star'; starId: string }
  | { kind: 'star-info'; constellationId: string; starId: string }
  | { kind: 'session' }
  | { kind: 'catalog'; hint?: boolean }
  | { kind: 'constellation' }
  | null

const state = reactive<{
  mode: 'idle' | 'orbiting'
  stars: Star[]
  panel: Panel
  notice: string
  selectedConstellationId: string
}>({
  mode: 'idle',
  stars: repo.list(),
  panel: null,
  notice: '',
  selectedConstellationId: 'aries',
})

const session = ref<OrbitSession | null>(null)
const now = ref(Date.now())
let timer: number | null = null
let lastSaved = 0
let noticeTimer: number | null = null

const elapsedMs = computed(() => (session.value ? now.value - session.value.startedAt : 0))

const selectedConstellation = computed(
  () => getConstellation(state.selectedConstellationId) ?? CONSTELLATIONS[0],
)

// 星座星 id → 能量状态
const energyMap = computed(() => {
  const m = new Map<string, StarEnergy>()
  for (const s of state.stars) {
    if (s.constellationStarId && s.energy != null && s.requiredEnergy != null) {
      m.set(s.constellationStarId, { energy: s.energy, required: s.requiredEnergy })
    }
  }
  return m
})

const progress = computed(() => progressOf(selectedConstellation.value, energyMap.value))

const catalogRows = computed(() =>
  CONSTELLATIONS.map((c) => {
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

function showNotice(text: string, ms = 3000) {
  state.notice = text
  if (noticeTimer) clearTimeout(noticeTimer)
  noticeTimer = window.setTimeout(() => {
    state.notice = ''
  }, ms)
}

function tick() {
  now.value = Date.now()
  // 心跳：每 2s 把会话（含中途记的东西）落盘，页面被关 / 被杀也不丢
  if (session.value && now.value - lastSaved > 2000) {
    session.value.lastActiveAt = now.value
    sessionRepo.save(session.value)
    lastSaved = now.value
  }
}

function stopTimer() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

webLifecycle.onVisibilityChange((hidden) => {
  if (hidden && session.value) {
    session.value.lastActiveAt = Date.now()
    sessionRepo.save(session.value)
  }
  if (!hidden) tick()
})

// 会话能量结算到目标星
function settle(s: OrbitSession): void {
  const record: OrbitRecord = {
    startedAt: s.startedAt,
    endedAt: s.lastActiveAt,
    durationMs: Math.max(0, s.lastActiveAt - s.startedAt),
  }
  const gain = sessionEnergy(record.durationMs, s.entries)

  // 目标：会话自带（新版）→ 当前星座下一颗未满的星（旧版会话）→ 自由星兜底
  let target: OrbitTarget | null = s.target ?? null
  if (!target) {
    const next = progress.value.next
    if (next) target = { constellationId: state.selectedConstellationId, starId: next.id }
  }

  if (!target) {
    // 全亮兜底：落成自由星（无能量概念，直接点亮）
    const star: Star = {
      id: newStarId(),
      createdAt: Date.now(),
      track: 'self',
      entries: s.entries,
      orbits: [record],
    }
    repo.save(star)
    state.stars = repo.list()
    showNotice('这次在轨，点亮了一颗自由的星')
    return
  }

  let star = repo.getByConstStar(target.constellationId, target.starId)
  if (!star) {
    star = {
      id: newStarId(),
      createdAt: Date.now(),
      track: 'self',
      constellationId: target.constellationId,
      constellationStarId: target.starId,
      entries: [],
      orbits: [],
      energy: 0,
    }
  }
  const cs = findConstellationStar(target.constellationId, target.starId)
  star.requiredEnergy ??= cs ? requiredEnergyFor(cs.massSolar) : ENERGY.minRequired
  star.energy = (star.energy ?? 0) + gain
  star.entries.push(...s.entries)
  star.orbits.push(record)
  repo.save(star)
  state.stars = repo.list()

  const c = getConstellation(target.constellationId)
  const cName = c?.name ?? ''
  const starName = cs?.name ?? '一颗星'
  if (star.energy >= star.requiredEnergy) {
    const done = progressOf(c ?? selectedConstellation.value, energyMap.value).complete
    showNotice(done ? `${cName}的${starName}被点亮，${cName}已全部点亮` : `${cName}的${starName}被点亮`)
  } else {
    // 能量规则对用户隐藏，只给感受
    showNotice(`为${starName}添了一点光`)
  }
}

// 打开页面：若上次有未完成的在轨，自动结算
const pending = sessionRepo.load()
if (pending) {
  settle(pending)
  sessionRepo.clear()
}

function start() {
  // 所选星座已全部点亮 → 打开目录换一个（带提示）
  if (progress.value.complete) {
    state.panel = { kind: 'catalog', hint: true }
    return
  }
  const next = progress.value.next
  if (!next) return
  session.value = startOrbit(Date.now(), { constellationId: state.selectedConstellationId, starId: next.id })
  sessionRepo.save(session.value) // 一开始就落盘，防止刚点开始就被关
  lastSaved = Date.now()
  state.mode = 'orbiting'
  state.notice = ''
  tick()
  timer = window.setInterval(tick, 250)
}

function end() {
  if (!session.value) return
  stopTimer()
  settle(session.value)
  sessionRepo.clear()
  session.value = null
  state.mode = 'idle'
}

function openStar(starId: string) {
  state.panel = { kind: 'star', starId }
}

function openStarInfo(constellationId: string, starId: string) {
  state.panel = { kind: 'star-info', constellationId, starId }
}

function openSessionInput() {
  state.panel = { kind: 'session' }
}

function openCatalog() {
  state.panel = { kind: 'catalog' }
}

function openConstellation() {
  state.panel = { kind: 'constellation' }
}

function selectConstellation(id: string) {
  state.selectedConstellationId = id
  state.panel = null
}

function closePanel() {
  state.panel = null
}

function addEntry(entry: StarEntry) {
  const panel = state.panel
  if (!panel) return
  if (panel.kind === 'session') {
    if (!session.value) return
    session.value.entries.push(entry)
    sessionRepo.save(session.value) // 立即落盘，页面被关也不丢
  } else if (panel.kind === 'star') {
    const star = repo.get(panel.starId)
    if (!star) return
    star.entries.push(entry)
    repo.save(star)
    state.stars = repo.list()
  }
}

// 当前面板指向的星座星（有则显示卡片化科普）
function panelConstStar(): ConstellationStar | null {
  const p = state.panel
  if (!p) return null
  if (p.kind === 'star-info') return findConstellationStar(p.constellationId, p.starId)
  if (p.kind === 'star') {
    const star = state.stars.find((s) => s.id === p.starId)
    if (star?.constellationId && star.constellationStarId) {
      return findConstellationStar(star.constellationId, star.constellationStarId)
    }
  }
  return null
}

const isMessagePanel = computed(() => {
  const p = state.panel
  return !!p && (p.kind === 'star' || p.kind === 'star-info' || p.kind === 'session')
})

const panelTitle = computed(() => {
  const p = state.panel
  if (!p) return ''
  if (p.kind === 'session') return '此刻，记点什么'
  if (p.kind === 'star-info') return panelConstStar()?.name ?? ''
  return panelConstStar()?.name ?? '一颗星'
})

const panelSubtitle = computed(() => {
  const p = state.panel
  if (!p) return ''
  if (p.kind === 'star-info') {
    const c = getConstellation(p.constellationId)
    return c ? `${c.name} · 尚未点亮` : ''
  }
  if (p.kind !== 'star') return ''
  const star = state.stars.find((s) => s.id === p.starId)
  if (!star) return ''
  const cs = panelConstStar()
  if (cs && star.energy != null && star.requiredEnergy != null && star.energy < star.requiredEnergy) {
    return `${getConstellation(star.constellationId ?? '')?.name ?? ''} · 点亮中`
  }
  const cName = star.constellationId ? getConstellation(star.constellationId)?.name : ''
  const total = star.orbits.reduce((a, o) => a + o.durationMs, 0)
  return `${cName ? cName + ' · ' : ''}点亮于 ${new Date(star.createdAt).toLocaleString()} · 在轨 ${formatMs(total)}`
})

// 分要点科普（名字/别名/星体/亮度/位置/文化/历史…），来自星座数据
const panelFacts = computed(() => panelConstStar()?.facts ?? [])

const panelEnergy = computed<{ current: number; required: number } | null>(() => {
  const p = state.panel
  if (!p) return null
  if (p.kind === 'star-info') {
    const cs = findConstellationStar(p.constellationId, p.starId)
    return cs ? { current: 0, required: requiredEnergyFor(cs.massSolar) } : null
  }
  if (p.kind === 'star') {
    const star = state.stars.find((s) => s.id === p.starId)
    if (!star || !star.constellationStarId || star.energy == null || star.requiredEnergy == null) return null
    return { current: star.energy, required: star.requiredEnergy }
  }
  return null
})

const panelEntries = computed<StarEntry[]>(() => {
  const p = state.panel
  if (!p) return []
  if (p.kind === 'session') return session.value ? session.value.entries : []
  if (p.kind === 'star') return state.stars.find((s) => s.id === p.starId)?.entries ?? []
  return []
})

const panelEmpty = computed(() => {
  const p = state.panel
  if (p?.kind === 'session') return '还没记什么'
  if (p?.kind === 'star-info') return '这颗星还没被点亮'
  return '这颗星还没有留言'
})

const panelCanAdd = computed(() => {
  const p = state.panel
  if (!p) return false
  if (p.kind === 'session') return true
  if (p.kind === 'star') {
    const star = state.stars.find((s) => s.id === p.starId)
    if (!star) return false
    if (!star.constellationStarId) return true // 自由星
    return (star.energy ?? 0) >= (star.requiredEnergy ?? 0)
  }
  return false
})

const catalogHint = computed(() =>
  state.panel?.kind === 'catalog' && state.panel.hint ? '这个星座已全部点亮，换一个星座吧' : '',
)

// 星座回顾统计
const recapStats = computed(() => {
  const c = selectedConstellation.value
  const stars = state.stars.filter((s) => s.constellationId === c.id)
  const orbits = stars.flatMap((s) => s.orbits)
  const entries = stars.flatMap((s) => s.entries)
  return {
    orbitCount: orbits.length,
    totalMs: orbits.reduce((a, o) => a + o.durationMs, 0),
    texts: entries.filter((e) => e.type === 'text'),
    voiceCount: entries.filter((e) => e.type === 'voice').length,
    imageCount: entries.filter((e) => e.type === 'image').length,
  }
})
</script>

<template>
  <SkyScreen
    :stars="state.stars"
    :constellation="selectedConstellation"
    :star-energy="energyMap"
    :complete="progress.complete"
    :percent="progress.percent"
    :target-name="session?.target ? (findConstellationStar(session.target.constellationId, session.target.starId)?.name ?? '') : ''"
    :orbiting="state.mode === 'orbiting'"
    :elapsed-ms="elapsedMs"
    :notice="state.notice"
    @light="start"
    @open-star="openStar"
    @open-star-info="openStarInfo"
    @end="end"
    @open-input="openSessionInput"
    @open-catalog="openCatalog"
    @open-constellation="openConstellation"
  />
  <MessagePanel
    v-if="isMessagePanel"
    :title="panelTitle"
    :subtitle="panelSubtitle"
    :empty-hint="panelEmpty"
    :entries="panelEntries"
    :facts="panelFacts"
    :energy="panelEnergy"
    :can-add="panelCanAdd"
    @add="addEntry"
    @close="closePanel"
  />
  <ConstellationCatalog
    v-if="state.panel?.kind === 'catalog'"
    :rows="catalogRows"
    :selected-id="state.selectedConstellationId"
    :hint="catalogHint"
    @select="selectConstellation"
    @close="closePanel"
  />
  <ConstellationPanel
    v-if="state.panel?.kind === 'constellation'"
    :constellation="selectedConstellation"
    :stats="recapStats"
    @close="closePanel"
  />
</template>
