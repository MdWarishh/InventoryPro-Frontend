import apiClient from '@/lib/axios'
import type { SerialNumber, SerialStatus } from '@/types/serial.types'

export const serialService = {
  getByProduct: async (
    productId: string,
    branchId?: string,
    status?: SerialStatus
  ): Promise<SerialNumber[]> => {
    const params = new URLSearchParams()
    if (branchId) params.set('branchId', branchId)
    if (status) params.set('status', status)
    const { data } = await apiClient.get(`/serials/product/${productId}?${params.toString()}`)
    return data.data
  },

  getAvailable: async (productId: string, branchId?: string): Promise<SerialNumber[]> => {
    const params = new URLSearchParams({ productId })
    if (branchId) params.set('branchId', branchId)
    const { data } = await apiClient.get(`/serials/available?${params.toString()}`)
    return data.data
  },

  /**
   * Dealer ke paas jo serial numbers hain (given but not yet sold) fetch karo.
   * Backend endpoint: GET /serials/dealer/:dealerId?productId=xxx
   *
   * Backend mein ye serials wo hain jinki status "with_dealer" ya similar ho,
   * aur jinhe is dealer ko give kiya gaya tha.
   */
  getByDealer: async (
    dealerId: string,
    productId?: string,
    branchId?: string
  ): Promise<SerialNumber[]> => {
    const params = new URLSearchParams()
    if (productId) params.set('productId', productId)
    if (branchId) params.set('branchId', branchId)
    const { data } = await apiClient.get(`/serials/dealer/${dealerId}?${params.toString()}`)
    return data.data
  },

  search: async (q: string): Promise<SerialNumber[]> => {
    const { data } = await apiClient.get(`/serials/search?q=${encodeURIComponent(q)}`)
    return data.data
  },

  markDamaged: async (id: string): Promise<void> => {
    await apiClient.patch(`/serials/${id}/damage`)
  },
}