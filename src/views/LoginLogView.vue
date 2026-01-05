<template>
  <div class="login-log">
    <!-- Search and Filter -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline class="search-form">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="管理员ID">
              <el-input
                v-model="searchForm.adminUserId"
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
            <el-form-item label="姓名">
              <el-input
                v-model="searchForm.name"
                placeholder="请输入"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="角色">
              <el-select
                v-model="searchForm.role"
                placeholder="请选择"
                clearable
                style="width: 200px"
              >
                <el-option label="超级管理员" value="admin" />
                <el-option label="业务管理员" value="business_manager" />
                <el-option label="初审管理员" value="initial_reviewer" />
                <el-option label="复核管理员" value="final_reviewer" />
                <el-option label="财务管理员" value="finance_manager" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="登录日期">
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

    <!-- Login Log List -->
    <el-card class="list-card">
      <template #header>
        <div class="card-header">
          <span>登录日志列表</span>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="loginLogs"
        stripe
        style="width: 100%"
        class="login-log-table"
      >
        <el-table-column prop="adminUser.id" label="管理员ID"  />
        <el-table-column prop="adminUser.phone" label="手机号" />
        <el-table-column prop="adminUser.name" label="姓名" />
        <el-table-column prop="adminUser.role" label="角色">
          <template #default="{ row }">
            {{ getRoleText(row.adminUser?.role) }}
          </template>
        </el-table-column>
        <el-table-column prop="loginStatus" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.loginStatus === 'success' ? 'success' : 'danger'">
              {{ row.loginStatus === 'success' ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="登录日期" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="ipAddress" label="IP地址" width="150">
          <template #default="{ row }">
            {{ formatIpAddress(row.ipAddress) }}
          </template>
        </el-table-column>
        <el-table-column prop="browser" label="浏览器" width="180" show-overflow-tooltip />
        <el-table-column prop="os" label="系统" width="180" show-overflow-tooltip />
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { adminLoginLogAPI, type LoginLogQueryParams, type AdminLoginLog } from '@/api/admin-login-log'

// Reactive data
const searchForm = reactive<{
  adminUserId: string
  phone: string
  name: string
  role: string
  loginStatus: string
  dateRange: string[]
}>({
  adminUserId: '',
  phone: '',
  name: '',
  role: '',
  loginStatus: '',
  dateRange: []
})

const loginLogs = ref<AdminLoginLog[]>([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// Methods
const getRoleText = (role: string): string => {
  const roleMap: Record<string, string> = {
    'admin': '超级管理员',
    'business_manager': '业务管理员',
    'initial_reviewer': '初审管理员',
    'final_reviewer': '复核管理员',
    'finance_manager': '财务管理员'
  }
  return roleMap[role] || role
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString('zh-CN')
}

const formatIpAddress = (ip: string): string => {
  // 如果是本地地址，显示为"本地"
  if (!ip || ip === '::1' || ip === '127.0.0.1' || ip === '::ffff:127.0.0.1') {
    return '本地'
  }
  // 移除 IPv6 前缀，只显示 IPv4
  if (ip.startsWith('::ffff:')) {
    return ip.replace('::ffff:', '')
  }
  return ip
}

const handleSearch = () => {
  currentPage.value = 1
  fetchLoginLogs()
}

const handleReset = () => {
  searchForm.adminUserId = ''
  searchForm.phone = ''
  searchForm.name = ''
  searchForm.role = ''
  searchForm.loginStatus = ''
  searchForm.dateRange = []
  currentPage.value = 1
  fetchLoginLogs()
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  fetchLoginLogs()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  fetchLoginLogs()
}

const fetchLoginLogs = async () => {
  loading.value = true
  try {
    const params: LoginLogQueryParams = {
      page: currentPage.value,
      limit: pageSize.value
    }
    
    if (searchForm.adminUserId) {
      params.adminUserId = Number(searchForm.adminUserId)
    }
    if (searchForm.phone) {
      params.phone = searchForm.phone
    }
    if (searchForm.name) {
      params.name = searchForm.name
    }
    if (searchForm.role) {
      params.role = searchForm.role
    }
    if (searchForm.loginStatus) {
      params.loginStatus = searchForm.loginStatus as 'success' | 'failed'
    }
    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      params.startDate = searchForm.dateRange[0]
      params.endDate = searchForm.dateRange[1]
    }
    
    const response = await adminLoginLogAPI.getLoginLogs(params)
    loginLogs.value = response.data
    total.value = response.total
  } catch (error) {
    console.error('获取登录日志失败:', error)
    ElMessage.error('获取登录日志失败')
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  fetchLoginLogs()
})
</script>

<style scoped>
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

.login-log-table {
  font-size: 14px;
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
</style>
