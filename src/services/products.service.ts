import apiClient from '@/lib/axios'
import type { ApiSuccess } from '@/types/auth.types'
import type {
  Product,
  CreateProductPayload,
  UpdateProductPayload,
  ProductsResponse,
  ProductsQuery,
} from '@/types/products.types'

export const productsService = {
  getAll: async (query: ProductsQuery = {}): Promise<ProductsResponse> => {
    const params = new URLSearchParams()
    if (query.page) params.set('page', String(query.page))
    if (query.limit) params.set('limit', String(query.limit))
    if (query.search) params.set('search', query.search)
    if (query.categoryId) params.set('categoryId', query.categoryId)
    if (query.branchId) params.set('branchId', query.branchId)
    if (query.lowStock) params.set('lowStock', 'true')
    const { data } = await apiClient.get(`/products?${params.toString()}`)
    // Backend sendPaginated sends: { success, data: [...], pagination: {...} }
    return {
      products: data.data,
      pagination: data.pagination,
    }
  },

  getById: async (id: string): Promise<Product> => {
    const { data } = await apiClient.get<ApiSuccess<Product>>(`/products/${id}`)
    return data.data
  },

  search: async (q: string): Promise<Product[]> => {
    const { data } = await apiClient.get<ApiSuccess<Product[]>>(`/products/search?q=${encodeURIComponent(q)}`)
    return data.data
  },

  create: async (payload: CreateProductPayload): Promise<Product> => {
    const formData = new FormData()
    Object.entries(payload).forEach(([key, value]) => {
      if (key === 'images' && Array.isArray(value)) {
        value.forEach((file: File) => formData.append('images', file))
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value))
      }
    })
    const { data } = await apiClient.post<ApiSuccess<Product>>('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data.data
  },

  update: async (id: string, payload: UpdateProductPayload): Promise<Product> => {
    const formData = new FormData()
    Object.entries(payload).forEach(([key, value]) => {
      if (key === 'images' && Array.isArray(value)) {
        value.forEach((file: File) => formData.append('images', file))
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value))
      }
    })
    const { data } = await apiClient.put<ApiSuccess<Product>>(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data.data
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`)
  },
}