import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type {
  User,
  AdminUserDetail,
  CreateAdminRequest,
  UpdateUserRequest,
  UpdateAdminRequest,
  UserListQuery,
  RolePermissionConfig
} from '@/types'
import { UserRole } from '@/types'
import { userApi, adminApi } from '@/api/user'

export const useUserStore = defineStore('user', () => {
  // State
  const users = ref<User[]>([])
  const admins = ref<AdminUserDetail[]>([])
  const rolePermissions = ref<RolePermissionConfig[]>([])
  const loading = ref(false)
  const totalUsers = ref(0)
  const totalAdmins = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(10)

  // Getters
  const activeUsers = computed(() => users.value.filter(user => user.isActive))
  const inactiveUsers = computed(() => users.value.filter(user => !user.isActive))
  const adminsByRole = computed(() => {
    const grouped: Record<UserRole, AdminUserDetail[]> = {
      [UserRole.ADMIN]: [],
      [UserRole.BUSINESS_MANAGER]: [],
      [UserRole.INITIAL_REVIEWER]: [],
      [UserRole.FINAL_REVIEWER]: [],
      [UserRole.FINANCE_MANAGER]: []
    }
    
    admins.value.forEach(admin => {
      if (grouped[admin.role]) {
        grouped[admin.role].push(admin)
      }
    })
    
    return grouped
  })

  // Actions
  const fetchUsers = async (query: UserListQuery = {}) => {
    loading.value = true
    try {
      const response = await userApi.getUsers({
        page: currentPage.value,
        limit: pageSize.value,
        ...query
      })
      
      users.value = response.users
      totalUsers.value = response.total
      currentPage.value = response.page
    } catch (error) {
      ElMessage.error('获取用户列表失败')
      console.error('Failed to fetch users:', error)
    } finally {
      loading.value = false
    }
  }

  const fetchAdmins = async (query: UserListQuery = {}) => {
    loading.value = true
    try {
      const response = await adminApi.getAdmins({
        page: currentPage.value,
        limit: pageSize.value,
        ...query
      })
      
      admins.value = response.admins
      totalAdmins.value = response.total
      currentPage.value = response.page
    } catch (error) {
      ElMessage.error('获取管理员列表失败')
      console.error('Failed to fetch admins:', error)
    } finally {
      loading.value = false
    }
  }

  const fetchRolePermissions = async () => {
    try {
      rolePermissions.value = await adminApi.getRolePermissions()
    } catch (error) {
      ElMessage.error('获取角色权限配置失败')
      console.error('Failed to fetch role permissions:', error)
    }
  }

  const getUserById = async (id: number): Promise<User | null> => {
    try {
      return await userApi.getUserById(id)
    } catch (error) {
      ElMessage.error('获取用户信息失败')
      console.error('Failed to get user:', error)
      return null
    }
  }

  const getAdminById = async (id: number): Promise<AdminUserDetail | null> => {
    try {
      return await adminApi.getAdminById(id)
    } catch (error) {
      ElMessage.error('获取管理员信息失败')
      console.error('Failed to get admin:', error)
      return null
    }
  }

  const updateUser = async (id: number, data: UpdateUserRequest): Promise<boolean> => {
    try {
      const updatedUser = await userApi.updateUser(id, data)
      
      // Update local state
      const index = users.value.findIndex(user => user.id === id)
      if (index !== -1) {
        users.value[index] = updatedUser
      }
      
      ElMessage.success('用户信息更新成功')
      return true
    } catch (error) {
      ElMessage.error('更新用户信息失败')
      console.error('Failed to update user:', error)
      return false
    }
  }

  const createAdmin = async (data: CreateAdminRequest): Promise<boolean> => {
    try {
      const newAdmin = await adminApi.createAdmin(data)
      
      // Add to local state
      admins.value.unshift(newAdmin)
      totalAdmins.value += 1
      
      ElMessage.success('管理员创建成功')
      return true
    } catch (error) {
      ElMessage.error('创建管理员失败')
      console.error('Failed to create admin:', error)
      return false
    }
  }

  const updateAdmin = async (id: number, data: UpdateAdminRequest): Promise<boolean> => {
    try {
      const updatedAdmin = await adminApi.updateAdmin(id, data)
      
      // Update local state
      const index = admins.value.findIndex(admin => admin.id === id)
      if (index !== -1) {
        admins.value[index] = updatedAdmin
      }
      
      ElMessage.success('管理员信息更新成功')
      return true
    } catch (error) {
      ElMessage.error('更新管理员信息失败')
      console.error('Failed to update admin:', error)
      return false
    }
  }

  const updateAdminRole = async (id: number, role: UserRole, permissions?: string[]): Promise<boolean> => {
    try {
      const updatedAdmin = await adminApi.updateAdminRole(id, role, permissions)
      
      // Update local state
      const index = admins.value.findIndex(admin => admin.id === id)
      if (index !== -1) {
        admins.value[index] = updatedAdmin
      }
      
      ElMessage.success('管理员角色更新成功')
      return true
    } catch (error) {
      ElMessage.error('更新管理员角色失败')
      console.error('Failed to update admin role:', error)
      return false
    }
  }

  const toggleUserStatus = async (id: number, isActive: boolean): Promise<boolean> => {
    try {
      const updatedUser = await userApi.toggleUserStatus(id, isActive)
      
      // Update local state
      const index = users.value.findIndex(user => user.id === id)
      if (index !== -1) {
        users.value[index] = updatedUser
      }
      
      ElMessage.success(`用户已${isActive ? '激活' : '禁用'}`)
      return true
    } catch (error) {
      ElMessage.error(`${isActive ? '激活' : '禁用'}用户失败`)
      console.error('Failed to toggle user status:', error)
      return false
    }
  }

  const deleteUser = async (id: number): Promise<boolean> => {
    try {
      await userApi.deleteUser(id)
      
      // Remove from local state
      users.value = users.value.filter(user => user.id !== id)
      totalUsers.value -= 1
      
      ElMessage.success('用户删除成功')
      return true
    } catch (error) {
      ElMessage.error('删除用户失败')
      console.error('Failed to delete user:', error)
      return false
    }
  }

  const deleteAdmin = async (id: number): Promise<boolean> => {
    try {
      await adminApi.deleteAdmin(id)
      
      // Remove from local state
      admins.value = admins.value.filter(admin => admin.id !== id)
      totalAdmins.value -= 1
      
      ElMessage.success('管理员删除成功')
      return true
    } catch (error) {
      ElMessage.error('删除管理员失败')
      console.error('Failed to delete admin:', error)
      return false
    }
  }

  const resetAdminPassword = async (id: number, newPassword: string): Promise<boolean> => {
    try {
      await adminApi.resetAdminPassword(id, newPassword)
      ElMessage.success('管理员密码重置成功')
      return true
    } catch (error) {
      ElMessage.error('重置管理员密码失败')
      console.error('Failed to reset admin password:', error)
      return false
    }
  }

  const setPage = (page: number) => {
    currentPage.value = page
  }

  const setPageSize = (size: number) => {
    pageSize.value = size
    currentPage.value = 1 // Reset to first page when changing page size
  }

  return {
    // State
    users,
    admins,
    rolePermissions,
    loading,
    totalUsers,
    totalAdmins,
    currentPage,
    pageSize,

    // Getters
    activeUsers,
    inactiveUsers,
    adminsByRole,

    // Actions
    fetchUsers,
    fetchAdmins,
    fetchRolePermissions,
    getUserById,
    getAdminById,
    updateUser,
    createAdmin,
    updateAdmin,
    updateAdminRole,
    toggleUserStatus,
    deleteUser,
    deleteAdmin,
    resetAdminPassword,
    setPage,
    setPageSize
  }
})