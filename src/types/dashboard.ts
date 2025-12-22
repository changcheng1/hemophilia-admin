// Dashboard statistics types
export interface DashboardStats {
  totalUsers: number
  totalApplications: number
  passedApplications: number
  returnedApplications: number
  totalBeneficiaries: number
  totalAmount: number
  averageApplications: number
  averageAmount: number
  // 添加缺失的字段
  pendingReview: number
  approvedApplications: number
  rejectedApplications: number
}

export interface ProvinceData {
  name: string
  value: number
}

export interface ProvinceRanking {
  province: string
  amount: number
}

export interface PieChartData {
  name: string
  value: number
  percentage: string
}

// 添加月度统计类型
export interface MonthlyStats {
  month: string
  applications: number
  amount: number
}
