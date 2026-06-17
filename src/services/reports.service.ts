import apiClient from '@/lib/axios'
import type {
  DashboardStats,
  SalesReport,
  PurchaseReport,
  StockValuationReport,
  AllBranchesReport,
  GSTSummary,
  GSTR1Item,
  GSTR2Item,
  LowStockItem,
  ReportsFilter,
  GSTFilter,
  ReportDownloadType,
} from '@/types/reports.types'
import type { ApiSuccess } from '@/types/auth.types'

const BASE_URL = '/reports'

// ─── Helper: Query Builder ─────────────────
function buildQuery(params: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, v]) => v !== undefined && v !== null && v !== ''
    )
  )
}

export const reportsService = {
  getDashboard: async (filters?: { branchId?: string }): Promise<DashboardStats> => {
    const { data } = await apiClient.get<ApiSuccess<DashboardStats>>(
      `${BASE_URL}/dashboard`,
      { params: buildQuery({ branchId: filters?.branchId }) }
    )
    return data.data
  },

  getSales: async (filters: ReportsFilter): Promise<SalesReport> => {
    const { data } = await apiClient.get<ApiSuccess<SalesReport>>(
      `${BASE_URL}/sales`,
      { params: buildQuery(filters) }
    )
    return data.data
  },

  getPurchase: async (filters: ReportsFilter): Promise<PurchaseReport> => {
    const { data } = await apiClient.get<ApiSuccess<PurchaseReport>>(
      `${BASE_URL}/purchase`,
      { params: buildQuery(filters) }
    )
    return data.data
  },

  getStockValuation: async (filters?: { branchId?: string }): Promise<StockValuationReport> => {
    const { data } = await apiClient.get<ApiSuccess<StockValuationReport>>(
      `${BASE_URL}/stock-valuation`,
      { params: buildQuery({ branchId: filters?.branchId }) }
    )
    return data.data
  },

  getAllBranches: async (filters: ReportsFilter): Promise<AllBranchesReport> => {
    const { data } = await apiClient.get<ApiSuccess<AllBranchesReport>>(
      `${BASE_URL}/all-branches`,
      { params: buildQuery(filters) }
    )
    return data.data
  },

  getGST: async (
    filters: GSTFilter
  ): Promise<GSTSummary | GSTR1Item[] | GSTR2Item[]> => {
    const { data } = await apiClient.get<
      ApiSuccess<GSTSummary | GSTR1Item[] | GSTR2Item[]>
    >(`${BASE_URL}/gst`, {
      params: buildQuery(filters),
    })
    return data.data
  },

  getLowStock: async (filters?: { branchId?: string }): Promise<LowStockItem[]> => {
    const { data } = await apiClient.get<ApiSuccess<LowStockItem[]>>(
      `${BASE_URL}/low-stock`,
      { params: buildQuery({ branchId: filters?.branchId }) }
    )
    return data.data
  },

  downloadReport: async (
    reportType: ReportDownloadType,
    filters: Record<string, any>
  ): Promise<void> => {
    const response = await apiClient.get(`${BASE_URL}/download`, {
      params: buildQuery({ reportType, ...filters }),
      responseType: 'blob', // ⚠️ important
    })

    const url = window.URL.createObjectURL(new Blob([response.data]))
    const a = document.createElement('a')
    a.href = url
    a.download = `${reportType}-report-${Date.now()}.xlsx`
    a.click()
    window.URL.revokeObjectURL(url)
  },
}