// Export base API service
export { BaseAPIService } from './base'
export type { 
  PaginatedResponse, 
  ListQueryParams, 
  APIResponse, 
  APIError 
} from './base'

// Export authentication API
export { authAPI } from './auth'
export type { AuthAPI } from './auth'

// Export application API
export { applicationAPI } from './application'
export type { 
  ApplicationAPI,
  ApplicationListParams,
  ApplicationListResponse,
  ReviewApplicationRequest
} from './application'

// Export dashboard API
export { dashboardAPI } from './dashboard'
export type { DashboardAPI } from './dashboard'

// Export finance API
export { financeAPI } from './finance'
export type { 
  FinanceAPI,
  FinanceListParams,
  FinanceListResponse,
  FinanceOperationRequest
} from './finance'

export { enrollmentAPI } from './enrollment'
export type { EnrollmentListItem, EnrollmentListResponse, EnrollmentSearchParams } from './enrollment'

// Export review workload API
export { adminReviewWorkloadAPI } from './admin-review-workload'
export type {
  ReviewWorkload,
  ReviewWorkloadQueryParams,
  ReviewWorkloadListResponse,
} from './admin-review-workload'

// Export user and admin APIs
export { userAPI, adminAPI, userApi, adminApi } from './user'
export type { UserAPI, AdminAPI } from './user'

// Import all API instances
import { authAPI } from './auth'
import { applicationAPI } from './application'
import { dashboardAPI } from './dashboard'
import { financeAPI } from './finance'
import { enrollmentAPI } from './enrollment'
import { userAPI, adminAPI } from './user'
import { adminReviewWorkloadAPI } from './admin-review-workload'

// Centralized API object for easy access
export const API = {
  auth: authAPI,
  application: applicationAPI,
  dashboard: dashboardAPI,
  finance: financeAPI,
  enrollment: enrollmentAPI,
  user: userAPI,
  admin: adminAPI,
  reviewWorkload: adminReviewWorkloadAPI,
} as const

// Type for the centralized API object
export type APIServices = typeof API

/**
 * Initialize all API services
 * This can be called during app initialization to set up any required configurations
 */
export function initializeAPI(): void {
  // Any global API initialization logic can go here
  console.log('API services initialized')
}

/**
 * Health check for all API services
 */
export async function checkAPIHealth(): Promise<Record<string, boolean>> {
  const results: Record<string, boolean> = {}
  
  try {
    await dashboardAPI.getSystemHealth()
    results.dashboard = true
  } catch {
    results.dashboard = false
  }

  // Add more health checks as needed
  
  return results
}
