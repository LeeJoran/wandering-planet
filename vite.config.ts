import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => ({
  plugins: [vue()],
  // GitHub Pages 部署在子路径 /<repo>/ 下；本地开发保持根路径
  base: mode === 'production' ? '/wandering-planet/' : '/',
}))
