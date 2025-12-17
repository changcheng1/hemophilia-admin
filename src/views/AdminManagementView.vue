<template>
  <div class="admin-management">
    <div class="page-header">
      <h1>管理员管理</h1>
      <p class="page-description">管理系统中的管理员账户和权限</p>
    </div>

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
            <el-button type="success" @click="handleCreateAdmin">
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
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="姓名" min-width="120" />
        <el-table-column prop="phone" label="手机号" min-width="140" />
        <el-table-column prop="email" label="邮箱" min-width="180" show-overflow-tooltip />
        <el-table-column label="角色" width="120">
          <template #default="{ row }">
            <el-tag :type="getRoleTagType(row.role)">
              {{ getRoleDisplayName(row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'danger'">
              {{ row.isActive ? '激活' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="lastLoginAt" label="最后登录" width="180">
          <template #default="{ row }">
            {{ row.lastLoginAt ? formatDateTime(row.lastLoginAt) : '从未登录' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="handleEditAdmin(row)"
            >
              编辑
            </el-button>
            <el-button
              type="info"
              size="small"
              @click="handleManageRole(row)"
            >
              角色权限
            </el-button>
            <el-button
              type="warning"
              size="small"
              @click="handleResetPassword(row)"
            >
              重置密码
            </el-button>
            <el-popconfirm
              title="确定要删除这个管理员吗？"
              @confirm="handleDeleteAdmin(row)"
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
      width="600px"
      @close="resetCreateForm"
    >
      <el-form
        ref="createFormRef"
        :model="createForm"
        :rules="createRules"
        label-width="100px"
      >
        <el-form-item label="姓名" prop="name">
          <el-input v-model="createForm.name" placeholder="请输入管理员姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="createForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="createForm.email" placeholder="请输入邮箱地址" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="createForm.role" placeholder="请选择角色" style="width: 100%">
            <el-option label="超级管理员" :value="UserRole.ADMIN" />
            <el-option label="业务管理员" :value="UserRole.BUSINESS_MANAGER" />
            <el-option label="初审管理员" :value="UserRole.INITIAL_REVIEWER" />
            <el-option label="复核管理员" :value="UserRole.FINAL_REVIEWER" />
            <el-option label="财务管理员" :value="UserRole.FINANCE_MANAGER" />
          </el-select>
        </el-form-item>
        <el-form-item label="初始密码" prop="password">
          <el-input
            v-model="createForm.password"
            type="password"
            placeholder="请输入初始密码"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="createDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveAdmin">创建</el-button>
        </span>
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
        label-width="80px"
      >
        <el-form-item label="姓名" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入管理员姓名" />
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
          <el-button type="primary" @click="handleUpdateAdmin">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Role Management Dialog -->
    <el-dialog
      v-model="roleDialogVisible"
      title="角色权限管理"
      width="600px"
      @close="resetRoleForm"
    >
      <el-form
        ref="roleFormRef"
        :model="roleForm"
        label-width="100px"
      >
        <el-form-item label="管理员">
          <span>{{ roleForm.adminName }}</span>
        </el-form-item>
        <el-form-item label="当前角色">
          <el-select v-model="roleForm.role" placeholder="请选择角色" style="width: 100%">
            <el-option label="超级管理员" :value="UserRole.ADMIN" />
            <el-option label="业务管理员" :value="UserRole.BUSINESS_MANAGER" />
            <el-option label="初审管理员" :value="UserRole.INITIAL_REVIEWER" />
            <el-option label="复核管理员" :value="UserRole.FINAL_REVIEWER" />
            <el-option label="财务管理员" :value="UserRole.FINANCE_MANAGER" />
          </el-select>
        </el-form-item>
        <el-form-item label="权限列表">
          <div class="permissions-list">
            <div v-for="permission in roleForm.permissions" :key="permission.id" class="permission-item">
              <el-tag>{{ permission.name }}</el-tag>
              <span class="permission-desc">{{ permission.resource }}:{{ permission.action }}</span>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="roleDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleUpdateRole">保存</el-button>
        </span>
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
import { ref, onMounted, reactive } from 'vue'
import { ElMessageBox } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import { useUserStore } from '../stores/user'
import { UserRole } from '../types'
import type { AdminUserDetail, CreateAdminRequest, UpdateAdminRequest, Permission } from '../types'

// Store
const userStore = useUserStore()

// Search and filter state
const searchQuery = ref('')
const roleFilter = ref<UserRole | undefined>(undefined)
const statusFilter = ref<boolean | undefined>(undefined)

// Dialog states
const createDialogVisible = ref(false)
const editDialogVisible = ref(false)
const roleDialogVisible = ref(false)
const passwordDialogVisible = ref(false)

// Form refs
const createFormRef = ref()
const editFormRef = ref()
const roleFormRef = ref()
const passwordFormRef = ref()

// Create form
const createForm = reactive({
  name: '',
  phone: '',
  email: '',
  role: UserRole.INITIAL_REVIEWER,
  password: ''
})

// Edit form
const editForm = reactive({
  id: 0,
  name: '',
  email: '',
  isActive: true
})

// Role form
const roleForm = reactive({
  id: 0,
  adminName: '',
  role: UserRole.INITIAL_REVIEWER,
  permissions: [] as Permission[]
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
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
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
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
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
      email: createForm.email || undefined,
      role: createForm.role,
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
  editForm.name = admin.name
  editForm.email = admin.email || ''
  editForm.isActive = admin.isActive
  editDialogVisible.value = true
}

const handleUpdateAdmin = async () => {
  if (!editFormRef.value) return

  try {
    await editFormRef.value.validate()
    
    const updateData: UpdateAdminRequest = {
      name: editForm.name,
      email: editForm.email || undefined,
      isActive: editForm.isActive
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

const handleManageRole = (admin: AdminUserDetail) => {
  roleForm.id = admin.id
  roleForm.adminName = admin.name
  roleForm.role = admin.role
  roleForm.permissions = admin.permissions
  roleDialogVisible.value = true
}

const handleUpdateRole = async () => {
  const success = await userStore.updateAdminRole(roleForm.id, roleForm.role)
  if (success) {
    roleDialogVisible.value = false
    resetRoleForm()
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

const handleDeleteAdmin = async (admin: AdminUserDetail) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除管理员 "${admin.name}" 吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await userStore.deleteAdmin(admin.id)
  } catch {
    // User cancelled the operation
  }
}

// Reset form functions
const resetCreateForm = () => {
  createForm.name = ''
  createForm.phone = ''
  createForm.email = ''
  createForm.role = UserRole.INITIAL_REVIEWER
  createForm.password = ''
  
  if (createFormRef.value) {
    createFormRef.value.clearValidate()
  }
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

const resetRoleForm = () => {
  roleForm.id = 0
  roleForm.adminName = ''
  roleForm.role = UserRole.INITIAL_REVIEWER
  roleForm.permissions = []
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
  await userStore.fetchRolePermissions()
})
</script>

<style scoped>
.admin-management {
  padding: 20px;
}

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
  text-align: right;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.permissions-list {
  max-height: 200px;
  overflow-y: auto;
}

.permission-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  gap: 10px;
}

.permission-desc {
  color: #909399;
  font-size: 12px;
}
</style>
