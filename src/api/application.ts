import { BaseAPIService, type PaginatedResponse } from './base'
import type { 
  ApplicationListItem, 
  Application, 
  ApplicationStatus,
  ReviewAction 
} from '@/types/application'

export interface ApplicationListParams {
  page?: number
  limit?: number
  status?: ApplicationStatus
  search?: string
  dateFrom?: string
  dateTo?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export type ApplicationListResponse = PaginatedResponse<ApplicationListItem>

export interface ReviewApplicationRequest {
  action: ReviewAction
  comment: string
}

export interface ApplicationAPI {
  getApplicationList(params?: ApplicationListParams): Promise<ApplicationListResponse>
  getFinalReviewApplicationList(params?: ApplicationListParams): Promise<ApplicationListResponse>
  getSpotCheckApplicationList(params?: ApplicationListParams): Promise<ApplicationListResponse>
  getApplicationDetail(id: number): Promise<Application>
  reviewApplication(id: number, data: ReviewApplicationRequest): Promise<void>
  finalReviewApplication(id: number, data: ReviewApplicationRequest): Promise<void>
  spotCheckApplication(id: number, data: ReviewApplicationRequest): Promise<void>
  downloadApplicationFile(fileId: number): Promise<Blob>
  exportApplications(params?: ApplicationListParams): Promise<Blob>
  getApplicationHistory(id: number): Promise<any[]>
}

class ApplicationService extends BaseAPIService implements ApplicationAPI {
  constructor() {
    super('/applications')
  }
  /**
   * Get application list for initial review
   */
  async getApplicationList(params: ApplicationListParams = {}): Promise<ApplicationListResponse> {
    const queryParams = this.buildQueryParams(params)
    return this.get<ApplicationListResponse>(`?${queryParams.toString()}`)
  }

  /**
   * Get application list for final review
   */
  async getFinalReviewApplicationList(params: ApplicationListParams = {}): Promise<ApplicationListResponse> {
    const queryParams = this.buildQueryParams(params)
    return this.get<ApplicationListResponse>(`/final-review?${queryParams.toString()}`)
  }

  /**
   * Get application list for spot check
   */
  async getSpotCheckApplicationList(params: ApplicationListParams = {}): Promise<ApplicationListResponse> {
    const queryParams = this.buildQueryParams(params)
    return this.get<ApplicationListResponse>(`/spot-check?${queryParams.toString()}`)
  }

  /**
   * Get application detail by ID
   */
  async getApplicationDetail(id: number): Promise<Application> {
    return this.get<Application>(`/${id}`)
  }

  /**
   * Submit initial review for an application
   */
  async reviewApplication(id: number, data: ReviewApplicationRequest): Promise<void> {
    return this.post<void>(`/${id}/review`, data)
  }

  /**
   * Submit final review for an application
   */
  async finalReviewApplication(id: number, data: ReviewApplicationRequest): Promise<void> {
    return this.post<void>(`/${id}/final-review`, data)
  }

  /**
   * Submit spot check for an application
   */
  async spotCheckApplication(id: number, data: ReviewApplicationRequest): Promise<void> {
    return this.post<void>(`/${id}/spot-check`, data)
  }

  /**
   * Download application file
   */
  async downloadApplicationFile(fileId: number): Promise<Blob> {
    return super.downloadFile(`/files/${fileId}/download`)
  }

  /**
   * Export applications to Excel
   */
  async exportApplications(params: ApplicationListParams = {}): Promise<Blob> {
    const queryParams = this.buildQueryParams(params)
    return super.downloadFile(`/export?${queryParams.toString()}`)
  }

  /**
   * Get application review history
   */
  async getApplicationHistory(id: number): Promise<any[]> {
    return this.get<any[]>(`/${id}/history`)
  }
}

export const applicationAPI = new ApplicationService()