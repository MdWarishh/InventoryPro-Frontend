import apiClient from '@/lib/axios'
import type {
  Branch,
  BranchWithStats,
  BranchStats,
  CreateBranchPayload,
  UpdateBranchPayload,
} from '@/types/branches.types'
import type { ApiSuccess } from '@/types/auth.types'

export const branchesService = {
  getAll: async (): Promise<BranchWithStats[]> => {
    const { data } = await apiClient.get<ApiSuccess<BranchWithStats[]>>('/branches')
    return data.data
  },

  getById: async (id: string): Promise<BranchWithStats> => {
    const { data } = await apiClient.get<ApiSuccess<BranchWithStats>>(`/branches/${id}`)
    return data.data
  },

  getStats: async (id: string): Promise<BranchStats> => {
    const { data } = await apiClient.get<ApiSuccess<BranchStats>>(`/branches/${id}/stats`)
    return data.data
  },

  create: async (payload: CreateBranchPayload): Promise<Branch> => {
    const { data } = await apiClient.post<ApiSuccess<Branch>>('/branches', payload)
    return data.data
  },

  update: async (id: string, payload: UpdateBranchPayload): Promise<Branch> => {
    const { data } = await apiClient.put<ApiSuccess<Branch>>(`/branches/${id}`, payload)
    return data.data
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/branches/${id}`)
  },
}