<script setup lang="ts">
import { RouterView, useRoute, useRouter } from 'vue-router'
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import MainLayout from '@/components/MainLayout.vue'
import GlobalErrorHandler from '@/components/GlobalErrorHandler.vue'
import LoadingOverlay from '@/components/LoadingOverlay.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

// 应用是否已准备好渲染
const isAppReady = ref(false)

// 判断是否为认证页面（登录、忘记密码等）
const isAuthPage = computed(() => {
  const path = route.path
  const name = route.name
  
  // 通过路径判断
  if (path === '/login' || path === '/forgot-password') {
    return true
  }
  
  // 通过路由名称判断
  if (name === 'Login' || name === 'ForgotPassword') {
    return true
  }
  
  // 开发环境 API 测试页面
  if (import.meta.env.DEV && (path === '/api-test' || name === 'ApiTest')) {
    return true
  }
  
  return false
})

// 等待路由准备好后再渲染
router.isReady().then(() => {
  isAppReady.value = true
})

onMounted(async () => {
  // Try to get current user if token exists
  if (authStore.token && !authStore.user) {
    try {
      await authStore.getCurrentUser()
    } catch (error) {
      console.error('Failed to get current user:', error)
      // Use the notification store to handle this error properly
      notificationStore.handleError(error, 'app-initialization')
    }
  }
})
</script>

<template>
  <div id="app">
    <!-- Global Error Handler -->
    <GlobalErrorHandler />
    
    <!-- Global Loading Overlay -->
    <LoadingOverlay
      :visible="notificationStore.loading"
      :text="notificationStore.loadingText"
      full-screen
    />

    <!-- 等待路由准备好后再渲染内容 -->
    <template v-if="isAppReady">
      <!-- Show auth pages (login/forgot password) without layout -->
      <RouterView v-if="isAuthPage" />

      <!-- Show main layout for authenticated pages -->
      <MainLayout v-else>
        <RouterView />
      </MainLayout>
    </template>
  </div>
</template>

<style>

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family:
    'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑',
    Arial, sans-serif;
}
</style>
