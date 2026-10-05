// 未完成的在轨会话：随时落盘，页面被关 / 被杀后，下次打开据此点亮成星

import type { IStorage } from '../platform/types'
import type { OrbitSession } from './orbit'

const KEY = 'wandering-planet.session'

export class SessionRepo {
  constructor(private storage: IStorage) {}

  load(): OrbitSession | null {
    return this.storage.get<OrbitSession>(KEY)
  }

  save(session: OrbitSession): void {
    this.storage.set(KEY, session)
  }

  clear(): void {
    this.storage.remove(KEY)
  }
}
