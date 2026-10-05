<script setup lang="ts">
// 深空背景：静态星点 + 微光呼吸。刻意保持朴素，不做精细动画。
const dots = Array.from({ length: 70 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2 + 1,
  delay: Math.random() * 4,
  duration: Math.random() * 4 + 3,
}))
</script>

<template>
  <div class="starfield" aria-hidden="true">
    <span
      v-for="d in dots"
      :key="d.id"
      class="dust"
      :style="{
        left: d.x + '%',
        top: d.y + '%',
        width: d.size + 'px',
        height: d.size + 'px',
        animationDelay: d.delay + 's',
        animationDuration: d.duration + 's',
      }"
    />
  </div>
</template>

<style scoped>
.starfield {
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  animation: drift 90s ease-in-out infinite alternate;
}

@keyframes drift {
  from {
    transform: translate(0, 0);
  }
  to {
    transform: translate(-14px, 8px);
  }
}

.dust {
  position: absolute;
  border-radius: 50%;
  background: #cdd8f0;
  opacity: 0.5;
  animation: twinkle 4s ease-in-out infinite;
}

@keyframes twinkle {
  0%,
  100% {
    opacity: 0.15;
  }
  50% {
    opacity: 0.7;
  }
}
</style>
