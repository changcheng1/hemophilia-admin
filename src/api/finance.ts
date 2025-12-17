import { BaseAPIService, type PaginatedResponse } from './base'
import type { 
  FinanceApplication,
  FinanceListItem,
  FinanceStatus,
  FinanceAction,
  FinanceStats
} from '@/types/finance'

export interface FinanceListParams {
  page?: number
  limit?: number
  status?: FinanceStatus
  search?: string
  dateFrom?: string
  dateTo?: string
  amountMin?: number
  amountMax?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export type FinanceListResponse = PaginatedResponse<FinanceListItem>

export interface FinanceOperationRequest {
  action: FinanceAction
  comment: string
  amount?: number
  bankInfo?: {
    accountName?: string
    accountNumber?: string
    bankName?: string
  }
}

export interface FinanceAPI {
  getFinanceApplicationList(params?: FinanceListParams): Promise<FinanceListResponse>
  getFinanceApplicationDetail(id: number): Promise<FinanceApplication>
  processFinanceOperation(id: number, data: FinanceOperationRequest): Promise<void>
  getFinanceStats(): Promise<FinanceStats>
  exportFinanceRecords(params?: FinanceListParams): Promise<Blob>
  getFinanceHistory(id: number): Promise<any[]>
  batchProcessFinance(ids: number[], data: FinanceOperationRequest): Promise<void>
}

class FinanceService extends BaseAPIService implements FinanceAPI {
  constructor() {
    super('/finance')
  }
  /**
   * Get finance application list for disbursement
   */
  async getFinanceApplicationList(params: FinanceListParams = {}): Promise<FinanceListResponse> {
    const queryParams = this.buildQueryParams(params)
    return this.get<FinanceListResponse>(`/applications?${queryParams.toString()}`)
  }

  /**
   * Get finance application detail by ID
   */
  async getFinanceApplicationDetail(id: number): Promise<FinanceApplication> {
    return this.get<FinanceApplication>(`/applications/${id}`)
  }

  /**
   * Process finance operation (confirm, complete, fail disbursement)
   */
  async processFinanceOperation(id: number, data: FinanceOperationRequest): Promise<void> {
    return this.post<void>(`/applications/${id}/process`, data)
  }

  /**
   * Get finance statistics
   */
  async getFinanceStats(): Promise<FinanceStats> {
    return this.get<FinanceStats>('/stats')
  }

  /**
   * Export finance records
   */
  async exportFinanceRecords(params: FinanceListParams = {}): Promise<Blob> {
    const queryParams = this.buildQueryParams(params)
    return super.downloadFile(`/export?${queryParams.toString()}`)
  }

  /**
   * Get finance operation history for an application
   */
  async getFinanceHistory(id: number): Promise<any[]> {
    return this.get<any[]>(`/applications/${id}/history`)
  }

  /**
   * Batch process multiple finance applications
   */
  async batchProcessFinance(ids: number[], data: FinanceOperationRequest): Promise<void> {
    return this.post<void>('/applications/batch-process', {
      applicationIds: ids,
      ...data
    })
  }
}

export const financeAPI = new FinanceService()