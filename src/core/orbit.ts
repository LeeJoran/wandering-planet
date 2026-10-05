// 在轨会话：内存态 + 随时落盘（SessionRepo）。
// 决策室新规则（覆盖 PRD 旧规则"退出/后台关闭 = 终止"）：
// 页面被关 / 后台被杀 → 下次打开时把未完成的在轨点亮成星。

import type { OrbitRecord, StarEntry } from './models'

export interface OrbitSession {
  startedAt: number
  lastActiveAt: number // 心跳时间戳：页面被关时据此计算时长
  entries: StarEntry[] // 在轨中记下的表达
}

export function startOrbit(now: number = Date.now()): OrbitSession {
  return { startedAt: now, lastActiveAt: now, entries: [] }
}

export function endOrbit(session: OrbitSession, now: number = Date.now()): OrbitRecord {
  return {
    startedAt: session.startedAt,
    endedAt: now,
    durationMs: Math.max(0, now - session.startedAt),
  }
}
