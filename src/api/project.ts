import http from '@/utils/http'

export interface Project {
  id: number
  name: string
  description: string
  executionStartDate?: string | null
  executionEndDate?: string | null
  projectPeriod?: string
  singlePeriodLimitAmount?: number | null
  periodCount?: number
  periods?: ProjectPeriod[]
  supportCompany: string
  responsiblePerson: string
  responsiblePersonIds?: number[]
  responsiblePersons?: ProjectResponsiblePerson[]
  allowedProvinces: string[]
  provinceLimits?: ProjectProvinceLimit[]
  isThreeElementEnabled: boolean
  isHouseholdLocationEnabled?: boolean
  isMedicalInsuranceLocationEnabled?: boolean
  isTreatmentLocationEnabled?: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ProjectResponsiblePerson {
  id: number
  name: string
  phone: string
}

export interface ProjectProvinceLimit {
  province: string
  limitCount: number
  registeredCount?: number
}

export interface ProjectPeriod {
  id?: number
  projectId?: number
  periodName: string
  startDate?: string | null
  endDate?: string | null
  sortOrder?: number
  isActive?: boolean
}

export interface CreateProjectDto {
  name: string
  description?: string
  executionStartDate?: string | null
  executionEndDate?: string | null
  projectPeriod?: string
  singlePeriodLimitAmount?: number | null
  supportCompany?: string
  responsiblePerson?: string
  responsiblePersonIds?: number[]
  allowedProvinces?: string[]
  provinceLimits?: ProjectProvinceLimit[]
  isThreeElementEnabled?: boolean
  isHouseholdLocationEnabled?: boolean
  isMedicalInsuranceLocationEnabled?: boolean
  isTreatmentLocationEnabled?: boolean
  isActive?: boolean
}

export interface UpdateProjectDto {
  name?: string
  description?: string
  executionStartDate?: string | null
  executionEndDate?: string | null
  projectPeriod?: string
  singlePeriodLimitAmount?: number | null
  supportCompany?: string
  responsiblePerson?: string
  responsiblePersonIds?: number[]
  allowedProvinces?: string[]
  provinceLimits?: ProjectProvinceLimit[]
  isThreeElementEnabled?: boolean
  isHouseholdLocationEnabled?: boolean
  isMedicalInsuranceLocationEnabled?: boolean
  isTreatmentLocationEnabled?: boolean
  isActive?: boolean
}

export const projectApi = {
  // 获取所有项目
  getAll() {
    return http.get<Project[]>('/admin/projects')
  },

  // 获取启用的项目
  getActive() {
    return http.get<Project[]>('/admin/projects/active')
  },

  // 获取项目详情
  getById(id: number) {
    return http.get<Project>(`/admin/projects/${id}`)
  },

  // 创建项目
  create(data: CreateProjectDto) {
    return http.post<Project>('/admin/projects', data)
  },

  // 更新项目
  update(id: number, data: UpdateProjectDto) {
    return http.patch<Project>(`/admin/projects/${id}`, data)
  },

  updateProvinces(id: number, provinceLimits: ProjectProvinceLimit[]) {
    return http.patch<Project>(`/admin/projects/${id}`, {
      provinceLimits,
      allowedProvinces: provinceLimits.map((item) => item.province),
    })
  },

  getPeriods(id: number) {
    return http.get<ProjectPeriod[]>(`/admin/projects/${id}/periods`)
  },

  updatePeriods(id: number, periods: ProjectPeriod[]) {
    return http.patch<ProjectPeriod[]>(`/admin/projects/${id}/periods`, { periods })
  },

  updateRiskControl(
    id: number,
    data: {
      isThreeElementEnabled?: boolean
      isHouseholdLocationEnabled?: boolean
      isMedicalInsuranceLocationEnabled?: boolean
      isTreatmentLocationEnabled?: boolean
    },
  ) {
    return http.patch<Project>(`/admin/projects/${id}/risk-control`, data)
  },

  // 切换启用状态
  toggleActive(id: number) {
    return http.patch<Project>(`/admin/projects/${id}/toggle-active`)
  },

  // 删除项目
  delete(id: number) {
    return http.delete(`/admin/projects/${id}`)
  },
}
