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
            <el-form-item label="申请项目">
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
            <el-form-item label="受捐人姓名">
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
                style="min-width: 150px; width: 100%"
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
                :disabled-date="disableBeforeDatePickerMinDate"
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
        <el-table-column prop="donationProject" label="申请项目" />
        <el-table-column prop="donationPeriod" label="申请期数" />
        <el-table-column prop="phone" label="手机号">
          <template #default="{ row }">
            {{ row.user?.phone || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="recipientName" label="受捐人姓名" />
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
              <!-- 查看按钮 - 所有状态都可以查看 -->
              <el-button
                type="info"
                size="small"
                @click="openReviewDialog(row)"
              >
                查看
              </el-button>
              
              <!-- 需要复核的状态 - 显示复核按钮 -->
              <el-button
                v-if="['initial_approved', 'under_review'].includes(row.status)"
                type="primary"
                size="small"
                @click="openReviewDialog(row)"
              >
                复核
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
      width="1400px"
      top="5vh"
      :close-on-click-modal="false"
    >
      <div v-if="currentApplicationDetail" class="review-dialog-content">
        <el-tabs
          v-if="relatedApplications.length > 1"
          v-model="activeRelatedApplicationId"
          class="application-number-tabs"
          @tab-change="handleRelatedApplicationChange"
        >
          <el-tab-pane
            v-for="item in relatedApplications"
            :key="item.id"
            :label="item.applicationNumber"
            :name="String(item.id)"
          />
        </el-tabs>

        <!-- 申请基本信息 -->
        <div class="application-header">
          <h3>{{ currentApplicationDetail.applicationNumber }} - {{ currentApplicationDetail.recipientName }}</h3>
          <el-tag :type="getStatusType(currentApplicationDetail.status as string)">
            {{ getStatusText(currentApplicationDetail.status as string) }}
          </el-tag>
        </div>

        <!-- 左右分栏布局 -->
        <div class="content-layout">
          <!-- 左侧：申请信息 -->
          <div class="left-section">
            <h4 class="section-title">申请信息</h4>
            <BasicInfoDisplay
              v-model="applicationBasicInfo"
              :readonly="true"
            />
          </div>

          <!-- 右侧：资料上传和发票上传 -->
          <div class="right-section">
            <el-tabs v-model="activeUploadTab" class="upload-tabs">
              <el-tab-pane label="资料上传" name="documents">
                <FileUploadSection
                  v-model="applicationDocuments"
                  title="申请资料"
                  :application-id="currentApplicationDetail.id"
                  :readonly="true"
                />
              </el-tab-pane>
              
              <el-tab-pane label="发票上传" name="invoices">
                <InvoiceUploadForm
                  v-model="applicationInvoices"
                  :application-id="currentApplicationDetail.id"
                  :editable-disbursement-amount="true"
                  @disbursement-amount-change="reviewDisbursementAmount = $event"
                />
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>

        <!-- 审核记录区域 -->
        <div class="review-records-section">
          <div class="section-divider"></div>
          <h4 class="section-title">审核记录</h4>
          <ApplicationReviews
            :reviews="applicationReviews"
            :loading="loadingReviews"
            :show-actions="currentApplicationDetail && ['initial_approved', 'under_review'].includes(currentApplicationDetail.status)"
            :application-status="currentApplicationDetail?.status"
            @review-submitted="handleReviewSubmitted"
          />
        </div>
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
import { adminApplicationAPI, type ApplicationReview, type RelatedApplicationItem } from '@/api/admin-application'
import InvoiceUploadForm from '@/components/common/InvoiceUploadForm.vue'
import ApplicationReviews from '@/components/ApplicationReviews.vue'
import { disableBeforeDatePickerMinDate } from '@/utils/datePicker'

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
const reviewDisbursementAmount = ref(0)
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
      id: number
      phone: string
    }
  }>
  [key: string]: unknown
}

interface InvoiceFileItem {
  id?: number
  name: string
  url: string
  uid: string
  status: string
  size: number
  fileType: string
  originalName: string
  recognizedAmount: number
  recognizedInvoiceNumber: string
  recognizedInvoiceDate: string
  verificationStatus: string
  verificationMessage: string
}

