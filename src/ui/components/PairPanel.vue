<script setup lang="ts">
// 共赴面板：没有星系时"点亮信标"邀请；有星系时列表 + 管理（黯淡/复明/彻底删除）。
import { ref } from 'vue'
import { pairBackend, type PairGalaxy } from '../../platform/pair'

defineProps<{ galaxies: PairGalaxy[]; initError?: string }>()
const emit = defineEmits<{ close: []; enter: [galaxyId: string]; status: [galaxyId: string, status: 'dimmed' | 'active' | 'deleted'] }>()

const inviteCode = ref<string | null>(null)
const busy = ref(false)
const error = ref('')
const confirmDeleteId = ref<string | null>(null)

async function lightBeacon() {
  busy.value = true
  error.value = ''
  try {
    inviteCode.value = await pairBackend.createInvite()
  } catch (e) {
    error.value = e instanceof Error ? e.message : '信标创建失败'
  } finally {
    busy.value = false
  }
}

async function copyLink() {
  if (!inviteCode.value) return
  const link = `${location.origin}${location.pathname}#join=${inviteCode.value}`
  try {
    await navigator.clipboard.writeText(link)
  } catch {
    // 剪贴板失败：选中文本让用户手动复制
    const el = document.createElement('textarea')
    el.value = link
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    el.remove()
  }
}

function litCount(g: PairGalaxy): number {
  return g.stars.filter((s) => s.litAt).length
}
</script>

<template>
  <div class="backdrop" @click.self="emit('close')">
    <div class="panel">
      <header>
        <h2 class="title">共赴</h2>
        <button class="close" @click="emit('close')">收起</button>
      </header>

      <p v-if="initError" class="hint error">{{ initError }}</p>

      <!-- 无星系：点亮信标 -->
      <template v-if="galaxies.length === 0">
        <p class="intro">共赴，是与另一个人共同拥有的一片天空。点亮一座信标，等那个人循光而来。</p>

        <template v-if="!inviteCode">
          <button class="btn" :disabled="busy" @click="lightBeacon">
            {{ busy ? '点亮中…' : '点亮信标' }}
          </button>
        </template>
        <template v-else>
          <div class="invite-card">
            <p class="invite-code">{{ inviteCode }}</p>
            <p class="invite-hint">把这个码或链接发给那个人</p>
            <button class="btn" @click="copyLink">复制邀请链接</button>
          </div>
          <p class="hint">等待循光而来…对方接受后，双星会出现在你们的天空。</p>
        </template>
      </template>

      <!-- 星系列表 -->
      <template v-else>
        <button v-for="g in galaxies" :key="g.id" class="row" @click="emit('enter', g.id)">
          <span class="dot" :class="{ on: g.partnerOnline }"></span>
          <span class="row-name">{{ g.status === 'dimmed' ? '黯淡的' : '' }}共赴星系</span>
          <span class="row-progress">{{ litCount(g) }}/{{ g.stars.length }}</span>
          <span class="row-status">{{ g.partnerOnline ? '对方在线' : g.status === 'dimmed' ? '已黯淡' : '对方不在' }}</span>
        </button>

        <div class="manage">
          <button class="btn ghost" @click="lightBeacon">再点一座信标</button>
        </div>
      </template>

      <!-- 管理：黯淡/复明/彻底删除（藏深） -->
      <div v-if="galaxies.length" class="manage-list">
        <template v-for="g in galaxies" :key="'m' + g.id">
          <template v-if="confirmDeleteId === g.id">
            <p class="hint warn">彻底删除后，你们共赴的记录将不复存在。确定？</p>
            <button class="btn danger" @click="emit('status', g.id, 'deleted'); confirmDeleteId = null">确定彻底删除</button>
          </template>
          <template v-else>
            <button v-if="g.status === 'active'" class="link-btn" @click="emit('status', g.id, 'dimmed')">移除这段共赴（黯淡）</button>
            <button v-else class="link-btn" @click="emit('status', g.id, 'active')">复明</button>
            <button class="link-btn dim" @click="confirmDeleteId = g.id">…</button>
          </template>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  z-index: 10;
  display: flex;
  align-items: flex-end;
}

.panel {
  width: 100%;
  max-height: 72vh;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px 20px calc(20px + env(safe-area-inset-bottom));
  background: #0a0f1e;
  border-radius: 16px 16px 0 0;
  overflow-y: auto;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.title {
  margin: 0;
  font-weight: 400;
  letter-spacing: 3px;
  font-size: 17px;
}

.close {
  font-size: 13px;
  opacity: 0.6;
}

.intro {
  margin: 0;
  font-size: 13px;
  opacity: 0.75;
  line-height: 1.8;
}

.invite-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 18px;
  background: rgba(205, 214, 232, 0.05);
  border: 1px solid rgba(255, 240, 200, 0.35);
  border-radius: 14px;
}

.invite-code {
  margin: 0;
  font-size: 30px;
  letter-spacing: 8px;
  color: #ffe9b8;
  font-variant-numeric: tabular-nums;
}

.invite-hint {
  margin: 0;
  font-size: 12px;
  opacity: 0.55;
}

.row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 14px 16px;
  border: 1px solid rgba(205, 214, 232, 0.12);
  border-radius: 12px;
  background: rgba(205, 214, 232, 0.04);
  text-align: left;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(205, 214, 232, 0.25);
  flex-shrink: 0;
}

.dot.on {
  background: #7fdc9a;
  box-shadow: 0 0 8px 2px rgba(127, 220, 154, 0.5);
}

.row-name {
  font-size: 14px;
}

.row-progress {
  margin-left: auto;
  font-size: 13px;
  opacity: 0.7;
  font-variant-numeric: tabular-nums;
}

.row-status {
  font-size: 12px;
  opacity: 0.55;
}

.manage {
  display: flex;
  justify-content: center;
}

.manage-list {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.link-btn {
  font-size: 12px;
  opacity: 0.5;
  padding: 4px 0;
}

.link-btn.dim {
  opacity: 0.3;
}

.warn {
  color: #e8a0a0;
  margin: 0;
}

.danger {
  border-color: rgba(255, 140, 140, 0.5);
  color: #ffb4b4;
}

.error {
  color: #e8a0a0;
  margin: 0;
}

.ghost {
  opacity: 0.65;
}
</style>
