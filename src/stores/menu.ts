import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { MenuItem } from '@/types'
import { UserRole } from '@/types/auth'
import { useAuthStore } from './auth'

export const useMenuStore = defineStore('menu', () => {
  // Enhanced menu configuration with roles and permissions
  const menuItems = ref<MenuItem[]>([
    {
      id: 'dashboard',
      title: '平台概况',
      icon: 'DataAnalysis',
      path: '/dashboard',
      component: 'Dashboard',
      roles: [
        UserRole.ADMIN,
        UserRole.BUSINESS_MANAGER,
        UserRole.INITIAL_REVIEWER,
        UserRole.FINAL_REVIEWER,
        UserRole.FINANCE_MANAGER,
      ],
    },
    {
      id: 'enrollment-management',
      title: '入组管理',
      icon: 'UserFilled',
      path: '/enrollment-management',
      component: 'EnrollmentManagement',
      roles: [UserRole.ADMIN, UserRole.BUSINESS_MANAGER, UserRole.INITIAL_REVIEWER],
    },
    {
      id: 'initial-review',
      title: '初审管理',
      icon: 'Document',
      path: '/initial-review',
      component: 'InitialReview',
      roles: [UserRole.ADMIN, UserRole.BUSINESS_MANAGER, UserRole.INITIAL_REVIEWER],
    },
    {
      id: 'final-review',
      title: '复核管理',
      icon: 'DocumentChecked',
      path: '/final-review',
      component: 'FinalReview',
      roles: [UserRole.ADMIN, UserRole.BUSINESS_MANAGER, UserRole.FINAL_REVIEWER],
    },
    {
      id: 'spot-check',
      title: '抽查管理',
      icon: 'Search',
      path: '/spot-check',
      component: 'SpotCheck',
      roles: [UserRole.ADMIN, UserRole.BUSINESS_MANAGER],
    },
    {
      id: 'finance',
      title: '财务管理',
      icon: 'Money',
      path: '/finance',
      component: 'Finance',
      roles: [UserRole.ADMIN, UserRole.BUSINESS_MANAGER, UserRole.FINANCE_MANAGER],
    },
    {
      id: 'user-management',
      title: '用户管理',
      icon: 'User',
      path: '/user-management',
      component: 'UserManagement',
      roles: [UserRole.ADMIN],
    },
    {
      id: 'admin-management',
      title: '管理员管理',
      icon: 'UserFilled',
      path: '/admin-management',
      component: 'AdminManagement',
      roles: [UserRole.ADMIN, UserRole.BUSINESS_MANAGER],
    },
    {
      id: 'login-log',
      title: '登录日志',
      icon: 'Document',
      path: '/login-log',
      component: 'LoginLog',
      roles: [UserRole.ADMIN, UserRole.BUSINESS_MANAGER],
    },
    {
      id: 'workload-statistics',
      title: '工作量统计',
      icon: 'Histogram',
      path: '/workload-statistics',
      component: 'WorkloadStatistics',
      roles: [UserRole.ADMIN, UserRole.BUSINESS_MANAGER],
    },
    {
      id: 'project-management',
      title: '项目管理',
      icon: 'Folder',
      path: '/project-management',
      component: 'ProjectManagement',
      roles: [UserRole.ADMIN, UserRole.BUSINESS_MANAGER],
    },
  ])

  // Computed property to get menu items for current user role
  const userMenuItems = computed(() => {
    const authStore = useAuthStore()
    if (!authStore.user) return []

    return menuItems.value.filter((item) => {
      // Check if user has required role for this menu item
      return authStore.canAccessRoute(item.roles)
    })
  })

  // Get menu items by role (for testing and admin purposes)
  const getMenuItemsByRole = (role: UserRole): MenuItem[] => {
    return menuItems.value.filter((item) => item.roles.includes(role))
  }

  // Check if a specific menu item is accessible to current user
  const isMenuItemAccessible = (menuId: string): boolean => {
    const authStore = useAuthStore()
    if (!authStore.user) return false

    const menuItem = menuItems.value.find(item => item.id === menuId)
    if (!menuItem) return false

    return authStore.canAccessRoute(menuItem.roles)
  }

  return {
    menuItems,
    userMenuItems,
    getMenuItemsByRole,
    isMenuItemAccessible,
  }
})
