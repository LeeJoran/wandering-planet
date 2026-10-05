// Web 实现：隐藏 file input 选图 + canvas 降采样（控制在 localStorage 可承受的体积）
// 小程序阶段：用 wx.chooseImage 实现同一接口

import type { IPhotoPicker } from '../types'

const MAX_SIDE = 800

export const webPhotoPicker: IPhotoPicker = {
  pickImage(): Promise<{ dataUrl: string } | null> {
    return new Promise((resolve) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      let settled = false
      const done = (result: { dataUrl: string } | null) => {
        if (!settled) {
          settled = true
          window.removeEventListener('focus', onCancel)
          resolve(result)
        }
      }
      // 用户取消选择：窗口重新聚焦且没有 change 事件
      const onCancel = () => setTimeout(() => done(null), 300)
      input.onchange = () => {
        const file = input.files?.[0]
        if (!file) return done(null)
        readFile(file)
          .then(downscale)
          .then((dataUrl) => done({ dataUrl }))
          .catch(() => done(null))
      }
      window.addEventListener('focus', onCancel)
      input.click()
    })
  },
}

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function downscale(dataUrl: string, maxSide: number = MAX_SIDE): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height))
      if (scale === 1) return resolve(dataUrl)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext('2d')
      if (!ctx) return resolve(dataUrl)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', 0.8))
    }
    img.onerror = () => resolve(dataUrl)
    img.src = dataUrl
  })
}
