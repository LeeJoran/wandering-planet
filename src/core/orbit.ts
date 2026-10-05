// 在轨会话：内存态 + 随时落盘（SessionRepo）。
// 决策室规则（覆盖 PRD 旧规则"退出/后台关闭 = 终止"）：
// 页面被关 / 后台被杀 → 下次打开时把未完成的在轨能量结算到目标星。
// 本阶段：每次在轨的目标是所选星座的第一颗未完全点亮的星。

import type { StarEntry } from './models'

export interface OrbitTarget {
  constellationId: string
  starId: string
}

export interface OrbitSession {
  startedAt: number
  lastActiveAt: number // 心跳时间戳：页面被关时据此计算时长
  entries: StarEntry[] // 在轨中记下的表达（结算时兑换能量）
  target?: OrbitTarget // 本次在轨点亮的星
}

export function startOrbit(now: number = Date.now(), target?: OrbitTarget): OrbitSession {
  return { startedAt: now, lastActiveAt: now, entries: [], target }
}
