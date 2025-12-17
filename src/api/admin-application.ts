import { BaseAPIService, type PaginatedResponse } from './base'

export interface AdminApplicationSearchParams {
  applicationNumber?: string
  donationProject?: string
  phone?: string
  recipientName?: string
  idNumber?: string
  status?: string
  reviewableStatuses?: string[]
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export interface AdminApplicationListItem {
  id: number
  applicationNumber: string
  donationProject?: string
  donationPeriod?: string
  recipientName: string
  idType: string
  idNumber: string
  status: string
  createdAt: string
  updatedAt: string
  user?: {
    phone: string
  }
}

export interface AdminApplicationListResponse {
  data: AdminApplicationListItem[]
  total: number
  page: number
  limit: number
}

export interface UpdateStatusRequest {
  status: string
  comment?: string
}

export interface BatchUpdateStatusRequest {
  applicationIds: number[]
  status: string
  comment?: string
}

export interface InitialReviewRequest {
  result: 'approve' | 'doubt'
  comment: string
}

export interface FinalReviewRequest {
  result: 'approve' | 'reject'
  comment: string
}

export interface SpotCheckRequest {
  result: 'approve' | 'reject'
  comment: string
}

export interface RandomSpotCheckRequest {
  count: number
  dateRange?: string
}

export interface RandomSpotCheckResponse {
  selectedApplications: any[]
  total: number
}

export interface ApplicationStatistics {
  pending_initial: number
  under_review: number
  initial_approved: number
  final_approved: number
  rejected: number
  total: number
}

export interface ApplicationReview {
  id: number
  stage: string
  result: string
  comment?: string
  previousStatus?: string
  newStatus?: string
  createdAt: string
  reviewer?: {
    id: number
    phone: string
  }
}

export interface AdminApplicationAPI {
  searchApplications(params?: AdminApplicationSearchParams): Promise<AdminApplicationListResponse>
  getApplicationDetail(id: number): Promise<any>
  updateApplicationStatus(id: number, data: UpdateStatusRequest): Promise<any>
  initialReview(id: number, data: InitialReviewRequest): Promise<any>
  finalReview(id: number, data: FinalReviewRequest): Promise<any>
  spotCheck(id: number, data: SpotCheckRequest): Promise<any>
  randomSpotCheck(data: RandomSpotCheckRequest): Promise<RandomSpotCheckResponse>
  batchUpdateStatus(data: BatchUpdateStatusRequest): Promise<{ success: number; failed: number; errors: string[] }>
  getApplicationStatistics(): Promise<ApplicationStatistics>
  getApplicationReviews(id: number): Promise<ApplicationReview[]>
}

class AdminApplicationService extends BaseAPIService implements AdminApplicationAPI {
  constructor() {
    super('/admin/applications')
  }

  /**
   * 管理员搜索申请列表
   */
  async searchApplications(params: AdminApplicationSearchParams = {}): Promise<AdminApplicationListResponse> {
    return this.post<AdminApplicationListResponse>('/search', params)
  }

  /**
   * 管理员获取申请详情
   */
  async getApplicationDetail(id: number): Promise<any> {
    return this.get<any>(`/${id}`)
  }

  /**
   * 管理员更新申请状态
   */
  async updateApplicationStatus(id: number, data: UpdateStatusRequest): Promise<any> {
    return this.patch<unknown>(`/${id}/status`, data)
  }

  /**
   * 初审申请
   */
  async initialReview(id: number, data: InitialReviewRequest): Promise<any> {
    return this.post<unknown>(`/${id}/initial-review`, data)
  }

  /**
   * 复核申请
   */
  async finalReview(id: number, data: FinalReviewRequest): Promise<unknown> {
    return this.post<unknown>(`/${id}/final-review`, data)
  }

  /**
   * 抽查申请
   */
  async spotCheck(id: number, data: SpotCheckRequest): Promise<unknown> {
    return this.post<unknown>(`/${id}/spot-check`, data)
  }

  /**
   * 随机抽查申请
   */
  async randomSpotCheck(data: RandomSpotCheckRequest): Promise<RandomSpotCheckResponse> {
    return this.post<RandomSpotCheckResponse>('/random-spot-check', data)
  }

  /**
   * 管理员批量更新申请状态
   */
  async batchUpdateStatus(data: BatchUpdateStatusRequest): Promise<{ success: number; failed: number; errors: string[] }> {
    return this.post<{ success: number; failed: number; errors: string[] }>('/batch-update-status', data)
  }

  /**
   * 获取申请统计信息
   */
  async getApplicationStatistics(): Promise<ApplicationStatistics> {
    return this.get<ApplicationStatistics>('/statistics/status')
  }

  /**
   * 获取待初审申请列表
   */
  async getPendingInitialApplications(page = 1, limit = 10): Promise<AdminApplicationListResponse> {
    return this.searchApplications({ status: 'pending_initial', page, limit })
  }

  /**
   * 获取审核存疑申请列表
   */
  async getUnderReviewApplications(page = 1, limit = 10): Promise<AdminApplicationListResponse> {
    return this.searchApplications({ status: 'under_review', page, limit })
  }

  /**
   * 获取初审通过申请列表
   */
  async getInitialApprovedApplications(page = 1, limit = 10): Promise<AdminApplicationListResponse> {
    return this.searchApplications({ status: 'initial_approved', page, limit })
  }

  /**
   * 获取审核通过申请列表
   */
  async getFinalApprovedApplications(page = 1, limit = 10): Promise<AdminApplicationListResponse> {
    return this.searchApplications({ status: 'final_approved', page, limit })
  }

  /**
   * 获取审核退回申请列表
   */
  async getRejectedApplications(page = 1, limit = 10): Promise<AdminApplicationListResponse> {
    return this.searchApplications({ status: 'rejected', page, limit })
  }

  /**
   * 获取申请审核记录
   */
  async getApplicationReviews(id: number): Promise<ApplicationReview[]> {
    return this.get<ApplicationReview[]>(`/${id}/reviews`)
  }
}

export const adminApplicationAPI = new AdminApplicationService()