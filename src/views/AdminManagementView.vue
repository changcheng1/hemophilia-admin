<template>
  <div class="admin-management">
    <!-- Search and Filter Section -->
    <el-card class="search-card" shadow="never">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input
            v-model="searchQuery"
            placeholder="搜索管理员姓名或手机号"
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :span="5">
          <el-select
            v-model="roleFilter"
            placeholder="角色筛选"
            clearable
            @change="handleSearch"
          >
            <el-option label="全部角色" :value="undefined" />
            <el-option label="超级管理员" :value="UserRole.ADMIN" />
            <el-option label="业务管理员" :value="UserRole.BUSINESS_MANAGER" />
            <el-option label="初审管理员" :value="UserRole.INITIAL_REVIEWER" />
            <el-option label="复核管理员" :value="UserRole.FINAL_REVIEWER" />
            <el-option label="财务管理员" :value="UserRole.FINANCE_MANAGER" />
          </el-select>
        </el-col>
        <el-col :span="5">
          <el-select
            v-model="statusFilter"
            placeholder="状态筛选"
            clearable
            @change="handleSearch"
          >
            <el-option label="全部状态" :value="undefined" />
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
        <el-col :span="4">
          <div class="action-buttons">
            <el-button v-if="isAdmin" type="success" @click="handleCreateAdmin">
              <el-icon><Plus /></el-icon>
              新增管理员
            </el-button>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- Admin Table -->
    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>管理员列表</span>
          <span class="admin-count">共 {{ userStore.totalAdmins }} 个管理员</span>
        </div>
      </template>

      <el-table
        v-loading="userStore.loading"
        :data="userStore.admins"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" />
        <el-table-column prop="name" label="姓名"  />
        <el-table-column prop="phone" label="手机号"  />
        <el-table-column label="角色" >
          <template #default="{ row }">
            <el-tag :type="getRoleTagType(row.role)">
              {{ getRoleDisplayName(row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'danger'">
              {{ row.isActive ? '激活' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" >
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="lastLoginAt" label="最后登录">
          <template #default="{ row }">
            {{ row.lastLoginAt ? formatDateTime(row.lastLoginAt) : '从未登录' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <template v-if="isAdmin">
              <el-button
                type="primary"
                size="small"
                @click="handleEditAdmin(row)"
              >
                编辑
              </el-button>
              <el-button
                type="warning"
                size="small"
                @click="handleResetPassword(row)"
              >
                修改密码
              </el-button>
              <el-button
                :type="row.isActive ? 'danger' : 'success'"
                size="small"
                @click="handleToggleStatus(row)"
              >
                {{ row.isActive ? '禁用' : '启用' }}
              </el-button>
            </template>
            <span v-else style="color: #909399;">无操作权限</span>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="userStore.currentPage"
          v-model:page-size="userStore.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="userStore.totalAdmins"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- Create Admin Dialog -->
    <el-dialog
      v-model="createDialogVisible"
      title="新增管理员"
      width="500px"
      @close="resetCreateForm"
    >
      <el-form
        ref="createFormRef"
        :model="createForm"
        :rules="createRules"
        label-width="120px"
        label-position="left"
      >
        <el-form-item label="*手机号:" prop="phone">
          <el-input 
            v-model="createForm.phone" 
            placeholder="请输入手机号" 
            clearable
          />
        </el-form-item>
        <el-form-item label="*姓名:" prop="name">
          <el-input 
            v-model="createForm.name" 
            placeholder="请输入管理员姓名" 
            clearable
          />
        </el-form-item>
        <el-form-item label="角色:" prop="role">
          <el-select 
            v-model="createForm.role" 
            placeholder="请选择角色" 
            style="width: 100%"
            clearable
          >
            <el-option label="超级管理员" :value="UserRole.ADMIN" />
            <el-option label="业务管理员" :value="UserRole.BUSINESS_MANAGER" />
            <el-option label="初审管理员" :value="UserRole.INITIAL_REVIEWER" />
            <el-option label="复核管理员" :value="UserRole.FINAL_REVIEWER" />
            <el-option label="财务管理员" :value="UserRole.FINANCE_MANAGER" />
          </el-select>
        </el-form-item>
        <el-form-item label="*初始密码:" prop="password">
          <el-input
            v-model="createForm.password"
            type="password"
            placeholder="请输入初始密码"
            show-password
            clearable
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="createDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="handleSaveAdmin">保存</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Edit Admin Dialog -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑管理员信息"
      width="500px"
      @close="resetEditForm"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editRules"
        label-width="120px"
        label-position="left"
      >
        <el-form-item label="手机号:">
          <el-input 
            :value="editForm.phone" 
            disabled
            placeholder="手机号"
          />
        </el-form-item>
        <el-form-item label="*姓名:" prop="name">
          <el-input 
            v-model="editForm.name" 
            placeholder="请输入管理员姓名" 
            clearable
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="handleUpdateAdmin">保存</el-button>
        </div>
      </template>
    </el-dialog>



    <!-- Reset Password Dialog -->
    <el-dialog
      v-model="passwordDialogVisible"
      title="重置密码"
      width="400px"
      @close="resetPasswordForm"
    >
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="100px"
      >
        <el-form-item label="管理员">
          <span>{{ passwordForm.adminName }}</span>
        </el-form-item>
        <el-form-item label="新密码" prop="password">
          <el-input
            v-model="passwordForm.password"
            type="password"
            placeholder="请输入新密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="passwordDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSavePassword">重置</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue'
import { ElMessageBox } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import { useUserStore } from '../stores/user'
import { useAuthStore } from '../stores/auth'
import { UserRole } from '../types'
import type { AdminUserDetail, CreateAdminRequest, UpdateAdminRequest } from '../types'

// Store
const userStore = useUserStore()
const authStore = useAuthStore()

// Check if current user is admin (only admin has operation permissions)
const isAdmin = computed(() => authStore.user?.role === UserRole.ADMIN)

// Search and filter state
const searchQuery = ref('')
const roleFilter = ref<UserRole | undefined>(undefined)
const statusFilter = ref<boolean | undefined>(undefined)

// Dialog states
const createDialogVisible = ref(false)
const editDialogVisible = ref(false)
const passwordDialogVisible = ref(false)

// Form refs
const createFormRef = ref()
const editFormRef = ref()
const passwordFormRef = ref()

// Create form
const createForm = reactive({
  name: '',
  phone: '',
  role: UserRole.INITIAL_REVIEWER,
  password: ''
})

// Edit form
const editForm = reactive({
  id: 0,
  phone: '',
  name: ''
})



// Password form
const passwordForm = reactive({
  id: 0,
  adminName: '',
  password: '',
  confirmPassword: ''
})

// Validation rules
const createRules = {
  name: [
    { required: true, message: '请输入管理员姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  role: [
    { required: false, message: '请选择角色', trigger: 'change' }
  ],
  password: [
    { required: true, message: '请输入初始密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

const editRules = {
  name: [
    { required: true, message: '请输入管理员姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度在 2 到 20 个字符', trigger: 'blur' }
  ]
}

const passwordRules = {
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (_rule: unknown, value: string, callback: (error?: Error) => void) => {
        if (value !== passwordForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// Utility functions
const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('zh-CN')
}

const getRoleDisplayName = (role: UserRole): string => {
  const roleNames = {
    [UserRole.ADMIN]: '超级管理员',
    [UserRole.BUSINESS_MANAGER]: '业务管理员',
    [UserRole.INITIAL_REVIEWER]: '初审管理员',
    [UserRole.FINAL_REVIEWER]: '复核管理员',
    [UserRole.FINANCE_MANAGER]: '财务管理员'
  }
  return roleNames[role] || role
}

const getRoleTagType = (role: UserRole): string => {
  const tagTypes = {
    [UserRole.ADMIN]: 'danger',
    [UserRole.BUSINESS_MANAGER]: 'warning',
    [UserRole.INITIAL_REVIEWER]: 'primary',
    [UserRole.FINAL_REVIEWER]: 'success',
    [UserRole.FINANCE_MANAGER]: 'info'
  }
  return tagTypes[role] || 'default'
}

// Event handlers
const handleSearch = async () => {
  await userStore.fetchAdmins({
    search: searchQuery.value || undefined,
    role: roleFilter.value,
    isActive: statusFilter.value
  })
}

const handleSizeChange = async (size: number) => {
  userStore.setPageSize(size)
  await userStore.fetchAdmins({
    search: searchQuery.value || undefined,
    role: roleFilter.value,
    isActive: statusFilter.value
  })
}

const handleCurrentChange = async (page: number) => {
  userStore.setPage(page)
  await userStore.fetchAdmins({
    search: searchQuery.value || undefined,
    role: roleFilter.value,
    isActive: statusFilter.value
  })
}

const handleCreateAdmin = () => {
  createDialogVisible.value = true
}

const handleSaveAdmin = async () => {
  if (!createFormRef.value) return

  try {
    await createFormRef.value.validate()
    
    const createData: CreateAdminRequest = {
      name: createForm.name,
      phone: createForm.phone,
      role: createForm.role || UserRole.INITIAL_REVIEWER,
      password: createForm.password
    }

    const success = await userStore.createAdmin(createData)
    if (success) {
      createDialogVisible.value = false
      resetCreateForm()
    }
  } catch (error) {
    console.error('Form validation failed:', error)
  }
}

const handleEditAdmin = (admin: AdminUserDetail) => {
  editForm.id = admin.id
  editForm.phone = admin.phone
  editForm.name = admin.name
  editDialogVisible.value = true
}

const handleUpdateAdmin = async () => {
  if (!editFormRef.value) return

  try {
    await editFormRef.value.validate()
    
    const updateData: UpdateAdminRequest = {
      name: editForm.name
    }

    const success = await userStore.updateAdmin(editForm.id, updateData)
    if (success) {
      editDialogVisible.value = false
      resetEditForm()
    }
  } catch (error) {
    console.error('Form validation failed:', error)
  }
}



const handleResetPassword = (admin: AdminUserDetail) => {
  passwordForm.id = admin.id
  passwordForm.adminName = admin.name
  passwordForm.password = ''
  passwordForm.confirmPassword = ''
  passwordDialogVisible.value = true
}

const handleSavePassword = async () => {
  if (!passwordFormRef.value) return

  try {
    await passwordFormRef.value.validate()
    
    const success = await userStore.resetAdminPassword(passwordForm.id, passwordForm.password)
    if (success) {
      passwordDialogVisible.value = false
      resetPasswordForm()
    }
  } catch (error) {
    console.error('Form validation failed:', error)
  }
}

const handleToggleStatus = async (admin: AdminUserDetail) => {
  const action = admin.isActive ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(
      `确定要${action}管理员 "${admin.name}" 吗？`,
      `确认${action}`,
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await userStore.toggleAdminStatus(admin.id, !admin.isActive)
  } catch {
    // User cancelled the operation
  }
}



// Reset form functions
const resetCreateForm = () => {
  createForm.name = ''
  createForm.phone = ''
  createForm.role = UserRole.INITIAL_REVIEWER
  createForm.password = ''
  
  if (createFormRef.value) {
    createFormRef.value.clearValidate()
  }
}

const resetEditForm = () => {
  editForm.id = 0
  editForm.phone = ''
  editForm.name = ''
  
  if (editFormRef.value) {
    editFormRef.value.clearValidate()
  }
}



const resetPasswordForm = () => {
  passwordForm.id = 0
  passwordForm.adminName = ''
  passwordForm.password = ''
  passwordForm.confirmPassword = ''
  
  if (passwordFormRef.value) {
    passwordFormRef.value.clearValidate()
  }
}

// Lifecycle
onMounted(async () => {
  await userStore.fetchAdmins()
})
</script>

<style scoped>
.page-header {
  margin-bottom: 20px;
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

.admin-count {
  color: #909399;
  font-size: 14px;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 20px 0 10px 0;
}

.dialog-footer .el-button {
  min-width: 80px;
}

:deep(.el-dialog__body) {
  padding: 20px 20px 10px 20px;
}

:deep(.el-form-item__label) {
  font-weight: normal;
  color: #606266;
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}

:deep(.el-input__wrapper) {
  border-radius: 4px;
}

:deep(.el-select .el-input__wrapper) {
  border-radius: 4px;
}


</style>
