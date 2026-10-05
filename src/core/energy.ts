// 能量系统：在轨时长与文字/语音/图片都可兑换为能量。
// 数值集中在此，方便调整。设计目标：任一颗星 2~5 分钟在轨即可完全点亮（"不宜过大"）。

import type { StarEntry } from './models'

export const ENERGY = {
  perSecond: 1, // 每秒在轨 = 1 能量
  text: 60, // 一条文字 = 60 能量（约 1 分钟）
  voice: 180, // 一段语音 = 180 能量（约 3 分钟）
  image: 30, // 一张图片 = 30 能量（约 30 秒）
  minRequired: 120, // 单星所需能量下限
  maxRequired: 300, // 单星所需能量上限（最重的星 5 分钟）
} as const

// 所需能量由恒星质量决定：越重的星需要越多，但被上下限夹住
export function requiredEnergyFor(massSolar: number): number {
  return Math.round(Math.min(ENERGY.maxRequired, Math.max(ENERGY.minRequired, 100 + massSolar * 18)))
}

export function energyOfEntries(entries: StarEntry[]): number {
  let n = 0
  for (const e of entries) {
    if (e.type === 'text') n += ENERGY.text
    else if (e.type === 'voice') n += ENERGY.voice
    else if (e.type === 'image') n += ENERGY.image
  }
  return n
}

export function sessionEnergy(durationMs: number, entries: StarEntry[]): number {
  return Math.round(durationMs / 1000) * ENERGY.perSecond + energyOfEntries(entries)
}
