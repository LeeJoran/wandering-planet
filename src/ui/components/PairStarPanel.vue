<script setup lang="ts">
// 共赴星面板：五类卡片科普 + 能量进度 + 互发的表达（文字/语音/图片，标注谁发的）+ 继续互发。
import { computed, onUnmounted, ref } from 'vue'
import { getPairConstellation } from '../../core/pairConstellations'
import type { PairEntry, PairMember, PairStar } from '../../platform/pair'
import { webPhotoPicker } from '../../platform/web/photo'
import { webRecorder } from '../../platform/web/recorder'

const props = defineProps<{
  star: PairStar
  galaxyName: string
  entries: PairEntry[]
  myUserId: string | null
  members: PairMember[] // 按加入顺序
  canAdd: boolean // 星系 active 才可互发
}>()
const emit = defineEmits<{
  close: []
  add: [type: 'text' | 'voice' | 'image', text?: string, media?: string]
}>()

const draftText = ref('')
const recording = ref(false)
const pendingAudio = ref<{ dataUrl: string; url: string } | null>(null)
const error = ref('')

const percent = computed(() => Math.floor((props.star.energy / props.star.required) * 100))
const full = computed(() => props.star.litAt !== null)

// 五类卡片科普（与单人同源的数据结构）
const facts = computed(() => {
  const cs = getPairConstellation(props.star.constellationId)?.stars.find((s) => s.id === props.star.starId)
  return cs?.facts ?? []
})

const starName = computed(() => {
  const cs = getPairConstellation(props.star.constellationId)?.stars.find((s) => s.id === props.star.starId)
  return cs?.name ?? '共赴星'
})

const CN_NUM = ['一', '二', '三', '四', '五', '六', '七', '八']

function isMine(e: PairEntry) {
  return props.myUserId !== null && e.author === props.myUserId
}

// 署名：2 人 = 我/对方；3+ = 我/自取称呼（空则按加入顺序叫成员N）
function authorLabel(e: PairEntry): string {
  if (isMine(e)) return '我'
  const idx = props.members.findIndex((m) => m.userId === e.author)
  if (props.members.length <= 2) return '对方'
  const m = props.members[idx]
  return m?.nickname || `成员${CN_NUM[idx] ?? idx + 1}`
}

async function toggleRecord() {
  if (recording.value) {
    const result = await webRecorder.stop()
    if (result) pendingAudio.value = { dataUrl: result.dataUrl, url: result.url }
    recording.value = false
  } else {
    try {
      await webRecorder.start()
      recording.value = true
      error.value = ''
    } catch {
      error.value = '录音启动失败（可能没有麦克风权限）'
    }
  }
}

function saveText() {
  if (!draftText.value.trim()) return
  emit('add', 'text', draftText.value.trim())
  draftText.value = ''
}

function saveVoice() {
  if (!pendingAudio.value) return
  emit('add', 'voice', undefined, pendingAudio.value.dataUrl)
  pendingAudio.value = null
}

async function pickImage() {
  const result = await webPhotoPicker.pickImage()
  if (result) emit('add', 'image', undefined, result.dataUrl)
}

onUnmounted(() => {
  if (recording.value) void webRecorder.stop()
})
</script>

<template>
  <div class="backdrop" @click.self="emit('close')">
    <div class="panel">
      <header>
        <div>
          <h2 class="title">{{ starName }}</h2>
          <p class="meta">{{ galaxyName }} · {{ full ? '已完全点亮' : '已点亮 ' + percent + '%' }}</p>
        </div>
        <button class="close" @click="emit('close')">收起</button>
      </header>

      <div class="energy">
        <div class="bar">
          <div class="fill" :style="{ width: percent + '%' }"></div>
        </div>
      </div>

      <template v-if="facts.length">
        <p class="section-title">关于这颗星</p>
        <div class="facts">
          <div v-for="f in facts" :key="f.label" class="fact-row">
            <p class="fact-label">{{ f.label }}</p>
            <p class="fact-text">{{ f.text }}</p>
          </div>
        </div>
      </template>

      <p class="section-title">你们留下的</p>
      <div class="entries">
        <p v-if="entries.length === 0" class="hint">还没有留下什么</p>
        <div v-for="e in entries" :key="e.id" class="entry" :class="{ mine: isMine(e) }">
          <p class="author">{{ authorLabel(e) }}</p>
          <p v-if="e.type === 'text'" class="entry-text">{{ e.text }}</p>
          <audio v-else-if="e.type === 'voice' && e.media" :src="e.media" controls />
          <img v-else-if="e.type === 'image' && e.media" :src="e.media" class="entry-img" />
        </div>
      </div>

      <div v-if="canAdd" class="form">
        <textarea v-model="draftText" rows="2" placeholder="写给对方…"></textarea>
        <button class="btn" :disabled="!draftText.trim()" @click="saveText">发出去</button>

        <template v-if="webRecorder.supported">
          <button class="btn" :class="{ recording }" @click="toggleRecord">
            {{ recording ? '停止录音' : '录音' }}
          </button>
          <audio v-if="pendingAudio" :src="pendingAudio.url" controls />
          <button v-if="pendingAudio" class="btn" @click="saveVoice">发语音</button>
        </template>
        <p v-else class="hint">当前浏览器不支持录音，用文字或图片吧</p>

        <button class="btn" @click="pickImage">发一张图</button>
      </div>

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

.meta {
  margin: 4px 0 0;
  font-size: 12px;
  opacity: 0.5;
}

.close {
  font-size: 13px;
  opacity: 0.6;
}

.energy {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.bar {
  height: 6px;
  border-radius: 999px;
  background: rgba(205, 214, 232, 0.12);
  overflow: hidden;
}

.fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #d8b06a, #ffe9b8);
  transition: width 0.5s ease;
}

.section-title {
  margin: 0;
  font-size: 12px;
  letter-spacing: 3px;
  opacity: 0.5;
}

.facts {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.fact-row {
  padding: 10px 12px;
  background: rgba(205, 214, 232, 0.05);
  border: 1px solid rgba(205, 214, 232, 0.12);
  border-radius: 12px;
}

.fact-label {
  margin: 0 0 4px;
  font-size: 11px;
  opacity: 0.5;
  letter-spacing: 2px;
}

.fact-text {
  margin: 0;
  font-size: 13px;
  opacity: 0.9;
  line-height: 1.7;
}

.entries {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.entry {
  padding: 10px 12px;
  background: rgba(205, 214, 232, 0.05);
  border: 1px solid rgba(205, 214, 232, 0.12);
  border-radius: 12px;
}

.entry.mine {
  border-color: rgba(255, 240, 200, 0.3);
}

.author {
  margin: 0 0 4px;
  font-size: 11px;
  opacity: 0.45;
}

.entry-text {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

.entry-img {
  max-width: 100%;
  border-radius: 8px;
  display: block;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 4px;
}

textarea {
  width: 100%;
  background: rgba(205, 214, 232, 0.05);
  border: 1px solid rgba(205, 214, 232, 0.25);
  border-radius: 12px;
  color: inherit;
  font: inherit;
  font-size: 14px;
  padding: 12px;
  resize: none;
}

textarea::placeholder {
  color: rgba(205, 214, 232, 0.4);
}

audio {
  width: 100%;
}

.recording {
  border-color: rgba(255, 150, 150, 0.6);
  background: rgba(255, 120, 120, 0.12);
}

.error {
  color: #e8a0a0;
  margin: 0;
}
</style>
