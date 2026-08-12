import { BaseAPIService } from './base'

export type EnrollmentStatus = 'pending_review' | 'approved' | 'rejected' | 'resubmit_required'

export interface EnrollmentSearchParams {
  donationProject?: string
  phone?: string
  recipientName?: string
  idNumber?: string
  status?: EnrollmentStatus | ''
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export interface EnrollmentListItem {
  id: number
  enrollmentNumber?: string
  projectId: number
  donationProject: string
  recipientName: string
  idType: string
  idNumber: string
  status: EnrollmentStatus
  submittedAt?: string
  createdAt: string
  user?: { phone: string }
}

export interface EnrollmentListResponse {
  data: EnrollmentListItem[]
  total: number
  page: number
  limit: number
}

class EnrollmentService extends BaseAPIService {
  constructor() { super('/admin/enrollments') }

  search(params: EnrollmentSearchParams): Promise<EnrollmentListResponse> {
    return this.post<EnrollmentListResponse>('/search', params)
  }

  getDetail(id: number): Promise<any> {
    return this.get<any>(`/${id}`)
  }

  review(id: number, result: 'approve' | 'reject', comment?: string): Promise<any> {
    return this.patch<any>(`/${id}/review`, { result, comment })
  }

  resetStatus(id: number): Promise<any> {
    return this.patch<any>(`/${id}/reset-status`)
  }

  resetStatusByProject(projectId: number): Promise<{ affected: number }> {
    return this.patch<{ affected: number }>('/reset-status-by-project', { projectId })
  }
}

export const enrollmentAPI = new EnrollmentService()
