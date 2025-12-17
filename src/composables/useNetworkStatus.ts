import { ref, onMounted, onUnmounted } from 'vue'
import { useNotificationStore } from '@/stores/notification'

export function useNetworkStatus() {
  const isOnline = ref(navigator.onLine)
  const notificationStore = useNotificationStore()
  
  let offlineNotificationShown = false

  const handleOnline = () => {
    isOnline.value = true
    if (offlineNotificationShown) {
      notificationStore.showSuccess('网络连接已恢复')
      offlineNotificationShown = false
    }
  }

  const handleOffline = () => {
    isOnline.value = false
    notificationStore.showWarning('网络连接已断开，请检查网络设置', '网络异常')
    offlineNotificationShown = true
  }

  onMounted(() => {
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
  })

  onUnmounted(() => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  })

  return {
    isOnline
  }
}