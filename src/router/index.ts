import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { authGuard, loginRedirectGuard } from './guards'
import { UserRole, type UserRole as UserRoleType } from '@/types/auth'

// Define route metadata interface for better type safety
declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    roles?: UserRoleType[]
    permissions?: string[]
    title?: string
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { 
      requiresAuth: false,
      title: '登录'
    },
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('@/views/ForgotPasswordView.vue'),
    meta: { 
      requiresAuth: false,
      title: '忘记密码'
    },
  },
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: {
      requiresAuth: true,
      roles: [UserRole.ADMIN, UserRole.BUSINESS_MANAGER, UserRole.INITIAL_REVIEWER, UserRole.FINAL_REVIEWER, UserRole.FINANCE_MANAGER],
      title: '平台概况'
    },
  },
  {
    path: '/initial-review',
    name: 'InitialReview',
    component: () => import('@/views/InitialReviewView.vue'),
    meta: {
      requiresAuth: true,
      roles: [UserRole.ADMIN, UserRole.BUSINESS_MANAGER, UserRole.INITIAL_REVIEWER],
      permissions: ['application:review'],
      title: '初审管理'
    },
  },
  {
    path: '/enrollment-management',
    name: 'EnrollmentManagement',
    component: () => import('@/views/EnrollmentManagementView.vue'),
    meta: {
      requiresAuth: true,
      roles: [UserRole.ADMIN, UserRole.BUSINESS_MANAGER, UserRole.INITIAL_REVIEWER],
      title: '入组管理'
    },
  },
  {
    path: '/application/:id',
    name: 'ApplicationDetail',
    component: () => import('@/views/ApplicationDetailView.vue'),
    meta: {
      requiresAuth: true,
      roles: [UserRole.ADMIN, UserRole.BUSINESS_MANAGER, UserRole.INITIAL_REVIEWER, UserRole.FINAL_REVIEWER, UserRole.FINANCE_MANAGER],
      permissions: ['application:view'],
      title: '申请详情'
    },
  },
  {
    path: '/final-review',
    name: 'FinalReview',
    component: () => import('@/views/FinalReviewView.vue'),
    meta: {
      requiresAuth: true,
      roles: [UserRole.ADMIN, UserRole.BUSINESS_MANAGER, UserRole.FINAL_REVIEWER],
      permissions: ['application:final_review'],
      title: '复核管理'
    },
  },
  {
    path: '/spot-check',
    name: 'SpotCheck',
    component: () => import('@/views/SpotCheckView.vue'),
    meta: {
      requiresAuth: true,
      roles: [UserRole.ADMIN, UserRole.BUSINESS_MANAGER],
      permissions: ['application:spot_check'],
      title: '抽查管理'
    },
  },
  {
    path: '/finance',
    name: 'Finance',
    component: () => import('@/views/FinanceView.vue'),
    meta: {
      requiresAuth: true,
      roles: [UserRole.ADMIN, UserRole.BUSINESS_MANAGER, UserRole.FINANCE_MANAGER],
      permissions: ['finance:manage'],
      title: '财务管理'
    },
  },
  {
    path: '/user-management',
    name: 'UserManagement',
    component: () => import('@/views/UserManagementView.vue'),
    meta: {
      requiresAuth: true,
      roles: [UserRole.ADMIN],
      permissions: ['user:manage'],
      title: '用户管理'
    },
  },
  {
    path: '/admin-management',
    name: 'AdminManagement',
    component: () => import('@/views/AdminManagementView.vue'),
    meta: {
      requiresAuth: true,
      roles: [UserRole.ADMIN, UserRole.BUSINESS_MANAGER],
      permissions: ['admin:manage'],
      title: '管理员管理'
    },
  },
  {
    path: '/login-log',
    name: 'LoginLog',
    component: () => import('@/views/LoginLogView.vue'),
    meta: {
      requiresAuth: true,
      roles: [UserRole.ADMIN, UserRole.BUSINESS_MANAGER],
      title: '登录日志'
    },
  },
  {
    path: '/workload-statistics',
    name: 'WorkloadStatistics',
    component: () => import('@/views/WorkloadStatisticsView.vue'),
    meta: {
      requiresAuth: true,
      roles: [UserRole.ADMIN, UserRole.BUSINESS_MANAGER],
      title: '工作量统计'
    },
  },
  {
    path: '/project-management',
    name: 'ProjectManagement',
    component: () => import('@/views/ProjectManagement.vue'),
    meta: {
      requiresAuth: true,
      roles: [UserRole.ADMIN, UserRole.BUSINESS_MANAGER],
      permissions: ['project:manage'],
      title: '项目管理'
    },
  },
  {
    path: '/unauthorized',
    name: 'Unauthorized',
    component: () => import('@/views/UnauthorizedView.vue'),
    meta: {
      requiresAuth: false,
      title: '无权限访问'
    },
  },
  // 开发环境API测试页面
  ...(import.meta.env.DEV ? [{
    path: '/api-test',
    name: 'ApiTest',
    component: () => import('@/views/ApiTestView.vue'),
    meta: {
      requiresAuth: false,
      title: 'API测试'
    },
  }] : []),
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundView.vue'),
    meta: {
      requiresAuth: false,
      title: '页面不存在'
    },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Enhanced route guards with comprehensive permission checking
router.beforeEach(async (to, from, next) => {
  try {
    // Apply login redirect guard first
    if (to.name === 'Login' || to.name === 'ForgotPassword') {
      loginRedirectGuard(to, from, next)
      return
    }

    // Apply authentication and role guards
    await authGuard(to, from, next)
  } catch (error) {
    console.error('Router guard error:', error)
    
    // Import notification store dynamically to avoid circular dependencies
    const { useNotificationStore } = await import('@/stores/notification')
    const notificationStore = useNotificationStore()
    
    // Handle different types of navigation errors
    if (error instanceof Error) {
      if (error.message.includes('401') || error.message.includes('unauthorized')) {
        notificationStore.showError('登录已过期，请重新登录')
        next('/login')
      } else if (error.message.includes('403') || error.message.includes('forbidden')) {
        notificationStore.showError('权限不足，无法访问该页面')
        next('/unauthorized')
      } else {
        notificationStore.showError('页面加载失败，请稍后重试')
        next(from.path || '/dashboard')
      }
    } else {
      // On unknown error, redirect to login for safety
      notificationStore.showError('系统异常，请重新登录')
      next('/login')
    }
  }
})

// Handle navigation errors
router.onError((error) => {
  console.error('Router navigation error:', error)
  
  // Import notification store dynamically
  import('@/stores/notification').then(({ useNotificationStore }) => {
    const notificationStore = useNotificationStore()
    notificationStore.showError('页面导航失败，请刷新页面重试')
  })
})

// After each route change, update document title
router.afterEach((to) => {
  if (to.meta.title) {
    document.title = `${to.meta.title} - 王定国公益基金会管理系统`
  } else {
    document.title = '王定国公益基金会管理系统'
  }
})

export default router
