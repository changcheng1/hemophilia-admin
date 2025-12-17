import type { UserRole } from './auth'

// Menu configuration types
export interface MenuItem {
  id: string
  title: string
  icon: string
  path: string
  component: string
  roles: UserRole[]
  permissions?: string[]
  children?: MenuItem[]
}

export interface MenuConfig {
  items: MenuItem[]
  roleBasedMenus: Record<UserRole, MenuItem[]>
}

// Route metadata types
export interface RoutePermissionConfig {
  roles: UserRole[]
  permissions: string[]
}
