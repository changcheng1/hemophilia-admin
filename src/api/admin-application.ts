import { BaseAPIService, type PaginatedResponse } from './base'

export interface AdminApplicationSearchParams {
  applicationNumber?: string
  donationProject?: string
  phone?: string
  recipientName?: string
  idNumber?: string
  donationPeriod?: string
  status?: string
  reviewableStatuses?: string[]
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
  maskSensitive?: boolean
}

export interface AdminApplicationListItem {
  id: number
  applicationNumber: string
  projectId?: number | null
  periodId?: number | null
  donationProject?: string
  donationPeriod?: string
  singlePeriodLimitAmount?: number | null
  totalReimbursementAmount?: number | string | null
  disbursementAmount?: number | string | null
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

export interface RelatedApplicationItem {
  id: number
  applicationNumber: string
  recipientName: string
  idNumber: string
  projectId?: number | null
  periodId?: number | null
  donationProject?: string
  donationPeriod?: string
  status: string
  createdAt: string
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
  disbursementAmount?: number
}

export interface BatchUpdateStatusRequest {
  applicationIds: number[]
  status: string
  comment?: string
}

export interface InitialReviewRequest {
  result: 'approve' | 'doubt'
  comment: string
  disbursementAmount?: number
}

export interface FinalReviewRequest {
  result: 'approve' | 'reject'
  comment: string
  disbursementAmount?: number
}

export interface SpotCheckRequest {
  result: 'approve' | 'reject'
  comment: string
}

export interface RandomSpotCheckRequest {
  count: number
  dateRange?: string
  maskSensitive?: boolean
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

export interface ApplicationInvoiceData {
  applicationId: number
  applicationNumber: string
  recipientName: string
  transportReimbursementAmount: number
  accommodationReimbursementAmount: number
  totalReimbursementAmount: number
  verifiedInvoiceTotalAmount: number
  transportInvoices: any[]
  accommodationInvoices: any[]
  medicalInvoices: any[]
}

export interface ApplicationFileVerificationItem {
  id: number
  applicationId: number
  fileType: string
  originalName: string
  filename?: string
  path?: string
  url?: string
  mimetype?: string
  size?: number
  createdAt?: string
  ocrStatus?: string
  ocrRawText?: string
  ocrPayload?: string
  recognizedName?: string
  recognizedIdNumber?: string
  recognizedVisitDate?: string
  recognizedInvoiceNumber?: string
  recognizedInvoiceDate?: string
  recognizedAmount?: number
  verificationStatus?: string
  verificationMessage?: string
  verificationPayload?: string
  verifiedAt?: string
}

export interface MedicalRecordVerificationResponse {
  recognizedCount: number
  matchedCount: number
  duplicatedVisitDates: string[]
  results: ApplicationFileVerificationItem[]
  summaryMessage: string
}

export interface InvoiceVerificationResponse {
  totalAmount: number
  transportAmount: number
  accommodationAmount: number
  medicalAmount: number
  verifiedCount: number
  failedCount: number
  files: ApplicationFileVerificationItem[]
  summaryMessage: string
}

export interface DisburseRequest {
  comment?: string
  amount?: number
}

export interface ImportApplicationData {
  applicationNumber: string
  name: string
  phone: string
  idNumber: string
  accountName: string
  bankName: string
  bankLocation: string
  accountNumber: string
  address: string
  treatment: string
  donationProject: string
  donationPeriod: string
  applyDate: string
  status: string
  totalAmount: string
}

export interface ImportApplicationsResponse {
  success: number
  failed: number
  errors: string[]
}

export interface AdminApplicationAPI {
  searchApplications(params?: AdminApplicationSearchParams): Promise<AdminApplicationListResponse>
  getApplicationDetail(id: number, params?: { maskSensitive?: boolean }): Promise<any>
  getRelatedApplications(id: number): Promise<RelatedApplicationItem[]>
  getSpotCheckApplicationDetail(id: number): Promise<any>
  updateApplicationStatus(id: number, data: UpdateStatusRequest): Promise<any>
  initialReview(id: number, data: InitialReviewRequest): Promise<any>
  finalReview(id: number, data: FinalReviewRequest): Promise<any>
  spotCheck(id: number, data: SpotCheckRequest): Promise<any>
  randomSpotCheck(data: RandomSpotCheckRequest): Promise<RandomSpotCheckResponse>
  batchUpdateStatus(data: BatchUpdateStatusRequest): Promise<{ success: number; failed: number; errors: string[] }>
  getApplicationStatistics(): Promise<ApplicationStatistics>
  getApplicationReviews(id: number): Promise<ApplicationReview[]>
  getApplicationInvoices(id: number): Promise<ApplicationInvoiceData>
  getBatchApplicationInvoices(applicationIds: number[]): Promise<ApplicationInvoiceData[]>
  verifyMedicalRecords(id: number): Promise<MedicalRecordVerificationResponse>
  verifyInvoices(id: number): Promise<InvoiceVerificationResponse>
  disburseApplication(id: number, data?: DisburseRequest): Promise<any>
  importApplications(data: ImportApplicationData[]): Promise<ImportApplicationsResponse>
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
  async getApplicationDetail(id: number, params?: { maskSensitive?: boolean }): Promise<any> {
    return this.get<any>(`/${id}`, { params })
  }

  async getRelatedApplications(id: number): Promise<RelatedApplicationItem[]> {
    return this.get<RelatedApplicationItem[]>(`/${id}/related`)
  }

  /**
   * 抽查管理获取脱敏申请详情
   */
  async getSpotCheckApplicationDetail(id: number): Promise<any> {
    return this.get<any>(`/${id}/spot-check-detail`)
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

  /**
   * 获取申请的发票信息
   */
  async getApplicationInvoices(id: number): Promise<ApplicationInvoiceData> {
    return this.get<ApplicationInvoiceData>(`/${id}/invoices`)
  }

  /**
   * 批量获取申请的发票信息
   */
  async getBatchApplicationInvoices(applicationIds: number[]): Promise<ApplicationInvoiceData[]> {
    return this.post<ApplicationInvoiceData[]>('/batch-invoices', { applicationIds })
  }

  async verifyMedicalRecords(id: number): Promise<MedicalRecordVerificationResponse> {
    return this.post<MedicalRecordVerificationResponse>(`/${id}/medical-records/verify`)
  }

  async verifyInvoices(id: number): Promise<InvoiceVerificationResponse> {
    return this.post<InvoiceVerificationResponse>(`/${id}/invoices/verify`)
  }

  /**
   * 财务发放
   */
  async disburseApplication(id: number, data: DisburseRequest = {}): Promise<any> {
    return this.post<any>(`/${id}/disburse`, data)
  }

  /**
   * 导入申请信息
   */
  async importApplications(data: ImportApplicationData[]): Promise<ImportApplicationsResponse> {
    return this.post<ImportApplicationsResponse>('/import', { data })
  }
}

export const adminApplicationAPI = new AdminApplicationService()
