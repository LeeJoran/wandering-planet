// 小程序存储实现（IStorage）：uni storage 同步 API。
import type { IStorage } from '@shared/platform/types'

export const mpStorage: IStorage = {
  get<T>(key: string): T | null {
    try {
      const v = uni.getStorageSync(key)
      return v === '' || v == null ? null : (v as T)
    } catch {
      return null
    }
  },
  set<T>(key: string, value: T): void {
    try {
      uni.setStorageSync(key, value)
    } catch {
      // 存储异常（如空间满）忽略：下次会话恢复
    }
  },
  remove(key: string): void {
    try {
      uni.removeStorageSync(key)
    } catch {
      // ignore
    }
  },
}
