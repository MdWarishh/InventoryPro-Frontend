import apiClient from '@/lib/axios'
import type {
  Dealer, StockInEntry, StockOutEntry, StockSummaryItem,
  DealerInvoice, ProductStock, Branch, Pagination,
  CreateDealerPayload, UpdateDealerPayload,
  CreateDealerStockInPayload, CreateDealerStockOutPayload,
  CreateInvoicePayload, DealerFilters, HistoryFilters,
  UnbilledStockProduct, UnbilledStockRes, MainInvoicesRes, DealersOverviewStatsRes,
  AddHistoricalStockPayload, DealerHistoricalStock, HistoricalStockRes,
} from '@/types/dealers.types'

// ─── Query String Helper ──────────────────────────────────────────────────────

function qs(params: object) {
  const p = Object.entries(params as Record<string, unknown>).filter(([, v]) => v !== undefined && v !== null && v !== '')
  return p.length ? '?' + new URLSearchParams(p.map(([k, v]) => [k, String(v)])).toString() : ''
}

// ─── RESPONSE TYPES ───────────────────────────────────────────────────────────

export interface DealersListRes {
  data: Dealer[]
  pagination: Pagination
}
export interface StockInHistoryRes {
  data: {
    history: StockInEntry[]
    totalAmount: number
    totalQuantity: number
    totalTransactions: number
    pagination: Pagination
  }
}
export interface StockOutHistoryRes {
  data: {
    history: StockOutEntry[]
    totalAmount: number
    totalQuantity: number
    totalTransactions: number
    pagination: Pagination
  }
}
export interface StockSummaryRes  { data: { summary: StockSummaryItem[] } }
export interface InvoicesListRes  { data: { invoices: DealerInvoice[]; totalAmount: number; pagination: Pagination } }

// ─── DEALERS ──────────────────────────────────────────────────────────────────

