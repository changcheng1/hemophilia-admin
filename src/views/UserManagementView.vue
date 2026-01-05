<template>
  <div class="user-management">
    <!-- Search and Filter Section -->
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline class="search-form">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="用户ID">
              <el-input
                v-model="searchForm.userId"
                placeholder="请输入"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="手机号">
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
          <el-col :span="6">
            <el-form-item label="证件号码">
              <el-input
                v-model="searchForm.idNumber"
                placeholder="请输入"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="注册日期">
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
          <el-col :span="12">
            <div class="search-buttons">
              <el-button type="primary" @click="handleSearch">
                搜索
              </el-button>
              <el-button @click="handleReset">
                重置
              </el-button>
            </div>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- User Table -->
    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>用户列表</span>
          <span class="user-count">共 {{ total }} 个用户</span>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="users"
        stripe
        style="width: 100%"
        class="user-table"
        :scrollbar-always-on="true"
        table-layout="fixed"
      >
        <el-table-column prop="id" label="用户ID"  />
        <el-table-column prop="phone" label="手机号" />
        <el-table-column prop="recipientName" label="患者姓名" />
        <el-table-column prop="idType" label="证件类型" />
        <el-table-column prop="idNumber" label="证件号码" />
        <el-table-column prop="householdLocation" label="户籍所在地"  />
        <el-table-column prop="medicalInsuranceLocation" label="医保所在地" />
        <el-table-column prop="treatmentLocation" label="就诊地"/>
        <el-table-column prop="createdAt" label="注册时间" >
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button
              type="success"
              size="small"
              link
              @click="handleViewApplications(row)"
            >
              援助信息
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="pagination-wrapper">
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

    <!-- User Applications Dialog -->
    <UserApplicationsDialog
      v-model="applicationsDialogVisible"
      :user="selectedUser"
      @update:modelValue="resetApplicationsDialog"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { userApi, type User } from '@/api/user'
import UserApplicationsDialog from '@/components/UserApplicationsDialog.vue'
// Data state
const users = ref<User[]>([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// Search form
const searchForm = reactive({
  userId: '',
  phone: '',
  recipientName: '',
  idNumber: '',
  dateRange: [] as string[]
})

// Applications dialog state
const applicationsDialogVisible = ref(false)
const selectedUser = ref<User | null>(null)

// Utility functions
const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// API functions
const fetchUsers = async () => {
  loading.value = true
  try {
    const params: Record<string, string | number | undefined> = {
      page: currentPage.value,
      limit: pageSize.value
    }

    if (searchForm.userId) {
      params.userId = searchForm.userId
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
    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      params.startDate = searchForm.dateRange[0]
      params.endDate = searchForm.dateRange[1]
    }

    const response = await userApi.getUsers(params)
    users.value = response.data.data || []
    total.value = response.data.total || 0
  } catch (error) {
    console.error('获取用户列表失败:', error)
    users.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// Event handlers
const handleSearch = () => {
  currentPage.value = 1
  fetchUsers()
}

const handleReset = () => {
  searchForm.userId = ''
  searchForm.phone = ''
  searchForm.recipientName = ''
  searchForm.idNumber = ''
  searchForm.dateRange = []
  currentPage.value = 1
  fetchUsers()
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchUsers()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  fetchUsers()
}

const handleViewApplications = (user: User) => {
  selectedUser.value = user
  applicationsDialogVisible.value = true
}

const resetApplicationsDialog = () => {
  selectedUser.value = null
}



// Lifecycle
onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>

.page-header {
  margin-bottom: 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.page-header h1 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.page-description {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.network-status {
  display: flex;
  align-items: center;
  gap: 4px;
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

.table-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-count {
  color: #909399;
  font-size: 14px;
}

.table-container {
  overflow-x: auto;
  width: 100%;
}

.user-table {
  font-size: 14px;
  min-width: 1200px; /* 设置最小宽度确保所有列都能显示 */
}

.pagination-wrapper {
  margin-top: 20px;
  text-align: center;
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
.el-pagination{
  display: flex;
  justify-content: center;
}

</style>
