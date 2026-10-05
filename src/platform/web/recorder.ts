// Web 实现：浏览器原生录音（MediaRecorder）
// 已知限制：部分 iOS Safari / 微信内置浏览器不支持，此时 supported = false，文字留言兜底
// 小程序阶段：用 wx.getRecorderManager 实现同一接口
// 录音上限 60s，控制 base64 存入 localStorage 的体积

import type { IRecorder, RecorderResult } from '../types'

const MAX_MS = 60_000

class WebRecorder implements IRecorder {
  supported = typeof MediaRecorder !== 'undefined' && !!navigator.mediaDevices?.getUserMedia

  private mediaRecorder: MediaRecorder | null = null
  private chunks: Blob[] = []
  private timer: number | null = null
  private finalize: Promise<RecorderResult | null> | null = null

  async start(): Promise<void> {
    this.chunks = []
    this.finalize = null
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mime = pickMime()
    const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined)
    rec.ondataavailable = (e) => {
      if (e.data.size > 0) this.chunks.push(e.data)
    }
    rec.start()
    this.mediaRecorder = rec
    // 到上限自动停止；结果暂存，等界面来取
    this.timer = window.setTimeout(() => void this.stop(), MAX_MS)
  }

  stop(): Promise<RecorderResult | null> {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
    if (!this.finalize) {
      const rec = this.mediaRecorder
      this.mediaRecorder = null
      this.finalize =
        !rec || rec.state === 'inactive'
          ? Promise.resolve(null)
          : finalizeRecording(rec, this.chunks)
    }
    return this.finalize
  }
}

async function finalizeRecording(rec: MediaRecorder, chunks: Blob[]): Promise<RecorderResult | null> {
  const stopped = new Promise<void>((resolve) => {
    rec.onstop = () => resolve()
  })
  rec.stop()
  rec.stream.getTracks().forEach((t) => t.stop())
  await stopped
  if (chunks.length === 0) return null
  const blob = new Blob(chunks, { type: rec.mimeType || 'audio/webm' })
  const url = URL.createObjectURL(blob)
  const dataUrl = await blobToDataUrl(blob)
  return { blob, url, dataUrl }
}

function pickMime(): string | null {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus']
  return candidates.find((m) => MediaRecorder.isTypeSupported(m)) ?? null
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

export const webRecorder = new WebRecorder()
