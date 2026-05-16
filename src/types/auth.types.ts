// ─── User & Auth Types ────────────────────────────────────────────────────────

export type UserRole = 'SUPER_ADMIN' | 'BRANCH_ADMIN' | 'STAFF'

// ✅ Permission type add kiya
export interface Permission {
  module: string
  canView: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
}

export interface Branch {
  id: string
  name: string
  address: string | null
  phone: string | null
  email: string | null
  isMain: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  branchId: string | null
  branch: Branch | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  permissions: Permission[]  
  whatsappNumber?: string | null
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiSuccess<T = unknown> {
  success: true
  data: T
  message: string
}

export interface ApiError {
  success: false
  message: string
  statusCode?: number
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError