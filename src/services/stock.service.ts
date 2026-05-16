import api from '@/lib/axios'
import type {
  StockInPayload, StockInRecord,
  StockOutPayload, StockOutRecord,
  PaginatedHistory, ProductStock,
  SerialNumber, SerialSearchResult,
} from '@/types/stock.types'

// POST /api/stock/in
export const stockIn = async (payload: StockInPayload): Promise<StockInRecord> => {
  const { data } = await api.post('/stock/in', payload)
  return data.data
}

// POST /api/stock/out
export const stockOut = async (payload: StockOutPayload): Promise<StockOutRecord> => {
  const { data } = await api.post('/stock/out', payload)
  return data.data
}

// GET /api/stock/history/:type  (type = 'in' | 'out')
export const getStockHistory = async (params: {
  type: 'in' | 'out'
  page?: number
  limit?: number
  branchId?: string
  productId?: string
}): Promise<PaginatedHistory> => {
  const { type, ...rest } = params
  const { data } = await api.get(`/stock/history/${type}`, { params: rest })
  return { items: data.data, pagination: data.pagination }
}

// GET /api/stock/current
export const getCurrentStock = async (params?: {
  branchId?: string
}): Promise<ProductStock[]> => {
  const { data } = await api.get('/stock/current', { params })
  return data.data
}

// GET /api/serials/available?productId=&branchId=
export const getAvailableSerials = async (
  productId: string,
  branchId?: string
): Promise<SerialNumber[]> => {
  const { data } = await api.get('/serials/available', {
    params: { productId, branchId },
  })
  return data.data
}

// GET /api/serials/search?q=
export const searchSerials = async (q: string): Promise<SerialSearchResult[]> => {
  const { data } = await api.get('/serials/search', { params: { q } })
  return data.data
}