const mapInvoiceFiles = (
  files: Record<string, unknown>[],
  fileType: string,
  defaultName: string,
): InvoiceFileItem[] =>
  files
    .filter((file: Record<string, unknown>) => file.fileType === fileType)
    .map((file: Record<string, unknown>) => ({
      id: Number(file.id) || undefined,
      name: String(file.originalName || defaultName),
      url: String(file.url || ''),
      uid: String(file.id || Date.now()),
      status: 'success',
      size: Number(file.size) || 0,
      fileType: String(file.fileType || ''),
      originalName: String(file.originalName || ''),
      recognizedAmount: Number(file.recognizedAmount) || 0,
      recognizedInvoiceNumber: String(file.recognizedInvoiceNumber || ''),
      recognizedInvoiceDate: String(file.recognizedInvoiceDate || ''),
      verificationStatus: String(file.verificationStatus || ''),
      verificationMessage: String(file.verificationMessage || '')
    }))

const currentApplicationDetail = ref<ApplicationDetail | null>(null)
const submitting = ref(false)
const activeUploadTab = ref('documents')
const relatedApplications = ref<RelatedApplicationItem[]>([])
const activeRelatedApplicationId = ref('')

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
      threeElementVerified: false,
      threeElementVerifiedAt: '',
      threeElementVerificationStatus: '',
      threeElementVerificationMessage: '',
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
    threeElementVerified: Boolean(app.threeElementVerified),
    threeElementVerifiedAt: String(app.threeElementVerifiedAt || ''),
    threeElementVerificationStatus: String(app.threeElementVerificationStatus || ''),
    threeElementVerificationMessage: String(app.threeElementVerificationMessage || ''),
    caseDescription: String(app.caseDescription || '')
  }
})

const applicationDocuments = computed(() => {
  if (!currentApplicationDetail.value?.files) return []
  
  // 过滤掉发票类型的文件，只返回其他文档
  return currentApplicationDetail.value.files
    .filter((file: Record<string, unknown>) => 
      file.fileType !== 'transport_invoice' && 
      file.fileType !== 'accommodation_invoice' &&
      file.fileType !== 'medical_invoice'
    )
    .map((file: Record<string, unknown>) => ({
      id: Number(file.id) || undefined,
      applicationId: Number(file.applicationId) || undefined,
      fileType: String(file.fileType || ''),
      originalName: String(file.originalName || ''),
      filename: String(file.filename || ''),
      path: String(file.path || ''),
      url: String(file.url || ''),
      mimetype: String(file.mimetype || ''),
      size: String(file.size || ''),
      createdAt: String(file.createdAt || ''),
      recognizedName: String(file.recognizedName || ''),
      recognizedIdNumber: String(file.recognizedIdNumber || ''),
      recognizedVisitDate: String(file.recognizedVisitDate || ''),
      ocrRawText: String(file.ocrRawText || ''),
      ocrPayload: String(file.ocrPayload || ''),
      verificationStatus: String(file.verificationStatus || ''),
      verificationMessage: String(file.verificationMessage || '')
    }))
})


