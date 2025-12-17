import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { UserRole } from '@/types/auth'

/**
 * Permission verification middleware
 * Checks if user has required permissions for accessing routes
 */
export class PermissionGuard {
  /**
   * Check if user has required role for the route
   */
  static checkRole(requiredRoles: UserRole[], userRole?: UserRole): boolean {
    if (!userRole) return false
    return requiredRoles.includes(userRole)
  }

  /**
   * Check if user has required permission
   */
  static checkPermission(requiredPermission: string, userPermissions: string[]): boolean {
    return userPermissions.includes(requiredPermission)
  }

  /**
   * Get redirect path based on user role when access is denied
   */
  static getRedirectPath(_userRole?: UserRole): string {
    // Always redirect to dashboard for authenticated users without proper role
    return '/dashboard'
  }
}

/**
 * Authentication guard - checks if user is authenticated
 */
export const authGuard = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
): Promise<void> => {
  const authStore = useAuthStore()

  // If route doesn't require auth, allow access
  if (!to.meta.requiresAuth) {
    next()
    return
  }

  // Check if user is authenticated
  if (!authStore.isAuthenticated) {
    // Try to get current user if token exists
    if (authStore.token) {
      try {
        await authStore.getCurrentUser()
        // If successful, continue with role and permission check
        roleAndPermissionGuard(to, from, next)
        return
      } catch (_error) {
        // If failed, redirect to login
        next('/login')
        return
      }
    } else {
      // No token, redirect to login
      next('/login')
      return
    }
  }

  // User is authenticated, proceed to role and permission checks
  roleAndPermissionGuard(to, from, next)
}

/**
 * Combined role and permission-based access control guard
 */
export const roleAndPermissionGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
): void => {
  const authStore = useAuthStore()

  // Check role requirements first
  if (to.meta.roles && Array.isArray(to.meta.roles)) {
    const hasRequiredRole = PermissionGuard.checkRole(
      to.meta.roles as UserRole[],
      authStore.userRole
    )

    if (!hasRequiredRole) {
      // User doesn't have required role, redirect to appropriate page
      const redirectPath = PermissionGuard.getRedirectPath(authStore.userRole)
      next(redirectPath)
      return
    }
  }

  // Check permission requirements
  if (to.meta.permissions && Array.isArray(to.meta.permissions)) {
    const hasAllPermissions = (to.meta.permissions as string[]).every(permission =>
      PermissionGuard.checkPermission(permission, authStore.permissions)
    )

    if (!hasAllPermissions) {
      // User doesn't have required permissions, redirect to dashboard
      next('/dashboard')
      return
    }
  }

  // All checks passed, allow access
  next()
}

/**
 * Role-based access control guard (kept for backward compatibility)
 */
export const roleGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
): void => {
  const authStore = useAuthStore()

  // If no role requirements, allow access
  if (!to.meta.roles || !Array.isArray(to.meta.roles)) {
    next()
    return
  }

  // Check if user has required role
  const hasRequiredRole = PermissionGuard.checkRole(
    to.meta.roles as UserRole[],
    authStore.userRole
  )

  if (!hasRequiredRole) {
    // User doesn't have required role, redirect to appropriate page
    const redirectPath = PermissionGuard.getRedirectPath(authStore.userRole)
    next(redirectPath)
    return
  }

  next()
}

/**
 * Permission-based access control guard
 */
export const permissionGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
): void => {
  const authStore = useAuthStore()

  // If no permission requirements, allow access
  if (!to.meta.permissions || !Array.isArray(to.meta.permissions)) {
    next()
    return
  }

  // Check if user has all required permissions
  const hasAllPermissions = (to.meta.permissions as string[]).every(permission =>
    PermissionGuard.checkPermission(permission, authStore.permissions)
  )

  if (!hasAllPermissions) {
    // User doesn't have required permissions, redirect to dashboard
    next('/dashboard')
    return
  }

  next()
}

/**
 * Login redirect guard - prevents authenticated users from accessing login/forgot password pages
 */
export const loginRedirectGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
): void => {
  const authStore = useAuthStore()

  // If user is authenticated and trying to access login or forgot password, redirect to dashboard
  if ((to.name === 'Login' || to.name === 'ForgotPassword') && authStore.isAuthenticated) {
    next('/dashboard')
    return
  }

  next()
}