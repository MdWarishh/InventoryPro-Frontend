import api from '@/lib/axios'
import type {
  StockOut, StockOutsResponse, SalesFilters, CreateStockOutPayload,
  UpdateStockOutPayload, MonthlyRevenue, YearlyRevenue, BreakdownData, SalesSummary,
} from '@/types/sales.types'

export type { StockOut, SalesSummary }

export const salesService = {
  getAll: async (params?: SalesFilters): Promise<StockOutsResponse> => {
    const { data } = await api.get('/stock/history/out', { params })
    return {
      stockOuts: Array.isArray(data.data) ? data.data : [],
      pagination: data.pagination ?? { total: 0, page: 1, limit: 20, pages: 0 },
      summary: data.summary ?? { totalRevenue: 0, totalTransactions: 0, totalUnits: 0, avgOrderValue: 0 },
    }
  },

  create: async (payload: CreateStockOutPayload): Promise<StockOut> => {
    const { data } = await api.post('/stock/out', payload)
    return data.data as StockOut
  },

  // ── Edit / Delete ────────────────────────────────────────────────────────────
  // NOTE: assumes backend exposes PUT/DELETE on /stock/out/:id alongside the
  // existing POST /stock/out. If your backend uses a different path
  // (e.g. /sales/:id), just change the two lines below.
  update: async (id: string, payload: UpdateStockOutPayload): Promise<StockOut> => {
    const { data } = await api.put(`/stock/out/${id}`, payload)
    return data.data as StockOut
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/stock/out/${id}`)
  },

  // ── Analytics ──────────────────────────────────────────────────────────────
  getMonthlyRevenue: async (params?: { months?: number; branchId?: string }): Promise<MonthlyRevenue[]> => {
    const { data } = await api.get('/stock/analytics/monthly', { params })
    return Array.isArray(data.data) ? data.data : []
  },

  getYearlyRevenue: async (params?: { years?: number; branchId?: string }): Promise<YearlyRevenue[]> => {
    const { data } = await api.get('/stock/analytics/yearly', { params })
    return Array.isArray(data.data) ? data.data : []
  },

  getBreakdown: async (params?: { branchId?: string; startDate?: string; endDate?: string }): Promise<BreakdownData> => {
    const { data } = await api.get('/stock/analytics/breakdown', { params })
    return data.data ?? { topProducts: [], topBranches: [] }
  },

  getSummary: async (params?: { branchId?: string; startDate?: string; endDate?: string }): Promise<SalesSummary> => {
    const { data } = await api.get('/stock/analytics/summary', { params })
    return data.data ?? { totalRevenue: 0, totalTransactions: 0, totalUnits: 0, avgOrderValue: 0 }
  },

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