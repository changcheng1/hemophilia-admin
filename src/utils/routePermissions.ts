import type { RouteLocationNormalized } from 'vue-router'
import type { UserRole } from '@/types/auth'

/**
 * Route permission configuration
 * Maps route names to their required roles and permissions
 */
export const ROUTE_PERMISSIONS = {
  Dashboard: {
    roles: ['admin', 'business_manager', 'initial_reviewer', 'final_reviewer', 'finance_manager'] as UserRole[],
    permissions: []
  },
  InitialReview: {
    roles: ['admin', 'business_manager', 'initial_reviewer'] as UserRole[],
    permissions: ['application:review']
  },
  FinalReview: {
    roles: ['admin', 'business_manager', 'final_reviewer'] as UserRole[],
    permissions: ['application:final_review']
  },
  SpotCheck: {
    roles: ['admin', 'business_manager'] as UserRole[],
    permissions: ['application:spot_check']
  },
  Finance: {
    roles: ['admin', 'business_manager', 'finance_manager'] as UserRole[],
    permissions: ['finance:manage']
  },
  UserManagement: {
    roles: ['admin'] as UserRole[],
    permissions: ['user:manage']
  },
  AdminManagement: {
    roles: ['admin', 'business_manager'] as UserRole[],
    permissions: ['admin:manage']
  },
  WorkloadStatistics: {
    roles: ['admin', 'business_manager'] as UserRole[],
    permissions: []
  }
} as const

/**
 * Get route permission requirements by route name
 */
export function getRoutePermissions(routeName: string) {
  return ROUTE_PERMISSIONS[routeName as keyof typeof ROUTE_PERMISSIONS] || null
}

/**
 * Check if a route requires authentication
 */
export function routeRequiresAuth(route: RouteLocationNormalized): boolean {
  return route.meta.requiresAuth !== false
}

/**
 * Get the default redirect path for a user role
 */
export function getDefaultRouteForRole(role: UserRole): string {
  switch (role) {
    case 'admin':
    case 'business_manager':
      return '/dashboard'
    case 'initial_reviewer':
      return '/initial-review'
    case 'final_reviewer':
      return '/final-review'
    case 'finance_manager':
      return '/finance'
    default:
      return '/dashboard'
  }
}

/**
 * Get accessible routes for a specific role
 */
export function getAccessibleRoutesForRole(role: UserRole): string[] {
  const accessibleRoutes: string[] = []
  
  Object.entries(ROUTE_PERMISSIONS).forEach(([routeName, config]) => {
    if (config.roles.includes(role)) {
      accessibleRoutes.push(routeName)
    }
  })
  
  return accessibleRoutes
}

/**
 * Validate if user can access a specific route
 */
export function validateRouteAccess(
  routeName: string,
  userRole: UserRole,
  userPermissions: string[]
): boolean {
  const routeConfig = getRoutePermissions(routeName)
  if (!routeConfig) return true // Allow access if no specific config

  // Check role requirement
  if (!routeConfig.roles.includes(userRole)) {
    return false
  }

  // Check permission requirement
  if (routeConfig.permissions.length > 0) {
    const hasAllPermissions = routeConfig.permissions.every(
      permission => userPermissions.includes(permission)
    )
    if (!hasAllPermissions) {
      return false
    }
  }

  return true
}
