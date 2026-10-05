<script setup lang="ts">
// 星座目录面板：选星座、看进度（试点三个，后续数据驱动扩展）。
defineProps<{
  rows: {
    id: string
    name: string
    symbol: string
    lit: number
    total: number
    partial: number
    remaining: number
    complete: boolean
  }[]
  selectedId: string
  hint: string
}>()
const emit = defineEmits<{ select: [id: string]; close: [] }>()
</script>

<template>
  <div class="backdrop" @click.self="emit('close')">
    <div class="panel">
      <header>
        <h2 class="title">星座目录</h2>
        <button class="close" @click="emit('close')">收起</button>
      </header>

      <p v-if="hint" class="hint-line">{{ hint }}</p>

      <button
        v-for="r in rows"
        :key="r.id"
        class="row"
        :class="{ active: r.id === selectedId }"
        @click="emit('select', r.id)"
      >
        <span class="symbol">{{ r.symbol }}</span>
        <span class="name">{{ r.name }}</span>
        <span class="progress">{{ r.lit }}/{{ r.total }}</span>
        <span class="status">{{
          r.complete
            ? '全部点亮'
            : (r.partial > 0 ? '点亮中 · ' : '') + '还需约 ' + Math.max(1, Math.ceil(r.remaining / 60)) + ' 分钟'
        }}</span>
      </button>

      <p class="foot">十二星座都在这里，逐颗点亮，直到虚影显现</p>
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

.close {
  font-size: 13px;
  opacity: 0.6;
}

.hint-line {
  margin: 0;
  font-size: 13px;
  color: #e8c890;
}

.row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 14px 16px;
  border: 1px solid rgba(205, 214, 232, 0.12);
  border-radius: 12px;
  background: rgba(205, 214, 232, 0.04);
  text-align: left;
}

.row.active {
  border-color: rgba(255, 240, 200, 0.45);
}

.symbol {
  font-size: 18px;
  width: 24px;
}

.name {
  font-size: 15px;
  letter-spacing: 1px;
}

.progress {
  margin-left: auto;
  font-size: 13px;
  opacity: 0.7;
  font-variant-numeric: tabular-nums;
}

.status {
  font-size: 12px;
  opacity: 0.55;
  min-width: 64px;
  text-align: right;
}

.foot {
  margin: 4px 0 0;
  font-size: 12px;
  opacity: 0.4;
}
</style>
