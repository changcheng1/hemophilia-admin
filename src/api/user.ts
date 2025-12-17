import { BaseAPIService, type PaginatedResponse } from './base'
import type {
  User,
  AdminUserDetail,
  CreateAdminRequest,
  UpdateUserRequest,
  UpdateAdminRequest,
  UserListQuery,
  UserListResponse,
  AdminListResponse,
  RolePermissionConfig
} from '@/types'
import { UserRole } from '@/types'

export interface UserAPI {
  getUsers(query?: UserListQuery): Promise<UserListResponse>
  getUserById(id: number): Promise<User>
  updateUser(id: number, data: UpdateUserRequest): Promise<User>
  deleteUser(id: number): Promise<void>
  toggleUserStatus(id: number, isActive: boolean): Promise<User>
  exportUsers(query?: UserListQuery): Promise<Blob>
  getUserStats(): Promise<any>
}

class UserService extends BaseAPIService implements UserAPI {
  constructor() {
    super('/admin/users')
  }

  /**
   * Get all users (for admin only)
   */
  async getUsers(query: UserListQuery = {}): Promise<UserListResponse> {
    const queryParams = this.buildQueryParams(query)
    return this.get<UserListResponse>(`?${queryParams.toString()}`)
  }

  /**
   * Get user by ID
   */
  async getUserById(id: number): Promise<User> {
    return this.get<User>(`/${id}`)
  }

  /**
   * Update user information
   */
  async updateUser(id: number, data: UpdateUserRequest): Promise<User> {
    return this.put<User>(`/${id}`, data)
  }

  /**
   * Delete user (soft delete)
   */
  async deleteUser(id: number): Promise<void> {
    return this.delete<void>(`/${id}`)
  }

  /**
   * Activate/Deactivate user
   */
  async toggleUserStatus(id: number, isActive: boolean): Promise<User> {
    return this.patch<User>(`/${id}/status`, { isActive })
  }

  /**
   * Export users to Excel
   */
  async exportUsers(query: UserListQuery = {}): Promise<Blob> {
    const queryParams = this.buildQueryParams(query)
    return super.downloadFile(`/export?${queryParams.toString()}`)
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<any> {
    return this.get<any>('/stats')
  }
}

export const userAPI = new UserService()

export interface AdminAPI {
  getAdmins(query?: UserListQuery): Promise<AdminListResponse>
  getAdminById(id: number): Promise<AdminUserDetail>
  createAdmin(data: CreateAdminRequest): Promise<AdminUserDetail>
  updateAdmin(id: number, data: UpdateAdminRequest): Promise<AdminUserDetail>
  deleteAdmin(id: number): Promise<void>
  getRolePermissions(): Promise<RolePermissionConfig[]>
  updateAdminRole(id: number, role: UserRole, permissions?: string[]): Promise<AdminUserDetail>
  resetAdminPassword(id: number, newPassword: string): Promise<void>
  getAdminStats(): Promise<any>
  exportAdmins(query?: UserListQuery): Promise<Blob>
}

class AdminService extends BaseAPIService implements AdminAPI {
  constructor() {
    super('/admin/admins')
  }

  /**
   * Get all admin users
   */
  async getAdmins(query: UserListQuery = {}): Promise<AdminListResponse> {
    const queryParams = this.buildQueryParams(query)
    return this.get<AdminListResponse>(`?${queryParams.toString()}`)
  }

  /**
   * Get admin by ID
   */
  async getAdminById(id: number): Promise<AdminUserDetail> {
    return this.get<AdminUserDetail>(`/${id}`)
  }

  /**
   * Create new admin
   */
  async createAdmin(data: CreateAdminRequest): Promise<AdminUserDetail> {
    return this.post<AdminUserDetail>('', data)
  }

  /**
   * Update admin information
   */
  async updateAdmin(id: number, data: UpdateAdminRequest): Promise<AdminUserDetail> {
    return this.put<AdminUserDetail>(`/${id}`, data)
  }

  /**
   * Delete admin
   */
  async deleteAdmin(id: number): Promise<void> {
    return this.delete<void>(`/${id}`)
  }

  /**
   * Get role permission configurations
   */
  async getRolePermissions(): Promise<RolePermissionConfig[]> {
    // This endpoint is at /admin/roles/permissions, not /admin/admins/roles/permissions
    const originalBaseURL = this.baseURL
    this.baseURL = '/admin'
    try {
      return await this.get<RolePermissionConfig[]>('/roles/permissions')
    } finally {
      this.baseURL = originalBaseURL
    }
  }

  /**
   * Update admin role and permissions
   */
  async updateAdminRole(id: number, role: UserRole, permissions?: string[]): Promise<AdminUserDetail> {
    return this.patch<AdminUserDetail>(`/${id}/role`, {
      role,
      permissions
    })
  }

  /**
   * Reset admin password
   */
  async resetAdminPassword(id: number, newPassword: string): Promise<void> {
    return this.patch<void>(`/${id}/password`, { password: newPassword })
  }

  /**
   * Get admin statistics
   */
  async getAdminStats(): Promise<any> {
    return this.get<any>('/stats')
  }

  /**
   * Export admins to Excel
   */
  async exportAdmins(query: UserListQuery = {}): Promise<Blob> {
    const queryParams = this.buildQueryParams(query)
    return super.downloadFile(`/export?${queryParams.toString()}`)
  }
}

export const adminAPI = new AdminService()

// Legacy exports for backward compatibility
export const userApi = userAPI
export const adminApi = adminAPI