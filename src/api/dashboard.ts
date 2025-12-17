import { BaseAPIService } from './base'
import type { DashboardStats, ProvinceData, PieChartData } from '@/types/dashboard'

export interface DashboardAPI {
  getStats(): Promise<DashboardStats>
  getProvinceData(
    timeRange: string, 
    dateRange: [string, string], 
    dimension?: string
  ): Promise<{
    chartData: ProvinceData[]
    ranking: Array<{ province: string; amount: number }>
  }>
  getGenderStats(): Promise<PieChartData[]>
  getAgeStats(): Promise<PieChartData[]>
  getRecentActivities(): Promise<any[]>
  getSystemHealth(): Promise<any>
  refreshStats(): Promise<DashboardStats>
}

class DashboardService extends BaseAPIService implements DashboardAPI {
  constructor() {
    super('/dashboard')
  }

  /**
   * Get dashboard statistics
   */
  async getStats(): Promise<DashboardStats> {
    return this.get<DashboardStats>('/stats')
  }

  /**
   * Get province data for charts and ranking
   */
  async getProvinceData(
    timeRange: string, 
    dateRange: [string, string] | [], 
    dimension?: string
  ): Promise<{
    chartData: ProvinceData[]
    ranking: Array<{ province: string; amount: number }>
  }> {
    return this.post<{
      chartData: ProvinceData[]
      ranking: Array<{ province: string; amount: number }>
    }>('/province-data', {
      timeRange,
      startDate: dateRange.length > 0 ? dateRange[0] : '',
      endDate: dateRange.length > 0 ? dateRange[1] : '',
      dimension
    })
  }

  /**
   * Get recent system activities
   */
  async getRecentActivities(): Promise<any[]> {
    return this.get<any[]>('/activities')
  }

  /**
   * Get system health status
   */
  async getSystemHealth(): Promise<any> {
    return this.get<any>('/health')
  }

  /**
   * Get gender statistics for pie chart
   */
  async getGenderStats(): Promise<PieChartData[]> {
    return this.get<PieChartData[]>('/gender-stats')
  }

  /**
   * Get age statistics for pie chart
   */
  async getAgeStats(): Promise<PieChartData[]> {
    return this.get<PieChartData[]>('/age-stats')
  }

  /**
   * Refresh dashboard statistics (background request)
   */
  async refreshStats(): Promise<DashboardStats> {
    return this.get<DashboardStats>('/stats', this.createBackgroundConfig())
  }
}

export const dashboardAPI = new DashboardService()