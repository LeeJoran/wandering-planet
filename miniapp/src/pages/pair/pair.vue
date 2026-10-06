<script setup lang="ts">
// 共赴页：占位（信标/成员/星座逻辑在后续迭代从 H5 版搬过来）
function back() {
  uni.navigateBack()
}
</script>

<template>
  <view class="screen">
    <view class="symbol">✦</view>
    <view class="msg">共赴正在搬进小程序…</view>
    <view class="sub">信标、多人共赴与 20 座共同点亮的星座，即将到达</view>
    <button class="btn" @click="back">返回星空</button>
  </view>
</template>

<style scoped>
.screen {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background: #05070f;
  padding: 40px;
  box-sizing: border-box;
}

.symbol {
  font-size: 40px;
  color: #ffe9b8;
}

.msg {
  font-size: 16px;
  letter-spacing: 3px;
  color: #ffe9b8;
}

.sub {
  font-size: 12px;
  opacity: 0.5;
  letter-spacing: 2px;
  text-align: center;
}

.btn {
  margin-top: 20px;
  padding: 10px 26px;
  border: 1px solid rgba(205, 214, 232, 0.25);
  border-radius: 999px;
  background: rgba(10, 15, 30, 0.7);
  color: #e8ecf5;
  font-size: 14px;
  letter-spacing: 2px;
  line-height: 1.4;
}

.btn::after {
  border: none;
}
</style>