export const dealersService = {
  getAll: async (f: DealerFilters = {}) => {
    const { data } = await apiClient.get(`/dealers${qs(f)}`)
    return data as DealersListRes
  },

  getOverviewStats: async (branchId?: string) => {
    const { data } = await apiClient.get(`/dealers/overview-stats${qs({ branchId })}`)
    return data as DealersOverviewStatsRes
  },

  getById: async (id: string) => {
    const { data } = await apiClient.get(`/dealers/${id}`)
    return data as { data: Dealer }
  },

  create: async (d: CreateDealerPayload) => {
    const { data } = await apiClient.post('/dealers', d)
    return data as { data: Dealer; message: string }
  },

  update: async (id: string, d: UpdateDealerPayload) => {
    const { data } = await apiClient.put(`/dealers/${id}`, d)
    return data as { data: Dealer; message: string }
  },

  delete: async (id: string) => {
    const { data } = await apiClient.delete(`/dealers/${id}`)
    return data as { message: string }
  },

  createStockIn: async (id: string, d: CreateDealerStockInPayload) => {
    const { data } = await apiClient.post(`/dealers/${id}/stock-in`, d)
    return data as { data: StockInEntry; message: string }
  },

  getStockInHistory: async (id: string, f: HistoryFilters = {}) => {
    const { data } = await apiClient.get(`/dealers/${id}/stock-in${qs(f)}`)
    return data as StockInHistoryRes
  },

  getStockSummary: async (id: string) => {
    const { data } = await apiClient.get(`/dealers/${id}/stock-summary`)
    return data as StockSummaryRes
  },

  // GET /dealers/:id/serials?productId=xxx&branchId=xxx&productName=xxx
  // Returns serials — TRANSFERRED (real) + DEALER_HISTORICAL (inventory linked) + manual string serials
  getDealerSerials: async (id: string, productId?: string, branchId?: string, productName?: string) => {
    const { data } = await apiClient.get(`/dealers/${id}/serials${qs({ productId, branchId, productName })}`)
    return data as {
      data: {
        id: string
        serialNumber: string
        status: string
        dealerBillingStatus: string | null
        historicalStockId?: string | null
        isManual?: boolean
      }[]
    }
  },

  createStockOut: async (id: string, d: CreateDealerStockOutPayload) => {
    const { data } = await apiClient.post(`/dealers/${id}/stock-out`, d)
    return data as { data: StockOutEntry; message: string }
  },

  getStockOutHistory: async (id: string, f: HistoryFilters = {}) => {
    const { data } = await apiClient.get(`/dealers/${id}/stock-out${qs(f)}`)
    return data as StockOutHistoryRes
  },

  // Old DealerInvoice model (backward compat)
  createInvoice: async (id: string, d: CreateInvoicePayload) => {
    const { data } = await apiClient.post(`/dealers/${id}/invoices`, d)
    return data as { data: DealerInvoice; message: string }
  },

  getInvoices: async (id: string, f: HistoryFilters = {}) => {
    const { data } = await apiClient.get(`/dealers/${id}/invoices${qs(f)}`)
    return data as InvoicesListRes
  },

  getInvoiceById: async (id: string, invId: string) => {
    const { data } = await apiClient.get(`/dealers/${id}/invoices/${invId}`)
    return data as { data: DealerInvoice }
  },

  createSalesReturn: async (id: string, d: {
  productId: string
  branchId: string
  quantity: number
  serialNumberIds?: string[]
  notes?: string
  date?: string
}) => {
  const { data } = await apiClient.post(`/dealers/${id}/stock-return`, d)
  return data as { data: { id: string }; message: string }
},
 
  // ── NEW: Unbilled stock for invoice generation ──────────────────────────
  // GET /dealers/:id/unbilled-stock
  // Returns dealer info + products grouped with their UNBILLED serials
  getUnbilledStock: async (id: string) => {
    const { data } = await apiClient.get(`/dealers/${id}/unbilled-stock`)
    return data as UnbilledStockRes
  },

  // ── NEW: Main invoices linked to dealer (Invoice model) ─────────────────
  // GET /dealers/:id/main-invoices
  getMainInvoices: async (id: string, f: HistoryFilters = {}) => {
    const { data } = await apiClient.get(`/dealers/${id}/main-invoices${qs(f)}`)
    return data as MainInvoicesRes
  },

  // ── HISTORICAL STOCK ──────────────────────────────────────────────────────
  // POST /dealers/:id/historical-stock
  addHistoricalStock: async (id: string, d: AddHistoricalStockPayload) => {
    const { data } = await apiClient.post(`/dealers/${id}/historical-stock`, d)
    return data as { data: DealerHistoricalStock; message: string }
  },

  // GET /dealers/:id/historical-stock
  getHistoricalStock: async (id: string, params: { type?: 'IN' | 'OUT'; page?: number; limit?: number } = {}) => {
    const { data } = await apiClient.get(`/dealers/${id}/historical-stock${qs(params)}`)
    return data as HistoricalStockRes
  },

  // DELETE /dealers/:id/historical-stock/:recordId
  deleteHistoricalStock: async (id: string, recordId: string) => {
    const { data } = await apiClient.delete(`/dealers/${id}/historical-stock/${recordId}`)
    return data as { message: string }
  },
}

// ─── PRODUCTS & BRANCHES (dropdowns ke liye) ─────────────────────────────────

export const productsService = {
  // Sirf wahi products jinका currentStock > 0 hai — GiveStockModal dropdown ke liye
  getAll: async (params?: { branchId?: string; search?: string }) => {
    const q = params
      ? '?' + new URLSearchParams(
          Object.entries(params)
            .filter(([, v]) => v !== undefined && v !== '')
            .map(([k, v]) => [k, String(v)])
        ).toString()
      : ''
    const { data } = await apiClient.get(`/stock/products-in-stock${q}`)
    return data as {
      data: {
        id: string
        name: string
        sku: string
        purchasePrice?: number
        sellingPrice: number
        hasSerialNumbers?: boolean
        currentStock: number
      }[]
    }
  },

  getStock: async (productId: string, branchId?: string) => {
    const q = branchId ? `?branchId=${branchId}` : ''
    const { data } = await apiClient.get(`/products/${productId}/stock${q}`)
    return data as { data: ProductStock[] }
  },
}

export const branchesService = {
  getAll: async () => {
    const { data } = await apiClient.get('/branches?isActive=true')
    return data as { data: Branch[] }
  },
}