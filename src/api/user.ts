import http from '@/utils/http'
import { UserRole } from '@/types/auth'

export interface UserSearchParams {
  page?: number
  limit?: number
  userId?: string
  phone?: string
  recipientName?: string
  idNumber?: string
  startDate?: string
  endDate?: string
}

export interface UserListResponse {
  code: number
  message: string
  data: {
    data: DonationUser[]
    total: number
    page: number
    limit: number
  }
}

export interface DonationUser {
  id: number
  phone: string
  recipientName?: string
  idType?: string
  idNumber?: string
  gender?: string
  dateOfBirth?: string
  householdLocation?: string
  medicalInsuranceLocation?: string
  treatmentLocation?: string
  residenceAddress?: string
  guardianName?: string
  guardianRelationship?: string
  guardianIdType?: string
  guardianIdNumber?: string
  createdAt: string
  updatedAt: string
}

export interface UserDetailResponse {
  code: number
  message: string
  data: DonationUser
}

export interface UserApplication {
  id: number
  applicationNumber: string
  recipientName: string
  idNumber: string
  bankAccountName?: string
  bankName?: string
  bankAccountNumber?: string
  residenceAddress?: string
  treatmentLocation?: string
  donationProject?: string
  donationPeriod?: string
  status: string
  transportReimbursementAmount?: number
  accommodationReimbursementAmount?: number
  requestAmount: number
  createdAt: string
  updatedAt: string
}

export interface UserApplicationsParams {
  page?: number
  limit?: number
}

export interface UserApplicationsResponse {
  code: number
  message: string
  data: {
    data: UserApplication[]
    total: number
    page: number
    limit: number
  }
}

export const userApi = {
  // 获取用户列表
  getUsers(params: UserSearchParams): Promise<UserListResponse> {
    return http.get('/admin/users/search', { params })
  },

  // 获取用户详情
  getUserDetail(id: number): Promise<UserDetailResponse> {
    return http.get(`/admin/users/${id}`)
  },

  // 获取用户的所有申请记录
  getUserApplications(userId: number, params?: UserApplicationsParams): Promise<UserApplicationsResponse> {
    return http.get(`/admin/users/${userId}/applications`, { params })
  },

  // 获取用户详情
  getUserById(id: number): Promise<DonationUser> {
    return http.get(`/admin/users/${id}`).then(res => res.data)
  },

  // 更新用户信息
  updateUser(id: number, data: any): Promise<DonationUser> {
    return http.put(`/admin/users/${id}`, data).then(res => res.data)
  },

  // 切换用户状态
  toggleUserStatus(id: number, isActive: boolean): Promise<DonationUser> {
    return http.put(`/admin/users/${id}/status`, { isActive }).then(res => res.data)
  },

  // 删除用户
  deleteUser(id: number): Promise<void> {
    return http.delete(`/admin/users/${id}`)
  }
}

// 为了兼容性，添加别名
export const userAPI = userApi
// Admin management interfaces
export interface AdminSearchParams {
  page?: number
  limit?: number
  search?: string
  role?: string
  isActive?: boolean
}

export interface AdminUser {
  id: number
  phone: string
  name: string
  role: UserRole
  isActive: boolean
  permissions: Permission[]
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
}

export interface Permission {
  id: string
  name: string
  resource: string
  action: string
}

export interface CreateAdminRequest {
  name: string
  phone: string
  role: UserRole
  password: string
}

export interface UpdateAdminRequest {
  name?: string
  isActive?: boolean
}

export interface AdminListResponse {
  code: number
  message: string
  data: {
    data: AdminUser[]
    total: number
    page: number
    limit: number
  }
}

export interface AdminDetailResponse {
  code: number
  message: string
  data: AdminUser
}

export interface RolePermissionConfig {
  role: UserRole
  permissions: Permission[]
  description: string
}

export const adminApi = {
  // 获取管理员列表
  getAdmins(params: AdminSearchParams): Promise<AdminListResponse> {
    return http.get('/admin/admins', { params })
  },

  // 获取管理员详情
  getAdminById(id: number): Promise<AdminDetailResponse> {
    return http.get(`/admin/admins/${id}`)
  },

  // 创建管理员
  createAdmin(data: CreateAdminRequest): Promise<AdminDetailResponse> {
    return http.post('/admin/admins', data)
  },

  // 更新管理员信息
  updateAdmin(id: number, data: UpdateAdminRequest): Promise<AdminDetailResponse> {
    return http.put(`/admin/admins/${id}`, data)
  },

  // 更新管理员角色
  updateAdminRole(id: number, role: UserRole, permissions?: string[]): Promise<AdminDetailResponse> {
    return http.put(`/admin/admins/${id}/role`, { role, permissions })
  },

  // 重置管理员密码
  resetAdminPassword(id: number, password: string): Promise<{ code: number; message: string }> {
    return http.put(`/admin/admins/${id}/password`, { password })
  },

  // 删除管理员
  deleteAdmin(id: number): Promise<{ code: number; message: string }> {
    return http.delete(`/admin/admins/${id}`)
  },

  // 获取角色权限配置
  getRolePermissions(): Promise<{ code: number; message: string; data: RolePermissionConfig[] }> {
    return http.get('/admin/roles/permissions')
  },

  // 切换管理员状态
  toggleAdminStatus(id: number, isActive: boolean): Promise<AdminDetailResponse> {
    return http.put(`/admin/admins/${id}/status`, { isActive })
  }
}

// 为了兼容性，添加别名
export const adminAPI = adminApi

// 导出类型接口
export type User = DonationUser

export interface UserAPI {
  getUsers: typeof userApi.getUsers
  getUserDetail: typeof userApi.getUserDetail
  getUserApplications: typeof userApi.getUserApplications
  getUserById: typeof userApi.getUserById
  updateUser: typeof userApi.updateUser
  toggleUserStatus: typeof userApi.toggleUserStatus
  deleteUser: typeof userApi.deleteUser
}

export interface AdminAPI {
  getAdmins: typeof adminApi.getAdmins
  getAdminById: typeof adminApi.getAdminById
  createAdmin: typeof adminApi.createAdmin
  updateAdmin: typeof adminApi.updateAdmin
  updateAdminRole: typeof adminApi.updateAdminRole
  resetAdminPassword: typeof adminApi.resetAdminPassword
  deleteAdmin: typeof adminApi.deleteAdmin
  getRolePermissions: typeof adminApi.getRolePermissions
  toggleAdminStatus: typeof adminApi.toggleAdminStatus
}