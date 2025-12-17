<template>
  <div class="finance">
    <!-- Finance Statistics -->
    <FinanceStats :stats="financeStats" :loading="loading" />

    <!-- Search and Filter -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="申请编号">
          <el-input
            v-model="searchForm.search"
            placeholder="请输入申请编号或受助人姓名"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="发放状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 150px"
          >
            <el-option
              v-for="status in financeStatuses"
              :key="status.value"
              :label="status.label"
              :value="status.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" :icon="Search">
            搜索
          </el-button>
          <el-button @click="handleReset" :icon="Refresh">
            重置
          </el-button>
          <el-button type="success" @click="handleExport" :icon="Download">
            导出记录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Finance Application List -->
    <el-card class="list-card">
      <template #header>
        <div class="card-header">
          <span>财务申请列表</span>
          <div class="header-actions">
            <el-tag type="warning" class="stat-tag">
              待处理: {{ pendingDisbursementCount }}
            </el-tag>
            <el-tag type="success" class="stat-tag">
              待发放金额: {{ formatCurrency(totalPendingAmount) }}
            </el-tag>
            <el-button 
              type="primary" 
              @click="refreshList" 
              :icon="Refresh"
              :loading="loading"
            >
              刷新
            </el-button>
          </div>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="financeApplications"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="applicationNumber" label="申请编号" width="180" />
        <el-table-column prop="recipientName" label="受助人姓名" width="120" />
        <el-table-column prop="amount" label="申请金额" width="120">
          <template #default="{ row }">
            <span class="amount-text">{{ formatCurrency(row.amount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="发放状态" width="140">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="approvedAt" label="审批时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.approvedAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.updatedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="viewFinanceDetail(row.id)"
              :icon="View"
            >
              查看详情
            </el-button>
            <el-button
              v-if="canProcess(row.status)"
              type="success"
              size="small"
              @click="quickProcess(row)"
              :icon="Edit"
            >
              快速处理
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

    <!-- Quick Process Dialog -->
    <el-dialog
      v-model="quickProcessVisible"
      title="财务处理"
      width="600px"
      center
    >
      <div v-if="selectedApplication">
        <div class="application-info">
          <h4>{{ selectedApplication.applicationNumber }} - {{ selectedApplication.recipientName }}</h4>
          <p>申请金额: <span class="amount-highlight">{{ formatCurrency(selectedApplication.amount) }}</span></p>
        </div>
        <FinanceActions
          :application-id="selectedApplication.id"
          :current-status="selectedApplication.status"
          :application-amount="selectedApplication.amount"
          :loading="submitting"
          @submit="handleQuickProcessSubmit"
          @cancel="quickProcessVisible = false"
        />
      </div>
    </el-dialog>

    <!-- Finance Detail Dialog -->
    <el-dialog
      v-model="detailVisible"
      title="财务详情"
      width="800px"
      center
    >
      <div v-if="currentFinanceApplication" class="finance-detail">
        <!-- Application Basic Info -->
        <el-card class="detail-card">
          <template #header>
            <span>申请基本信息</span>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="申请编号">
              {{ currentFinanceApplication.applicationNumber }}
            </el-descriptions-item>
            <el-descriptions-item label="受助人姓名">
              {{ currentFinanceApplication.recipientName }}
            </el-descriptions-item>
            <el-descriptions-item label="身份证号">
              {{ currentFinanceApplication.idNumber }}
            </el-descriptions-item>
            <el-descriptions-item label="申请金额">
              <span class="amount-highlight">{{ formatCurrency(currentFinanceApplication.amount) }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="发放状态">
              <el-tag :type="getStatusType(currentFinanceApplication.status)">
                {{ getStatusText(currentFinanceApplication.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="审批时间">
              {{ formatDate(currentFinanceApplication.approvedAt) }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- Bank Information -->
        <el-card class="detail-card">
          <template #header>
            <span>银行信息</span>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="开户银行">
              {{ currentFinanceApplication.bankName }}
            </el-descriptions-item>
            <el-descriptions-item label="银行账号">
              {{ currentFinanceApplication.bankAccount }}
            </el-descriptions-item>
            <el-descriptions-item label="账户持有人" :span="2">
              {{ currentFinanceApplication.accountHolder }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- Finance Records -->
        <el-card class="detail-card">
          <template #header>
            <span>财务记录</span>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="record in currentFinanceApplication.financeRecords"
              :key="record.id"
              :timestamp="formatDate(record.createdAt)"
              placement="top"
            >
              <div class="record-item">
                <div class="record-header">
                  <span class="record-action">{{ getActionText(record.action) }}</span>
                  <span class="record-operator">操作人: {{ record.operatorName }}</span>
                </div>
                <div v-if="record.amount" class="record-amount">
                  金额: {{ formatCurrency(record.amount) }}
                </div>
                <div class="record-comment">{{ record.comment }}</div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </el-card>

        <!-- Actions -->
        <div class="detail-actions">
          <FinanceActions
            v-if="canProcess(currentFinanceApplication.status)"
            :application-id="currentFinanceApplication.id"
            :current-status="currentFinanceApplication.status"
            :application-amount="currentFinanceApplication.amount"
            :loading="submitting"
            @submit="handleDetailProcessSubmit"
            @cancel="detailVisible = false"
          />
          <el-button v-else @click="detailVisible = false">
            关闭
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { Search, Refresh, View, Edit, Download } from '@element-plus/icons-vue'
import { useFinanceStore } from '../stores/finance'
import FinanceActions from '../components/FinanceActions.vue'
import FinanceStats from '../components/FinanceStats.vue'
import type { FinanceListItem } from '../types/finance'
import { FinanceStatus, FinanceAction } from '../types/finance'

const financeStore = useFinanceStore()

// Reactive data
const searchForm = reactive({
  search: '',
  status: '' as FinanceStatus | ''
})

const quickProcessVisible = ref(false)
const detailVisible = ref(false)
const selectedApplication = ref<FinanceListItem | null>(null)
const submitting = ref(false)

// Computed properties
const financeApplications = computed(() => financeStore.financeApplications)
const currentFinanceApplication = computed(() => financeStore.currentFinanceApplication)
const financeStats = computed(() => financeStore.financeStats)
const loading = computed(() => financeStore.loading)
const total = computed(() => financeStore.total)
const pendingDisbursementCount = computed(() => financeStore.pendingDisbursementCount)
const totalPendingAmount = computed(() => financeStore.totalPendingAmount)

const currentPage = computed({
  get: () => financeStore.currentPage,
  set: (value) => financeStore.setPage(value)
})
const pageSize = computed({
  get: () => financeStore.pageSize,
  set: (value) => financeStore.setPageSize(value)
})

// Finance statuses for filtering
const financeStatuses = [
  { label: '待发放', value: FinanceStatus.PENDING_DISBURSEMENT },
  { label: '发放确认', value: FinanceStatus.DISBURSEMENT_CONFIRMED },
  { label: '发放完成', value: FinanceStatus.DISBURSEMENT_COMPLETED },
  { label: '发放失败', value: FinanceStatus.DISBURSEMENT_FAILED }
]

// Methods
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY'
  }).format(amount)
}

const getStatusType = (status: FinanceStatus): string => {
  switch (status) {
    case FinanceStatus.PENDING_DISBURSEMENT:
      return 'warning'
    case FinanceStatus.DISBURSEMENT_CONFIRMED:
      return 'primary'
    case FinanceStatus.DISBURSEMENT_COMPLETED:
      return 'success'
    case FinanceStatus.DISBURSEMENT_FAILED:
      return 'danger'
    default:
      return 'info'
  }
}

const getStatusText = (status: FinanceStatus): string => {
  const statusMap: Record<string, string> = {
    'pending_initial': '待审核',
    'initial_approved': '初审通过',
    'under_review': '初审存疑',
    'rejected': '审核退回',
    'final_approved': '审核通过'
  }
  return statusMap[status] || '未知状态'
}

const getActionText = (action: FinanceAction): string => {
  const actionMap: Record<FinanceAction, string> = {
    [FinanceAction.CONFIRM_DISBURSEMENT]: '确认发放',
    [FinanceAction.COMPLETE_DISBURSEMENT]: '完成发放',
    [FinanceAction.FAIL_DISBURSEMENT]: '发放失败'
  }
  return actionMap[action] || '未知操作'
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString('zh-CN')
}

const canProcess = (status: FinanceStatus): boolean => {
  return status === FinanceStatus.PENDING_DISBURSEMENT || 
         status === FinanceStatus.DISBURSEMENT_CONFIRMED
}

const handleSearch = () => {
  financeStore.setPage(1)
  fetchFinanceApplications()
}

const handleReset = () => {
  searchForm.search = ''
  searchForm.status = ''
  financeStore.setPage(1)
  fetchFinanceApplications()
}

const refreshList = () => {
  fetchFinanceApplications()
  financeStore.fetchFinanceStats()
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  fetchFinanceApplications()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  fetchFinanceApplications()
}

const handleExport = () => {
  const params: Record<string, unknown> = {}
  if (searchForm.search) {
    params.search = searchForm.search
  }
  if (searchForm.status) {
    params.status = searchForm.status
  }
  financeStore.exportFinanceRecords(params)
}

const fetchFinanceApplications = () => {
  const params: Record<string, unknown> = {}
  if (searchForm.search) {
    params.search = searchForm.search
  }
  if (searchForm.status) {
    params.status = searchForm.status
  }
  financeStore.fetchFinanceApplications(params)
}

const viewFinanceDetail = async (id: number) => {
  try {
    await financeStore.fetchFinanceApplicationDetail(id)
    detailVisible.value = true
  } catch (error) {
    console.error('Failed to fetch finance detail:', error)
  }
}

const quickProcess = (application: FinanceListItem) => {
  selectedApplication.value = application
  quickProcessVisible.value = true
}

const handleQuickProcessSubmit = async (data: { action: FinanceAction; comment: string; amount?: number }) => {
  if (!selectedApplication.value) return
  
  submitting.value = true
  try {
    await financeStore.processFinanceOperation(
      selectedApplication.value.id, 
      data.action, 
      data.comment, 
      data.amount
    )
    quickProcessVisible.value = false
    selectedApplication.value = null
    // Refresh the list to show updated status
    await fetchFinanceApplications()
    await financeStore.fetchFinanceStats()
  } catch (error) {
    console.error('Quick process failed:', error)
  } finally {
    submitting.value = false
  }
}

const handleDetailProcessSubmit = async (data: { action: FinanceAction; comment: string; amount?: number }) => {
  if (!currentFinanceApplication.value) return
  
  submitting.value = true
  try {
    await financeStore.processFinanceOperation(
      currentFinanceApplication.value.id, 
      data.action, 
      data.comment, 
      data.amount
    )
    // Refresh the detail view
    await financeStore.fetchFinanceApplicationDetail(currentFinanceApplication.value.id)
    // Refresh the list and stats
    await fetchFinanceApplications()
    await financeStore.fetchFinanceStats()
  } catch (error) {
    console.error('Detail process failed:', error)
  } finally {
    submitting.value = false
  }
}

// Lifecycle
onMounted(() => {
  fetchFinanceApplications()
  financeStore.fetchFinanceStats()
})
</script>

<style scoped>
.finance {
  padding: 20px;
}

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

.list-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stat-tag {
  margin-right: 10px;
}

.amount-text {
  font-weight: 500;
  color: #E6A23C;
}

.amount-highlight {
  font-weight: bold;
  color: #E6A23C;
  font-size: 16px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.application-info {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.application-info h4 {
  margin: 0 0 10px 0;
  color: #303133;
}

.application-info p {
  margin: 0;
  color: #606266;
}

.finance-detail {
  max-height: 70vh;
  overflow-y: auto;
}

.detail-card {
  margin-bottom: 20px;
}

.record-item {
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.record-action {
  font-weight: 500;
  color: #409EFF;
}

.record-operator {
  font-size: 12px;
  color: #909399;
}

.record-amount {
  font-weight: 500;
  color: #E6A23C;
  margin-bottom: 5px;
}

.record-comment {
  color: #606266;
  font-size: 14px;
}

.detail-actions {
  margin-top: 20px;
  text-align: center;
}

:deep(.el-table) {
  font-size: 14px;
}

:deep(.el-table .cell) {
  padding: 8px 12px;
}

:deep(.el-descriptions-item__label) {
  font-weight: 500;
}
</style>
