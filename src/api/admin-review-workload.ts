import { BaseAPIService, type PaginatedResponse } from './base'

/**
 * A reviewer's review workload summary for a selected period.
 */
export interface ReviewWorkload {
  reviewerId: number
  phone: string | null
  name: string | null
  totalCount: number
  approvedCount: number
  doubtCount: number
  rejectedCount: number
  startTime?: string | null
  endTime?: string | null
}

export interface ReviewWorkloadQueryParams {
  phone?: string
  name?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export type ReviewWorkloadListResponse = PaginatedResponse<ReviewWorkload>

class AdminReviewWorkloadAPI extends BaseAPIService {
  /**
   * Get paginated review workload summaries.
   */
  async getReviewWorkloads(
    params: ReviewWorkloadQueryParams = {},
  ): Promise<ReviewWorkloadListResponse> {
    return this.get<ReviewWorkloadListResponse>('/admin/review-workloads', { params })
  }

  /**
   * Get all review workload summaries matching the selected filters.
   * The endpoint intentionally does not receive pagination parameters.
   */
  async exportReviewWorkloads(
    params: Omit<ReviewWorkloadQueryParams, 'page' | 'limit'> = {},
  ): Promise<ReviewWorkload[]> {
    return this.get<ReviewWorkload[]>('/admin/review-workloads/export-data', { params })
  }
}

export const adminReviewWorkloadAPI = new AdminReviewWorkloadAPI()
