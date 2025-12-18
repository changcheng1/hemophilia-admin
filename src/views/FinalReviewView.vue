<template>
  <div class="final-review">
    <!-- Search and Filter -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline class="search-form">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="申请号">
              <el-input
                v-model="searchForm.applicationNumber"
                placeholder="请输入"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="援助项目">
              <el-input
                v-model="searchForm.donationProject"
                placeholder="请输入"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="手机号码">
              <el-input
                v-model="searchForm.phone"
                placeholder="请输入"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="患者姓名">
              <el-input
                v-model="searchForm.recipientName"
                placeholder="请输入"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="证件号码">
              <el-input
                v-model="searchForm.idNumber"
                placeholder="请输入"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="状态">
              <el-select
                v-model="searchForm.status"
                placeholder="请选择"
                clearable
              >
                <el-option
                  v-for="status in finalReviewStatuses"
                  :key="status.value"
                  :label="status.label"
                  :value="status.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="申请日期">
              <el-date-picker
                v-model="searchForm.dateRange"
                type="daterange"
                range-separator="～"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24" class="search-buttons">
            <el-button type="primary" @click="handleSearch">
              搜索
            </el-button>
            <el-button @click="handleReset">
              重置
            </el-button>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- Application List -->
    <el-card class="list-card">
      <template #header>
        <div class="card-header">
          <span>复核申请列表</span>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="applications"
        stripe
        style="width: 100%"
        class="review-table"
      >
        <el-table-column prop="applicationNumber" label="申请号" show-overflow-tooltip/>
        <el-table-column prop="donationProject" label="援助项目" />
        <el-table-column prop="donationPeriod" label="援助期数" />
        <el-table-column prop="phone" label="手机号">
          <template #default="{ row }">
            {{ row.user?.phone || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="recipientName" label="患者姓名" />
        <el-table-column prop="idType" label="证件类型"/>
        <el-table-column prop="idNumber" label="证件号码" />
        <el-table-column prop="status" label="申请状态" >
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="申请时间">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <!-- 需要复核的状态 - 显示复核按钮 -->
              <el-button
                v-if="['initial_approved', 'under_review'].includes(row.status)"
                type="primary"
                size="small"
                @click="openReviewDialog(row)"
              >
                复核
              </el-button>
              
              <!-- 审核通过状态 -->
              <el-button
                v-if="row.status === 'final_approved'"
                type="success"
                size="small"
                plain
                disabled
              >
                已通过
              </el-button>
              
              <!-- 审核退回状态 -->
              <el-button
                v-if="row.status === 'rejected'"
                type="danger"
                size="small"
                plain
                disabled
              >
                已退回
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- Review Dialog -->
    <el-dialog
      v-model="reviewDialogVisible"
      title="申请复核"
      width="1200px"
      top="5vh"
      :close-on-click-modal="false"
    >
      <div v-if="currentApplicationDetail" class="review-dialog-content">
        <!-- 申请基本信息 -->
        <div class="application-header">
          <h3>{{ currentApplicationDetail.applicationNumber }} - {{ currentApplicationDetail.recipientName }}</h3>
          <el-tag :type="getStatusType(currentApplicationDetail.status as string)">
            {{ getStatusText(currentApplicationDetail.status as string) }}
          </el-tag>
        </div>

        <!-- 详细信息标签页 -->
        <el-tabs v-model="activeDetailTab" class="detail-tabs">
          <!-- 基本信息 -->
          <el-tab-pane label="基本信息" name="basic">
            <BasicInfoDisplay
              v-model="applicationBasicInfo"
              :readonly="true"
            />
          </el-tab-pane>
            <!-- 资料上传 -->
          <el-tab-pane label="资料上传" name="documents">
            <FileUploadSection
              v-model="applicationDocuments"
              title="申请资料"
              :readonly="true"
            />
          </el-tab-pane>

          <!-- 发票上传 -->
          <el-tab-pane label="发票上传" name="invoices">
            <InvoiceUploadForm
              v-model="applicationInvoices"
              :readonly="true"
            />
          </el-tab-pane>
          

        </el-tabs>

        <!-- 审核记录组件 -->
        <ApplicationReviews
          :reviews="applicationReviews"
          :loading="loadingReviews"
          :show-actions="currentApplicationDetail && ['initial_approved', 'under_review'].includes(currentApplicationDetail.status)"
          :application-status="currentApplicationDetail?.status"
          @review-submitted="handleReviewSubmitted"
        />
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="reviewDialogVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>


  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

import { useApplicationStore } from '@/stores/application'
import type { ApplicationListItem } from '@/types/application'
import type { ApplicationReview } from '@/api/admin-application'
import InvoiceUploadForm from '@/components/common/InvoiceUploadForm.vue'
import ApplicationReviews from '@/components/ApplicationReviews.vue'

const applicationStore = useApplicationStore()

// Reactive data
const searchForm = reactive({
  applicationNumber: '',
  donationProject: '',
  phone: '',
  recipientName: '',
  idNumber: '',
  status: '', // 默认查询所有需要复核的数据
  dateRange: [] as string[]
})

const reviewDialogVisible = ref(false)
const selectedApplication = ref<ApplicationListItem | null>(null)
interface ApplicationDetail {
  id: number
  applicationNumber: string
  recipientName: string
  status: string
  files?: Array<{
    id: number
    fileType: string
    originalName: string
    fileUrl: string
    fileSize: number
    createdAt: string
  }>
  reviews?: Array<{
    id: number
    stage: string
    result: string
    comment?: string
    createdAt: string
    reviewer?: {
      phone: string
    }
  }>
  [key: string]: unknown
}

const currentApplicationDetail = ref<ApplicationDetail | null>(null)
const submitting = ref(false)
const activeDetailTab = ref('basic')

const applicationReviews = ref<ApplicationReview[]>([])
const loadingReviews = ref(false)

// 当前申请的数据，转换为新组件格式
const applicationBasicInfo = computed(() => {
  if (!currentApplicationDetail.value) {
    return {
      applicationNumber: '',
      status: '',
      donationProject: '',
      donationPeriod: '',
      recipientName: '',
      gender: '',
      idType: '',
      idNumber: '',
      dateOfBirth: '',

      householdLocation: '',
      medicalInsuranceLocation: '',
      treatmentLocation: '',
      residenceAddress: '',
      guardianName: '',
      guardianRelationship: '',
      guardianIdType: '',
      guardianIdNumber: '',

      bankAccountName: '',
      bankName: '',
      bankAccountNumber: '',
      caseDescription: ''
    }
  }
  
  const app = currentApplicationDetail.value
  return {
    applicationNumber: String(app.applicationNumber || ''),
    status: String(app.status || ''),
    donationProject: String(app.donationProject || ''),
    donationPeriod: String(app.donationPeriod || ''),
    recipientName: String(app.recipientName || ''),
    gender: String(app.gender || ''),
    idType: String(app.idType || ''),
    idNumber: String(app.idNumber || ''),
    dateOfBirth: String(app.dateOfBirth || ''),

    householdLocation: String(app.householdLocation || ''),
    medicalInsuranceLocation: String(app.medicalInsuranceLocation || ''),
    treatmentLocation: String(app.treatmentLocation || ''),
    residenceAddress: String(app.residenceAddress || ''),
    guardianName: String(app.guardianName || ''),
    guardianRelationship: String(app.guardianRelationship || ''),
    guardianIdType: String(app.guardianIdType || ''),
    guardianIdNumber: String(app.guardianIdNumber || ''),

    bankAccountName: String(app.bankAccountName || ''),
    bankName: String(app.bankName || ''),
    bankAccountNumber: String(app.bankAccountNumber || ''),
    caseDescription: String(app.caseDescription || '')
  }
})

const applicationDocuments = computed(() => {
  if (!currentApplicationDetail.value?.files) return []
  
  return currentApplicationDetail.value.files
    .filter((file: Record<string, unknown>) => file.fileType !== 'invoice') // 过滤掉发票文件
    .map((file: Record<string, unknown>, index: number) => ({
      name: String(file.originalName || file.fileName || `文件${index + 1}`),
      url: String(file.fileUrl || file.url || ''),
      uid: Number(file.id) || index,
      status: 'success'
    }))
})


const applicationInvoices = computed(() => {
  if (!currentApplicationDetail.value) {
    return {
      transportReimbursementAmount: 0,
      accommodationReimbursementAmount: 0,
      transportInvoiceFiles: [],
      accommodationInvoiceFiles: []
    }
  }
  
  const app = currentApplicationDetail.value
  const invoiceFiles = app.files?.filter((file: Record<string, unknown>) => file.fileType === 'invoice') || []
  
  // 根据文件名或其他标识分类发票文件
  const transportFiles = invoiceFiles.filter((file: Record<string, unknown>) => {
    const fileName = String(file.originalName || '')
    return fileName.includes('交通') || fileName.includes('车票') || fileName.includes('火车')
  }).map((file: Record<string, unknown>, index: number) => ({
    name: String(file.originalName || file.fileName || `交通费发票${index + 1}`),
    url: String(file.fileUrl || file.url || ''),
    uid: String(file.id || `transport_${index}`),
    status: 'success'
  }))
  
  const accommodationFiles = invoiceFiles.filter((file: Record<string, unknown>) => {
    const fileName = String(file.originalName || '')
    return fileName.includes('住宿') || fileName.includes('酒店') || fileName.includes('宾馆')
  }).map((file: Record<string, unknown>, index: number) => ({
    name: String(file.originalName || file.fileName || `住宿费发票${index + 1}`),
    url: String(file.fileUrl || file.url || ''),
    uid: String(file.id || `accommodation_${index}`),
    status: 'success'
  }))
  
  return {
    transportReimbursementAmount: Number(app.transportReimbursementAmount) || 0,
    accommodationReimbursementAmount: Number(app.accommodationReimbursementAmount) || 0,
    transportInvoiceFiles: transportFiles,
    accommodationInvoiceFiles: accommodationFiles
  }
})

// Computed properties
const applications = computed(() => applicationStore.applications)
const loading = computed(() => applicationStore.loading)
const total = computed(() => applicationStore.total)
const currentPage = computed({
  get: () => applicationStore.currentPage,
  set: (value) => applicationStore.setPage(value)
})
const pageSize = computed({
  get: () => applicationStore.pageSize,
  set: (value) => applicationStore.setPageSize(value)
})

// Final reviewable statuses - 复核相关状态
// 复核管理相关状态 - 初审通过、初审存疑、审核通过、审核退回
const finalReviewStatuses = [
  { label: '全部', value: '' },
  { label: '初审通过', value: 'initial_approved' },
  { label: '初审存疑', value: 'under_review' },
  { label: '审核通过', value: 'final_approved' },
  { label: '审核退回', value: 'rejected' }
]

// Methods
const getStatusType = (status: string): string => {
  switch (status) {
    case 'pending_initial':
      return 'info'
    case 'under_review':
      return 'warning'
    case 'initial_approved':
      return 'primary'
    case 'final_approved':
      return 'success'
    case 'rejected':
      return 'danger'
    default:
      return 'info'
  }
}

const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    'pending_initial': '待审核',
    'initial_approved': '初审通过',
    'under_review': '初审存疑',
    'rejected': '审核退回',
    'final_approved': '审核通过'
  }
  return statusMap[status] || '未知状态'
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// 移除未使用的方法

const handleSearch = () => {
  applicationStore.setPage(1)
  fetchFinalReviewApplications()
}

const handleReset = () => {
  searchForm.applicationNumber = ''
  searchForm.donationProject = ''
  searchForm.phone = ''
  searchForm.recipientName = ''
  searchForm.idNumber = ''
  searchForm.status = '' // 重置时查询所有需要复核的数据
  searchForm.dateRange = []
  applicationStore.setPage(1)
  fetchFinalReviewApplications()
}



const handleSizeChange = (size: number) => {
  pageSize.value = size
  fetchFinalReviewApplications()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  fetchFinalReviewApplications()
}

const fetchFinalReviewApplications = () => {
  const params: Record<string, unknown> = {}
  
  if (searchForm.applicationNumber) {
    params.applicationNumber = searchForm.applicationNumber
  }
  if (searchForm.donationProject) {
    params.donationProject = searchForm.donationProject
  }
  if (searchForm.phone) {
    params.phone = searchForm.phone
  }
  if (searchForm.recipientName) {
    params.recipientName = searchForm.recipientName
  }
  if (searchForm.idNumber) {
    params.idNumber = searchForm.idNumber
  }
  
  // 复核管理页面查询逻辑
  if (searchForm.status) {
    params.status = searchForm.status
  } else {
    // 默认查询复核相关的状态：初审通过、初审存疑、审核通过、审核退回
    params.reviewableStatuses = ['initial_approved', 'under_review', 'final_approved', 'rejected']
  }
  
  if (searchForm.dateRange && searchForm.dateRange.length === 2) {
    params.startDate = searchForm.dateRange[0]
    params.endDate = searchForm.dateRange[1]
  }
  
  
  // 使用管理员搜索接口
  applicationStore.searchApplications(params).then(() => {
      applications.value.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1
        return acc
      }, {} as Record<string, number>)
  })
}

