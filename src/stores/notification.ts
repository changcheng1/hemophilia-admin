import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ElMessage, ElNotification, ElMessageBox } from 'element-plus'

export interface NotificationOptions {
  title?: string
  message: string
  type?: 'success' | 'warning' | 'info' | 'error'
  duration?: number
  showClose?: boolean
}

export interface ErrorRecoveryStrategy {
  retry: boolean
  maxRetries: number
  fallbackAction?: () => void
  userNotification: string
}

export const useNotificationStore = defineStore('notification', () => {
  // State
  const loading = ref(false)
  const loadingText = ref('加载中...')
  const retryCount = ref(new Map<string, number>())

  // Error recovery strategies
  const errorStrategies: Record<string, ErrorRecoveryStrategy> = {
    NETWORK_ERROR: {
      retry: true,
      maxRetries: 3,
      userNotification: '网络连接异常，正在重试...'
    },
    AUTH_ERROR: {
      retry: false,
      maxRetries: 0,
      fallbackAction: () => {
        localStorage.removeItem('admin_token')
        window.location.href = '/login'
      },
      userNotification: '登录已过期，请重新登录'
    },
    PERMISSION_ERROR: {
      retry: false,
      maxRetries: 0,
      userNotification: '权限不足，无法执行此操作'
    },
    SERVER_ERROR: {
      retry: true,
      maxRetries: 2,
      userNotification: '服务器异常，正在重试...'
    },
    VALIDATION_ERROR: {
      retry: false,
      maxRetries: 0,
      userNotification: '数据验证失败，请检查输入'
    }
  }

  // Actions
  const showMessage = (options: NotificationOptions) => {
    ElMessage({
      message: options.message,
      type: options.type || 'info',
      duration: options.duration || 3000,
      showClose: options.showClose || false
    })
  }

  const showNotification = (options: NotificationOptions) => {
    ElNotification({
      title: options.title || '系统通知',
      message: options.message,
      type: options.type || 'info',
      duration: options.duration || 4500,
      showClose: options.showClose !== false
    })
  }

  const showSuccess = (message: string, title?: string) => {
    if (title) {
      showNotification({
        title,
        message,
        type: 'success'
      })
    } else {
      showMessage({
        message,
        type: 'success'
      })
    }
  }

  const showError = (message: string, title?: string) => {
    if (title) {
      showNotification({
        title,
        message,
        type: 'error',
        duration: 6000
      })
    } else {
      showMessage({
        message,
        type: 'error',
        duration: 5000
      })
    }
  }

  const showWarning = (message: string, title?: string) => {
    if (title) {
      showNotification({
        title,
        message,
        type: 'warning'
      })
    } else {
      showMessage({
        message,
        type: 'warning'
      })
    }
  }

  const showInfo = (message: string, title?: string) => {
    if (title) {
      showNotification({
        title,
        message,
        type: 'info'
      })
    } else {
      showMessage({
        message,
        type: 'info'
      })
    }
  }

  const showConfirm = async (
    message: string,
    title: string = '确认操作',
    options?: {
      confirmButtonText?: string
      cancelButtonText?: string
      type?: 'warning' | 'info' | 'success' | 'error'
    }
  ): Promise<boolean> => {
    try {
      await ElMessageBox.confirm(message, title, {
        confirmButtonText: options?.confirmButtonText || '确定',
        cancelButtonText: options?.cancelButtonText || '取消',
        type: options?.type || 'warning'
      })
      return true
    } catch {
      return false
    }
  }

  const setLoading = (isLoading: boolean, text?: string) => {
    loading.value = isLoading
    if (text) {
      loadingText.value = text
    }
  }

  const handleError = async (
    error: any,
    context: string,
    retryCallback?: () => Promise<any>
  ): Promise<boolean> => {
    const errorType = getErrorType(error)
    const strategy = errorStrategies[errorType]
    
    if (!strategy) {
      console.error(`No error strategy found for type: ${errorType}`)
      showError('系统异常，请稍后重试')
      return false
    }
    
    const currentRetryCount = retryCount.value.get(context) || 0

    console.error(`Error in ${context}:`, error)

    if (strategy.retry && currentRetryCount < strategy.maxRetries && retryCallback) {
      retryCount.value.set(context, currentRetryCount + 1)
      
      showWarning(
        `${strategy.userNotification} (${currentRetryCount + 1}/${strategy.maxRetries})`
      )

      // Wait before retry with exponential backoff
      const delay = Math.min(1000 * Math.pow(2, currentRetryCount), 10000)
      await new Promise(resolve => setTimeout(resolve, delay))

      try {
        await retryCallback()
        retryCount.value.delete(context) // Clear retry count on success
        
        // Show success message after successful retry
        if (currentRetryCount > 0) {
          showSuccess('操作已成功完成')
        }
        
        return true
      } catch (retryError) {
        return await handleError(retryError, context, retryCallback)
      }
    } else {
      // Max retries reached or no retry strategy
      retryCount.value.delete(context)
      
      if (strategy.fallbackAction) {
        strategy.fallbackAction()
      }

      const errorMessage = getErrorMessage(error) || strategy.userNotification
      showError(errorMessage)
      
      return false
    }
  }

  const handleAsyncOperation = async <T>(
    operation: () => Promise<T>,
    context: string,
    options?: {
      successMessage?: string
      loadingMessage?: string
      showLoading?: boolean
      showSuccessMessage?: boolean
    }
  ): Promise<T | null> => {
    const {
      successMessage = '操作成功',
      loadingMessage = '处理中...',
      showLoading = true,
      showSuccessMessage = true
    } = options || {}

    try {
      if (showLoading) {
        setLoading(true, loadingMessage)
      }

      const result = await operation()

      if (showSuccessMessage && successMessage) {
        showSuccess(successMessage)
      }

      return result
    } catch (error) {
      const success = await handleError(error, context, operation)
      
      return success ? await operation() : null
    } finally {
      if (showLoading) {
        setLoading(false)
      }
    }
  }

  const getErrorType = (error: any): string => {
    if (error?.response) {
      const status = error.response.status
      switch (status) {
        case 401:
          return 'AUTH_ERROR'
        case 403:
          return 'PERMISSION_ERROR'
        case 422:
          return 'VALIDATION_ERROR'
        case 500:
        case 502:
        case 503:
          return 'SERVER_ERROR'
        default:
          return 'SERVER_ERROR'
      }
    } else if (error?.request || error?.code === 'NETWORK_ERROR') {
      return 'NETWORK_ERROR'
    } else {
      return 'SERVER_ERROR'
    }
  }

  const getErrorMessage = (error: any): string => {
    if (error?.response?.data?.message) {
      return error.response.data.message
    } else if (error?.message) {
      return error.message
    } else if (typeof error === 'string') {
      return error
    } else {
      return '操作失败，请稍后重试'
    }
  }

  const clearRetryCount = (context?: string) => {
    if (context) {
      retryCount.value.delete(context)
    } else {
      retryCount.value.clear()
    }
  }

  return {
    // State
    loading,
    loadingText,

    // Actions
    showMessage,
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
    setLoading,
    handleError,
    handleAsyncOperation,
    clearRetryCount,
    getErrorMessage,
    getErrorType
  }
})