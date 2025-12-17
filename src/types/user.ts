// User management related types
import type { UserRole, Permission } from './auth'

export interface User {
  id: number
  phone: string
  name: string
  email?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
}

export interface AdminUserDetail extends User {
  role: UserRole
  permissions: Permission[]
}

export interface CreateAdminRequest {
  phone: string
  name: string
  email?: string
  role: UserRole
  password: string
}

export interface UpdateUserRequest {
  name?: string
  email?: string
  isActive?: boolean
}

export interface UpdateAdminRequest extends UpdateUserRequest {
  role?: UserRole
  permissions?: string[]
}

export interface UserListQuery {
  page?: number
  limit?: number
  search?: string
  role?: UserRole
  isActive?: boolean
}

export interface UserListResponse {
  users: User[]
  total: number
  page: number
  limit: number
}

export interface AdminListResponse {
  admins: AdminUserDetail[]
  total: number
  page: number
  limit: number
}

export interface RolePermissionConfig {
  role: UserRole
  permissions: Permission[]
  description: string
}