import apiClient from '@/lib/axios'
import { API_ENDPOINTS } from '@/config/api.config'
import type {
  LoginPayload,
  LoginResponse,
  User,
  ChangePasswordPayload,
  ApiSuccess,
} from '@/types/auth.types'

// ─── Auth Service ─────────────────────────────────────────────────────────────

export const authService = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const { data } = await apiClient.post<ApiSuccess<LoginResponse>>(
      API_ENDPOINTS.auth.login,
      payload
    )
    return data.data
  },

  // ✅ getMe — backend MUST return permissions array in response
  // Backend ke auth controller me user select me permissions include karo (neeche dekho)
  getMe: async (): Promise<User> => {
    const { data } = await apiClient.get<ApiSuccess<User>>(API_ENDPOINTS.auth.me)
    return data.data
  },

  logout: async (): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.auth.logout)
  },

  changePassword: async (payload: ChangePasswordPayload): Promise<void> => {
    await apiClient.put(API_ENDPOINTS.auth.changePassword, payload)
  },
}

/*
  ─── BACKEND FIX REQUIRED ────────────────────────────────────────────────────
  
  Apne backend auth controller me /auth/me aur /auth/login dono jagah
  permissions include karo. Example:

  // auth.controller.js ya jahan /me handle hota hai:
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true, name: true, email: true, role: true,
      branchId: true, branch: true, isActive: true,
      createdAt: true, updatedAt: true,
      permissions: {                          // ← yeh add karo
        select: {
          module: true, canView: true,
          canCreate: true, canEdit: true, canDelete: true
        }
      }
    }
  })

  Same login response me bhi user ke saath permissions bhejo.
  ─────────────────────────────────────────────────────────────────────────────
*/