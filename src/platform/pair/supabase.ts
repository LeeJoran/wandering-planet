// 双人后端的 Supabase 实现：匿名登录 + RPC + 实时订阅。
// 表结构与 RPC 定义见仓库 supabase/setup.sql。

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { IPairBackend, PairEntry, PairGalaxy } from './types'

// 数据库原始行（蛇形命名）
type RawStarRow = { id: string; seq: number; name: string; energy: number; required: number; lit_at: string | null }

const URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined

let client: SupabaseClient | null = null
let uid: string | null = null
let presenceTimer: number | null = null
let currentGalaxy: string | null = null

function getClient(): SupabaseClient {
  if (!URL || !KEY) {
    throw new Error('缺少 Supabase 配置：请在 .env 里填写 VITE_SUPABASE_URL 与 VITE_SUPABASE_PUBLISHABLE_KEY')
  }
  if (!client) {
    client = createClient(URL, KEY, {
      auth: { persistSession: true, autoRefreshToken: true, storageKey: 'wp-supabase-auth' },
    })
  }
  return client
}

async function rpc<T = unknown>(name: string, args?: Record<string, unknown>): Promise<T> {
  const { data, error } = await getClient().rpc(name, args)
  if (error) throw error
  return data as T
}

export const pairBackend: IPairBackend = {
  async init() {
    const sb = getClient()
    const { data } = await sb.auth.getSession()
    if (!data.session) {
      const { error } = await sb.auth.signInAnonymously()
      if (error) throw error
    }
    uid = (await sb.auth.getSession()).data.session?.user.id ?? null
    // 双方都离线 90 秒以上的会话，由这次访问结算
    await rpc('settle_stale_orbits').catch(() => {})
    if (!presenceTimer) {
      presenceTimer = window.setInterval(() => {
        rpc('heartbeat_presence', { p_galaxy: currentGalaxy }).catch(() => {})
      }, 8000)
    }
  },

  myUserId() {
    return uid
  },

  async createInvite() {
    return rpc<string>('create_invite')
  },

  async acceptInvite(code: string) {
    return rpc<string | null>('accept_invite', { p_code: code })
  },

  async listGalaxies(): Promise<PairGalaxy[]> {
    const sb = getClient()
    const { data: gs, error } = await sb
      .from('galaxies')
      .select('*')
      .or(`member_a.eq.${uid},member_b.eq.${uid}`)
      .order('created_at')
    if (error) throw error

    const out: PairGalaxy[] = []
    for (const g of gs ?? []) {
      const [{ data: stars }, { data: orbit }, { data: presence }] = await Promise.all([
        sb.from('shared_stars').select('*').eq('galaxy_id', g.id).order('seq'),
        sb.from('shared_orbits').select('*').eq('galaxy_id', g.id).is('ended_at', null).maybeSingle(),
        sb.from('presence').select('last_seen').eq('galaxy_id', g.id).neq('user_id', uid).maybeSingle(),
      ])
      const iAmA = g.member_a === uid
      const partnerActive = orbit ? (iAmA ? orbit.b_active : orbit.a_active) : false
      const online = presence?.last_seen ? Date.now() - new Date(presence.last_seen).getTime() < 20000 : false
      out.push({
        id: g.id,
        status: g.status as PairGalaxy['status'],
        iAmA,
        createdAt: g.created_at,
        stars: ((stars ?? []) as RawStarRow[]).map((s) => ({
          id: s.id,
          seq: s.seq,
          name: s.name,
          energy: Number(s.energy),
          required: Number(s.required),
          litAt: s.lit_at ?? null,
        })),
        orbit: orbit
          ? {
              id: orbit.id,
              galaxyId: orbit.galaxy_id,
              starId: orbit.star_id,
              startedAt: orbit.started_at,
              aActive: orbit.a_active,
              bActive: orbit.b_active,
            }
          : null,
        partnerOnline: online,
        partnerInOrbit: partnerActive,
      })
    }
    return out
  },

  async loadEntries(starId: string): Promise<PairEntry[]> {
    const sb = getClient()
    const { data, error } = await sb.from('shared_entries').select('*').eq('star_id', starId).order('created_at')
    if (error) throw error
    return (data ?? []).map((e) => ({
      id: e.id,
      starId: e.star_id,
      author: e.author,
      type: e.type as PairEntry['type'],
      text: e.text_content ?? undefined,
      media: e.media_data ?? undefined,
      createdAt: e.created_at,
    }))
  },

  async startOrbit(galaxyId: string, starId: string) {
    return rpc<string>('shared_orbit_start', { p_galaxy: galaxyId, p_star: starId })
  },

  async heartbeatOrbit(sessionId: string, active: boolean) {
    await rpc('shared_orbit_heartbeat', { p_session: sessionId, p_active: active })
  },

  async addEntry(galaxyId: string, starId: string, type, text?, media?) {
    await rpc('add_shared_entry', { p_galaxy: galaxyId, p_star: starId, p_type: type, p_text: text ?? null, p_media: media ?? null })
  },

  async setGalaxyStatus(galaxyId: string, status) {
    await rpc('set_galaxy_status', { p_galaxy: galaxyId, p_status: status })
  },

  presenceHeartbeat(galaxyId: string | null) {
    currentGalaxy = galaxyId
    rpc('heartbeat_presence', { p_galaxy: galaxyId }).catch(() => {})
  },

  subscribe(cb: () => void) {
    const sb = getClient()
    const channel = sb.channel('pair-changes')
    for (const table of ['shared_orbits', 'shared_entries', 'shared_stars', 'galaxies', 'invites'] as const) {
      channel.on('postgres_changes', { event: '*', schema: 'public', table }, () => cb())
    }
    channel.subscribe()
    return () => {
      void sb.removeChannel(channel)
    }
  },
}
