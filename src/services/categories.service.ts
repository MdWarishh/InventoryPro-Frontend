import api from '@/lib/axios'
import type {
  Category,
  CategoryFilters,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '@/types/categories.types'

export type { Category }

export const categoriesService = {
  getAll: async (params?: CategoryFilters): Promise<Category[]> => {
    const { data } = await api.get('/categories', { params })
    return Array.isArray(data.data) ? data.data : []
  },

  create: async (payload: CreateCategoryPayload): Promise<Category> => {
    const { data } = await api.post('/categories', payload)
    return data.data as Category
  },

  update: async (id: string, payload: UpdateCategoryPayload): Promise<Category> => {
    const { data } = await api.put(`/categories/${id}`, payload)
    return data.data as Category
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`)
  },
}