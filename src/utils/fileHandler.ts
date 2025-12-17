import { useNotificationStore } from '@/stores/notification'

export interface FileValidationOptions {
  maxSize?: number // in bytes
  allowedTypes?: string[]
  allowedExtensions?: string[]
}

export interface FileHandlerResult<T = any> {
  success: boolean
  data?: T
  error?: string
}

export class FileHandler {
  private notificationStore = useNotificationStore()

  /**
   * Validate file against specified criteria
   */
  validateFile(file: File, options: FileValidationOptions = {}): FileHandlerResult<File> {
    const {
      maxSize = 10 * 1024 * 1024, // 10MB default
      allowedTypes = [],
      allowedExtensions = []
    } = options

    try {
      // Check file size
      if (file.size > maxSize) {
        const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1)
        const error = `文件大小不能超过 ${maxSizeMB}MB`
        this.notificationStore.showError(error)
        return { success: false, error }
      }

      // Check file type
      if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
        const error = `不支持的文件类型，请选择: ${allowedTypes.join(', ')}`
        this.notificationStore.showError(error)
        return { success: false, error }
      }

      // Check file extension
      if (allowedExtensions.length > 0) {
        const extension = file.name.split('.').pop()?.toLowerCase()
        if (!extension || !allowedExtensions.includes(extension)) {
          const error = `不支持的文件格式，请选择: ${allowedExtensions.join(', ')}`
          this.notificationStore.showError(error)
          return { success: false, error }
        }
      }

      return { success: true, data: file }
    } catch (error) {
      const errorMessage = '文件验证失败'
      this.notificationStore.showError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  /**
   * Read file as text with error handling
   */
  async readAsText(file: File): Promise<FileHandlerResult<string>> {
    try {
      return new Promise((resolve) => {
        const reader = new FileReader()
        
        reader.onload = (e) => {
          const result = e.target?.result as string
          resolve({ success: true, data: result })
        }
        
        reader.onerror = () => {
          const error = '文件读取失败'
          this.notificationStore.showError(error)
          resolve({ success: false, error })
        }
        
        reader.readAsText(file)
      })
    } catch (error) {
      const errorMessage = '文件读取异常'
      this.notificationStore.showError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  /**
   * Read file as data URL with error handling
   */
  async readAsDataURL(file: File): Promise<FileHandlerResult<string>> {
    try {
      return new Promise((resolve) => {
        const reader = new FileReader()
        
        reader.onload = (e) => {
          const result = e.target?.result as string
          resolve({ success: true, data: result })
        }
        
        reader.onerror = () => {
          const error = '文件读取失败'
          this.notificationStore.showError(error)
          resolve({ success: false, error })
        }
        
        reader.readAsDataURL(file)
      })
    } catch (error) {
      const errorMessage = '文件读取异常'
      this.notificationStore.showError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  /**
   * Download file with error handling
   */
  async downloadFile(url: string, filename?: string): Promise<FileHandlerResult<void>> {
    try {
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename || 'download'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Clean up
      window.URL.revokeObjectURL(downloadUrl)
      
      this.notificationStore.showSuccess('文件下载成功')
      return { success: true }
    } catch (error) {
      const errorMessage = '文件下载失败'
      this.notificationStore.showError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  /**
   * Create and download text file
   */
  downloadTextFile(content: string, filename: string, mimeType: string = 'text/plain'): FileHandlerResult<void> {
    try {
      const blob = new Blob([content], { type: mimeType })
      const url = window.URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Clean up
      window.URL.revokeObjectURL(url)
      
      this.notificationStore.showSuccess('文件导出成功')
      return { success: true }
    } catch (error) {
      const errorMessage = '文件导出失败'
      this.notificationStore.showError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }
}

// Export singleton instance
export const fileHandler = new FileHandler()

// Export composable for use in components
export function useFileHandler() {
  return fileHandler
}