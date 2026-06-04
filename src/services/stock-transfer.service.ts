import api from '@/lib/axios'
import type {
  CurrentStock,
  CurrentStockFilters,
  StockHistoryFilters,
  StockHistoryResponse,
  StockHistoryType,
  StockInPayload,
  StockInRecord,
  StockOutPayload,
  StockOutRecord,
  TransferStockPayload,
  UpdateStockInPayload,
  UpdateStockOutPayload,
} from '@/types/stock-transfer.types'

export const stockService = {
  stockIn: async (payload: StockInPayload): Promise<StockInRecord> => {
    const { data } = await api.post('/stock/in', payload)
    return data.data as StockInRecord
  },

  updateStockIn: async (id: string, payload: UpdateStockInPayload): Promise<StockInRecord> => {
    const { data } = await api.put(`/stock/in/${id}`, payload)
    return data.data as StockInRecord
  },

  deleteStockIn: async (id: string): Promise<void> => {
    await api.delete(`/stock/in/${id}`)
  },

  stockOut: async (payload: StockOutPayload): Promise<StockOutRecord> => {
    const { data } = await api.post('/stock/out', payload)
    return data.data as StockOutRecord
  },

  updateStockOut: async (id: string, payload: UpdateStockOutPayload): Promise<StockOutRecord> => {
    const { data } = await api.put(`/stock/out/${id}`, payload)
    return data.data as StockOutRecord
  },

  deleteStockOut: async (id: string): Promise<void> => {
    await api.delete(`/stock/out/${id}`)
  },

  getCurrentStock: async (params?: CurrentStockFilters): Promise<CurrentStock[]> => {
    const { data } = await api.get('/stock/current', { params })
    return Array.isArray(data.data) ? data.data : []
  },

  getHistory: async (
    type: StockHistoryType,
    params?: StockHistoryFilters
  ): Promise<StockHistoryResponse> => {
    const { data } = await api.get(`/stock/history/${type}`, { params })
    return {
      items: Array.isArray(data.data) ? data.data : [],
      pagination: data.pagination ?? { total: 0, page: 1, limit: 20, pages: 0 },
    }
  },

  transferStock: async (payload: TransferStockPayload): Promise<void> => {
    await api.post('/stock/transfer', payload)
  },
}