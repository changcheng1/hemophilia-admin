import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { applicationAPI } from '@/api/application'
import { adminApplicationAPI } from '@/api/admin-application'
import type { 
  ApplicationListItem, 
  Application
} from '@/types/application'
import { 
  ApplicationStatus,
  ReviewAction
} from '@/types/application'
import type { ApplicationListParams } from '@/api/application'
import type { 
  AdminApplicationSearchParams, 
  AdminApplicationListItem
} from '@/api/admin-application'

export const useApplicationStore = defineStore('application', () => {
  // State
  const applications = ref<ApplicationListItem[] | AdminApplicationListItem[]>([])
  const currentApplication = ref<Application | null>(null)
  const loading = ref(false)
  const total = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(10)

  // Getters
  const hasApplications = computed(() => applications.value.length > 0)
  const isLoading = computed(() => loading.value)

  // Actions
  const fetchApplications = async (params: ApplicationListParams = {}) => {
    loading.value = true
    try {
      const response = await applicationAPI.getApplicationList({
        page: currentPage.value,
        limit: pageSize.value,
        ...params
      })
      
      applications.value = response.data
      total.value = response.total
      currentPage.value = response.page
      pageSize.value = response.limit
    } catch (error) {
      ElMessage.error('获取申请列表失败')
      console.error('Failed to fetch applications:', error)
    } finally {
      loading.value = false
    }
  }

  const fetchApplicationDetail = async (id: number) => {
    loading.value = true
    try {
      const application = await applicationAPI.getApplicationDetail(id)
      currentApplication.value = application
      return application
    } catch (error) {
      ElMessage.error('获取申请详情失败')
      console.error('Failed to fetch application detail:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const submitReview = async (id: number, action: ReviewAction, comment: string) => {
    loading.value = true
    try {
      await applicationAPI.reviewApplication(id, { action, comment })
      
      // Update local state
      const index = applications.value.findIndex(app => app.id === id)
      if (index !== -1) {
        const application = applications.value[index]
        if (application) {
          // Update status based on action
          let newStatus: ApplicationStatus
          switch (action) {
            case ReviewAction.APPROVE:
              newStatus = ApplicationStatus.INITIAL_APPROVED
              break
            case ReviewAction.REJECT:
              newStatus = ApplicationStatus.REJECTED
              break
            case ReviewAction.REQUEST_MODIFICATION:
              newStatus = ApplicationStatus.UNDER_REVIEW
              break
            default:
              newStatus = application.status as ApplicationStatus
          }
          Object.assign(application, { status: newStatus })
          application.updatedAt = new Date().toISOString()
        }
      }

      // Update current application if it's the same one
      if (currentApplication.value && currentApplication.value.id === id) {
        const updatedApp = await applicationAPI.getApplicationDetail(id)
        currentApplication.value = updatedApp
      }
    } catch (error) {
      ElMessage.error('审核提交失败')
      console.error('Failed to submit review:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const fetchFinalReviewApplications = async (params: ApplicationListParams = {}) => {
    loading.value = true
    try {
      const response = await applicationAPI.getFinalReviewApplicationList({
        page: currentPage.value,
        limit: pageSize.value,
        ...params
      })
      
      applications.value = response.data
      total.value = response.total
      currentPage.value = response.page
      pageSize.value = response.limit
    } catch (error) {
      ElMessage.error('获取复核申请列表失败')
      console.error('Failed to fetch final review applications:', error)
    } finally {
      loading.value = false
    }
  }

  const submitFinalReview = async (id: number, action: ReviewAction, comment: string) => {
    loading.value = true
    try {
      await applicationAPI.finalReviewApplication(id, { action, comment })
      
      // Update local state
      const index = applications.value.findIndex(app => app.id === id)
      if (index !== -1) {
        const application = applications.value[index]
        if (application) {
          // Update status based on final review action
          let newStatus: ApplicationStatus
          switch (action) {
            case ReviewAction.APPROVE:
              newStatus = ApplicationStatus.FINAL_APPROVED
              break
            case ReviewAction.REJECT:
              newStatus = ApplicationStatus.REJECTED
              break
            default:
              newStatus = application.status as ApplicationStatus
          }
          Object.assign(application, { status: newStatus })
          application.updatedAt = new Date().toISOString()
        }
      }

      // Update current application if it's the same one
      if (currentApplication.value && currentApplication.value.id === id) {
        const updatedApp = await applicationAPI.getApplicationDetail(id)
        currentApplication.value = updatedApp
      }
    } catch (error) {
      ElMessage.error('复核提交失败')
      console.error('Failed to submit final review:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const downloadFile = async (fileId: number, fileName: string) => {
    try {
      const blob = await applicationAPI.downloadApplicationFile(fileId)
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      ElMessage.success('文件下载成功')
      return blob
    } catch (error) {
      ElMessage.error('文件下载失败')
      console.error('Failed to download file:', error)
      throw error
    }
  }

  const setPage = (page: number) => {
    currentPage.value = page
  }

  const setPageSize = (size: number) => {
    pageSize.value = size
    currentPage.value = 1 // Reset to first page when changing page size
  }

  const setApplications = (apps: ApplicationListItem[] | AdminApplicationListItem[], totalCount: number) => {
    applications.value = apps
    total.value = totalCount
  }

  const clearCurrentApplication = () => {
    currentApplication.value = null
  }

  // 管理员相关方法
  const searchApplications = async (params: AdminApplicationSearchParams = {}) => {
    loading.value = true
    try {
      const response = await adminApplicationAPI.searchApplications({
        page: currentPage.value,
        limit: pageSize.value,
        ...params
      })
      
      applications.value = response.data
      total.value = response.total
      currentPage.value = response.page
      pageSize.value = response.limit
    } catch (error) {
      ElMessage.error('获取申请列表失败')
      console.error('Failed to search applications:', error)
    } finally {
      loading.value = false
    }
  }

  const fetchAdminApplicationDetail = async (id: number, options: { maskSensitive?: boolean } = {}) => {
    loading.value = true
    try {
      const application = options.maskSensitive
        ? await adminApplicationAPI.getSpotCheckApplicationDetail(id)
        : await adminApplicationAPI.getApplicationDetail(id, options)
      currentApplication.value = application
      return application
    } catch (error) {
      ElMessage.error('获取申请详情失败')
      console.error('Failed to fetch admin application detail:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const updateApplicationStatus = async (
    id: number,
    status: string,
    comment?: string,
    disbursementAmount?: number,
  ) => {
    loading.value = true
    try {
      await adminApplicationAPI.updateApplicationStatus(id, {
        status,
        comment,
        disbursementAmount,
      })
      
      // 更新本地状态
      const index = applications.value.findIndex(app => app.id === id)
      if (index !== -1) {
        const app = applications.value[index]
        if (app) {
          Object.assign(app, { status })
        }
      }

      ElMessage.success('状态更新成功')
    } catch (error) {
      ElMessage.error('状态更新失败')
      console.error('Failed to update application status:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const initialReview = async (id: number, result: 'approve' | 'doubt', comment: string) => {
    console.log('🔍 initialReview method called with:', { id, result, comment })
    loading.value = true
    try {
      await adminApplicationAPI.initialReview(id, { result, comment })
      
      // 更新本地状态
      const newStatus = result === 'approve' ? 'initial_approved' : 'under_review'
      const index = applications.value.findIndex(app => app.id === id)
      if (index !== -1) {
        const app = applications.value[index]
        if (app) {
          Object.assign(app, { status: newStatus })
        }
      }

      ElMessage.success(`初审${result === 'approve' ? '通过' : '存疑'}成功`)
    } catch (error) {
      ElMessage.error('初审提交失败')
      console.error('Failed to submit initial review:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const finalReview = async (
    id: number,
    result: 'approve' | 'reject',
    comment: string,
    disbursementAmount?: number,
  ) => {
    loading.value = true
    try {
      await adminApplicationAPI.finalReview(id, {
        result,
        comment,
        disbursementAmount,
      })
      
      // 更新本地状态
      const newStatus = result === 'approve' ? 'final_approved' : 'rejected'
      const index = applications.value.findIndex(app => app.id === id)
      if (index !== -1) {
        const app = applications.value[index]
        if (app) {
          Object.assign(app, { status: newStatus })
        }
      }

      ElMessage.success(`复核${result === 'approve' ? '通过' : '拒绝'}成功`)
    } catch (error) {
      ElMessage.error('复核提交失败')
      console.error('Failed to submit final review:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const spotCheck = async (id: number, result: 'approve' | 'reject', comment: string) => {
    loading.value = true
    try {
      await adminApplicationAPI.spotCheck(id, { result, comment })
      
      // 抽查不改变申请状态，只记录抽查结果
      ElMessage.success(`抽查${result === 'approve' ? '通过' : '不通过'}成功`)
    } catch (error) {
      ElMessage.error('抽查提交失败')
      console.error('Failed to submit spot check:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const randomSpotCheck = async (count: number, dateRange?: string, options: { maskSensitive?: boolean } = {}) => {
    loading.value = true
    try {
      const result = await adminApplicationAPI.randomSpotCheck({ count, dateRange, ...options })
      ElMessage.success(`随机选择了 ${result.selectedApplications.length} 个申请进行抽查`)
      return result
    } catch (error) {
      ElMessage.error('随机抽查失败')
      console.error('Failed to execute random spot check:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const getApplicationStatistics = async () => {
    try {
      return await adminApplicationAPI.getApplicationStatistics()
    } catch (error) {
      ElMessage.error('获取统计信息失败')
      console.error('Failed to get application statistics:', error)
      throw error
    }
  }

  const getApplicationReviews = async (id: number) => {
    try {
      return await adminApplicationAPI.getApplicationReviews(id)
    } catch (error) {
      ElMessage.error('获取审核记录失败')
      console.error('Failed to get application reviews:', error)
      throw error
    }
  }

  return {
    // State
    applications,
    currentApplication,
    loading,
    total,
    currentPage,
    pageSize,
    
    // Getters
    hasApplications,
    isLoading,
    
    // Actions
    fetchApplications,
    fetchApplicationDetail,
    submitReview,
    fetchFinalReviewApplications,
    submitFinalReview,
    downloadFile,
    setPage,
    setPageSize,
    setApplications,
    clearCurrentApplication,
    
    // 管理员方法
    searchApplications,
    fetchAdminApplicationDetail,
    updateApplicationStatus,
    initialReview,
    finalReview,
    spotCheck,
    randomSpotCheck,
    getApplicationStatistics,
    getApplicationReviews
  }
})
