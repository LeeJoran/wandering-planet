<script setup lang="ts">
// 留言面板：叠在天空上的底部面板，星星始终可见。星/在轨会话共用：
// 看已有的表达（文字/语音/图片），也可以继续加。
import { onUnmounted, ref } from 'vue'
import type { StarEntry } from '../../core/models'
import { webPhotoPicker } from '../../platform/web/photo'
import { webRecorder } from '../../platform/web/recorder'

defineProps<{
  title: string
  subtitle?: string
  emptyHint: string
  entries: StarEntry[]
  facts?: { label: string; value: string }[]
  story?: string
  canAdd?: boolean
}>()
const emit = defineEmits<{ add: [entry: StarEntry]; close: [] }>()

const draftText = ref('')
const recording = ref(false)
const pendingAudio = ref<{ dataUrl: string; url: string } | null>(null)
const error = ref('')

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
  emit('add', { type: 'text', text: draftText.value.trim(), createdAt: Date.now() })
  draftText.value = ''
}

function saveVoice() {
  if (!pendingAudio.value) return
  emit('add', { type: 'voice', audioDataUrl: pendingAudio.value.dataUrl, createdAt: Date.now() })
  pendingAudio.value = null
}

async function pickImage() {
  const result = await webPhotoPicker.pickImage()
  if (result) emit('add', { type: 'image', imageDataUrl: result.dataUrl, createdAt: Date.now() })
}

onUnmounted(() => {
  // 离开面板时若正在录音，释放麦克风
  if (recording.value) void webRecorder.stop()
})
</script>

<template>
  <div class="backdrop" @click.self="emit('close')">
    <div class="panel">
      <header>
        <div>
          <h2 class="title">{{ title }}</h2>
          <p v-if="subtitle" class="meta">{{ subtitle }}</p>
        </div>
        <button class="close" @click="emit('close')">收起</button>
      </header>

      <div v-if="facts && facts.length" class="facts">
        <p v-for="f in facts" :key="f.label" class="fact">
          <span class="fact-label">{{ f.label }}</span>{{ f.value }}
        </p>
      </div>
      <p v-if="story" class="story">{{ story }}</p>

      <div class="entries">
        <p v-if="entries.length === 0" class="hint">{{ emptyHint }}</p>
        <div v-for="(e, i) in entries" :key="i" class="entry">
          <p v-if="e.type === 'text'" class="entry-text">{{ e.text }}</p>
          <audio v-else-if="e.type === 'voice' && e.audioDataUrl" :src="e.audioDataUrl" controls />
          <img v-else-if="e.type === 'image' && e.imageDataUrl" :src="e.imageDataUrl" class="entry-img" />
        </div>
      </div>

      <div v-if="canAdd !== false" class="form">
        <textarea v-model="draftText" rows="2" placeholder="写点什么…"></textarea>
        <button class="btn" :disabled="!draftText.trim()" @click="saveText">存下文字</button>

        <template v-if="webRecorder.supported">
          <button class="btn" :class="{ recording }" @click="toggleRecord">
            {{ recording ? '停止录音' : '录音' }}
          </button>
          <audio v-if="pendingAudio" :src="pendingAudio.url" controls />
          <button v-if="pendingAudio" class="btn" @click="saveVoice">存下语音</button>
        </template>
        <p v-else class="hint">当前浏览器不支持录音，用文字或图片吧</p>

        <button class="btn" @click="pickImage">选一张图</button>

        <p v-if="error" class="hint error">{{ error }}</p>
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
  max-height: 68vh;
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

.facts {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.fact {
  margin: 0;
  font-size: 13px;
  opacity: 0.85;
}

.fact-label {
  display: inline-block;
  min-width: 3em;
  margin-right: 10px;
  font-size: 12px;
  opacity: 0.5;
}

.story {
  margin: 0;
  font-size: 13px;
  opacity: 0.75;
  line-height: 1.7;
}

.entries {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.entry {
  padding: 12px 14px;
  background: rgba(205, 214, 232, 0.05);
  border: 1px solid rgba(205, 214, 232, 0.12);
  border-radius: 12px;
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
}
</style>
