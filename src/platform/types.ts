// 平台能力接口 —— 浏览器与小程序各自实现。
// 本阶段只有 Web 实现（platform/web/），小程序实现留待以后（platform/miniapp/）。

export interface IStorage {
  get<T>(key: string): T | null
  set<T>(key: string, value: T): void
  remove(key: string): void
}

export interface RecorderResult {
  blob: Blob
  url: string // 本次会话内可播放的临时 URL
  dataUrl: string // 可持久化到本地的数据
}

export interface IRecorder {
  supported: boolean
  start(): Promise<void>
  stop(): Promise<RecorderResult | null> // 未开始 / 无数据时返回 null
}

export interface ILifecycle {
  onVisibilityChange(cb: (hidden: boolean) => void): void
}

export interface IPhotoPicker {
  pickImage(): Promise<{ dataUrl: string } | null> // 用户取消时返回 null
}
