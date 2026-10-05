<script setup lang="ts">
// 信标：被邀请方打开链接时看到的那束光。
defineProps<{ code: string; busy: boolean; error: string }>()
const emit = defineEmits<{ accept: []; dismiss: [] }>()
</script>

<template>
  <div class="backdrop">
    <div class="panel">
      <div class="beacon">
        <span class="ray"></span>
      </div>
      <h2 class="title">远处有一束光，正朝你亮起</h2>
      <p class="intro">有人为你点亮了一座信标，想与你共赴一片天空。循光而来，双星将在你们两人的天空同时亮起。</p>
      <p class="code">信标 · {{ code }}</p>
      <button class="btn" :disabled="busy" @click="emit('accept')">
        {{ busy ? '循光而来…' : '循光而来' }}
      </button>
      <button class="link-btn" @click="emit('dismiss')">稍后再说</button>
      <p v-if="error" class="hint error">{{ error }}</p>
    </div>
  </div>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(2, 3, 10, 0.85);
}

.panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  text-align: center;
}

.beacon {
  position: relative;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ray {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #ffe9b8;
  box-shadow: 0 0 24px 10px rgba(255, 233, 184, 0.5);
  animation: pulse 2.2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 0 24px 10px rgba(255, 233, 184, 0.5);
  }
  50% {
    transform: scale(1.35);
    box-shadow: 0 0 40px 18px rgba(255, 233, 184, 0.7);
  }
}

.title {
  margin: 0;
  font-weight: 400;
  letter-spacing: 3px;
  font-size: 17px;
  color: #ffe9b8;
}

.intro {
  margin: 0;
  max-width: 280px;
  font-size: 13px;
  opacity: 0.75;
  line-height: 1.8;
}

.code {
  margin: 0;
  font-size: 13px;
  letter-spacing: 3px;
  opacity: 0.5;
  font-variant-numeric: tabular-nums;
}

.link-btn {
  font-size: 12px;
  opacity: 0.5;
}

.error {
  color: #e8a0a0;
  margin: 0;
}
</style>
