<template>
  <transition name="loading-fade">
    <div v-if="visible" class="loading-overlay" :class="{ 'full-screen': fullScreen }">
      <div class="loading-content">
        <el-icon class="loading-icon" :size="size">
          <Loading />
        </el-icon>
        <p v-if="text" class="loading-text">{{ text }}</p>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { Loading } from '@element-plus/icons-vue'

interface Props {
  visible: boolean
  text?: string
  fullScreen?: boolean
  size?: number
}

withDefaults(defineProps<Props>(), {
  text: '加载中...',
  fullScreen: false,
  size: 40
})
</script>

<style scoped>
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-overlay.full-screen {
  position: fixed;
  z-index: 2000;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.loading-icon {
  animation: rotate 2s linear infinite;
  color: var(--el-color-primary);
}

.loading-text {
  color: var(--el-text-color-regular);
  font-size: 14px;
  margin: 0;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-fade-enter-active,
.loading-fade-leave-active {
  transition: opacity 0.3s ease;
}

.loading-fade-enter-from,
.loading-fade-leave-to {
  opacity: 0;
}
</style>