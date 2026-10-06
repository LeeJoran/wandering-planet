<script setup lang="ts">
// 共赴面板：星系列表（可多段，每段独立删除）+ 点亮信标（选人数/目标/称呼）+ 循光而来（输入码+称呼）。
// 黯淡/复明与人数切换在共赴天空内部的成员面板里做。
import { computed, ref } from 'vue'
import { pairBackend, type PairGalaxy } from '../../platform/pair'

const { galaxies, initError } = defineProps<{ galaxies: PairGalaxy[]; initError?: string }>()
const emit = defineEmits<{
  close: []
  enter: [galaxyId: string]
  accepted: [galaxyId: string]
  status: [galaxyId: string, status: 'deleted']
}>()

const inviteCode = ref<string | null>(null)
const beaconOpen = ref(false)
const capacity = ref(2)
const targetId = ref<string | null>(null) // null = 开启新共赴；否则 = 邀请加入该星系
const myNickname = ref('')
const enterCode = ref('')
const enterNickname = ref('')
const busy = ref(false)
const error = ref('')
const acceptError = ref('')
const confirmDeleteId = ref<string | null>(null)

// 有位置可加入的星系（作为信标目标候选）
const joinable = computed(() => galaxies.filter((g) => g.members.length < g.capacity))

const CN_NUM = ['一', '二', '三', '四', '五', '六', '七', '八']

function galaxyName(index: number): string {
  return `共赴星系 · ${CN_NUM[index] ?? index + 1}`
}

