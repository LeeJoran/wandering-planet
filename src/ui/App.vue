<script setup lang="ts">
// 单一"天空"视角：首屏、在轨（计时以小芯片存在）、留言面板都在这片天空上展开。
// 决策室决定：计时不是主角，天空是；在轨中可随时记东西；页面被关/后台被杀后，
// 下次打开自动把未完成的在轨点亮成星（覆盖 PRD 旧规则"关闭=终止"）。
import { computed, reactive, ref } from 'vue'
import type { Star, StarEntry } from '../core/models'
import type { OrbitSession } from '../core/orbit'
import { endOrbit, startOrbit } from '../core/orbit'
import { SessionRepo } from '../core/sessionRepo'
import { newStarId, StarRepo } from '../core/starRepo'
import { webLifecycle } from '../platform/web/lifecycle'
import { webStorage } from '../platform/web/storage'
import MessagePanel from './components/MessagePanel.vue'
import { formatMs } from './format'
import SkyScreen from './screens/SkyScreen.vue'

const repo = new StarRepo(webStorage)
const sessionRepo = new SessionRepo(webStorage)

type Panel = { kind: 'star'; starId: string } | { kind: 'session' } | null

const state = reactive<{ mode: 'idle' | 'orbiting'; stars: Star[]; panel: Panel; notice: string }>({
  mode: 'idle',
  stars: repo.list(),
  panel: null,
  notice: '',
})

const session = ref<OrbitSession | null>(null)
const now = ref(Date.now())
let timer: number | null = null
let lastSaved = 0

const elapsedMs = computed(() => (session.value ? now.value - session.value.startedAt : 0))

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
  repo.save(litStar(pending))
  sessionRepo.clear()
  state.stars = repo.list()
  state.notice = '上次离开时的在轨，已为你点亮一颗星'
}

function litStar(s: OrbitSession): Star {
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
  }
}

function start() {
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
  const record = endOrbit(session.value)
  const star: Star = {
    id: newStarId(),
    createdAt: Date.now(),
    track: 'self',
    entries: session.value.entries,
    orbits: [record],
  }
  repo.save(star)
  sessionRepo.clear()
  session.value = null
  state.mode = 'idle'
  state.stars = repo.list()
}

function openStar(starId: string) {
  state.panel = { kind: 'star', starId }
}

function openSessionInput() {
  state.panel = { kind: 'session' }
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
  } else {
    const star = repo.get(panel.starId)
    if (!star) return
    star.entries.push(entry)
    repo.save(star)
    state.stars = repo.list()
  }
}

const panelEntries = computed<StarEntry[]>(() => {
  const panel = state.panel
  if (!panel) return []
  if (panel.kind === 'session') return session.value ? session.value.entries : []
  return state.stars.find((s) => s.id === panel.starId)?.entries ?? []
})

const panelTitle = computed(() => (state.panel?.kind === 'session' ? '此刻，记点什么' : '这颗星'))

const panelSubtitle = computed(() => {
  const panel = state.panel
  if (!panel || panel.kind !== 'star') return ''
  const star = state.stars.find((s) => s.id === panel.starId)
  if (!star) return ''
  const total = star.orbits.reduce((a, o) => a + o.durationMs, 0)
  return `点亮于 ${new Date(star.createdAt).toLocaleString()} · 在轨 ${formatMs(total)}`
})

const panelEmpty = computed(() => (state.panel?.kind === 'session' ? '还没记什么' : '这颗星还没有留言'))
</script>

<template>
  <SkyScreen
    :stars="state.stars"
    :orbiting="state.mode === 'orbiting'"
    :elapsed-ms="elapsedMs"
    :notice="state.notice"
    @light="start"
    @open-star="openStar"
    @end="end"
    @open-input="openSessionInput"
  />
  <MessagePanel
    v-if="state.panel"
    :title="panelTitle"
    :subtitle="panelSubtitle"
    :empty-hint="panelEmpty"
    :entries="panelEntries"
    @add="addEntry"
    @close="closePanel"
  />
</template>
