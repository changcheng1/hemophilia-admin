import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { UserRole, type UserRole as UserRoleType } from '@/types/auth'

/**
 * Composable for handling permissions and role-based access control
 */
export function usePermissions() {
  const authStore = useAuthStore()

  // Computed properties for common permission checks
  const isAdmin = computed(() => authStore.userRole === UserRole.ADMIN)
  const isBusinessManager = computed(() => authStore.userRole === UserRole.BUSINESS_MANAGER)
  const isInitialReviewer = computed(() => authStore.userRole === UserRole.INITIAL_REVIEWER)
  const isFinalReviewer = computed(() => authStore.userRole === UserRole.FINAL_REVIEWER)
  const isFinanceManager = computed(() => authStore.userRole === UserRole.FINANCE_MANAGER)

  // Check if user has specific role
  const hasRole = (role: UserRoleType): boolean => {
    return authStore.userRole === role
  }

  // Check if user has any of the specified roles
  const hasAnyRole = (roles: UserRoleType[]): boolean => {
    return authStore.checkRole(roles)
  }

  // Check if user has specific permission
  const hasPermission = (permission: string): boolean => {
    return authStore.hasPermission(permission)
  }

  // Check if user has all specified permissions
  const hasAllPermissions = (permissions: string[]): boolean => {
    return authStore.checkPermissions(permissions)
  }

  // Check if user can access a route
  const canAccessRoute = (roles?: UserRoleType[], permissions?: string[]): boolean => {
    return authStore.canAccessRoute(roles, permissions)
  }

  // Common permission checks for different modules
  const canManageUsers = computed(() => hasRole(UserRole.ADMIN))
  const canManageAdmins = computed(() => hasRole(UserRole.ADMIN))
  const canReviewApplications = computed(() =>
    hasAnyRole([UserRole.ADMIN, UserRole.INITIAL_REVIEWER]),
  )
  const canFinalReview = computed(() => hasAnyRole([UserRole.ADMIN, UserRole.FINAL_REVIEWER]))
  const canManageFinance = computed(() => hasAnyRole([UserRole.ADMIN, UserRole.FINANCE_MANAGER]))
  const canSpotCheck = computed(() => hasAnyRole([UserRole.ADMIN, UserRole.BUSINESS_MANAGER]))

  return {
    // Role checks
    isAdmin,
    isBusinessManager,
    isInitialReviewer,
    isFinalReviewer,
    isFinanceManager,
    hasRole,
    hasAnyRole,

    // Permission checks
    hasPermission,
    hasAllPermissions,
    canAccessRoute,

    // Module-specific permissions
    canManageUsers,
    canManageAdmins,
    canReviewApplications,
    canFinalReview,
    canManageFinance,
    canSpotCheck,
  }
}
