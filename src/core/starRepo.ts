// 星的读写。本阶段落在本地存储；将来换存储实现（云开发 / SQLite）时此层不动。
// 注意：本阶段在轨会话由 SessionRepo 落盘；这里只有星记录。

import { findConstellationStar } from './constellations'
import { requiredEnergyFor } from './energy'
import type { Star } from './models'
import type { IStorage } from '../platform/types'

const KEY = 'wandering-planet.stars'

export class StarRepo {
  constructor(private storage: IStorage) {}

  list(): Star[] {
    const stars = this.storage.get<Star[]>(KEY) ?? []
    return stars.map((s) => {
      const migrated: Star = { ...s, entries: s.entries ?? (s.message ? [s.message] : []) }
      // 旧版星（能量系统之前点亮的）按"已满"迁移
      if (s.constellationStarId && (s.energy == null || s.requiredEnergy == null)) {
        const cs = findConstellationStar(s.constellationId ?? '', s.constellationStarId)
        const req = cs ? requiredEnergyFor(cs.massSolar) : 1
        if (s.energy == null) migrated.energy = req
        if (s.requiredEnergy == null) migrated.requiredEnergy = req
      }
      return migrated
    })
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

  getByConstStar(constellationId: string, starId: string): Star | null {
    return this.list().find((s) => s.constellationId === constellationId && s.constellationStarId === starId) ?? null
  }
}

export function newStarId(): string {
  return `star-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}
