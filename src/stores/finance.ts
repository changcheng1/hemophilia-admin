import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { financeAPI } from '@/api/finance'
import type { 
  FinanceListItem, 
  FinanceApplication,
  FinanceStats
} from '@/types/finance'
import { 
  FinanceStatus,
  FinanceAction
} from '@/types/finance'
import type { FinanceListParams } from '@/api/finance'

export const useFinanceStore = defineStore('finance', () => {
  // State
  const financeApplications = ref<FinanceListItem[]>([])
  const currentFinanceApplication = ref<FinanceApplication | null>(null)
  const financeStats = ref<FinanceStats | null>(null)
  const loading = ref(false)
  const total = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(10)

  // Getters
  const hasFinanceApplications = computed(() => financeApplications.value.length > 0)
  const isLoading = computed(() => loading.value)
  const pendingDisbursementCount = computed(() => 
    financeApplications.value.filter(app => app.status === FinanceStatus.PENDING_DISBURSEMENT).length
  )
  const totalPendingAmount = computed(() => 
    financeApplications.value
      .filter(app => app.status === FinanceStatus.PENDING_DISBURSEMENT)
      .reduce((sum, app) => sum + app.amount, 0)
  )

  // Actions
  const fetchFinanceApplications = async (params: FinanceListParams = {}) => {
    loading.value = true
    try {
      const response = await financeAPI.getFinanceApplicationList({
        page: currentPage.value,
        limit: pageSize.value,
        ...params
      })
      
      financeApplications.value = response.data
      total.value = response.total
      currentPage.value = response.page
      pageSize.value = response.limit
    } catch (error) {
      ElMessage.error('获取财务申请列表失败')
      console.error('Failed to fetch finance applications:', error)
    } finally {
      loading.value = false
    }
  }

  const fetchFinanceApplicationDetail = async (id: number) => {
    loading.value = true
    try {
      const application = await financeAPI.getFinanceApplicationDetail(id)
      currentFinanceApplication.value = application
      return application
    } catch (error) {
      ElMessage.error('获取财务申请详情失败')
      console.error('Failed to fetch finance application detail:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const processFinanceOperation = async (id: number, action: FinanceAction, comment: string, amount?: number) => {
    loading.value = true
    try {
      await financeAPI.processFinanceOperation(id, { action, comment, amount })
      
      // Update local state
      const index = financeApplications.value.findIndex(app => app.id === id)
      if (index !== -1) {
        const application = financeApplications.value[index]
        if (application) {
          // Update status based on action
          let newStatus: FinanceStatus
          switch (action) {
            case FinanceAction.CONFIRM_DISBURSEMENT:
              newStatus = FinanceStatus.DISBURSEMENT_CONFIRMED
              break
            case FinanceAction.COMPLETE_DISBURSEMENT:
              newStatus = FinanceStatus.DISBURSEMENT_COMPLETED
              break
            case FinanceAction.FAIL_DISBURSEMENT:
              newStatus = FinanceStatus.DISBURSEMENT_FAILED
              break
            default:
              newStatus = application.status
          }
          application.status = newStatus
          application.updatedAt = new Date().toISOString()
        }
      }

      // Update current application if it's the same one
      if (currentFinanceApplication.value && currentFinanceApplication.value.id === id) {
        const updatedApp = await financeAPI.getFinanceApplicationDetail(id)
        currentFinanceApplication.value = updatedApp
      }

      ElMessage.success('财务操作提交成功')
    } catch (error) {
      ElMessage.error('财务操作提交失败')
      console.error('Failed to process finance operation:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const fetchFinanceStats = async () => {
    loading.value = true
    try {
      const stats = await financeAPI.getFinanceStats()
      financeStats.value = stats
      return stats
    } catch (error) {
      ElMessage.error('获取财务统计失败')
      console.error('Failed to fetch finance stats:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const exportFinanceRecords = async (params: FinanceListParams = {}) => {
    try {
      const blob = await financeAPI.exportFinanceRecords(params)
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `财务记录_${new Date().toISOString().split('T')[0]}.xls`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      ElMessage.success('财务记录导出成功')
      return blob
    } catch (error) {
      ElMessage.error('财务记录导出失败')
      console.error('Failed to export finance records:', error)
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

  const clearCurrentFinanceApplication = () => {
    currentFinanceApplication.value = null
  }

  const clearFinanceStats = () => {
    financeStats.value = null
  }

  return {
    // State
    financeApplications,
    currentFinanceApplication,
    financeStats,
    loading,
    total,
    currentPage,
    pageSize,
    
    // Getters
    hasFinanceApplications,
    isLoading,
    pendingDisbursementCount,
    totalPendingAmount,
    
    // Actions
    fetchFinanceApplications,
    fetchFinanceApplicationDetail,
    processFinanceOperation,
    fetchFinanceStats,
    exportFinanceRecords,
    setPage,
    setPageSize,
    clearCurrentFinanceApplication,
    clearFinanceStats
  }
})