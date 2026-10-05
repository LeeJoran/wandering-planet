// Web 实现：页面可见性。用于从后台回来时立即校准计时显示

import type { ILifecycle } from '../types'

export const webLifecycle: ILifecycle = {
  onVisibilityChange(cb) {
    document.addEventListener('visibilitychange', () => cb(document.hidden))
  },
}
