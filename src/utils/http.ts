import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios'
import { useNotificationStore } from '@/stores/notification'

// Extend Axios config to include metadata
declare module 'axios' {
  interface InternalAxiosRequestConfig {
    metadata?: {
      startTime: number
    }
    _retry?: boolean
    'X-Retry-Request'?: boolean
  }
}

// Create axios instance
const http: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://8.147.63.4:3001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request counter for loading state management
let activeRequests = 0

// Request interceptor
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add auth token if available
    const token = localStorage.getItem('admin_token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Add request timestamp for debugging
    config.metadata = {
      startTime: Date.now()
    }

    // Add request ID for tracking
    config.headers['X-Request-ID'] = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Show loading for non-background requests
    if (!config.headers?.['X-Background-Request']) {
      activeRequests++
      if (activeRequests === 1) {
        const notificationStore = useNotificationStore()
        notificationStore.setLoading(true)
      }
    }

    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, {
        headers: config.headers,
        data: config.data,
        params: config.params
      })
    }

    return config
  },
  (error) => {
    activeRequests = Math.max(0, activeRequests - 1)
    if (activeRequests === 0) {
      const notificationStore = useNotificationStore()
      notificationStore.setLoading(false)
    }
    return Promise.reject(error)
  },
)

// Response interceptor
http.interceptors.response.use(
  (response: AxiosResponse) => {
    // Calculate request duration
    const duration = Date.now() - (response.config.metadata?.startTime || Date.now())
    
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`, {
        status: response.status,
        data: response.data,
        headers: response.headers
      })
    }

    // Hide loading when request completes
    if (!response.config.headers?.['X-Background-Request']) {
      activeRequests = Math.max(0, activeRequests - 1)
      if (activeRequests === 0) {
        const notificationStore = useNotificationStore()
        notificationStore.setLoading(false)
      }
    }

    // Handle backend unified response format
    if (response.data && typeof response.data === 'object' && 'code' in response.data) {
      // Backend returns: { code: 200, message: "success", data: {...} }
      if (String(response.data.code).startsWith('2')) {
        // Success response - return the actual data
        response.data = response.data.data
      } else {
        // Backend error response - throw error with backend message
        const error = new Error(response.data.message || '请求失败') as any
        error.response = {
          ...response,
          status: response.data.code,
          data: response.data
        }
        return Promise.reject(error)
      }
    }

    // Handle successful responses with specific status codes
    if (response.status === 201) {
      // Resource created successfully
      const notificationStore = useNotificationStore()
      if (!response.config.headers?.['X-Silent-Success']) {
        notificationStore.showSuccess('操作成功完成')
      }
    }

    return response
  },
  async (error) => {
    // Calculate request duration for failed requests
    const duration = Date.now() - (error.config?.metadata?.startTime || Date.now())
    
    // Log error in development
    if (import.meta.env.DEV) {
      console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} (${duration}ms)`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      })
    }

    // Hide loading on error
    if (!error.config?.headers?.['X-Background-Request']) {
      activeRequests = Math.max(0, activeRequests - 1)
      if (activeRequests === 0) {
        const notificationStore = useNotificationStore()
        notificationStore.setLoading(false)
      }
    }

    // Enhanced error handling with notification store
    const notificationStore = useNotificationStore()
    
    // Don't show error messages for requests that will be handled by retry mechanism
    const shouldShowError = !error.config?.['X-Retry-Request']
    
    if (shouldShowError) {
      if (error.response) {
        const { status, data } = error.response

        // Handle backend unified error format
        let errorMessage = error.message
        if (data && typeof data === 'object' && data.message) {
          errorMessage = data.message
        }

        switch (status) {
          case 400:
            error.errorType = 'VALIDATION_ERROR'
            notificationStore.showError(errorMessage || '请求参数错误')
            break
          case 401:
            // Handle authentication errors
            error.errorType = 'AUTH_ERROR'
            notificationStore.showError(errorMessage || '登录已过期，请重新登录')
            // Clear auth state and redirect to login
            localStorage.removeItem('admin_token')
            if (window.location.pathname !== '/login') {
              window.location.href = '/login'
            }
            break
          case 403:
            error.errorType = 'PERMISSION_ERROR'
            notificationStore.showError(errorMessage || '您没有权限执行此操作')
            break
          case 404:
            error.errorType = 'NOT_FOUND_ERROR'
            notificationStore.showError(errorMessage || '请求的资源不存在')
            break
          case 422:
            error.errorType = 'VALIDATION_ERROR'
            // Handle validation errors
            if (data?.errors) {
              const errorMessages = Object.values(data.errors).flat().join(', ')
              notificationStore.showError(`验证失败: ${errorMessages}`)
            } else {
              notificationStore.showError(data?.message || '数据验证失败')
            }
            break
          case 429:
            error.errorType = 'RATE_LIMIT_ERROR'
            notificationStore.showError('请求过于频繁，请稍后再试')
            break
          case 500:
          case 502:
          case 503:
            error.errorType = 'SERVER_ERROR'
            notificationStore.showError('服务器错误，请稍后重试')
            break
          default:
            error.errorType = 'SERVER_ERROR'
            notificationStore.showError(data?.message || '请求失败，请重试')
        }
      } else if (error.request) {
        error.errorType = 'NETWORK_ERROR'
        notificationStore.showError('网络连接失败，请检查网络设置')
      } else {
        error.errorType = 'REQUEST_ERROR'
        notificationStore.showError('请求配置错误')
      }
    }

    // Retry logic for specific error types
    if (error.response?.status >= 500 && !error.config?._retry) {
      error.config._retry = true
      
      // Add retry header
      if (!error.config.headers) {
        error.config.headers = {}
      }
      error.config.headers['X-Retry-Request'] = 'true'
      
      // Wait 1 second before retry
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return http.request(error.config)
    }

    return Promise.reject(error)
  },
)

export default http
