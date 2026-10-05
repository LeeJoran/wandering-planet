// Web 实现：localStorage。小程序阶段用 wx 存储实现同一接口（见 platform/miniapp/）

import type { IStorage } from '../types'

export const webStorage: IStorage = {
  get<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : null
    } catch {
      return null
    }
  },
  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // 存储满 / 隐私模式：MVP 阶段静默失败
    }
  },
  remove(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch {
      // 同上
    }
  },
}