const applicationInvoices = computed(() => {
  if (!currentApplicationDetail.value) {
    return {
      applicationId: 0,
      totalReimbursementAmount: 0,
      transportReimbursementAmount: 0,
      accommodationReimbursementAmount: 0,
      medicalInvoiceAmount: 0,
      verifiedInvoiceTotalAmount: 0,
      singlePeriodLimitAmount: 0,
      disbursementAmount: null,
      transportInvoiceFiles: [],
      accommodationInvoiceFiles: [],
      medicalInvoiceFiles: []
    }
  }
  
  const app = currentApplicationDetail.value
  
  const files = (app.files || []) as Record<string, unknown>[]
  const transportFiles = mapInvoiceFiles(files, 'transport_invoice', '交通费发票')
  const accommodationFiles = mapInvoiceFiles(files, 'accommodation_invoice', '住宿费发票')
  const medicalFiles = mapInvoiceFiles(files, 'medical_invoice', '医疗发票及费用清单')
  
  return {
    applicationId: Number(app.id) || 0,
    totalReimbursementAmount: Number(app.totalReimbursementAmount) || 0,
    transportReimbursementAmount: Number(app.transportReimbursementAmount) || 0,
    accommodationReimbursementAmount: Number(app.accommodationReimbursementAmount) || 0,
    medicalInvoiceAmount: Number(app.medicalInvoiceAmount) || 0,
    verifiedInvoiceTotalAmount: Number(app.verifiedInvoiceTotalAmount) || 0,
    singlePeriodLimitAmount: Number(app.singlePeriodLimitAmount) || 0,
    disbursementAmount:
      app.disbursementAmount === null || app.disbursementAmount === undefined
        ? null
        : Number(app.disbursementAmount),
    transportInvoiceFiles: transportFiles,
    accommodationInvoiceFiles: accommodationFiles,
    medicalInvoiceFiles: medicalFiles
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
  applicationStore.setPageSize(size)
  fetchFinalReviewApplications()
}

const handleCurrentChange = (page: number) => {
  applicationStore.setPage(page)
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

const loadApplicationDetail = async (applicationId: number) => {
  const detail = await applicationStore.fetchAdminApplicationDetail(applicationId)

  // 转换文件数据格式以匹配前端组件期望的格式
  if (detail.files && detail.files.length > 0) {
    detail.files = detail.files.map((file: Record<string, unknown>) => ({
      ...file,
      fileUrl: file.url || file.path || '',
      fileSize: file.size || 0
    }))
  }

  currentApplicationDetail.value = detail as ApplicationDetail
  activeRelatedApplicationId.value = String(applicationId)
  const relatedItem = relatedApplications.value.find((item) => item.id === applicationId)
  selectedApplication.value = {
    id: applicationId,
    applicationNumber: String(detail.applicationNumber || relatedItem?.applicationNumber || ''),
    recipientName: String(detail.recipientName || relatedItem?.recipientName || ''),
    status: String(detail.status || relatedItem?.status || '') as ApplicationListItem['status'],
    createdAt: String(detail.createdAt || relatedItem?.createdAt || ''),
    updatedAt: String(detail.updatedAt || detail.createdAt || relatedItem?.createdAt || ''),
  }

  await fetchApplicationReviews(applicationId)
}

const openReviewDialog = async (application: ApplicationListItem) => {
  selectedApplication.value = application
  submitting.value = true

  try {
    relatedApplications.value = await adminApplicationAPI.getRelatedApplications(application.id)
    await loadApplicationDetail(application.id)

    reviewDialogVisible.value = true
    activeUploadTab.value = 'documents'

  } catch (error) {
    console.error('❌ 获取申请详情失败:', error)
    ElMessage.error('获取申请详情失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

const handleRelatedApplicationChange = async (name: string | number) => {
  const applicationId = Number(name)
  if (!applicationId || applicationId === currentApplicationDetail.value?.id) return

  submitting.value = true
  try {
    await loadApplicationDetail(applicationId)
    activeUploadTab.value = 'documents'
  } catch (error) {
    console.error('切换申请详情失败:', error)
    ElMessage.error('切换申请详情失败')
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
      comment,
      reviewDisbursementAmount.value,
    )
    
    await loadApplicationDetail(selectedApplication.value.id)
    
    // 刷新列表显示最新状态
    fetchFinalReviewApplications()
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

/* 左右分栏布局 */
.content-layout {
  display: flex;
  gap: 20px;
  height: 60vh;
}

.left-section {
  flex: 1;
  min-width: 0;
  padding-right: 20px;
  border-right: 1px solid #ebeef5;
  overflow-y: auto;
  max-height: 100%;
}

.right-section {
  flex: 1;
  min-width: 0;
  padding-right: 20px;
  overflow-y: auto;
  max-height: 100%;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px 0;
  padding-bottom: 12px;
}

.upload-tabs {
  :deep(.el-tabs__header) {
    margin-bottom: 16px;
  }

  :deep(.el-tabs__nav-wrap::after) {
    display: none;
  }

  :deep(.el-tabs__item) {
    font-weight: 500;
    font-size: 15px;
  }

  :deep(.el-tabs__item.is-active) {
    color: #409eff;
  }
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

.application-number-tabs {
  margin-bottom: 16px;
}

/* 审核记录区域样式 */
.review-records-section {
  margin-top: 24px;
  padding-top: 24px;
}

.section-divider {
  height: 1px;
  background: #ebeef5;
  margin-bottom: 20px;
}

</style>
