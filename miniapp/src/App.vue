<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { installFetch } from './platform/weapp/fetch'
import { notifyAppShow, notifyAppHide } from './platform/weapp/lifecycle'

onLaunch(() => {
  // supabase-js 需要 fetch：小程序环境用 uni.request 垫片（须在一切网络调用前安装）
  installFetch()
})

onShow(() => {
  notifyAppShow()
})

onHide(() => {
  notifyAppHide()
})
</script>

<style>
/* 全局基础样式：与 H5 版一致的深空底色 */
page {
  background: #05070f;
  color: #e8ecf5;
  font-family: -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif;
}
</style>