const openReviewDialog = async (application: ApplicationListItem) => {
  selectedApplication.value = application
  submitting.value = true
  
  try {
    
    // 使用管理员API根据申请ID查询完整的申请信息
    const detail = await applicationStore.fetchAdminApplicationDetail(application.id)
    
    // 转换文件数据格式以匹配前端组件期望的格式
    if (detail.files && detail.files.length > 0) {
      detail.files = detail.files.map((file: Record<string, unknown>) => ({
        ...file,
        fileUrl: file.url || file.path || '',
        fileSize: file.size || 0
      }))
    }
    
    currentApplicationDetail.value = detail as ApplicationDetail
    
    // 获取审核记录
    await fetchApplicationReviews(application.id)
    
    reviewDialogVisible.value = true
    activeDetailTab.value = 'basic'

  } catch (error) {
    console.error('❌ 获取申请详情失败:', error)
    ElMessage.error('获取申请详情失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}



// 处理审核记录组件提交的审核
const handleReviewSubmitted = async (result: 'approve' | 'reject', comment: string) => {
  if (!selectedApplication.value) return
  
  try {
    // 使用复核接口
    await applicationStore.finalReview(
      selectedApplication.value.id, 
      result,
      comment
    )
    
    // 重新获取申请详情以更新状态
    const updatedDetail = await applicationStore.fetchAdminApplicationDetail(selectedApplication.value.id)
    
    // 转换文件数据格式
    if (updatedDetail.files && updatedDetail.files.length > 0) {
      updatedDetail.files = updatedDetail.files.map((file: Record<string, unknown>) => ({
        ...file,
        fileUrl: file.url || file.path || '',
        fileSize: file.size || 0
      }))
    }
    
    currentApplicationDetail.value = updatedDetail as ApplicationDetail
    
    // 重新获取审核记录
    await fetchApplicationReviews(selectedApplication.value.id)
    
    // 刷新列表显示最新状态
    fetchFinalReviewApplications()
    
    ElMessage.success(`审核${result === 'approve' ? '通过' : '退回'}成功`)
  } catch (error) {
    console.error('Review submission failed:', error)
    ElMessage.error('审核提交失败')
  }
}

// 获取审核记录
const fetchApplicationReviews = async (applicationId: number) => {
  loadingReviews.value = true
  try {
    const reviews = await applicationStore.getApplicationReviews(applicationId)
    applicationReviews.value = reviews || []
  } catch (error) {
    console.error('❌ 获取审核记录失败:', error)
    applicationReviews.value = []
  } finally {
    loadingReviews.value = false
  }
}



// Lifecycle
onMounted(() => {
  fetchFinalReviewApplications()
})
</script>

<style scoped>
.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0 0 8px 0;
  color: #303133;
}

.page-header p {
  margin: 0;
  color: #606266;
}

.search-card {
  margin-bottom: 20px;
}

.search-form {
  padding: 10px 0;
}

.search-buttons {
  text-align: right;
  margin-top: 10px;
}

.list-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
}

.review-table {
  font-size: 14px;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.action-buttons .el-button {
  margin: 0;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

:deep(.el-table) {
  font-size: 14px;
}

:deep(.el-table .cell) {
  padding: 8px 12px;
}

:deep(.el-form-item) {
  margin-bottom: 16px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}



/* 审核对话框样式 */
.review-dialog-content {
  max-height: 70vh;
  overflow-y: auto;
}

.application-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.application-header h3 {
  margin: 0;
  color: #303133;
  font-size: 18px;
}

.detail-tabs {
  margin-bottom: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 复核意见对话框样式 */
.review-opinion-content {
  .review-options {
    margin-bottom: 24px;

    .options-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      margin: 0 0 16px 0;
    }

    .review-radio-group {
      :deep(.el-radio) {
        margin-right: 24px;
        margin-bottom: 12px;

        .el-radio__label {
          font-weight: 500;
          color: #606266;
        }

        &.is-checked .el-radio__label {
          color: #409eff;
        }
      }
    }

    .reject-hint {
      margin-top: 12px;
      padding: 8px 12px;
      background: #fdf6ec;
      border: 1px solid #faecd8;
      border-radius: 4px;
    }
  }

  .comment-section {
    .comment-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      margin: 0 0 12px 0;
      display: flex;
      align-items: center;

      .required-mark {
        color: #f56c6c;
        margin-right: 4px;
      }
    }

    :deep(.el-textarea) {
      .el-textarea__inner {
        border-radius: 6px;
        font-family: inherit;
        line-height: 1.6;

        &:focus {
          border-color: #409eff;
          box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
        }
      }
    }
  }
}

:deep(.el-dialog__body) {
  padding: 20px;
}

:deep(.el-tabs__content) {
  padding-top: 15px;
}


</style>