// 小程序录音实现（IRecorder）：wx RecorderManager，60 秒封顶，产出可持久化的 dataUrl。
import type { IRecorder, RecorderResult } from '@shared/platform/types'

let manager: UniApp.RecorderManager | null = null
let stopPromise: Promise<RecorderResult | null> | null = null
let collectResolver: ((r: RecorderResult | null) => void) | null = null

function toDataUrl(tempFilePath: string): Promise<string> {
  return new Promise((resolve) => {
    try {
      const b64 = uni.getFileSystemManager().readFileSync(tempFilePath, 'base64')
      resolve(`data:audio/mp3;base64,${b64}`)
    } catch {
      resolve('')
    }
  })
}

async function collect(res: { tempFilePath?: string }): Promise<void> {
  const finish = collectResolver
  collectResolver = null
  if (!finish) return
  if (!res.tempFilePath) {
    finish(null)
    return
  }
  const dataUrl = await toDataUrl(res.tempFilePath)
  finish({
    // 小程序没有 Blob：下游只用 url/dataUrl，这里给个占位
    blob: undefined as unknown as Blob,
    url: res.tempFilePath,
    dataUrl,
  })
}

export const mpRecorder: IRecorder = {
  supported: true, // 微信端能力始终存在，权限由系统询问
  start(): Promise<void> {
    const m = uni.getRecorderManager()
    manager = m
    m.onStop(collect)
    return new Promise<void>((resolve, reject) => {
      // 启动成功后 Promise 已 resolve，此后再报错也是空操作（resolve 后 reject 无效）
      m.onError(() => {
        manager = null
        reject(new Error('录音启动失败（可能没有麦克风权限）'))
      })
      m.onStart(() => resolve())
      m.start({ format: 'mp3', duration: 60000, sampleRate: 22050 })
    })
  },
  stop(): Promise<RecorderResult | null> {
    const m = manager
    manager = null
    if (!m) return Promise.resolve(null)
    if (stopPromise) return stopPromise
    stopPromise = new Promise((resolve) => {
      collectResolver = resolve
      m.stop() // onStop → collect → resolve
      // 保险：3 秒后还没回调就当失败
      setTimeout(() => {
        if (collectResolver) {
          collectResolver = null
          stopPromise = null
          resolve(null)
        }
      }, 3000)
    })
    return stopPromise
  },
}
