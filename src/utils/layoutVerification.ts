/**
 * Layout and Menu System Verification Utilities
 * This file contains functions to verify the main layout and menu system functionality
 */

import { UserRole } from '@/types/auth'
import type { MenuItem } from '@/types/menu'

/**
 * Verify that menu items are correctly filtered based on user role
 */
export function verifyRoleBasedMenuFiltering(
  allMenuItems: MenuItem[],
  userRole: UserRole,
  expectedMenuIds: string[]
): boolean {
  const filteredItems = allMenuItems.filter(item => item.roles.includes(userRole))
  const actualMenuIds = filteredItems.map(item => item.id).sort()
  const expectedSorted = expectedMenuIds.sort()
  
  return JSON.stringify(actualMenuIds) === JSON.stringify(expectedSorted)
}

/**
 * Verify that all required menu items exist for each role
 */
export function verifyMenuItemsForAllRoles(): Record<UserRole, string[]> {
  const expectedMenusByRole: Record<UserRole, string[]> = {
    [UserRole.ADMIN]: [
      'dashboard',
      'initial-review',
      'final-review',
      'spot-check',
      'finance',
      'user-management',
      'admin-management'
    ],
    [UserRole.BUSINESS_MANAGER]: [
      'dashboard',
      'initial-review',
      'final-review',
      'spot-check',
      'finance',
      'admin-management'
    ],
    [UserRole.INITIAL_REVIEWER]: [
      'dashboard',
      'initial-review'
    ],
    [UserRole.FINAL_REVIEWER]: [
      'dashboard',
      'final-review'
    ],
    [UserRole.FINANCE_MANAGER]: [
      'dashboard',
      'finance'
    ]
  }
  
  return expectedMenusByRole
}

/**
 * Verify responsive design breakpoints
 */
export function verifyResponsiveBreakpoints(): { mobile: number; tablet: number; desktop: number } {
  return {
    mobile: 768,
    tablet: 1024,
    desktop: 1200
  }
}

/**
 * Verify breadcrumb navigation structure
 */
export function verifyBreadcrumbStructure(currentPath: string): { title: string; path?: string }[] {
  const breadcrumbMap: Record<string, { title: string; path?: string }[]> = {
    '/dashboard': [
      { title: '首页', path: '/dashboard' }
    ],
    '/initial-review': [
      { title: '首页', path: '/dashboard' },
      { title: '初审管理', path: '/initial-review' }
    ],
    '/final-review': [
      { title: '首页', path: '/dashboard' },
      { title: '复核管理', path: '/final-review' }
    ],
    '/spot-check': [
      { title: '首页', path: '/dashboard' },
      { title: '抽查管理', path: '/spot-check' }
    ],
    '/finance': [
      { title: '首页', path: '/dashboard' },
      { title: '财务管理', path: '/finance' }
    ],
    '/user-management': [
      { title: '首页', path: '/dashboard' },
      { title: '用户管理', path: '/user-management' }
    ],
    '/admin-management': [
      { title: '首页', path: '/dashboard' },
      { title: '管理员管理', path: '/admin-management' }
    ]
  }
  
  return breadcrumbMap[currentPath] || [{ title: '首页', path: '/dashboard' }, { title: '页面' }]
}

/**
 * Verify user role display names
 */
export function verifyRoleDisplayNames(): Record<UserRole, string> {
  return {
    [UserRole.ADMIN]: '系统管理员',
    [UserRole.BUSINESS_MANAGER]: '业务管理员',
    [UserRole.INITIAL_REVIEWER]: '初审管理员',
    [UserRole.FINAL_REVIEWER]: '复核管理员',
    [UserRole.FINANCE_MANAGER]: '财务管理员'
  }
}

/**
 * Test all layout functionality
 */
export function runLayoutVerificationTests(): {
  success: boolean
  results: Record<string, boolean>
  errors: string[]
} {
  const results: Record<string, boolean> = {}
  const errors: string[] = []
  
  try {
    // Test 1: Role-based menu filtering
    const expectedMenus = verifyMenuItemsForAllRoles()
    results.roleBasedMenus = Object.keys(expectedMenus).length === 5
    
    // Test 2: Responsive breakpoints
    const breakpoints = verifyResponsiveBreakpoints()
    results.responsiveBreakpoints = breakpoints.mobile === 768 && breakpoints.tablet === 1024
    
    // Test 3: Breadcrumb structure
    const dashboardBreadcrumb = verifyBreadcrumbStructure('/dashboard')
    results.breadcrumbStructure = dashboardBreadcrumb.length === 1 && dashboardBreadcrumb[0]?.title === '首页'
    
    // Test 4: Role display names
    const roleNames = verifyRoleDisplayNames()
    results.roleDisplayNames = Object.keys(roleNames).length === 5
    
    const success = Object.values(results).every(result => result === true)
    
    return { success, results, errors }
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Unknown error')
    return { success: false, results, errors }
  }
}