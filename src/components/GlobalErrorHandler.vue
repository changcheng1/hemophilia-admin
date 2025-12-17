<template>
  <div class="global-error-handler">
    <!-- This component handles global errors but doesn't render visible content -->
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useNotificationStore } from '@/stores/notification'

const notificationStore = useNotificationStore()

// Global error handler for unhandled promise rejections
const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
  console.error('Unhandled promise rejection:', event.reason)
  
  // Prevent default browser error handling
  event.preventDefault()
  
  // Handle the error through our notification system
  notificationStore.handleError(
    event.reason,
    'unhandled-promise',
    undefined
  )
}

// Global error handler for JavaScript errors
const handleError = (event: ErrorEvent) => {
  console.error('Global JavaScript error:', event.error)
  
  // Handle the error through our notification system
  notificationStore.handleError(
    event.error || event.message,
    'javascript-error',
    undefined
  )
}

// Global error handler for resource loading errors
const handleResourceError = (event: Event) => {
  const target = event.target as HTMLElement
  console.error('Resource loading error:', target)
  
  // Only show notification for critical resources
  if (target.tagName === 'SCRIPT' || target.tagName === 'LINK') {
    notificationStore.showError('资源加载失败，请刷新页面重试')
  }
}

onMounted(() => {
  // Register global error handlers
  window.addEventListener('unhandledrejection', handleUnhandledRejection)
  window.addEventListener('error', handleError)
  window.addEventListener('error', handleResourceError, true) // Use capture phase for resource errors
})

onUnmounted(() => {
  // Clean up event listeners
  window.removeEventListener('unhandledrejection', handleUnhandledRejection)
  window.removeEventListener('error', handleError)
  window.removeEventListener('error', handleResourceError, true)
})
</script>

<style scoped>
.global-error-handler {
  /* This component doesn't render visible content, just handles global errors */
}
</style>