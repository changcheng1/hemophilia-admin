<template>
  <div class="spot-check">
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
                  v-for="status in spotCheckStatuses"
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
          <span>抽查申请列表</span>
          <div class="header-buttons">
            <el-button 
              type="primary" 
              @click="handleRandomSpotCheck"
              :loading="randomSelecting"
            >
              随机抽查
            </el-button>
          </div>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="applications"
        stripe
        style="width: 100%"
        class="spot-check-table"
      >
        <el-table-column prop="applicationNumber" label="申请号" width="140" />
        <el-table-column prop="donationProject" label="援助项目" width="120" />
        <el-table-column prop="donationPeriod" label="援助期数" width="100" />
        <el-table-column prop="phone" label="手机号" width="120">
          <template #default="{ row }">
            {{ row.user?.phone || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="recipientName" label="患者姓名" width="100" />
        <el-table-column prop="idType" label="证件类型" width="100" />
        <el-table-column prop="idNumber" label="证件号码" width="160" />
        <el-table-column prop="status" label="申请状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="申请时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="openSpotCheck(row)"
            >
              审核
            </el-button>
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

    <!-- Spot Check Dialog -->
    <el-dialog
      v-model="spotCheckDialogVisible"
      title="抽查详情"
      width="1200px"
      top="5vh"
      :close-on-click-modal="false"
    >
      <div v-if="currentApplicationDetail" class="spot-check-dialog-content">
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
            <BasicInfoForm
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

        <!-- 审核记录组件 - 不显示审核操作 -->
        <ApplicationReviews
          :reviews="applicationReviews"
          :loading="loadingReviews"
          :show-actions="false"
          :application-status="currentApplicationDetail?.status"
        />
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="spotCheckDialogVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Random Spot Check Dialog -->
    <el-dialog
      v-model="randomSpotCheckDialogVisible"
      title="随机抽查"
      width="400px"
      center
    >
      <div class="random-spot-check-content">
        <el-form :model="randomSpotCheckForm" label-width="100px">
          <el-form-item label="抽查数量" required>
            <el-input-number
              v-model="randomSpotCheckForm.count"
              :min="1"
              :max="50"
              placeholder="请输入抽查数量"
              style="width: 100%"
            />
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="randomSpotCheckDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            :loading="randomSelecting"
            :disabled="!randomSpotCheckForm.count"
            @click="executeRandomSpotCheck"
          >
            开始随机抽查
          </el-button>
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
import BasicInfoForm from '@/components/common/BasicInfoForm.vue'
import InvoiceUploadForm from '@/components/common/InvoiceUploadForm.vue'
import FileUploadSection from '@/components/common/FileUploadSection.vue'
import ApplicationReviews from '@/components/ApplicationReviews.vue'

const applicationStore = useApplicationStore()

// Reactive data
const searchForm = reactive({
  applicationNumber: '',
  donationProject: '',
  phone: '',
  recipientName: '',
  idNumber: '',
  status: '', // 默认查询审核通过的申请
  dateRange: [] as string[]
})

const spotCheckDialogVisible = ref(false)
const randomSpotCheckDialogVisible = ref(false)
const randomSelecting = ref(false)
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

const activeDetailTab = ref('basic')

const applicationReviews = ref<ApplicationReview[]>([])
const loadingReviews = ref(false)

const randomSpotCheckForm = reactive({
  count: 5
})

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
      idExpiryDate: '',
      householdLocation: '',
      medicalInsuranceLocation: '',
      treatmentLocation: '',
      residenceAddress: '',
      guardianName: '',
      guardianRelationship: '',
      guardianIdType: '',
      guardianIdNumber: '',
      guardianPhone: '',
      guardianAddress: '',
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
    idExpiryDate: String(app.idExpiryDate || ''),
    householdLocation: String(app.householdLocation || ''),
    medicalInsuranceLocation: String(app.medicalInsuranceLocation || ''),
    treatmentLocation: String(app.treatmentLocation || ''),
    residenceAddress: String(app.residenceAddress || ''),
    guardianName: String(app.guardianName || ''),
    guardianRelationship: String(app.guardianRelationship || ''),
    guardianIdType: String(app.guardianIdType || ''),
    guardianIdNumber: String(app.guardianIdNumber || ''),
    guardianPhone: String(app.guardianPhone || ''),
    guardianAddress: String(app.guardianAddress || ''),
    bankAccountName: String(app.bankAccountName || ''),
    bankName: String(app.bankName || ''),
    bankAccountNumber: String(app.bankAccountNumber || ''),
    caseDescription: String(app.caseDescription || '')
  }
})

