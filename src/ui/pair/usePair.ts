// 共赴（双人）状态：后端初始化、星系列表、实时订阅 + 轮询兜底、信标接受。
import { computed, reactive } from 'vue'
import { pairBackend, type PairGalaxy } from '../../platform/pair'

export function usePair() {
  const state = reactive({
    ready: false,
    error: '',
    galaxies: [] as PairGalaxy[],
    selectedId: null as string | null,
    view: false, // 是否在共赴天空视图
    beaconCode: null as string | null, // 收到邀请（链接 #join=CODE）
  })

  const selected = computed(() => state.galaxies.find((g) => g.id === state.selectedId) ?? null)

  let poll: number | null = null
  let unsubscribe: (() => void) | null = null
  let refreshSeq = 0
  let debounceTimer: number | null = null

  async function refresh() {
    const seq = ++refreshSeq
    try {
      const gs = await pairBackend.listGalaxies()
      if (seq !== refreshSeq) return
      state.galaxies = gs
      if (state.selectedId && !gs.some((g) => g.id === state.selectedId)) {
        state.selectedId = gs[0]?.id ?? null
        if (!gs.length) state.view = false
      }
    } catch {
      // 网络抖动：忽略，下一轮兜底
    }
  }

  function scheduleRefresh() {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = window.setTimeout(() => void refresh(), 300)
  }

  async function init() {
    try {
      await pairBackend.init()
      const m = location.hash.match(/join=([A-Za-z0-9]{6})/)
      if (m) state.beaconCode = m[1].toUpperCase()
      // 应用已开着时再打开邀请链接（hash 变化不重载页面）：同样弹出信标
      window.addEventListener('hashchange', () => {
        const hm = location.hash.match(/join=([A-Za-z0-9]{6})/)
        if (hm && !state.view) state.beaconCode = hm[1].toUpperCase()
      })
      await refresh()
      unsubscribe = pairBackend.subscribe(scheduleRefresh)
      poll = window.setInterval(() => void refresh(), 15000) // 实时订阅的兜底
      state.ready = true
    } catch (e) {
      const msg = e instanceof Error ? e.message : '共赴服务初始化失败'
      state.error = msg.includes('fetch') || msg.includes('网络') || msg.includes('network')
        ? '共赴服务连接失败：网络无法访问服务器。请检查网络后重试（稍后再打开本面板）'
        : `共赴服务初始化失败：${msg}`
      state.ready = true
    }
  }

  function dispose() {
    if (poll) clearInterval(poll)
    if (unsubscribe) unsubscribe()
    if (debounceTimer) clearTimeout(debounceTimer)
  }

  async function createInvite(): Promise<string> {
    return pairBackend.createInvite()
  }

  async function acceptBeacon(code: string, nickname = ''): Promise<string | null> {
    const gid = await pairBackend.acceptInvite(code, nickname)
    if (gid) {
      location.hash = ''
      state.beaconCode = null
      await refresh()
      enter(gid)
    }
    return gid
  }

  function enter(galaxyId: string) {
    state.selectedId = galaxyId
    state.view = true
    pairBackend.presenceHeartbeat(galaxyId)
  }

  function leave() {
    state.view = false
    pairBackend.presenceHeartbeat(null)
  }

  async function setStatus(galaxyId: string, status: 'dimmed' | 'active' | 'deleted') {
    await pairBackend.setGalaxyStatus(galaxyId, status)
    await refresh()
  }

  return { state, selected, init, dispose, refresh, createInvite, acceptBeacon, enter, leave, setStatus }
}
