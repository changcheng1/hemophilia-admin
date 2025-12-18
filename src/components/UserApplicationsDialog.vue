<template>
  <el-dialog
    v-model="visible"
    title="用户申请记录"
    width="1000px"
    @close="handleClose"
  >
 
    <div class="applications-content">
      <el-table
        v-loading="loading"
        :data="applications"
        stripe
        style="width: 100%"
        class="applications-table"
      >
        <el-table-column prop="recipientName" label="姓名" width="100" />
        <el-table-column prop="idNumber" label="身份证号" width="180" />
        <el-table-column label="银行卡信息" width="200">
          <template #default="{ row }">
              <div v-if="row.bankAccountName || row.bankName || row.bankAccountNumber">
              <div v-if="row.bankAccountName">{{ row.bankAccountName }}</div>
              <div v-if="row.bankName">{{ row.bankName }}</div>
              <div v-if="row.bankAccountNumber">{{ row.bankAccountNumber }}</div>
            </div>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="residenceAddress" label="现在住址" width="150">
          <template #default="{ row }">
            {{ row.residenceAddress || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="treatmentLocation" label="就诊城市" width="120">
          <template #default="{ row }">
            {{ row.treatmentLocation || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="就诊医院" width="120">
          <template #default="{ row }">
            {{ row.donationProject || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="审核状况" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="援助金额" width="100">
          <template #default="{ row }">
            ¥{{ (row.requestAmount || 0).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="申请时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
      </el-table>
      
      <div v-if="!loading && applications.length === 0" class="no-applications">
        <el-empty description="该用户暂无申请记录" />
      </div>

      <!-- Applications Pagination -->
      <div v-if="total > 0" class="applications-pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { userApi, type User, type UserApplication, type UserApplicationsParams } from '@/api/user'

interface Props {
  modelValue: boolean
  user: User | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Data state
const applications = ref<UserApplication[]>([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// Computed
const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

// Utility functions
const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// 获取状态标签类型
const getStatusType = (status: string): string => {
  const statusMap: Record<string, string> = {
    'pending_initial': 'warning',
    'under_review': 'info',
    'initial_approved': 'primary',
    'final_approved': 'success',
    'rejected': 'danger',
    'cancelled': 'info'
  }
  return statusMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    'pending_initial': '待初审',
    'under_review': '审核存疑',
    'initial_approved': '初审通过',
    'final_approved': '审核通过',
    'rejected': '审核退回',
    'cancelled': '已取消'
  }
  return statusMap[status] || status
}

// API functions
const fetchApplications = async () => {
  if (!props.user) return
  
  loading.value = true
  try {
    const params: UserApplicationsParams = {
      page: currentPage.value,
      limit: pageSize.value
    }
    
    const response = await userApi.getUserApplications(props.user.id, params)
    applications.value = response.data.data || []
    total.value = response.data.total || 0
  } catch (error) {
    console.error('获取用户申请记录失败:', error)
    applications.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// Event handlers
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchApplications()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  fetchApplications()
}

const handleClose = () => {
  visible.value = false
  // 重置数据
  applications.value = []
  total.value = 0
  currentPage.value = 1
}

// Watch for dialog open
watch(() => props.modelValue, (newValue) => {
  if (newValue && props.user) {
    currentPage.value = 1
    fetchApplications()
  }
})
</script>

<style scoped>
.applications-header {
  margin-bottom: 20px;
}

.applications-content {
  min-height: 300px;
}

.applications-table {
  font-size: 14px;
}

.no-applications {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.applications-pagination {
  margin-top: 20px;
    text-align: right;
    display: flex;
    justify-content: flex-end;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>