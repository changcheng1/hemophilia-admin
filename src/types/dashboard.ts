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
