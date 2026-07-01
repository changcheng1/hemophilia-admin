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
            <el-form-item label="状态">
              <el-select
                v-model="searchForm.status"
                placeholder="请选择"
                clearable
                style="min-width: 150px; width: 100%"
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
        <el-table-column prop="applicationNumber" label="申请号" show-overflow-tooltip/>
        <el-table-column prop="donationProject" label="申请项目"/>
        <el-table-column prop="donationPeriod" label="申请期数" />
        <el-table-column prop="phone" label="手机号">
          <template #default="{ row }">
            {{ row.user?.phone || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="recipientName" label="患者姓名" />
        <el-table-column prop="idType" label="证件类型"  />
        <el-table-column prop="idNumber" label="证件号码" />
        <el-table-column prop="status" label="申请状态">
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
    <ApplicationDetailDialog
      v-model:visible="spotCheckDialogVisible"
      title="申请详情"
      :application-detail="currentApplicationDetail"
      :status-type="currentApplicationDetail ? getStatusType(currentApplicationDetail.status as string) : 'info'"
      :status-text="currentApplicationDetail ? getStatusText(currentApplicationDetail.status as string) : ''"
      :show-reviews="true"
      :reviews="applicationReviews"
      :loading-reviews="loadingReviews"
    />

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
import ApplicationDetailDialog from '@/components/common/ApplicationDetailDialog.vue'

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

const randomSpotCheckForm = reactive({
  count: 5
})

// 审核记录相关
const applicationReviews = ref<Array<{
  id: number
  stage: string
  result: string
  comment?: string
  createdAt: string
  reviewer?: {
    id: number
    phone: string
  }
}>>([])
const loadingReviews = ref(false)

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

// 抽查相关状态 - 显示所有状态
const spotCheckStatuses = [
  { label: '全部', value: '' },
  { label: '待审核', value: 'pending_initial' },
  { label: '初审通过', value: 'initial_approved' },
  { label: '初审存疑', value: 'under_review' },
  { label: '审核通过', value: 'final_approved' },
  { label: '审核退回', value: 'rejected' },
  { label: '援助发放', value: 'disbursed' }
]

// 添加一个标识来跟踪是否显示随机抽查结果
const showingRandomResults = ref(false)

// Methods
const getStatusType = (status: string): string => {
  switch (status) {
    case 'draft':
      return 'info'
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
    'draft': '待补全',
    'pending_initial': '待审核',
    'initial_approved': '初审通过',
    'under_review': '初审存疑',
    'rejected': '审核退回',
    'final_approved': '审核通过',
    'disbursed': '援助发放'
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
  applicationStore.setPageSize(size)
  fetchSpotCheckApplications()
}

const handleCurrentChange = (page: number) => {
  applicationStore.setPage(page)
  fetchSpotCheckApplications()
}

const fetchSpotCheckApplications = () => {
  const params: Record<string, unknown> = {}
  params.maskSensitive = true
  
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
  
  // 抽查管理页面查询逻辑 - 显示所有申请记录
  if (searchForm.status) {
    params.status = searchForm.status
  }
  // 不设置默认状态，显示所有申请
  
  if (searchForm.dateRange && searchForm.dateRange.length === 2) {
    params.startDate = searchForm.dateRange[0]
    params.endDate = searchForm.dateRange[1]
  }
  
  
  // 使用管理员搜索接口
  applicationStore.searchApplications(params).then(() => {
  })
}

// 查看申请详情
const handleViewApplication = async (application: ApplicationListItem) => {
  try {
    // 使用管理员API根据申请ID查询完整的申请信息
    const detail = await applicationStore.fetchAdminApplicationDetail(application.id, { maskSensitive: true })
    
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
    
    // 获取审核记录
    await fetchApplicationReviews(application.id)
    
    // 显示对话框
    spotCheckDialogVisible.value = true
  } catch (error) {
    console.error('获取申请详情失败:', error)
    ElMessage.error('获取申请详情失败')
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
      'all',
      { maskSensitive: true }
    )
    
    console.log('随机抽查结果:', result)
    
    // 关闭弹窗
    randomSpotCheckDialogVisible.value = false
    
    // 设置显示随机抽查结果
    showingRandomResults.value = true
    
    // 直接设置应用列表为随机抽查结果
    applicationStore.setApplications(result.selectedApplications || [], result.selectedApplications?.length || 0)
  } catch (error) {
    console.error('随机抽查失败:', error)
    ElMessage.error('随机抽查失败')
  } finally {
    randomSelecting.value = false
  }
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

/* 随机抽查对话框样式 */
.random-spot-check-content {
  padding: 20px 0;
}
</style>
