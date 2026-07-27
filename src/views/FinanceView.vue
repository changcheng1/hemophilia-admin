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
            <el-form-item label="援助期数">
              <el-input
                v-model="searchForm.donationPeriod"
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
          <span>抽查申请列表</span>
          <div class="header-buttons">
            <el-upload
              ref="uploadRef"
              :auto-upload="false"
              :show-file-list="false"
              :on-change="handleFileChange"
              accept=".xlsx,.xls"
            >
              <el-button type="success">导入信息</el-button>
            </el-upload>
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
        <el-table-column prop="donationProject" label="申请项目" />
        <el-table-column prop="donationPeriod" label="援助期数"  />
        <el-table-column label="上限金额" width="120">
          <template #default="{ row }">
            {{ formatOptionalCurrency(row.singlePeriodLimitAmount) }}
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" width="120">
          <template #default="{ row }">
            {{ row.user?.phone || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="recipientName" label="患者姓名"  />
        <el-table-column prop="idType" label="证件类型" />
        <el-table-column prop="idNumber" label="证件号码" />
        <el-table-column prop="totalReimbursementAmount" label="申请金额" width="120">
          <template #default="{ row }">
            {{ formatOptionalCurrency(row.totalReimbursementAmount) }}
          </template>
        </el-table-column>
        <el-table-column prop="disbursementAmount" label="发放金额" width="120">
          <template #default="{ row }">
            <span style="color: #f56c6c; font-weight: 500;">
              {{ formatOptionalCurrency(row.disbursementAmount) }}
            </span>
          </template>
        </el-table-column>
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
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button
                type="primary"
                size="small"
                @click="handleViewApplication(row)"
              >
                查看
              </el-button>
              <el-button
                v-if="canDisburse(row)"
                type="success"
                size="small"
                @click="handleDisburse(row)"
              >
                申请发放
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

    <!-- Application Detail Dialog -->
    <ApplicationDetailDialog
      v-model:visible="spotCheckDialogVisible"
      title="审核管理"
      :application-detail="currentApplicationDetail"
      :status-type="currentApplicationDetail ? getStatusType(currentApplicationDetail.status as string) : 'info'"
      :status-text="currentApplicationDetail ? getStatusText(currentApplicationDetail.status as string) : ''"
      :hide-documents="true"
    >
      <template #before-content>
        <el-tabs
          v-if="displayRelatedApplications.length"
          v-model="activeRelatedApplicationId"
          class="finance-application-tabs"
          @tab-change="handleRelatedApplicationChange"
        >
          <el-tab-pane
            v-for="item in displayRelatedApplications"
            :key="item.id"
            :label="item.applicationNumber"
            :name="String(item.id)"
          />
        </el-tabs>
      </template>
    </ApplicationDetailDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import axios from 'axios'

import { useApplicationStore } from '@/stores/application'
import { adminApplicationAPI, type RelatedApplicationItem } from '@/api/admin-application'
import { projectApi, type Project } from '@/api/project'
import type { ApplicationListItem } from '@/types/application'
import ApplicationDetailDialog from '@/components/common/ApplicationDetailDialog.vue'
import { disableBeforeDatePickerMinDate } from '@/utils/datePicker'

const applicationStore = useApplicationStore()

// Upload ref
const uploadRef = ref()

// Reactive data
const searchForm = reactive({
  applicationNumber: '',
  donationProject: '',
  phone: '',
  recipientName: '',
  idNumber: '',
  donationPeriod: '',
  status: '', // 默认查询审核通过的申请
  dateRange: [] as string[]
})

const spotCheckDialogVisible = ref(false)

type FinanceApplication = ApplicationListItem & {
  projectId?: number | null
  periodId?: number | null
  donationProject?: string
  donationPeriod?: string
  singlePeriodLimitAmount?: number | string | null
  totalReimbursementAmount?: number | string | null
  disbursementAmount?: number | string | null
  applicationNumber: string
  idType?: string
  idNumber?: string
  bankAccountName?: string
  bankName?: string
  bankLocation?: string
  bankAccountNumber?: string
  residenceAddress?: string
  treatmentLocation?: string
  transportInvoices?: Array<{ url: string }>
  accommodationInvoices?: Array<{ url: string }>
  user?: {
    phone?: string
  }
}

type FinanceSummaryRow = FinanceApplication & {
  applications: FinanceApplication[]
  applicationNumbers: string[]
  latestApplication: FinanceApplication
  totalReimbursementAmount: number
  disbursementAmount: number | null
}

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

const currentApplicationDetail = ref<ApplicationDetail | null>(null)
const allFinanceApplications = ref<FinanceApplication[]>([])
const financeTotal = ref(0)
const financeLoading = ref(false)
const relatedApplications = ref<RelatedApplicationItem[]>([])
const activeRelatedApplicationId = ref('')
const projectLimitLoaded = ref(false)
const projectLimitById = ref(new Map<number, number>())
const projectLimitByName = ref(new Map<string, number>())

const displayRelatedApplications = computed<RelatedApplicationItem[]>(() => {
  if (relatedApplications.value.length) {
    return relatedApplications.value
  }
  if (!currentApplicationDetail.value) {
    return []
  }
  const detail = currentApplicationDetail.value
  return [
    {
      id: detail.id,
      applicationNumber: detail.applicationNumber,
      recipientName: detail.recipientName,
      idNumber: String(detail.idNumber || ''),
      projectId: typeof detail.projectId === 'number' ? detail.projectId : null,
      periodId: typeof detail.periodId === 'number' ? detail.periodId : null,
      donationProject: String(detail.donationProject || ''),
      donationPeriod: String(detail.donationPeriod || ''),
      status: detail.status,
      createdAt: String(detail.createdAt || ''),
    },
  ]
})

// Computed properties
const applications = computed(() => summarizeApplications(allFinanceApplications.value))
const loading = computed(() => applicationStore.loading || financeLoading.value)
const total = computed(() => financeTotal.value)
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
    case 'disbursed':
      return 'success'
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
    'final_approved': '审核通过',
    'disbursed': '申请发放'
  }
  return statusMap[status] || '未知状态'
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const toAmountNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null
  const amount = Number(value)
  return Number.isFinite(amount) ? amount : null
}

