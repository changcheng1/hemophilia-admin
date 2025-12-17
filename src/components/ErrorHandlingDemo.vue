<template>
  <el-card class="error-demo" header="错误处理演示">
    <div class="demo-section">
      <h4>网络状态</h4>
      <el-tag :type="isOnline ? 'success' : 'danger'">
        {{ isOnline ? '在线' : '离线' }}
      </el-tag>
    </div>

    <div class="demo-section">
      <h4>错误处理测试</h4>
      <el-space wrap>
        <el-button @click="testNetworkError" :loading="networkLoading">
          测试网络错误
        </el-button>
        <el-button @click="testValidationError" :loading="validationLoading">
          测试验证错误
        </el-button>
        <el-button @click="testSuccessOperation" :loading="successLoading">
          测试成功操作
        </el-button>
        <el-button @click="testRetryOperation" :loading="retryLoading">
          测试重试机制
        </el-button>
      </el-space>
    </div>

    <div v-if="error" class="demo-section">
      <h4>错误信息</h4>
      <el-alert :title="error" type="error" show-icon />
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useErrorHandler } from '@/composables/useErrorHandler'
import { useNetworkStatus } from '@/composables/useNetworkStatus'

const { isOnline } = useNetworkStatus()
const { execute, error } = useErrorHandler({
  context: 'error-demo',
  showLoading: false
})

const networkLoading = ref(false)
const validationLoading = ref(false)
const successLoading = ref(false)
const retryLoading = ref(false)

const testNetworkError = async () => {
  networkLoading.value = true
  try {
    await execute(async () => {
      // Simulate network error
      const error = new Error('Network connection failed')
      error.name = 'NetworkError'
      throw error
    }, {
      successMessage: '网络操作成功',
      loadingMessage: '测试网络错误...'
    })
  } finally {
    networkLoading.value = false
  }
}

const testValidationError = async () => {
  validationLoading.value = true
  try {
    await execute(async () => {
      // Simulate validation error
      const error = new Error('Validation failed: Invalid input data')
      ;(error as any).response = { status: 422, data: { message: '输入数据格式不正确' } }
      throw error
    }, {
      successMessage: '验证成功',
      loadingMessage: '测试验证错误...'
    })
  } finally {
    validationLoading.value = false
  }
}

const testSuccessOperation = async () => {
  successLoading.value = true
  try {
    await execute(async () => {
      // Simulate successful operation
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { success: true, message: '操作完成' }
    }, {
      successMessage: '操作成功完成！',
      loadingMessage: '正在处理...'
    })
  } finally {
    successLoading.value = false
  }
}

const testRetryOperation = async () => {
  retryLoading.value = true
  let attemptCount = 0
  
  try {
    await execute(async () => {
      attemptCount++
      if (attemptCount < 3) {
        // Fail first 2 attempts
        const error = new Error('Temporary server error')
        ;(error as any).response = { status: 500 }
        throw error
      }
      // Succeed on 3rd attempt
      return { success: true, attempt: attemptCount }
    }, {
      successMessage: `重试成功！(第${attemptCount}次尝试)`,
      loadingMessage: '测试重试机制...'
    })
  } finally {
    retryLoading.value = false
  }
}
</script>

<style scoped>
.error-demo {
  margin: 20px 0;
}

.demo-section {
  margin-bottom: 20px;
}

.demo-section h4 {
  margin: 0 0 10px 0;
  color: #303133;
}
</style>