// 小程序生命周期实现（ILifecycle）：由 App.vue 的 onShow/onHide 桥接进来。
import type { ILifecycle } from '@shared/platform/types'

let cb: ((hidden: boolean) => void) | null = null

export const mpLifecycle: ILifecycle = {
  onVisibilityChange(c) {
    cb = c
  },
}

// App.vue 里调用：小程序切后台 = hidden，回前台 = visible
export function notifyAppShow(): void {
  cb?.(false)
}

export function notifyAppHide(): void {
  cb?.(true)
}
