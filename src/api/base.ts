import http from '@/utils/http'
import type { AxiosResponse, AxiosRequestConfig } from 'axios'

/**
 * Base API service class providing common functionality for all API services
 */
export abstract class BaseAPIService {
  protected baseURL: string

  constructor(baseURL: string = '') {
    this.baseURL = baseURL
  }

  /**
   * Build full URL with base URL
   */
  protected buildURL(endpoint: string): string {
    return this.baseURL ? `${this.baseURL}${endpoint}` : endpoint
  }

  /**
   * Generic GET request
   */
  protected async get<T>(
    endpoint: string, 
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await http.get(this.buildURL(endpoint), config)
      return response.data
    } catch (error) {
      this.handleError(error, 'GET', endpoint)
      throw error
    }
  }

  /**
   * Generic POST request
   */
  protected async post<T>(
    endpoint: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await http.post(this.buildURL(endpoint), data, config)
      return response.data
    } catch (error) {
      this.handleError(error, 'POST', endpoint)
      throw error
    }
  }

  /**
   * Generic PUT request
   */
  protected async put<T>(
    endpoint: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await http.put(this.buildURL(endpoint), data, config)
      return response.data
    } catch (error) {
      this.handleError(error, 'PUT', endpoint)
      throw error
    }
  }

  /**
   * Generic PATCH request
   */
  protected async patch<T>(
    endpoint: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await http.patch(this.buildURL(endpoint), data, config)
      return response.data
    } catch (error) {
      this.handleError(error, 'PATCH', endpoint)
      throw error
    }
  }

  /**
   * Generic DELETE request
   */
  protected async delete<T>(
    endpoint: string, 
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await http.delete(this.buildURL(endpoint), config)
      return response.data
    } catch (error) {
      this.handleError(error, 'DELETE', endpoint)
      throw error
    }
  }

  /**
   * Download file as blob
   */
  protected async downloadFile(
    endpoint: string, 
    config?: AxiosRequestConfig
  ): Promise<Blob> {
    try {
      const response: AxiosResponse<Blob> = await http.get(this.buildURL(endpoint), {
        ...config,
        responseType: 'blob'
      })
      return response.data
    } catch (error) {
      this.handleError(error, 'DOWNLOAD', endpoint)
      throw error
    }
  }

  /**
   * Build query parameters from object
   */
  protected buildQueryParams(params: Record<string, any>): URLSearchParams {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          // Handle array parameters by appending each value with the same key
          value.forEach(item => {
            if (item !== undefined && item !== null && item !== '') {
              searchParams.append(key, String(item))
            }
          })
        } else {
          searchParams.append(key, String(value))
        }
      }
    })
    
    return searchParams
  }

  /**
   * Handle API errors with context
   */
  private handleError(error: any, method: string, endpoint: string): void {
    const context = `${this.constructor.name}.${method} ${endpoint}`
    
    if (error?.response) {
      console.error(`${context} - HTTP ${error.response.status}:`, error.response.data)
    } else if (error?.request) {
      console.error(`${context} - Network error:`, error.message)
    } else {
      console.error(`${context} - Error:`, error.message)
    }
  }

  /**
   * Create background request config (won't show loading indicator)
   */
  protected createBackgroundConfig(config?: AxiosRequestConfig): AxiosRequestConfig {
    return {
      ...config,
      headers: {
        ...config?.headers,
        'X-Background-Request': 'true'
      }
    }
  }

  /**
   * Create retry request config (won't show error notifications)
   */
  protected createRetryConfig(config?: AxiosRequestConfig): AxiosRequestConfig {
    return {
      ...config,
      headers: {
        ...config?.headers,
        'X-Retry-Request': 'true'
      }
    }
  }
}

/**
 * Common response interfaces
 */
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export interface ListQueryParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * API response wrapper for consistent error handling
 */
export interface APIResponse<T = any> {
  success: boolean
  data: T
  message?: string
  errors?: Record<string, string[]>
}

/**
 * Standard error response structure
 */
export interface APIError {
  message: string
  statusCode: number
  error?: string
  details?: any
}