import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import path from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [uni()],
  resolve: {
    alias: {
      // 共享主工程的核心层（纯 TS：星座数据/能量系统/模型）与平台接口
      '@core': path.resolve(__dirname, '../src/core'),
      '@shared/platform': path.resolve(__dirname, '../src/platform'),
    },
  },
})
