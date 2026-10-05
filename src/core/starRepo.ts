// 星的读写。本阶段落在本地存储；将来换存储实现（云开发 / SQLite）时此层不动。
// 注意：本阶段在轨会话不落盘，只有"被点亮的星"落盘。

import type { IStorage } from '../platform/types'
import type { Star } from './models'

const KEY = 'wandering-planet.stars'

export class StarRepo {
  constructor(private storage: IStorage) {}

  list(): Star[] {
    const stars = this.storage.get<Star[]>(KEY) ?? []
    // 旧版单留言槽（message）迁移进 entries
    return stars.map((s) => ({
      ...s,
      entries: s.entries ?? (s.message ? [s.message] : []),
    }))
  }

  save(star: Star): void {
    const stars = this.list()
    const i = stars.findIndex((s) => s.id === star.id)
    if (i >= 0) stars[i] = star
    else stars.push(star)
    this.storage.set(KEY, stars)
  }

  get(id: string): Star | null {
    return this.list().find((s) => s.id === id) ?? null
  }
}

export function newStarId(): string {
  return `star-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}