const getDisplayDisbursementAmount = (application: { disbursementAmount?: unknown }): number => {
  return toAmountNumber(application.disbursementAmount) ?? 0
}

const formatCurrency = (value: unknown): string => {
  const amount = toAmountNumber(value) ?? 0
  return `¥${amount.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`
}

const formatOptionalCurrency = (value: unknown): string => {
  const amount = toAmountNumber(value)
  if (amount === null) return '-'
  return formatCurrency(amount)
}

const loadProjectLimitAmounts = async () => {
  if (projectLimitLoaded.value) return
  try {
    const response = await projectApi.getAll()
    const projects = response.data
    const byId = new Map<number, number>()
    const byName = new Map<string, number>()

    ;(projects as Project[]).forEach((project) => {
      const limitAmount = toAmountNumber(project.singlePeriodLimitAmount)
      if (limitAmount === null) return
      byId.set(project.id, limitAmount)
      const projectName = String(project.name || '').trim()
      if (projectName) {
        byName.set(projectName, limitAmount)
      }
    })

    projectLimitById.value = byId
    projectLimitByName.value = byName
    projectLimitLoaded.value = true
  } catch (error) {
    console.error('获取项目单期额度失败:', error)
  }
}

const getProjectLimitAmount = (application: FinanceApplication): number | null => {
  const directAmount = toAmountNumber(application.singlePeriodLimitAmount)
  if (directAmount !== null) return directAmount

  const projectId = Number(application.projectId)
  if (Number.isFinite(projectId)) {
    const amountById = projectLimitById.value.get(projectId)
    if (amountById !== undefined) return amountById
  }

  const projectName = String(application.donationProject || '').trim()
  if (projectName) {
    const amountByName = projectLimitByName.value.get(projectName)
    if (amountByName !== undefined) return amountByName
  }

  return null
}

