<script setup lang="ts">
// 星座回顾面板：完成点亮后，介绍星座 + 回看使用者在这里留下的一切。
import type { Constellation } from '../../core/constellations'
import type { StarEntry } from '../../core/models'
import { formatMs } from '../format'

defineProps<{
  constellation: Constellation
  stats: {
    orbitCount: number
    totalMs: number
    texts: StarEntry[]
    voiceCount: number
    imageCount: number
  }
}>()
const emit = defineEmits<{ close: [] }>()
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
        <div class="stat">
          <p class="stat-num">{{ stats.orbitCount }}</p>
          <p class="stat-label">点亮次数</p>
        </div>
        <div class="stat">
          <p class="stat-num">{{ formatMs(stats.totalMs) }}</p>
          <p class="stat-label">总在轨时长</p>
        </div>
        <div class="stat">
          <p class="stat-num">{{ stats.texts.length }}</p>
          <p class="stat-label">写下的文字</p>
        </div>
        <div class="stat">
          <p class="stat-num">{{ stats.voiceCount }}</p>
          <p class="stat-label">录入的语音</p>
        </div>
        <div class="stat">
          <p class="stat-num">{{ stats.imageCount }}</p>
          <p class="stat-label">上传的照片</p>
        </div>
      </div>

      <div v-if="stats.texts.length" class="texts">
        <p class="texts-title">你写下的</p>
        <p v-for="(t, i) in stats.texts" :key="i" class="text-item">{{ t.text }}</p>
      </div>
      <p v-else class="hint">这个星座还没有留下文字</p>
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

.texts-title {
  margin: 0 0 6px;
  font-size: 12px;
  opacity: 0.5;
}

.text-item {
  margin: 0;
  padding: 10px 12px;
  background: rgba(205, 214, 232, 0.04);
  border: 1px solid rgba(205, 214, 232, 0.1);
  border-radius: 10px;
  font-size: 13px;
  opacity: 0.85;
  line-height: 1.6;
}

.texts {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
</style>
