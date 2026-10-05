// 数据模型 —— 单人闭环为地基，双人/四状态字段预留（本阶段不实现）

export type Track = 'self' | 'shared' // 自我轨道 / 共赴轨道

export type StarStatus = 'roaming' | 'dwelling' | 'together' | 'coexistence' // 四种状态，预留

export interface OrbitRecord {
  startedAt: number
  endedAt: number
  durationMs: number
}

// 星的"表达"：文字 / 语音 / 图片。在轨中记下的与点亮后补记的，都收在 entries 里。
export interface StarEntry {
  type: 'text' | 'voice' | 'image'
  text?: string
  audioDataUrl?: string // 语音（本阶段 base64 存本地）
  imageDataUrl?: string // 图片（本阶段降采样后 base64 存本地）
  createdAt: number
}

export interface Star {
  id: string
  createdAt: number
  track: Track
  status?: StarStatus // 预留：四种状态
  partnerId?: string // 预留：双星
  dimmed?: boolean // 预留：黯淡
  message?: StarEntry // 旧版单留言槽，读取时迁移进 entries（保留字段避免丢数据）
  entries: StarEntry[]
  orbits: OrbitRecord[] // 在轨记录
  constellationId?: string // 所属星座（试点：白羊/狮子/天蝎）；自由星没有
  constellationStarId?: string // 星座内恒星 id
}
