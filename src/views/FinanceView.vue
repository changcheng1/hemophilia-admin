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
            <el-button @click="handleExportCommand" type="primary">导出打款信息</el-button>
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
        <el-table-column prop="applicationNumber" label="申请号" show-overflow-tooltip/>
        <el-table-column prop="donationProject" label="援助项目" />
        <el-table-column prop="donationPeriod" label="援助期数"  />
        <el-table-column prop="phone" label="手机号" width="120">
          <template #default="{ row }">
            {{ row.user?.phone || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="recipientName" label="患者姓名"  />
        <el-table-column prop="idType" label="证件类型" />
        <el-table-column prop="idNumber" label="证件号码" />
        <el-table-column prop="status" label="申请状态" >
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="申请时间" >
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button
                type="primary"
                size="small"
                @click="handleViewApplication(row)"
              >
                查看
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

    <!-- Spot Check Dialog -->
    <el-dialog
      v-model="spotCheckDialogVisible"
      title="申请详情"
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
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="spotCheckDialogVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

import { useApplicationStore } from '@/stores/application'
import type { ApplicationListItem } from '@/types/application'
import BasicInfoDisplay from '@/components/common/BasicInfoDisplay.vue'
import InvoiceUploadForm from '@/components/common/InvoiceUploadForm.vue'
import FileUploadSection from '@/components/common/FileUploadSection.vue'

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
  
  // 过滤掉发票类型的文件，只返回其他文档
  return currentApplicationDetail.value.files
    .filter((file: Record<string, unknown>) => 
      file.fileType !== 'transport_invoice' && 
      file.fileType !== 'accommodation_invoice'
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
      // 兼容旧格式
      name: String(file.originalName || ''),
      uid: Number(file.id) || Date.now()
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
  
  // 根据 fileType 筛选交通费发票和住宿费发票
  const transportFiles = (app.files || [])
    .filter((file: Record<string, unknown>) => file.fileType === 'transport_invoice')
    .map((file: Record<string, unknown>) => ({
      id: file.id,
      name: String(file.originalName || `交通费发票`),
      url: String(file.url || ''),
      uid: String(file.id || Date.now()),
      status: 'success',
      size: Number(file.size) || 0,
      fileType: file.fileType,
      originalName: file.originalName
    }))
  
  const accommodationFiles = (app.files || [])
    .filter((file: Record<string, unknown>) => file.fileType === 'accommodation_invoice')
    .map((file: Record<string, unknown>) => ({
      id: file.id,
      name: String(file.originalName || `住宿费发票`),
      url: String(file.url || ''),
      uid: String(file.id || Date.now()),
      status: 'success',
      size: Number(file.size) || 0,
      fileType: file.fileType,
      originalName: file.originalName
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

// 查看申请详情
const handleViewApplication = async (application: ApplicationListItem) => {
  try {
    // 使用管理员API根据申请ID查询完整的申请信息
    const detail = await applicationStore.fetchAdminApplicationDetail(application.id)
    
    // 转换文件数据格式以匹配前端组件期望的格式
    if (detail.files && detail.files.length > 0) {
      detail.files = detail.files.map((file: Record<string, unknown>) => ({
        ...file,
        fileUrl: file.url || file.path || '',
        fileSize: file.size || 0,
        createdAt: file.createdAt || file.uploadedAt
      }))
    }
    
    currentApplicationDetail.value = detail as ApplicationDetail
    
    // 重置标签页
    activeDetailTab.value = 'basic'
    
    // 显示对话框
    spotCheckDialogVisible.value = true
  } catch (error) {
    console.error('获取申请详情失败:', error)
    ElMessage.error('获取申请详情失败')
  }
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

    // 默认查询审核通过的申请（可以进行抽查的）
    params.status = 'final_approved'
  
  if (searchForm.dateRange && searchForm.dateRange.length === 2) {
    params.startDate = searchForm.dateRange[0]
    params.endDate = searchForm.dateRange[1]
  }
  
  
  // 使用管理员搜索接口
  applicationStore.searchApplications(params).then(() => {
  })
}








// 处理导出命令
const handleExportCommand = () => {
  if (applications.value.length === 0) {
    ElMessage.warning('没有可导出的数据')
    return
  }

  ElMessageBox.confirm(
    `确定要导出 ${applications.value.length} 条打款信息吗？`,
    '确认导出',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info',
    }
  ).then(() => {
      exportToExcel()
  }).catch(() => {
    // 用户取消
  })
}


// 导出Excel
const exportToExcel = () => {
  try {
    // 准备Excel数据
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const excelData = applications.value.map((app: any, index: number) => ({
      '序号': index + 1,
      '姓名': app.recipientName || '-',
      '手机号': app.user?.phone || '-',
      '身份证号': app.idNumber || '-',
      '账户名': app.bankAccountName || '-',
      '开户银行': app.bankName || '-',
      '银行账号': app.bankAccountNumber || '-',
      '常住地址': app.residenceAddress || '-',
      '就诊地': app.treatmentLocation || '-',
      '申请时间': app.createdAt ? new Date(app.createdAt).toLocaleDateString('zh-CN') : '-',
      '审核状态': getStatusText(app.status),
      '援助金额': ((Number(app.transportReimbursementAmount) || 0) + (Number(app.accommodationReimbursementAmount) || 0)).toFixed(2)
    }))

    // 创建工作簿和工作表
    const worksheet = XLSX.utils.json_to_sheet(excelData)
    const workbook = XLSX.utils.book_new()
    
    // 设置列宽
    const colWidths = [
      { wch: 8 },  // 序号
      { wch: 12 }, // 姓名
      { wch: 15 }, // 手机号
      { wch: 20 }, // 身份证号
      { wch: 12 }, // 账户名
      { wch: 15 }, // 开户银行
      { wch: 20 }, // 银行账号
      { wch: 25 }, // 常住地址
      { wch: 20 }, // 就诊地
      { wch: 12 }, // 申请时间
      { wch: 12 }, // 审核状态
      { wch: 12 }  // 援助金额
    ]
    worksheet['!cols'] = colWidths

    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(workbook, worksheet, '打款信息表')

    // 生成Excel文件并下载
    const fileName = `打款信息表_${new Date().toISOString().slice(0, 10)}.xls`
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    saveAs(blob, fileName)
    
    ElMessage.success('Excel导出成功')
  } catch (error) {
    console.error('Excel导出失败:', error)
    ElMessage.error('Excel导出失败')
  }
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
