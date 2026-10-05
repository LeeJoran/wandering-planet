import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  // GitHub Pages 部署在子路径下时设置 BASE_PATH=/<repo>/
  base: process.env.BASE_PATH || '/',
})