const canDisburse = (row: FinanceSummaryRow | FinanceApplication) => {
  const applications = (row as FinanceSummaryRow).applications || [row as FinanceApplication]
  return applications.some((item) => item.status === 'final_approved')
}

const getSummaryKey = (application: FinanceApplication) => {
  return [
    application.idNumber || '',
    application.projectId || application.donationProject || '',
    application.periodId || application.donationPeriod || '',
  ].join('|')
}

const summarizeApplications = (items: FinanceApplication[]): FinanceSummaryRow[] => {
  const groups = new Map<string, FinanceApplication[]>()
  items.forEach((item) => {
    const key = getSummaryKey(item)
    const group = groups.get(key) || []
    group.push(item)
    groups.set(key, group)
  })

  return Array.from(groups.values()).flatMap((group) => {
    const sorted = [...group].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    const latest = sorted[0]
    if (!latest) return []
    const requestAmount = sorted.reduce(
      (sum, item) => sum + (toAmountNumber(item.totalReimbursementAmount) ?? 0),
      0,
    )
    const disbursedItems = sorted
      .map((item) => toAmountNumber(item.disbursementAmount))
      .filter((amount): amount is number => amount !== null)
    const disbursementAmount = disbursedItems.length
      ? disbursedItems.reduce((sum, amount) => sum + amount, 0)
      : null
    const singlePeriodLimitAmount = sorted
      .map((item) => getProjectLimitAmount(item))
      .find((amount): amount is number => amount !== null)

    return [{
      ...latest,
      applications: sorted,
      latestApplication: latest,
      applicationNumber: latest.applicationNumber,
      applicationNumbers: sorted.map((item) => item.applicationNumber),
      singlePeriodLimitAmount: singlePeriodLimitAmount ?? latest.singlePeriodLimitAmount,
      totalReimbursementAmount: requestAmount,
      disbursementAmount,
    }]
  })
}

const buildFinanceSearchParams = (withPagination = true) => {
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
  if (searchForm.donationPeriod) {
    params.donationPeriod = searchForm.donationPeriod
  }

  params.reviewableStatuses = ['final_approved', 'disbursed']

  if (searchForm.dateRange && searchForm.dateRange.length === 2) {
    params.startDate = searchForm.dateRange[0]
    params.endDate = searchForm.dateRange[1]
  }

  if (withPagination) {
    params.page = 1
    params.limit = 10000
  }

  return params
}

const normalizeDetailFiles = (detail: Record<string, unknown>) => {
  if (Array.isArray(detail.files) && detail.files.length > 0) {
    detail.files = detail.files.map((file: Record<string, unknown>) => ({
      ...file,
      fileUrl: file.url || file.path || '',
      fileSize: file.size || 0,
      createdAt: file.createdAt || file.uploadedAt
    }))
  }
  return detail
}

const toRelatedApplicationItem = (application: FinanceApplication): RelatedApplicationItem => ({
  id: application.id,
  applicationNumber: application.applicationNumber,
  recipientName: application.recipientName,
  idNumber: application.idNumber || '',
  projectId: application.projectId,
  periodId: application.periodId,
  donationProject: application.donationProject,
  donationPeriod: application.donationPeriod,
  status: application.status,
  createdAt: application.createdAt
})

const getFallbackRelatedApplications = (
  application: ApplicationListItem | FinanceSummaryRow,
): RelatedApplicationItem[] => {
  const summary = application as FinanceSummaryRow
  const items = summary.applications || [application as FinanceApplication]
  return items.map((item) => toRelatedApplicationItem(item))
}

