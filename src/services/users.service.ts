import api from '@/lib/axios'
import type {
  User, UsersResponse, UserFilters,
  CreateUserPayload, UpdateUserPayload, ResetPasswordPayload,
  Permission,
} from '@/types/users.types'

export type { User, UsersResponse }
export interface UpdateProfilePayload {
  whatsappNumber?: string | null
}

export const usersService = {
  getAll: async (params?: UserFilters): Promise<UsersResponse> => {
    const { data } = await api.get('/users', { params })
    return {
      users: Array.isArray(data.data) ? data.data : [],
      pagination: data.pagination ?? { total: 0, page: 1, limit: 20, pages: 0 },
    }
  },

  create: async (payload: CreateUserPayload): Promise<User> => {
    const { data } = await api.post('/users', payload)
    return data.data as User
  },

  update: async (id: string, payload: UpdateUserPayload): Promise<User> => {
    const { data } = await api.put(`/users/${id}`, payload)
    return data.data as User
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`)
  },

  resetPassword: async (id: string, payload: ResetPasswordPayload): Promise<void> => {
    await api.put(`/users/${id}/reset-password`, payload)
  },

  getPermissions: async (id: string): Promise<Permission[]> => {
    const { data } = await api.get(`/users/${id}/permissions`)
    return Array.isArray(data.data) ? data.data : []
  },
  // users.service.ts mein add karo at the end:



// usersService object mein add karo:
getProfile: async (): Promise<User> => {
  const { data } = await api.get('/users/profile')
  return data.data as User
},

updateProfile: async (payload: UpdateProfilePayload): Promise<User> => {
  const { data } = await api.put('/users/profile', payload)
  return data.data as User
},
}

