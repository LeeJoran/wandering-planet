// 小程序选图实现（IPhotoPicker）：uni.chooseMedia（压缩图），读成 dataUrl 持久化。
import type { IPhotoPicker } from '@shared/platform/types'

export const mpPhotoPicker: IPhotoPicker = {
  pickImage(): Promise<{ dataUrl: string } | null> {
    return new Promise((resolve) => {
      uni.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sizeType: ['compressed'],
        success: (res) => {
          const f = res.tempFiles?.[0]
          if (!f) {
            resolve(null)
            return
          }
          try {
            const b64 = uni.getFileSystemManager().readFileSync(f.tempFilePath, 'base64') as string
            resolve({ dataUrl: `data:image/jpeg;base64,${b64}` })
          } catch {
            resolve(null)
          }
        },
        fail: () => resolve(null),
      })
    })
  },
}
