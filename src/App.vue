<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import MainLayout from '@/components/MainLayout.vue'
import GlobalErrorHandler from '@/components/GlobalErrorHandler.vue'
import LoadingOverlay from '@/components/LoadingOverlay.vue'

const route = useRoute()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const isAuthPage = computed(() => 
  route.name === 'Login' || 
  route.name === 'ForgotPassword' || 
  (import.meta.env.DEV && route.name === 'ApiTest')
)

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

    <!-- Show auth pages (login/forgot password) without layout -->
    <RouterView v-if="isAuthPage" />

    <!-- Show main layout for authenticated pages -->
    <MainLayout v-else>
      <RouterView />
    </MainLayout>
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
