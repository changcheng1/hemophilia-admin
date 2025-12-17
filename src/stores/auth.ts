import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AdminUser, LoginRequest, LoginResponse, Permission } from '@/types'
import { authAPI } from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<AdminUser | null>(null)
  const token = ref<string | null>(localStorage.getItem('admin_token'))
  const permissions = ref<string[]>([])

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const userRole = computed(() => user.value?.role)
  const hasPermission = (permission: string) => permissions.value.includes(permission)

  // Actions
  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      const response = await authAPI.login(credentials)
      const { token: authToken, user: userData, permissions: userPermissions } = response

      // Store auth data
      token.value = authToken
      user.value = userData
      permissions.value = userPermissions.map((p) => `${p.resource}:${p.action}`)

      // Persist token
      localStorage.setItem('admin_token', authToken)
    } catch (error) {
      throw error
    }
  }

  const logout = async (): Promise<void> => {
    try {
      // Call logout API to invalidate token on server
      await authAPI.logout()
    } catch (error) {
      // Continue with local logout even if API call fails
      console.warn('Logout API call failed:', error)
    } finally {
      // Clear local state
      user.value = null
      token.value = null
      permissions.value = []
      localStorage.removeItem('admin_token')
    }
  }

  const getCurrentUser = async (): Promise<void> => {
    if (!token.value) return

    try {
      const response = await authAPI.getCurrentUser()
      const { user: userData, permissions: userPermissions } = response

      user.value = userData
      permissions.value = userPermissions.map((p) => `${p.resource}:${p.action}`)
    } catch (error) {
      // If getting current user fails, clear auth state
      await logout()
      throw error
    }
  }

  const checkRole = (roles: string[]): boolean => {
    if (!user.value) return false
    return roles.includes(user.value.role)
  }

  const checkPermissions = (requiredPermissions: string[]): boolean => {
    if (!permissions.value.length) return false
    return requiredPermissions.every(permission => permissions.value.includes(permission))
  }

  const canAccessRoute = (routeRoles?: string[], routePermissions?: string[]): boolean => {
    if (!user.value) return false
    
    // Check role requirements
    if (routeRoles && routeRoles.length > 0) {
      if (!checkRole(routeRoles)) return false
    }
    
    // Check permission requirements
    if (routePermissions && routePermissions.length > 0) {
      if (!checkPermissions(routePermissions)) return false
    }
    
    return true
  }

  return {
    // State
    user,
    token,
    permissions,

    // Getters
    isAuthenticated,
    userRole,

    // Actions
    login,
    logout,
    getCurrentUser,
    hasPermission,
    checkRole,
    checkPermissions,
    canAccessRoute,
  }
})