async function lightBeacon() {
  busy.value = true
  error.value = ''
  try {
    const code = await pairBackend.createInvite(capacity.value, targetId.value, myNickname.value.trim())
    inviteCode.value = code
    beaconOpen.value = false
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

async function submitCode() {
  const code = enterCode.value.trim().toUpperCase()
  if (code.length !== 6) return
  busy.value = true
  acceptError.value = ''
  try {
    const gid = await pairBackend.acceptInvite(code, enterNickname.value.trim())
    if (!gid) acceptError.value = '这束光已经熄灭（信标码无效或已过期）'
    else emit('accepted', gid)
  } catch (e) {
    acceptError.value = e instanceof Error ? e.message : '循光而来失败'
  } finally {
    busy.value = false
  }
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

      <!-- 星系列表：每段一个删除图标按钮，点击行进入查看 -->
      <template v-if="galaxies.length">
        <button
          v-for="(g, i) in galaxies"
          :key="g.id"
          class="row"
          @click="emit('enter', g.id)"
        >
          <span class="dot" :class="{ on: g.onlineMembers.length > 0 }"></span>
          <span class="row-name">{{ g.status === 'dimmed' ? '黯淡的' : '' }}{{ galaxyName(i) }}</span>
          <span class="row-status">
            {{ g.members.length }}/{{ g.capacity }} 人 ·
            {{ g.onlineMembers.length > 0 ? g.onlineMembers.length + ' 人在线' : g.status === 'dimmed' ? '已黯淡' : '无人同行' }}
          </span>
        </button>

        <!-- 每段共赴独立的删除图标 -->
        <div class="del-list">
          <template v-for="(g, i) in galaxies" :key="'del' + g.id">
            <template v-if="confirmDeleteId === g.id">
              <p class="warn">彻底删除「{{ galaxyName(i) }}」？这段共赴的记录将不复存在。</p>
              <div class="confirm-row">
                <button class="btn danger" @click="emit('status', g.id, 'deleted'); confirmDeleteId = null">确定彻底删除</button>
                <button class="link-btn" @click="confirmDeleteId = null">取消</button>
              </div>
            </template>
            <button v-else class="del-btn" title="删除这段共赴" @click="confirmDeleteId = g.id">✕</button>
          </template>
        </div>
      </template>

      <p v-if="galaxies.length === 0" class="intro">共赴，是与另一个人共同拥有的一片天空。</p>

      <!-- 点亮信标：选人数、选目标、取称呼；邀请码常驻可见（多段共赴随时可开） -->
      <template v-if="inviteCode">
        <div class="invite-card">
          <p class="invite-code">{{ inviteCode }}</p>
          <button class="btn" @click="copyLink">复制邀请链接</button>
        </div>
        <p class="hint">把链接发给对方，等待循光而来…（你已有的共赴不受影响）</p>
        <button class="link-btn" @click="inviteCode = null">收起信标</button>
      </template>

      <template v-else>
        <button v-if="!beaconOpen" class="btn ghost" @click="beaconOpen = true">点亮信标，邀请新朋友</button>

        <div v-else class="beacon-form">
          <p class="sub-title">这片星空，几个人共赴？</p>
          <div class="seg">
            <button
              v-for="n in [2, 3, 4, 5]"
              :key="n"
              class="seg-btn"
              :class="{ on: capacity === n }"
              @click="capacity = n"
            >
              {{ n }}人
            </button>
          </div>

          <template v-if="joinable.length">
            <p class="sub-title">信标指向哪里？</p>
            <button class="radio-row" :class="{ on: targetId === null }" @click="targetId = null">
              <span class="radio"></span>开启一段新的共赴
            </button>
            <button
              v-for="g in joinable"
              :key="g.id"
              class="radio-row"
              :class="{ on: targetId === g.id }"
              @click="targetId = g.id"
            >
              <span class="radio"></span>邀请加入「{{ galaxyName(galaxies.indexOf(g)) }}」（{{ g.members.length }}/{{ g.capacity }} 人）
            </button>
          </template>

          <template v-if="capacity >= 3">
            <p class="sub-title">给自己取个称呼（同行的人会看到）</p>
            <input v-model="myNickname" class="code-input" maxlength="8" placeholder="如：小月" />
          </template>

          <button class="btn" :disabled="busy" @click="lightBeacon">
            {{ busy ? '点亮中…' : '点亮信标' }}
          </button>
          <p v-if="error" class="hint error">{{ error }}</p>
        </div>
      </template>

      <div class="divider"><span>或</span></div>

      <!-- 循光而来：输入码 + 自取称呼 -->
      <p class="sub-title">收到对方的信标码？</p>
      <div class="code-input-row">
        <input
          v-model="enterCode"
          class="code-input"
          maxlength="6"
          placeholder="输入 6 位信标码"
          @input="enterCode = enterCode.toUpperCase()"
        />
        <button class="btn" :disabled="enterCode.trim().length !== 6 || busy" @click="submitCode">
          {{ busy ? '循光而来…' : '循光而来' }}
        </button>
      </div>
      <input
        v-model="enterNickname"
        class="code-input"
        maxlength="8"
        placeholder="给自己取个称呼（可留空，3 人以上共赴会用到）"
      />
      <p v-if="acceptError" class="hint error">{{ acceptError }}</p>
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
  max-height: 78vh;
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

.row-status {
  margin-left: auto;
  font-size: 12px;
  opacity: 0.55;
  white-space: nowrap;
}

.del-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.del-btn {
  align-self: flex-end;
  width: 30px;
  height: 30px;
  margin-top: -46px;
  margin-right: 8px;
  border-radius: 50%;
  font-size: 12px;
  opacity: 0.35;
}

.del-btn:active {
  opacity: 0.7;
}

.warn {
  margin: 0;
  font-size: 13px;
  color: #e8a0a0;
}

.confirm-row {
  display: flex;
  gap: 12px;
  align-items: center;
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

.divider {
  display: flex;
  align-items: center;
  gap: 10px;
  opacity: 0.35;
  font-size: 12px;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgba(205, 214, 232, 0.25);
}

.sub-title {
  margin: 0;
  font-size: 12px;
  letter-spacing: 2px;
  opacity: 0.55;
}

.beacon-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border: 1px solid rgba(205, 214, 232, 0.12);
  border-radius: 12px;
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

.seg-btn.on {
  border-color: rgba(255, 240, 200, 0.55);
  color: #ffe9b8;
  opacity: 1;
}

.radio-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid rgba(205, 214, 232, 0.12);
  border-radius: 12px;
  background: rgba(205, 214, 232, 0.04);
  text-align: left;
  font-size: 13px;
}

.radio {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1px solid rgba(205, 214, 232, 0.4);
  flex-shrink: 0;
}

.radio-row.on {
  border-color: rgba(255, 240, 200, 0.45);
}

.radio-row.on .radio {
  border-color: #ffe9b8;
  background: radial-gradient(circle, #ffe9b8 40%, transparent 45%);
}

.code-input-row {
  display: flex;
  gap: 10px;
}

.code-input {
  width: 100%;
  background: rgba(205, 214, 232, 0.05);
  border: 1px solid rgba(205, 214, 232, 0.25);
  border-radius: 999px;
  color: inherit;
  font: inherit;
  font-size: 16px;
  letter-spacing: 2px;
  text-align: center;
  padding: 10px 14px;
  text-transform: uppercase;
}

.code-input::placeholder {
  color: rgba(205, 214, 232, 0.35);
  letter-spacing: 1px;
}

.link-btn {
  font-size: 12px;
  opacity: 0.5;
  padding: 4px 0;
}

.btn.danger {
  border-color: rgba(255, 140, 140, 0.5);
  color: #ffb4b4;
}

.btn.ghost {
  opacity: 0.65;
}

.error {
  color: #e8a0a0;
  margin: 0;
}

.hint {
  margin: 0;
  font-size: 12px;
  opacity: 0.55;
}
</style>
