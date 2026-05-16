import api from '@/lib/axios'
import type {
  StockOut, StockOutsResponse, SalesFilters, CreateStockOutPayload, SalesSummary,
} from '@/types/sales.types'

export type { StockOut, SalesSummary }

export const salesService = {
  // Get all sales with filters
  getAll: async (params?: SalesFilters): Promise<StockOutsResponse> => {
    const { data } = await api.get('/stock/history/out', { params })
    return {
      stockOuts: Array.isArray(data.data) ? data.data : [],
      pagination: data.pagination ?? { total: 0, page: 1, limit: 20, pages: 0 },
      summary: data.summary ?? { totalRevenue: 0, totalTransactions: 0 },
    }
  },

  // Record a new sale
  create: async (payload: CreateStockOutPayload): Promise<StockOut> => {
    const { data } = await api.post('/stock/out', payload)
    return data.data as StockOut
  },

  // Download Excel report
  downloadExcel: async (params: { startDate?: string; endDate?: string; branchId?: string }) => {
    const response = await api.get('/reports/download', {
      params: { reportType: 'sales', ...params },
      responseType: 'blob',
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `sales-report-${Date.now()}.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },
}