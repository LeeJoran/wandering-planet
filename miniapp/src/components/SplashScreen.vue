<script setup lang="ts">
// 片头：6 颗星依次点亮 + 标题，约 2.4 秒（与 H5 版同款节奏）。
const stars = [
  { left: 18, top: 34, delay: 0.1 },
  { left: 82, top: 22, delay: 0.35 },
  { left: 70, top: 62, delay: 0.6 },
  { left: 30, top: 70, delay: 0.85 },
  { left: 50, top: 44, delay: 1.1 },
  { left: 88, top: 48, delay: 1.35 },
]
</script>

<template>
  <view class="splash">
    <view class="stars">
      <view
        v-for="(s, i) in stars"
        :key="i"
        class="star"
        :style="{ left: s.left + '%', top: s.top + '%', animationDelay: s.delay + 's' }"
      ></view>
    </view>
    <view class="title">
      <text class="t1">流浪星球</text>
      <text class="t2">把一起度过的时间，变成看得见的星</text>
    </view>
  </view>
</template>

<style scoped>
.splash {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #05070f;
}

.stars {
  position: absolute;
  inset: 0;
}

.star {
  position: absolute;
  width: 5px;
  height: 5px;
  margin: -2.5px 0 0 -2.5px;
  border-radius: 50%;
  background: #ffe9b8;
  box-shadow: 0 0 12px 4px rgba(255, 233, 184, 0.6);
  animation: lightup 0.7s ease-out both;
}

.title {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  animation: fadein 1.2s 1.4s ease-out both;
}

.t1 {
  font-size: 30px;
  letter-spacing: 12px;
  color: #ffe9b8;
}

.t2 {
  font-size: 12px;
  letter-spacing: 3px;
  opacity: 0.55;
}

@keyframes lightup {
  from {
    transform: scale(0);
    opacity: 0;
  }
  60% {
    transform: scale(1.6);
    opacity: 1;
  }
  to {
    transform: scale(1);
    opacity: 0.9;
  }
}

@keyframes fadein {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
</style>
