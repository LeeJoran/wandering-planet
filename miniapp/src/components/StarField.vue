<script setup lang="ts">
// 背景星尘：固定 70 颗微星缓慢漂移（位置一次性生成，避免重渲染闪动）。
interface Dust {
  left: number
  top: number
  size: number
  delay: number
  dur: number
}

const dust: Dust[] = []
let seed = 42
const rand = () => {
  seed = (seed * 9301 + 49297) % 233280
  return seed / 233280
}
for (let i = 0; i < 70; i++) {
  dust.push({
    left: rand() * 100,
    top: rand() * 100,
    size: 1 + rand() * 1.6,
    delay: rand() * 8,
    dur: 20 + rand() * 70,
  })
}
</script>

<template>
  <view class="starfield">
    <view
      v-for="(d, i) in dust"
      :key="i"
      class="dust"
      :style="{
        left: d.left + '%',
        top: d.top + '%',
        width: d.size + 'px',
        height: d.size + 'px',
        animationDelay: -d.delay + 's',
        animationDuration: d.dur + 's',
      }"
    ></view>
  </view>
</template>

<style scoped>
.starfield {
  position: fixed;
  inset: 0;
  pointer-events: none;
}

.dust {
  position: absolute;
  border-radius: 50%;
  background: rgba(205, 214, 232, 0.6);
  animation: drift linear infinite;
}

@keyframes drift {
  0% {
    transform: translate(0, 0);
    opacity: 0.5;
  }
  50% {
    transform: translate(6px, -10px);
    opacity: 1;
  }
  100% {
    transform: translate(-4px, 4px);
    opacity: 0.5;
  }
}
</style>
