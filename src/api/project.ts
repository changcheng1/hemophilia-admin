import http from '@/utils/http'

export interface Project {
  id: number
  name: string
  description: string
  supportCompany: string
  responsiblePerson: string
  allowedProvinces: string[]
  isThreeElementEnabled: boolean
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface CreateProjectDto {
  name: string
  description?: string
  supportCompany?: string
  responsiblePerson?: string
  allowedProvinces?: string[]
  isThreeElementEnabled?: boolean
  isActive?: boolean
  sortOrder?: number
}

export interface UpdateProjectDto {
  name?: string
  description?: string
  supportCompany?: string
  responsiblePerson?: string
  allowedProvinces?: string[]
  isThreeElementEnabled?: boolean
  isActive?: boolean
  sortOrder?: number
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

  updateProvinces(id: number, allowedProvinces: string[]) {
    return http.patch<Project>(`/admin/projects/${id}/provinces`, { allowedProvinces })
  },

  updateRiskControl(id: number, data: { isThreeElementEnabled?: boolean }) {
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
