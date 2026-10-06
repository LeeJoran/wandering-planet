<script setup lang="ts">
// 共赴成员面板：成员名单（称呼/在线）、人数上限切换、邀请更多人、黯淡/复明。
import { computed, ref } from 'vue'
import { pairBackend, type PairGalaxy } from '../../platform/pair'

const { galaxy } = defineProps<{ galaxy: PairGalaxy }>()
const emit = defineEmits<{ close: []; changed: [] }>()

const busy = ref(false)
const error = ref('')
const inviteCode = ref<string | null>(null)

const CN_NUM = ['一', '二', '三', '四', '五', '六', '七', '八']

function memberLabel(userId: string): string {
  if (userId === pairBackend.myUserId()) return '我'
  const idx = galaxy.members.findIndex((m) => m.userId === userId)
  if (galaxy.members.length <= 2) return '对方'
  const m = galaxy.members[idx]
  return m?.nickname || `成员${CN_NUM[idx] ?? idx + 1}`
}

function isOnline(userId: string): boolean {
  return userId === pairBackend.myUserId() || galaxy.onlineMembers.includes(userId)
}

const canLowerTo = computed(() => Math.max(2, galaxy.members.length))

async function setCapacity(n: number) {
  if (n < canLowerTo.value || n === galaxy.capacity) return
  busy.value = true
  error.value = ''
  try {
    await pairBackend.setGalaxyCapacity(galaxy.id, n)
    emit('changed')
  } catch (e) {
    error.value = e instanceof Error ? e.message : '人数切换失败'
  } finally {
    busy.value = false
  }
}

async function makeInvite() {
  busy.value = true
  error.value = ''
  try {
    inviteCode.value = await pairBackend.createInvite(galaxy.capacity, galaxy.id, '')
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
    const el = document.createElement('textarea')
    el.value = link
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    el.remove()
  }
}

async function setStatus(status: 'dimmed' | 'active') {
  busy.value = true
  error.value = ''
  try {
    await pairBackend.setGalaxyStatus(galaxy.id, status)
    emit('changed')
  } catch (e) {
    error.value = e instanceof Error ? e.message : '操作失败'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="backdrop" @click.self="emit('close')">
    <div class="panel">
      <header>
        <h2 class="title">共赴成员</h2>
        <button class="close" @click="emit('close')">收起</button>
      </header>

      <div class="members">
        <div v-for="m in galaxy.members" :key="m.userId" class="member">
          <span class="dot" :class="{ on: isOnline(m.userId) }"></span>
          <span class="name">{{ memberLabel(m.userId) }}</span>
          <span class="state">{{ isOnline(m.userId) ? '在线' : '不在' }}</span>
        </div>
      </div>

      <p class="sub-title">这片星空的人数上限</p>
      <div class="seg">
        <button
          v-for="n in [2, 3, 4, 5]"
          :key="n"
          class="seg-btn"
          :class="{ on: galaxy.capacity === n }"
          :disabled="busy || n < canLowerTo"
          @click="setCapacity(n)"
        >
          {{ n }}人
        </button>
      </div>
      <p class="hint">当前 {{ galaxy.members.length }} 人，上限不能低于当前人数。</p>

      <template v-if="galaxy.members.length < galaxy.capacity">
        <template v-if="inviteCode">
          <div class="invite-card">
            <p class="invite-code">{{ inviteCode }}</p>
            <button class="btn" @click="copyLink">复制邀请链接</button>
          </div>
          <p class="hint">把链接发给新朋友，循光而来即可加入这片星空。</p>
        </template>
        <button v-else class="btn ghost" :disabled="busy" @click="makeInvite">邀请更多人加入</button>
      </template>

      <div class="divider"></div>

      <template v-if="galaxy.status === 'active'">
        <p class="hint">让这段共赴黯淡后，大家仍可进入查看、随时继续点亮。</p>
        <button class="link-btn" :disabled="busy" @click="setStatus('dimmed')">让这段共赴黯淡</button>
      </template>
      <template v-else>
        <p class="warn">这段共赴已黯淡，点击下方按钮重新点亮，旅程继续。</p>
        <button class="btn" :disabled="busy" @click="setStatus('active')">继续点亮这段共赴</button>
      </template>

      <p v-if="error" class="hint error">{{ error }}</p>
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
  max-height: 74vh;
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

.members {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.member {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid rgba(205, 214, 232, 0.12);
  border-radius: 12px;
  background: rgba(205, 214, 232, 0.04);
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

.name {
  font-size: 14px;
}

.state {
  margin-left: auto;
  font-size: 12px;
  opacity: 0.5;
}

.sub-title {
  margin: 0;
  font-size: 12px;
  letter-spacing: 2px;
  opacity: 0.55;
}

.seg {
  display: flex;
  gap: 8px;
}

.seg-btn {
  flex: 1;
  padding: 8px 0;
  border: 1px solid rgba(205, 214, 232, 0.2);
  border-radius: 999px;
  font-size: 13px;
  opacity: 0.6;
}

.seg-btn:disabled {
  opacity: 0.25;
}

.seg-btn.on {
  border-color: rgba(255, 240, 200, 0.55);
  color: #ffe9b8;
  opacity: 1;
}

.invite-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 14px;
  background: rgba(205, 214, 232, 0.05);
  border: 1px solid rgba(255, 240, 200, 0.35);
  border-radius: 14px;
}

.invite-code {
  margin: 0;
  font-size: 26px;
  letter-spacing: 8px;
  color: #ffe9b8;
  font-variant-numeric: tabular-nums;
}

.divider {
  height: 1px;
  background: rgba(205, 214, 232, 0.12);
}

.hint {
  margin: 0;
  font-size: 12px;
  opacity: 0.55;
}

.warn {
  margin: 0;
  font-size: 12px;
  color: #e8c890;
}

.link-btn {
  align-self: flex-start;
  font-size: 12px;
  opacity: 0.5;
  padding: 4px 0;
}

.btn.ghost {
  opacity: 0.65;
}

.error {
  color: #e8a0a0;
  margin: 0;
}
</style>
