// Authentication related types
export interface AdminUser {
  id: number
  phone: string
  role: UserRole
  name: string
  permissions: Permission[]
  lastLoginAt: Date
  isActive: boolean
}

export enum UserRole {
  ADMIN = 'admin',
  BUSINESS_MANAGER = 'business_manager',
  INITIAL_REVIEWER = 'initial_reviewer',
  FINAL_REVIEWER = 'final_reviewer',
  FINANCE_MANAGER = 'finance_manager',
}

export interface Permission {
  id: string
  name: string
  resource: string
  action: string
}

export interface AuthState {
  user: AdminUser | null
  token: string | null
  permissions: string[]
  isAuthenticated: boolean
}

export interface LoginRequest {
  phone: string
  password: string
  captcha: string
  captchaKey: string
}

export interface LoginResponse {
  token: string
  user: AdminUser
  permissions: Permission[]
}

export interface CaptchaResponse {
  key: string
  image: string
}

export interface ForgotPasswordRequest {
  phone: string
  captcha: string
  captchaKey: string
  newPassword: string
}
