<template>
  <transition name="success-fade">
    <div v-if="visible" class="success-feedback" @click="handleClick">
      <div class="success-content">
        <el-icon class="success-icon" :size="iconSize">
          <Check />
        </el-icon>
        <p class="success-text">{{ message }}</p>
        <p v-if="subMessage" class="success-sub-text">{{ subMessage }}</p>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { Check } from '@element-plus/icons-vue'
import { onMounted } from 'vue'

interface Props {
  visible: boolean
  message: string
  subMessage?: string
  duration?: number
  iconSize?: number
  autoClose?: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'click'): void
}

const props = withDefaults(defineProps<Props>(), {
  duration: 2000,
  iconSize: 48,
  autoClose: true
})

const emit = defineEmits<Emits>()

const handleClick = () => {
  emit('click')
  emit('close')
}

onMounted(() => {
  if (props.autoClose && props.visible) {
    setTimeout(() => {
      emit('close')
    }, props.duration)
  }
})
</script>

<style scoped>
.success-feedback {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 8px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  z-index: 3000;
  cursor: pointer;
  min-width: 200px;
  text-align: center;
}

.success-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.success-icon {
  color: var(--el-color-success);
  animation: success-bounce 0.6s ease-out;
}

.success-text {
  color: var(--el-text-color-primary);
  font-size: 16px;
  font-weight: 500;
  margin: 0;
}

.success-sub-text {
  color: var(--el-text-color-regular);
  font-size: 14px;
  margin: 0;
}

@keyframes success-bounce {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.success-fade-enter-active {
  transition: all 0.3s ease-out;
}

.success-fade-leave-active {
  transition: all 0.2s ease-in;
}

.success-fade-enter-from {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.8);
}

.success-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.9);
}
</style>