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
} from '@/types/stock-transfer.types'

export const stockService = {
  stockIn: async (payload: StockInPayload): Promise<StockInRecord> => {
    const { data } = await api.post('/stock/in', payload)
    return data.data as StockInRecord
  },

  stockOut: async (payload: StockOutPayload): Promise<StockOutRecord> => {
    const { data } = await api.post('/stock/out', payload)
    return data.data as StockOutRecord
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