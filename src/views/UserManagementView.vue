<template>
  <div class="user-management">
    <div class="page-header">
      <div class="header-content">
        <div>
          <h1>用户管理</h1>
          <p class="page-description">管理系统中的所有用户账户</p>
        </div>
        <div v-if="!isOnline" class="network-status">
          <el-tag type="danger" size="small">
            <el-icon><Warning /></el-icon>
            网络连接异常
          </el-tag>
        </div>
      </div>
    </div>

    <!-- Search and Filter Section -->
    <el-card class="search-card" shadow="never">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            v-model="searchQuery"
            placeholder="搜索用户姓名或手机号"
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :span="6">
          <el-select
            v-model="statusFilter"
            placeholder="用户状态"
            clearable
            @change="handleSearch"
          >
            <el-option label="全部" :value="undefined" />
            <el-option label="激活" :value="true" />
            <el-option label="禁用" :value="false" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
        </el-col>
        <el-col :span="6">
          <div class="action-buttons">
            <el-button @click="handleRefresh">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- User Table -->
    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>用户列表</span>
          <span class="user-count">共 {{ userStore.totalUsers }} 个用户</span>
        </div>
      </template>

      <el-table
        v-loading="userStore.loading"
        :data="userStore.users"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="姓名" min-width="120" />
        <el-table-column prop="phone" label="手机号" min-width="140" />
        <el-table-column prop="email" label="邮箱" min-width="180" show-overflow-tooltip />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'danger'">
              {{ row.isActive ? '激活' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="注册时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="lastLoginAt" label="最后登录" width="180">
          <template #default="{ row }">
            {{ row.lastLoginAt ? formatDateTime(row.lastLoginAt) : '从未登录' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="handleEditUser(row)"
            >
              编辑
            </el-button>
            <el-button
              :type="row.isActive ? 'warning' : 'success'"
              size="small"
              @click="handleToggleStatus(row)"
            >
              {{ row.isActive ? '禁用' : '激活' }}
            </el-button>
            <el-popconfirm
              title="确定要删除这个用户吗？"
              @confirm="handleDeleteUser(row)"
            >
              <template #reference>
                <el-button type="danger" size="small">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="userStore.currentPage"
          v-model:page-size="userStore.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="userStore.totalUsers"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- Edit User Dialog -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑用户信息"
      width="500px"
      @close="resetEditForm"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editRules"
        label-width="80px"
      >
        <el-form-item label="姓名" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入用户姓名" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" placeholder="请输入邮箱地址" />
        </el-form-item>
        <el-form-item label="状态" prop="isActive">
          <el-switch
            v-model="editForm.isActive"
            active-text="激活"
            inactive-text="禁用"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveUser">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { ElMessageBox } from 'element-plus'
import { Search, Refresh, Warning } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useErrorHandler, useDataLoader } from '@/composables/useErrorHandler'
import { useNetworkStatus } from '@/composables/useNetworkStatus'
import type { User, UpdateUserRequest } from '@/types'

// Store
const userStore = useUserStore()

// Error handling and network status
const { execute: executeWithErrorHandling } = useErrorHandler({
  context: 'user-management',
  showLoading: false // We'll use component-level loading
})

const { execute: loadData } = useDataLoader('user-data')
const { isOnline } = useNetworkStatus()

// Search and filter state
const searchQuery = ref('')
const statusFilter = ref<boolean | undefined>(undefined)

// Edit dialog state
const editDialogVisible = ref(false)
const editFormRef = ref()
const editForm = reactive({
  id: 0,
  name: '',
  email: '',
  isActive: true
})

// Form validation rules
const editRules = {
  name: [
    { required: true, message: '请输入用户姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

// Utility functions
const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// Event handlers
const handleSearch = async () => {
  await loadData(async () => {
    return await userStore.fetchUsers({
      search: searchQuery.value || undefined,
      isActive: statusFilter.value
    })
  })
}

const handleRefresh = async () => {
  searchQuery.value = ''
  statusFilter.value = undefined
  await loadData(async () => {
    return await userStore.fetchUsers()
  })
}

const handleSizeChange = async (size: number) => {
  userStore.setPageSize(size)
  await loadData(async () => {
    return await userStore.fetchUsers({
      search: searchQuery.value || undefined,
      isActive: statusFilter.value
    })
  })
}

const handleCurrentChange = async (page: number) => {
  userStore.setPage(page)
  await loadData(async () => {
    return await userStore.fetchUsers({
      search: searchQuery.value || undefined,
      isActive: statusFilter.value
    })
  })
}

const handleEditUser = (user: User) => {
  editForm.id = user.id
  editForm.name = user.name
  editForm.email = user.email || ''
  editForm.isActive = user.isActive
  editDialogVisible.value = true
}

const handleSaveUser = async () => {
  if (!editFormRef.value) return

  try {
    await editFormRef.value.validate()
    
    const updateData: UpdateUserRequest = {
      name: editForm.name,
      email: editForm.email || undefined,
      isActive: editForm.isActive
    }

    const result = await executeWithErrorHandling(async () => {
      return await userStore.updateUser(editForm.id, updateData)
    }, {
      successMessage: '用户信息更新成功',
      loadingMessage: '正在保存用户信息...'
    })

    if (result) {
      editDialogVisible.value = false
      resetEditForm()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Form validation failed:', error)
    }
  }
}

const handleToggleStatus = async (user: User) => {
  const action = user.isActive ? '禁用' : '激活'
  
  try {
    await ElMessageBox.confirm(
      `确定要${action}用户 "${user.name}" 吗？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await executeWithErrorHandling(async () => {
      return await userStore.toggleUserStatus(user.id, !user.isActive)
    }, {
      successMessage: `用户已${action}`,
      loadingMessage: `正在${action}用户...`
    })
  } catch {
    // User cancelled the operation
  }
}

const handleDeleteUser = async (user: User) => {
  await executeWithErrorHandling(async () => {
    return await userStore.deleteUser(user.id)
  }, {
    successMessage: '用户删除成功',
    loadingMessage: '正在删除用户...'
  })
}

const resetEditForm = () => {
  editForm.id = 0
  editForm.name = ''
  editForm.email = ''
  editForm.isActive = true
  
  if (editFormRef.value) {
    editFormRef.value.clearValidate()
  }
}

// Lifecycle
onMounted(async () => {
  await loadData(async () => {
    return await userStore.fetchUsers()
  })
})
</script>

<style scoped>
.user-management {
  padding: 20px;
}

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

.action-buttons {
  text-align: right;
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

.pagination-wrapper {
  margin-top: 20px;
  text-align: right;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
