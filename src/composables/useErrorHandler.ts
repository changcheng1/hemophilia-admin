import { useNotificationStore } from '@/stores/notification'
import type { Ref } from 'vue'
import { ref } from 'vue'

export interface UseErrorHandlerOptions {
  showLoading?: boolean
  showSuccess?: boolean
  defaultSuccessMessage?: string
  context?: string
}

export interface UseErrorHandlerReturn {
  loading: Ref<boolean>
  error: Ref<string | null>
  execute: <T>(
    operation: () => Promise<T>,
    options?: {
      successMessage?: string
      loadingMessage?: string
      showLoading?: boolean
      showSuccess?: boolean
    }
  ) => Promise<T | null>
  handleError: (error: any, context?: string) => Promise<boolean>
  clearError: () => void
  retry: <T>(operation: () => Promise<T>) => Promise<T | null>
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}): UseErrorHandlerReturn {
  const notificationStore = useNotificationStore()
  
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  const {
    showLoading = true,
    showSuccess = true,
    defaultSuccessMessage = '操作成功',
    context = 'operation'
  } = options

  const execute = async <T>(
    operation: () => Promise<T>,
    executeOptions?: {
      successMessage?: string
      loadingMessage?: string
      showLoading?: boolean
      showSuccess?: boolean
    }
  ): Promise<T | null> => {
    const {
      successMessage = defaultSuccessMessage,
      loadingMessage = '处理中...',
      showLoading: shouldShowLoading = showLoading,
      showSuccess: shouldShowSuccess = showSuccess
    } = executeOptions || {}

    try {
      error.value = null
      
      if (shouldShowLoading) {
        loading.value = true
      }

      const result = await operation()

      if (shouldShowSuccess && successMessage) {
        notificationStore.showSuccess(successMessage)
      }

      return result
    } catch (err) {
      error.value = notificationStore.getErrorMessage(err)
      
      const success = await notificationStore.handleError(err, context, () => operation())
      
      if (success) {
        error.value = null
        if (shouldShowSuccess && successMessage) {
          notificationStore.showSuccess(successMessage)
        }
        return await operation()
      }
      
      return null
    } finally {
      if (shouldShowLoading) {
        loading.value = false
      }
    }
  }

  const handleError = async (err: any, errorContext?: string): Promise<boolean> => {
    error.value = notificationStore.getErrorMessage(err)
    return await notificationStore.handleError(err, errorContext || context)
  }

  const clearError = () => {
    error.value = null
    notificationStore.clearRetryCount(context)
  }

  const retry = async <T>(operation: () => Promise<T>): Promise<T | null> => {
    return await execute(operation, { showSuccess: false })
  }

  return {
    loading,
    error,
    execute,
    handleError,
    clearError,
    retry
  }
}

// Specialized composables for common operations
export function useFormHandler(formName: string = 'form') {
  return useErrorHandler({
    context: `${formName}-submission`,
    defaultSuccessMessage: '保存成功',
    showLoading: true,
    showSuccess: true
  })
}

export function useDataLoader(resourceName: string = 'data') {
  return useErrorHandler({
    context: `${resourceName}-loading`,
    showLoading: false, // Usually handled by component-level loading
    showSuccess: false
  })
}

export function useApiCall(apiName: string = 'api') {
  return useErrorHandler({
    context: `${apiName}-call`,
    defaultSuccessMessage: '操作完成',
    showLoading: true,
    showSuccess: true
  })
}