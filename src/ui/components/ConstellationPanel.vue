<script setup lang="ts">
// 星座回顾面板：介绍 + 可展开的明细（点亮时间/文字/语音/照片）。
import { ref } from 'vue'
import type { Constellation } from '../../core/constellations'
import { formatDateTime, formatMs } from '../format'

defineProps<{
  constellation: Constellation
  stats: {
    orbits: { startedAt: number; durationMs: number }[]
    texts: { text?: string; createdAt: number }[]
    voices: { audioDataUrl: string; createdAt: number }[]
    images: { imageDataUrl: string; createdAt: number }[]
  }
}>()
const emit = defineEmits<{ close: [] }>()

type Section = 'orbits' | 'texts' | 'voices' | 'images' | null
const active = ref<Section>(null)

function toggle(s: Exclude<Section, null>) {
  active.value = active.value === s ? null : s
}
</script>

<template>
  <div class="backdrop" @click.self="emit('close')">
    <div class="panel">
      <header>
        <h2 class="title">{{ constellation.symbol }} {{ constellation.name }}</h2>
        <button class="close" @click="emit('close')">收起</button>
      </header>

      <div class="facts">
        <div v-for="f in constellation.facts" :key="f.label" class="fact-row">
          <p class="fact-label">{{ f.label }}</p>
          <p class="fact-text">{{ f.text }}</p>
        </div>
      </div>

      <div class="stats">
        <button class="stat" :class="{ on: active === 'orbits' }" @click="toggle('orbits')">
          <p class="stat-num">{{ stats.orbits.length }}</p>
          <p class="stat-label">点亮次数</p>
        </button>
        <button class="stat" :class="{ on: active === 'texts' }" @click="toggle('texts')">
          <p class="stat-num">{{ stats.texts.length }}</p>
          <p class="stat-label">写下的文字</p>
        </button>
        <button class="stat" :class="{ on: active === 'voices' }" @click="toggle('voices')">
          <p class="stat-num">{{ stats.voices.length }}</p>
          <p class="stat-label">录入的语音</p>
        </button>
        <button class="stat" :class="{ on: active === 'images' }" @click="toggle('images')">
          <p class="stat-num">{{ stats.images.length }}</p>
          <p class="stat-label">上传的照片</p>
        </button>
      </div>

      <!-- 点亮明细 -->
      <div v-if="active === 'orbits'" class="detail">
        <p class="detail-title">每次点亮</p>
        <p v-if="stats.orbits.length === 0" class="hint">还没有点亮记录</p>
        <p v-for="(o, i) in stats.orbits" :key="i" class="detail-row">
          <span>{{ formatDateTime(o.startedAt) }}</span>
          <span class="detail-meta">在轨 {{ formatMs(o.durationMs) }}</span>
        </p>
      </div>

      <!-- 文字明细 -->
      <div v-if="active === 'texts'" class="detail">
        <p class="detail-title">你写下的</p>
        <p v-if="stats.texts.length === 0" class="hint">还没有留下文字</p>
        <div v-for="(t, i) in stats.texts" :key="i" class="detail-card">
          <p class="detail-text">{{ t.text }}</p>
          <p class="detail-meta">{{ formatDateTime(t.createdAt) }}</p>
        </div>
      </div>

      <!-- 语音明细 -->
      <div v-if="active === 'voices'" class="detail">
        <p class="detail-title">录下的语音</p>
        <p v-if="stats.voices.length === 0" class="hint">还没有录入语音</p>
        <div v-for="(v, i) in stats.voices" :key="i" class="detail-card">
          <audio :src="v.audioDataUrl" controls />
          <p class="detail-meta">{{ formatDateTime(v.createdAt) }}</p>
        </div>
      </div>

      <!-- 照片明细 -->
      <div v-if="active === 'images'" class="detail">
        <p class="detail-title">上传的照片</p>
        <p v-if="stats.images.length === 0" class="hint">还没有上传照片</p>
        <div v-for="(im, i) in stats.images" :key="i" class="detail-card">
          <img :src="im.imageDataUrl" class="detail-img" />
          <p class="detail-meta">{{ formatDateTime(im.createdAt) }}</p>
        </div>
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
  opacity: 0.85;
  line-height: 1.7;
}

.stats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.stat {
  flex: 1 1 30%;
  min-width: 90px;
  padding: 12px;
  background: rgba(205, 214, 232, 0.05);
  border: 1px solid rgba(205, 214, 232, 0.12);
  border-radius: 12px;
  text-align: center;
}

.stat.on {
  border-color: rgba(255, 240, 200, 0.5);
}

.stat-num {
  margin: 0;
  font-size: 20px;
  font-variant-numeric: tabular-nums;
  color: #ffe9b8;
}

.stat-label {
  margin: 4px 0 0;
  font-size: 11px;
  opacity: 0.55;
}

.detail {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-title {
  margin: 2px 0;
  font-size: 12px;
  letter-spacing: 3px;
  opacity: 0.5;
}

.detail-row {
  margin: 0;
  padding: 10px 12px;
  background: rgba(205, 214, 232, 0.04);
  border: 1px solid rgba(205, 214, 232, 0.1);
  border-radius: 10px;
  font-size: 13px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-card {
  padding: 10px 12px;
  background: rgba(205, 214, 232, 0.04);
  border: 1px solid rgba(205, 214, 232, 0.1);
  border-radius: 10px;
}

.detail-text {
  margin: 0;
  font-size: 13px;
  opacity: 0.85;
  line-height: 1.6;
}

.detail-meta {
  margin: 6px 0 0;
  font-size: 11px;
  opacity: 0.45;
}

.detail-img {
  max-width: 100%;
  border-radius: 8px;
  display: block;
}

audio {
  width: 100%;
}
</style>
