// 双人/多人共赴轨道后端接口（Supabase 实现见 ./supabase.ts；将来小程序云开发可另做实现）

export interface PairStar {
  id: string // 数据库记录 id
  constellationId: string
  starId: string // 星座数据里的恒星 id
  energy: number
  required: number
  litAt: string | null
}

export interface PairMember {
  userId: string
  nickname: string // 自取称呼；空 = 前端按加入顺序显示「成员N」
  joinedAt: string
}

export interface PairOrbit {
  id: string
  galaxyId: string
  starId: string
  startedAt: string
  activeMembers: string[] // 在轨成员 user_id 列表
}

export interface PairEntry {
  id: string
  starId: string
  author: string
  type: 'text' | 'voice' | 'image'
  text?: string
  media?: string
  createdAt: string
}

export interface PairGalaxy {
  id: string
  status: 'active' | 'dimmed'
  capacity: number // 人数上限 2-5
  createdAt: string
  members: PairMember[] // 按加入顺序
  stars: PairStar[]
  orbit: PairOrbit | null
  onlineMembers: string[] // 近 20 秒内心跳在场的成员（不含自己）
}

export interface IPairBackend {
  /** 初始化：匿名登录 + 清理结算离线会话 + 启动在场心跳 */
  init(): Promise<void>
  myUserId(): string | null
  /** 点亮信标：p_galaxy=null 开启新共赴（人数 p_capacity）；否则邀请加入已有共赴。返回 6 位邀请码 */
  createInvite(capacity?: number, galaxyId?: string | null, creatorNickname?: string): Promise<string>
  /** 循光而来：接受邀请（p_nickname=自取称呼），返回星系 id（无效/满员返回 null） */
  acceptInvite(code: string, nickname?: string): Promise<string | null>
  listGalaxies(): Promise<PairGalaxy[]>
  loadEntries(starId: string): Promise<PairEntry[]>
  /** 确保共赴星记录存在（幂等），返回数据库记录 id */
  ensureSharedStar(galaxyId: string, constellationId: string, starId: string, required: number): Promise<string>
  /** 开始共赴在轨（starId 为数据库记录 id），返回会话 id */
  startOrbit(galaxyId: string, starId: string): Promise<string>
  /** 顺延：目标星已点亮 → 结算旧会话并切到下一颗星，返回新会话 id（幂等，他人已顺延则返回其会话） */
  advanceOrbit(galaxyId: string, sessionId: string, constellationId: string, starId: string, required: number): Promise<string>
  /** 心跳（约 10 秒一次）：active 表示我是否在轨；全员离开 → 服务端结算 */
  heartbeatOrbit(sessionId: string, active: boolean): Promise<void>
  /** 互发表达：文字/语音/图片 */
  addEntry(galaxyId: string, starId: string, type: 'text' | 'voice' | 'image', text?: string, media?: string): Promise<void>
  /** 黯淡 / 复明 / 彻底删除 */
  setGalaxyStatus(galaxyId: string, status: 'dimmed' | 'active' | 'deleted'): Promise<void>
  /** 切换人数上限（2-5，不能低于当前成员数；服务端校验） */
  setGalaxyCapacity(galaxyId: string, capacity: number): Promise<void>
  /** 在场心跳（每 ~8 秒调用，galaxyId 为当前所在星系） */
  presenceHeartbeat(galaxyId: string | null): void
  /** 实时订阅：与我相关的数据变化时回调（粗粒度，回调里重新拉取） */
  subscribe(cb: () => void): () => void
}
