import { BaseAPIService } from './base'
import type { 
  LoginRequest, 
  LoginResponse, 
  AdminUser, 
  Permission,
  CaptchaResponse,
  ForgotPasswordRequest
} from '@/types/auth'

export interface AuthAPI {
  getCaptcha(): Promise<CaptchaResponse>
  login(credentials: LoginRequest): Promise<LoginResponse>
  logout(): Promise<void>
  getCurrentUser(): Promise<{ user: AdminUser; permissions: Permission[] }>
  refreshToken(): Promise<{ token: string }>
  changePassword(currentPassword: string, newPassword: string): Promise<void>
  forgotPassword(request: ForgotPasswordRequest): Promise<{ message: string }>
  resetPassword(token: string, newPassword: string): Promise<void>
  resetPasswordByPhone(phone: string, newPassword: string): Promise<void>
}

/**
 * Authentication API service
 * Handles all authentication-related API calls
 */
class AuthService extends BaseAPIService implements AuthAPI {
  constructor() {
    super('/auth')
  }

  /**
   * Get captcha image and key
   */
  async getCaptcha(): Promise<CaptchaResponse> {
    return this.get<CaptchaResponse>('/captcha')
  }

  /**
   * Admin login with phone, password and captcha
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.post<LoginResponse>('/admin/login', credentials)
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    return this.post<void>('/logout')
  }

  /**
   * Get current authenticated user info
   */
  async getCurrentUser(): Promise<{ user: AdminUser; permissions: Permission[] }> {
    return this.get<{ user: AdminUser; permissions: Permission[] }>('/admin/me')
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<{ token: string }> {
    return this.post<{ token: string }>('/refresh')
  }

  /**
   * Change current user's password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    return this.post<void>('/change-password', {
      currentPassword,
      newPassword
    })
  }

  /**
   * Admin forgot password with captcha
   */
  async forgotPassword(request: ForgotPasswordRequest): Promise<{ message: string }> {
    return this.post<{ message: string }>('/admin/forgot-password', request)
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    return this.post<void>('/reset-password', {
      token,
      newPassword
    })
  }

  /**
   * Reset password by phone number (for admin forgot password)
   */
  async resetPasswordByPhone(phone: string, newPassword: string): Promise<void> {
    return this.post<void>('/reset-password-by-phone', {
      phone,
      newPassword
    })
  }

  /**
   * Verify authentication token
   */
  async verifyToken(): Promise<boolean> {
    try {
      await this.get('/verify', this.createBackgroundConfig())
      return true
    } catch {
      return false
    }
  }
}

export const authAPI = new AuthService()