const applicationDocuments = computed(() => {
  if (!currentApplicationDetail.value) {
    return []
  }
  
  const app = currentApplicationDetail.value
  const documentFiles = app.files?.filter((file: Record<string, unknown>) => 
    file.fileType === 'document' || file.fileType === 'medical' || file.fileType === 'identity'
  ) || []
  
  return documentFiles.map((file: Record<string, unknown>, index: number) => ({
    name: String(file.originalName || file.fileName || `申请资料${index + 1}`),
    url: String(file.fileUrl || file.url || ''),
    uid: String(file.id || `document_${index}`),
    status: 'success',
    size: Number(file.fileSize || file.size || 0)
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

// 抽查相关状态 - 主要针对审核通过的申请
const spotCheckStatuses = [
  { label: '全部', value: '' },
  { label: '审核通过', value: 'final_approved' },
  { label: '初审通过', value: 'initial_approved' },
  { label: '初审存疑', value: 'under_review' },
  { label: '审核退回', value: 'rejected' }
]

// 添加一个标识来跟踪是否显示随机抽查结果
const showingRandomResults = ref(false)

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

const handleSearch = () => {
  applicationStore.setPage(1)
  fetchSpotCheckApplications()
}

const handleReset = () => {
  searchForm.applicationNumber = ''
  searchForm.donationProject = ''
  searchForm.phone = ''
  searchForm.recipientName = ''
  searchForm.idNumber = ''
  searchForm.status = ''
  searchForm.dateRange = []
  
  // 重置随机抽查状态
  showingRandomResults.value = false
  
  applicationStore.setPage(1)
  fetchSpotCheckApplications()
}




const handleSizeChange = (size: number) => {
  pageSize.value = size
  fetchSpotCheckApplications()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  fetchSpotCheckApplications()
}

const fetchSpotCheckApplications = () => {
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
  
  // 重置随机抽查状态
  showingRandomResults.value = false
  
  // 抽查管理页面查询逻辑
  if (searchForm.status) {
    params.status = searchForm.status
    console.log('🔍 抽查管理 - 使用单一状态查询:', searchForm.status)
  } else {
    // 默认查询审核通过的申请（可以进行抽查的）
    params.status = 'final_approved'
    console.log('🔍 抽查管理 - 默认查询审核通过申请')
  }
  
  if (searchForm.dateRange && searchForm.dateRange.length === 2) {
    params.startDate = searchForm.dateRange[0]
    params.endDate = searchForm.dateRange[1]
  }
  
  console.log('🔍 抽查管理页面查询参数:', params)
  
  // 使用管理员搜索接口
  applicationStore.searchApplications(params).then(() => {
    console.log('🔍 查询完成，结果数量:', applications.value.length)
  })
}





// 获取审核记录
const fetchApplicationReviews = async (applicationId: number) => {
  loadingReviews.value = true
  try {
    console.log(`🔍 正在获取申请 ${applicationId} 的审核记录`)
    const reviews = await applicationStore.getApplicationReviews(applicationId)
    applicationReviews.value = reviews || []
    console.log('✅ 审核记录获取成功:', reviews?.length || 0, '条记录')
  } catch (error) {
    console.error('❌ 获取审核记录失败:', error)
    applicationReviews.value = []
  } finally {
    loadingReviews.value = false
  }
}



const executeRandomSpotCheck = async () => {
  // 验证表单
  if (!randomSpotCheckForm.count || randomSpotCheckForm.count <= 0) {
    ElMessage.warning('请输入有效的抽查数量')
    return
  }

  randomSelecting.value = true
  try {
    console.log('执行随机抽查:', randomSpotCheckForm)
    
    // 使用随机抽查接口，默认查询全部时间范围
    const result = await applicationStore.randomSpotCheck(
      randomSpotCheckForm.count,
      'all'
    )
    
    console.log('随机抽查结果:', result)
    
    // 关闭弹窗
    randomSpotCheckDialogVisible.value = false
    
    // 设置显示随机抽查结果
    showingRandomResults.value = true
    
    // 直接设置应用列表为随机抽查结果
    applicationStore.setApplications(result.selectedApplications || [], result.selectedApplications?.length || 0)
    
    // 显示成功消息
    ElMessage.success(`随机抽查完成，共选中 ${result.selectedApplications?.length || 0} 个申请`)
  } catch (error) {
    console.error('随机抽查失败:', error)
    ElMessage.error('随机抽查失败')
  } finally {
    randomSelecting.value = false
  }
}

// 打开单个申请抽查
const openSpotCheck = async (application: ApplicationListItem) => {
  selectedApplication.value = application
  
  try {
    console.log(`🔍 正在查询申请详情: ID=${application.id}, 申请号=${application.applicationNumber}`)
    
    // 使用管理员API根据申请ID查询完整的申请信息
    const detail = await applicationStore.fetchAdminApplicationDetail(application.id)
    
    console.log('✅ 申请详情查询成功:', {
      applicationNumber: detail.applicationNumber,
      recipientName: detail.recipientName,
      status: detail.status,
      filesCount: detail.files?.length || 0
    })
    
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
    
    spotCheckDialogVisible.value = true
    activeDetailTab.value = 'basic'

  } catch (error) {
    console.error('❌ 获取申请详情失败:', error)
    ElMessage.error('获取申请详情失败，请稍后重试')
  }
}

// 清除随机抽查结果，返回完整列表
const clearRandomResults = () => {
  showingRandomResults.value = false
  fetchSpotCheckApplications()
}

// 随机抽查功能
const handleRandomSpotCheck = () => {
  // 设置默认抽查数量
  randomSpotCheckForm.count = 5
  randomSpotCheckDialogVisible.value = true
}

// Lifecycle
onMounted(() => {
  fetchSpotCheckApplications()
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

.spot-check-table {
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

/* 抽查对话框样式 */
.spot-check-dialog-content {
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

/* 随机抽查对话框样式 */
.random-spot-check-content {
  padding: 20px 0;
}





:deep(.el-dialog__body) {
  padding: 20px;
}

:deep(.el-tabs__content) {
  padding-top: 15px;
}
</style>
