<script setup lang="ts">
// 片头动画：几颗星依次点亮，随后淡出进入星空。总时长约 2.4s。
const dots = [
  { x: 38, y: 40, delay: 0.1, size: 3 },
  { x: 62, y: 30, delay: 0.4, size: 2.5 },
  { x: 50, y: 55, delay: 0.75, size: 4 },
  { x: 30, y: 24, delay: 1.05, size: 2.5 },
  { x: 70, y: 60, delay: 1.35, size: 3.5 },
  { x: 44, y: 16, delay: 1.6, size: 2 },
]
</script>

<template>
  <div class="splash">
    <div class="stars">
      <span
        v-for="(d, i) in dots"
        :key="i"
        class="dot"
        :style="{
          left: d.x + '%',
          top: d.y + '%',
          width: d.size + 'px',
          height: d.size + 'px',
          animationDelay: d.delay + 's',
        }"
      />
    </div>
    <p class="title">流浪星球</p>
  </div>
</template>

<style scoped>
.splash {
  position: fixed;
  inset: 0;
  z-index: 30;
  background: #02030a;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeout 0.5s ease 1.9s both;
}

.stars {
  position: absolute;
  inset: 0;
}

.dot {
  position: absolute;
  border-radius: 50%;
  background: #fff6dd;
  opacity: 0;
  animation: lightup 0.8s ease-out both;
}

@keyframes lightup {
  0% {
    opacity: 0;
    transform: scale(0.3);
    box-shadow: 0 0 0 0 rgba(255, 240, 200, 0);
  }
  40% {
    opacity: 1;
    transform: scale(1.2);
    box-shadow: 0 0 14px 6px rgba(255, 240, 200, 0.55);
  }
  100% {
    opacity: 1;
    transform: scale(1);
    box-shadow: 0 0 8px 3px rgba(255, 240, 200, 0.4);
  }
}

.title {
  font-size: 17px;
  letter-spacing: 8px;
  opacity: 0;
  color: #cdd6e8;
  animation: titlein 0.8s ease 1.15s both;
}

@keyframes titlein {
  from {
    opacity: 0;
    letter-spacing: 14px;
  }
  to {
    opacity: 0.85;
    letter-spacing: 8px;
  }
}

@keyframes fadeout {
  to {
    opacity: 0;
    visibility: hidden;
  }
}
</style>
