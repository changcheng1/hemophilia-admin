import { BaseAPIService, type PaginatedResponse } from './base'

export interface AdminLoginLog {
  id: number
  adminUserId: number
  ipAddress: string
  userAgent: string
  loginStatus: 'success' | 'failed'
  failureReason?: string
  browser?: string
  os?: string
  device?: string
  createdAt: string
  adminUser?: {
    id: number
    phone: string
    name: string
    role: string
  }
}

export interface LoginLogQueryParams {
  page?: number
  limit?: number
  adminUserId?: number
  phone?: string
  name?: string
  role?: string
  loginStatus?: 'success' | 'failed'
  startDate?: string
  endDate?: string
}

export interface LoginLogListResponse {
  data: AdminLoginLog[]
  total: number
}

class AdminLoginLogAPI extends BaseAPIService {
  /**
   * 获取登录日志列表
   */
  async getLoginLogs(params: LoginLogQueryParams): Promise<LoginLogListResponse> {
    return this.get<LoginLogListResponse>('/admin/login-logs', { params })
  }

  /**
   * 获取登录日志详情
   */
  async getLoginLogById(id: number): Promise<AdminLoginLog> {
    return this.get<AdminLoginLog>(`/admin/login-logs/${id}`)
  }

  /**
   * 删除登录日志
   */
  async deleteLoginLog(id: number): Promise<{ message: string }> {
    return this.delete<{ message: string }>(`/admin/login-logs/${id}`)
  }

  /**
   * 批量删除登录日志
   */
  async batchDeleteLoginLogs(ids: number[]): Promise<{ message: string }> {
    return this.delete<{ message: string }>('/admin/login-logs', { data: { ids } })
  }
}

export const adminLoginLogAPI = new AdminLoginLogAPI()

