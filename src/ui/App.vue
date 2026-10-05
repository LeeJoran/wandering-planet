<script setup lang="ts">
// 单一"天空"视角：首屏、在轨（计时以小芯片存在）、留言面板、星座目录都在这片天空上展开。
// 决策室决定：计时不是主角，天空是；在轨中可随时记东西；页面被关/后台被杀后，
// 下次打开自动把未完成的在轨点亮成星（覆盖 PRD 旧规则"关闭=终止"）。
// 星座：先试点白羊/狮子/天蝎，选星座 → 点亮 → 自动按形状顺序点亮下一颗未亮星。
import { computed, reactive, ref } from 'vue'
import {
  CONSTELLATIONS,
  findConstellationStar,
  getConstellation,
  progressOf,
  type ConstellationStar,
} from '../core/constellations'
import type { Star, StarEntry } from '../core/models'
import type { OrbitSession } from '../core/orbit'
import { startOrbit } from '../core/orbit'
import { SessionRepo } from '../core/sessionRepo'
import { newStarId, StarRepo } from '../core/starRepo'
import { webLifecycle } from '../platform/web/lifecycle'
import { webStorage } from '../platform/web/storage'
import ConstellationCatalog from './components/ConstellationCatalog.vue'
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

const elapsedMs = computed(() => (session.value ? now.value - session.value.startedAt : 0))

const selectedConstellation = computed(
  () => getConstellation(state.selectedConstellationId) ?? CONSTELLATIONS[0],
)

const litConstStarIds = computed(() => {
  const set = new Set<string>()
  for (const s of state.stars) if (s.constellationStarId) set.add(s.constellationStarId)
  return set
})

const progress = computed(() => progressOf(selectedConstellation.value, litConstStarIds.value))

const catalogRows = computed(() =>
  CONSTELLATIONS.map((c) => {
    const p = progressOf(c, litConstStarIds.value)
    return { id: c.id, name: c.name, symbol: c.symbol, lit: p.lit, total: p.total, remaining: p.remaining, complete: p.complete }
  }),
)

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

// 打开页面：若上次有未完成的在轨，直接点亮成星
const pending = sessionRepo.load()
if (pending) {
  repo.save(litStar(pending, null))
  sessionRepo.clear()
  state.stars = repo.list()
  state.notice = '上次离开时的在轨，已为你点亮一颗星'
}

function litStar(s: OrbitSession, constellationStar: ConstellationStar | null): Star {
  return {
    id: newStarId(),
    createdAt: Date.now(),
    track: 'self', // 本阶段只有自我轨道；共赴轨道字段已预留
    entries: s.entries,
    orbits: [
      {
        startedAt: s.startedAt,
        endedAt: s.lastActiveAt,
        durationMs: Math.max(0, s.lastActiveAt - s.startedAt),
      },
    ],
    constellationId: constellationStar ? state.selectedConstellationId : undefined,
    constellationStarId: constellationStar?.id,
  }
}

function start() {
  // 所选星座已全部点亮 → 打开目录换一个（带提示）
  if (progress.value.complete) {
    state.panel = { kind: 'catalog', hint: true }
    return
  }
  session.value = startOrbit()
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
  const next = progress.value.next
  repo.save(litStar(session.value, next))
  sessionRepo.clear()
  session.value = null
  state.mode = 'idle'
  state.stars = repo.list()
  state.notice = next ? `${selectedConstellation.value.name}的${next.name}被点亮` : ''
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

// 当前面板指向的星座星（有则显示重量/位置/故事）
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
  const cName = star.constellationId ? getConstellation(star.constellationId)?.name : ''
  const total = star.orbits.reduce((a, o) => a + o.durationMs, 0)
  return `${cName ? cName + ' · ' : ''}点亮于 ${new Date(star.createdAt).toLocaleString()} · 在轨 ${formatMs(total)}`
})

const panelFacts = computed(() => {
  const cs = panelConstStar()
  if (!cs) return []
  return [
    { label: '重量', value: cs.mass },
    { label: '位置', value: cs.distance },
  ]
})

const panelStory = computed(() => panelConstStar()?.story ?? '')

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
  return !!p && (p.kind === 'star' || p.kind === 'session')
})

const catalogHint = computed(() =>
  state.panel?.kind === 'catalog' && state.panel.hint ? '这个星座已全部点亮，换一个星座吧' : '',
)
</script>

<template>
  <SkyScreen
    :stars="state.stars"
    :constellation="selectedConstellation"
    :lit-const-star-ids="litConstStarIds"
    :remaining="progress.remaining"
    :orbiting="state.mode === 'orbiting'"
    :elapsed-ms="elapsedMs"
    :notice="state.notice"
    @light="start"
    @open-star="openStar"
    @open-star-info="openStarInfo"
    @end="end"
    @open-input="openSessionInput"
    @open-catalog="openCatalog"
  />
  <MessagePanel
    v-if="isMessagePanel"
    :title="panelTitle"
    :subtitle="panelSubtitle"
    :empty-hint="panelEmpty"
    :entries="panelEntries"
    :facts="panelFacts"
    :story="panelStory"
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
</template>