const ensureCurrentApplicationInRelatedList = (
  target: FinanceApplication,
  relatedItems: RelatedApplicationItem[],
) => {
  if (relatedItems.some((item) => item.id === target.id)) {
    return relatedItems
  }
  return [toRelatedApplicationItem(target), ...relatedItems]
}

const mergeRelatedApplications = (
  target: FinanceApplication,
  primaryItems: RelatedApplicationItem[],
  fallbackItems: RelatedApplicationItem[],
) => {
  const itemById = new Map<number, RelatedApplicationItem>()
  ;[
    ...ensureCurrentApplicationInRelatedList(target, primaryItems),
    ...fallbackItems,
  ].forEach((item) => {
    if (item?.id && !itemById.has(item.id)) {
      itemById.set(item.id, item)
    }
  })
  return Array.from(itemById.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

const loadFinanceApplicationDetail = async (applicationId: number) => {
  const detail = await applicationStore.fetchAdminApplicationDetail(applicationId)
  currentApplicationDetail.value = normalizeDetailFiles(
    detail as Record<string, unknown>,
  ) as ApplicationDetail
  activeRelatedApplicationId.value = String(applicationId)
}

// 查看申请详情
const handleViewApplication = async (application: ApplicationListItem | FinanceSummaryRow) => {
  try {
    const target = (application as FinanceSummaryRow).latestApplication || application
    const fallbackRelatedApplications = getFallbackRelatedApplications(application)

    try {
      const relatedItems = await adminApplicationAPI.getRelatedApplications(target.id)
      relatedApplications.value = mergeRelatedApplications(
        target as FinanceApplication,
        relatedItems,
        fallbackRelatedApplications,
      )
    } catch (error) {
      console.error('获取同组申请列表失败:', error)
      relatedApplications.value = fallbackRelatedApplications
    }

    await loadFinanceApplicationDetail(target.id)
    
    // 显示对话框
    spotCheckDialogVisible.value = true
  } catch (error) {
    console.error('获取申请详情失败:', error)
    ElMessage.error('获取申请详情失败')
  }
}

const handleRelatedApplicationChange = async (name: string | number) => {
  const applicationId = Number(name)
  if (!applicationId || applicationId === currentApplicationDetail.value?.id) return

  try {
    await loadFinanceApplicationDetail(applicationId)
  } catch (error) {
    console.error('切换申请详情失败:', error)
    ElMessage.error('切换申请详情失败')
  }
}

// 处理申请发放
const handleDisburse = async (application: ApplicationListItem | FinanceSummaryRow) => {
  try {
    const summary = application as FinanceSummaryRow
    const targetApplications = summary.applications || [application as FinanceApplication]
    const payableApplications = targetApplications.filter((item) => item.status === 'final_approved')
    if (!payableApplications.length) {
      ElMessage.warning('当前汇总记录没有待发放申请')
      return
    }
    await ElMessageBox.confirm(
      `确定要将 ${payableApplications.length} 条申请标记为申请发放吗？`,
      '确认发放',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    for (const item of payableApplications) {
      await adminApplicationAPI.disburseApplication(item.id, {
        comment: '财务发放完成',
        amount: toAmountNumber(item.totalReimbursementAmount) ?? 0,
      })
    }

    ElMessage.success('申请发放成功')
    
    // 刷新列表
    fetchSpotCheckApplications()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('申请发放失败:', error)
      ElMessage.error(error.response?.data?.message || '申请发放失败')
    }
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
  searchForm.donationPeriod = ''
  searchForm.status = ''
  searchForm.dateRange = []
  
  // 重置随机抽查状态
  showingRandomResults.value = false
  
  applicationStore.setPage(1)
  fetchSpotCheckApplications()
}




const handleSizeChange = (size: number) => {
  applicationStore.setPageSize(size)
  applicationStore.setPage(1)
  updatePagedFinanceApplications()
}

const handleCurrentChange = (page: number) => {
  applicationStore.setPage(page)
  updatePagedFinanceApplications()
}

const updatePagedFinanceApplications = () => {
  const summarized = summarizeApplications(allFinanceApplications.value)
  financeTotal.value = summarized.length
  const start = (currentPage.value - 1) * pageSize.value
  applicationStore.setApplications(
    summarized.slice(start, start + pageSize.value),
    summarized.length,
  )
}

const fetchSpotCheckApplications = async () => {
  showingRandomResults.value = false
  financeLoading.value = true
  try {
    await loadProjectLimitAmounts()
    const response = await adminApplicationAPI.searchApplications(
      buildFinanceSearchParams(true),
    )
    allFinanceApplications.value = response.data as FinanceApplication[]
    updatePagedFinanceApplications()
  } catch (error) {
    console.error('获取财务申请列表失败:', error)
    ElMessage.error('获取财务申请列表失败')
  } finally {
    financeLoading.value = false
  }
}

// 处理导出命令
const handleExportCommand = async () => {
  try {
    // 获取总数
    const totalCount = total.value
    
    if (totalCount === 0) {
      ElMessage.warning('没有可导出的数据')
      return
    }

    const confirmed = await ElMessageBox.confirm(
      `确定要导出打款信息吗？`,
      '确认导出',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info',
      }
    ).catch(() => false)

    if (!confirmed) {
      return
    }

    // 导出所有数据
    await exportAllToExcel()
  } catch (error) {
    console.error('导出失败:', error)
  }
}

// 导出所有数据到Excel（带发票图片）
const exportAllToExcel = async () => {
  try {
    await loadProjectLimitAmounts()
    const response = await adminApplicationAPI.searchApplications(
      buildFinanceSearchParams(true),
    )
    const allApplications = summarizeApplications(response.data as FinanceApplication[])
    
    if (allApplications.length === 0) {
      ElMessage.warning('没有可导出的审核通过或申请发放数据')
      return
    }
    // 创建工作簿和工作表
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('打款信息表')

    // 设置列（包含申请号和发放金额）
    worksheet.columns = [
      { header: '申请号', key: 'applicationNumber', width: 20 },
      { header: '姓名', key: 'name', width: 12 },
      { header: '手机号', key: 'phone', width: 15 },
      { header: '身份证号', key: 'idNumber', width: 20 },
      { header: '账户名', key: 'accountName', width: 12 },
      { header: '开户银行', key: 'bankName', width: 15 },
      { header: '开户行所在区域', key: 'bankLocation', width: 20 },
      { header: '银行账号', key: 'accountNumber', width: 20 },
      { header: '常住地址', key: 'address', width: 25 },
      { header: '就诊地', key: 'treatment', width: 20 },
      { header: '援助项目', key: 'donationProject', width: 15 },
      { header: '项目期数', key: 'donationPeriod', width: 12 },
      { header: '上限金额', key: 'limitAmount', width: 12 },
      { header: '申请时间', key: 'applyDate', width: 12 },
      { header: '审核状态', key: 'status', width: 12 },
      { header: '发放金额', key: 'disbursementAmount', width: 12 },
      { header: '申请总金额', key: 'totalAmount', width: 12 },
      { header: '交通发票', key: 'transportInvoice', width: 30 },
      { header: '住宿发票', key: 'accommodationInvoice', width: 30 }
    ]

    // 设置表头样式
    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' }

    // 添加数据和图片
    for (let i = 0; i < allApplications.length; i++) {
      const app = allApplications[i]
      if (!app) continue
      const latest = app.latestApplication || app
      
      const totalAmount = toAmountNumber(app.totalReimbursementAmount) ?? 0
      const disbursementAmount = getDisplayDisbursementAmount(app)
      const limitAmount = toAmountNumber(app.singlePeriodLimitAmount) ?? 0

      // 添加数据行（包含申请号和发放金额）
      const row = worksheet.addRow({
        applicationNumber: latest.applicationNumber || '-',
        name: app.recipientName || '-',
        phone: app.user?.phone || '-',
        idNumber: app.idNumber || '-',
        accountName: app.bankAccountName || '-',
        bankName: app.bankName || '-',
        bankLocation: app.bankLocation || '-',
        accountNumber: app.bankAccountNumber || '-',
        address: app.residenceAddress || '-',
        treatment: app.treatmentLocation || '-',
        donationProject: app.donationProject || '-',
        donationPeriod: app.donationPeriod || '-',
        limitAmount: limitAmount.toFixed(2),
        applyDate: latest.createdAt ? new Date(latest.createdAt).toLocaleDateString('zh-CN') : '-',
        status: getStatusText(app.status),
        disbursementAmount: disbursementAmount.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        transportInvoice: '',
        accommodationInvoice: ''
      })

      // 设置行高以容纳图片（根据发票数量动态调整，每张图片40px高度 + 20px间距）
      const transportInvoices = app.applications.flatMap((item) => item.transportInvoices || [])
      const accommodationInvoices = app.applications.flatMap((item) => item.accommodationInvoices || [])
      const maxInvoices = Math.max(transportInvoices.length, accommodationInvoices.length)
      row.height = maxInvoices > 0 ? maxInvoices * 60 : 60

      // 添加交通发票图片（固定大小80x40，间距20px，支持多张）
      if (transportInvoices.length > 0) {
        for (let j = 0; j < transportInvoices.length; j++) {
          const invoice = transportInvoices[j]
          if (!invoice) continue
          try {
            const imageBuffer = await downloadImage(invoice.url)
            if (imageBuffer) {
              const imageId = workbook.addImage({
                buffer: imageBuffer,
                extension: getImageExtension(invoice.url)
              })
              
              // 固定大小80x40，垂直间距20px（交通发票在第17列，索引为17）
              worksheet.addImage(imageId, {
                tl: { col: 17, row: i + 1 + j * 0.8 } as any,
                ext: { width: 80, height: 40 },
                editAs: 'oneCell'
              })
            }
          } catch (error) {
            console.error('添加交通发票图片失败:', error)
          }
        }
      }

      // 添加住宿发票图片（固定大小80x40，间距20px，支持多张）
      if (accommodationInvoices.length > 0) {
        for (let j = 0; j < accommodationInvoices.length; j++) {
          const invoice = accommodationInvoices[j]
          if (!invoice) continue
          try {
            const imageBuffer = await downloadImage(invoice.url)
            if (imageBuffer) {
              const imageId = workbook.addImage({
                buffer: imageBuffer,
                extension: getImageExtension(invoice.url)
              })
              
              // 固定大小80x40，垂直间距20px（住宿发票在第18列，索引为18）
              worksheet.addImage(imageId, {
                tl: { col: 18, row: i + 1 + j * 0.8 } as any,
                ext: { width: 80, height: 40 },
                editAs: 'oneCell'
              })
            }
          } catch (error) {
            console.error('添加住宿发票图片失败:', error)
          }
        }
      }
    }

    // 生成Excel文件并下载
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    const fileName = `打款信息表_${new Date().toISOString().slice(0, 10)}.xlsx`
    saveAs(blob, fileName)
    
    ElMessage.success(`Excel导出成功！共导出 ${allApplications.length} 条数据`)
  } catch (error) {
    console.error('Excel导出失败:', error)
    ElMessage.error('Excel导出失败: ' + (error as Error).message)
  }
}

// 下载图片并转换为Buffer
const downloadImage = async (url: string): Promise<ArrayBuffer | null> => {
    // 替换localhost地址为实际服务器地址
    let fixedUrl = url
    if (url.includes('localhost:3000')) {
      fixedUrl = url.replace('http://localhost:3000', 'http://8.147.63.4:3001')
    } else if (url.includes('localhost:3001')) {
      fixedUrl = url.replace('http://localhost:3001', 'http://8.147.63.4:3001')
    }
    
    const response = await axios.get(fixedUrl, { 
      responseType: 'arraybuffer',
      timeout: 10000
    })
    return response.data
}

// 获取图片扩展名
const getImageExtension = (url: string): 'png' | 'jpeg' | 'gif' => {
  const ext = url.split('.').pop()?.toLowerCase()
  if (ext === 'png') return 'png'
  if (ext === 'gif') return 'gif'
  return 'jpeg'
}

// 处理文件选择
const handleFileChange = async (file: { raw?: File }) => {
  try {
    const rawFile = file.raw
    if (!rawFile) {
      ElMessage.error('请选择文件')
      return
    }

    // 验证文件类型
    const fileName = rawFile.name
    if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
      ElMessage.error('只支持 Excel 文件格式（.xlsx 或 .xls）')
      return
    }

    // 读取Excel文件
    const workbook = new ExcelJS.Workbook()
    const arrayBuffer = await rawFile.arrayBuffer()
    await workbook.xlsx.load(arrayBuffer)
    
    const worksheet = workbook.getWorksheet(1)
    if (!worksheet) {
      ElMessage.error('Excel文件中没有找到工作表')
      return
    }

    // 解析数据（跳过表头）
    const importData: {
      applicationNumber: string
      name: string
      phone: string
      idNumber: string
      accountName: string
      bankName: string
      bankLocation: string
      accountNumber: string
      address: string
      treatment: string
      donationProject: string
      donationPeriod: string
      limitAmount: string
      applyDate: string
      status: string
      disbursementAmount: string
      totalAmount: string
    }[] = []
    
    const validationErrors: string[] = []
    
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return // 跳过表头
      
      const rowData = {
        applicationNumber: row.getCell(1).value?.toString().trim() || '',
        name: row.getCell(2).value?.toString().trim() || '',
        phone: row.getCell(3).value?.toString().trim() || '',
        idNumber: row.getCell(4).value?.toString().trim() || '',
        accountName: row.getCell(5).value?.toString().trim() || '',
        bankName: row.getCell(6).value?.toString().trim() || '',
        bankLocation: row.getCell(7).value?.toString().trim() || '',
        accountNumber: row.getCell(8).value?.toString().trim() || '',
        address: row.getCell(9).value?.toString().trim() || '',
        treatment: row.getCell(10).value?.toString().trim() || '',
        donationProject: row.getCell(11).value?.toString().trim() || '',
        donationPeriod: row.getCell(12).value?.toString().trim() || '',
        limitAmount: row.getCell(13).value?.toString().trim() || '',
        applyDate: row.getCell(14).value?.toString().trim() || '',
        status: row.getCell(15).value?.toString().trim() || '',
        disbursementAmount: row.getCell(16).value?.toString().trim() || '',
        totalAmount: row.getCell(17).value?.toString().trim() || ''
      }
      
      // 校验必填字段
      const requiredFields = [
        { field: 'applicationNumber', label: '申请号', value: rowData.applicationNumber },
        { field: 'name', label: '姓名', value: rowData.name },
        { field: 'phone', label: '手机号', value: rowData.phone },
        { field: 'idNumber', label: '身份证号', value: rowData.idNumber },
        { field: 'accountName', label: '账户名', value: rowData.accountName },
        { field: 'bankName', label: '开户银行', value: rowData.bankName },
        { field: 'bankLocation', label: '开户行所在区域', value: rowData.bankLocation },
        { field: 'accountNumber', label: '银行账号', value: rowData.accountNumber },
        { field: 'address', label: '常住地址', value: rowData.address },
        { field: 'treatment', label: '就诊地', value: rowData.treatment },
        { field: 'donationProject', label: '援助项目', value: rowData.donationProject },
        { field: 'donationPeriod', label: '项目期数', value: rowData.donationPeriod },
        { field: 'applyDate', label: '申请时间', value: rowData.applyDate },
        { field: 'status', label: '审核状态', value: rowData.status },
        { field: 'disbursementAmount', label: '发放金额', value: rowData.disbursementAmount }
      ]
      
      const missingFields: string[] = []
      requiredFields.forEach(({ label, value }) => {
        if (!value) {
          missingFields.push(label)
        }
      })
      
      if (missingFields.length > 0) {
        validationErrors.push(`第 ${rowNumber} 行缺少必填字段: ${missingFields.join('、')}`)
      } else {
        // 验证手机号格式
        if (!/^1[3-9]\d{9}$/.test(rowData.phone)) {
          validationErrors.push(`第 ${rowNumber} 行手机号格式不正确: ${rowData.phone}`)
        }
        
        // 验证身份证号格式（简单验证长度）
        if (rowData.idNumber.length !== 15 && rowData.idNumber.length !== 18) {
          validationErrors.push(`第 ${rowNumber} 行身份证号格式不正确: ${rowData.idNumber}`)
        }
        
        // 验证金额格式
        if (isNaN(parseFloat(rowData.disbursementAmount))) {
          validationErrors.push(`第 ${rowNumber} 行发放金额格式不正确: ${rowData.disbursementAmount}`)
        }
        
        // 验证申请总金额格式（如果提供）
        if (rowData.totalAmount && isNaN(parseFloat(rowData.totalAmount))) {
          validationErrors.push(`第 ${rowNumber} 行申请总金额格式不正确: ${rowData.totalAmount}`)
        }
        
        // 如果没有错误，添加到导入数据
        if (validationErrors.length === 0 || !validationErrors.some(err => err.includes(`第 ${rowNumber} 行`))) {
          importData.push(rowData)
        }
      }
    })

    // 如果有校验错误，显示错误信息
    if (validationErrors.length > 0) {
      const errorMessage = validationErrors.slice(0, 5).join('\n') + 
        (validationErrors.length > 5 ? `\n... 还有 ${validationErrors.length - 5} 个错误` : '')
      ElMessageBox.alert(errorMessage, '数据校验失败', {
        confirmButtonText: '确定',
        type: 'error',
        dangerouslyUseHTMLString: false
      })
      return
    }

    if (importData.length === 0) {
      ElMessage.warning('Excel文件中没有有效数据')
      return
    }

    // 确认导入
    await ElMessageBox.confirm(
      `确定要导入 ${importData.length} 条数据吗？`,
      '确认导入',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info',
      }
    )

    // 调用后端API导入数据
    console.log('准备导入的数据:', importData.slice(0, 2)); // 打印前2条数据
    const result = await adminApplicationAPI.importApplications(importData)
    
    if (result.failed > 0) {
      ElMessage.warning(`导入完成：成功 ${result.success} 条，失败 ${result.failed} 条`)
      console.error('导入错误:', result.errors)
    } else {
      ElMessage.success(`成功导入 ${result.success} 条数据`)
    }
    
    // 刷新列表
    fetchSpotCheckApplications()
  } catch (error: unknown) {
    if (error !== 'cancel') {
      console.error('导入失败:', error)
      const errorMessage = error instanceof Error ? error.message : '导入失败'
      ElMessage.error(errorMessage)
    }
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

.finance-application-tabs {
  margin-bottom: 20px;

  :deep(.el-tabs__header) {
    margin: 0;
  }

  :deep(.el-tabs__nav-wrap::after) {
    height: 1px;
  }

  :deep(.el-tabs__item) {
    min-width: 140px;
    padding: 0 24px;
    font-weight: 600;
    font-size: 15px;
  }
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

/* 随机抽查对话框样式 */
.random-spot-check-content {
  padding: 20px 0;
}
</style>
