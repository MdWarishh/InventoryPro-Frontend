export interface SaleProduct {
  id: string
  name: string
  sku: string
  brand?: string
  category?: { name: string; color: string }
}

export interface SaleBranch {
  id: string
  name: string
}

export interface SaleDealer {
  id: string
  name: string
}

export interface SaleSerialNumber {
  id: string
  serialNumber: string
}

export interface StockOut {
  id: string
  productId: string
  branchId: string
  quantity: number
  sellingPrice: number
  dealerId: string | null
  customerName: string | null
  customerPhone: string | null
  note: string | null
  date: string
  product: SaleProduct
  branch: SaleBranch
  dealer: SaleDealer | null
  invoice: { invoiceNumber: string } | null
  serialNumbers?: SaleSerialNumber[]
}

export interface SalesSummary {
  totalRevenue: number
  totalTransactions: number
  totalUnits: number
  avgOrderValue: number
}

export interface StockOutsResponse {
  stockOuts: StockOut[]
  pagination: { total: number; page: number; limit: number; pages: number }
  summary: SalesSummary
}

export interface CreateStockOutPayload {
  productId: string
  branchId?: string
  quantity: number
  sellingPrice: number
  dealerId?: string | null
  customerName?: string
  customerPhone?: string
  note?: string
  serialNumberIds?: string[]
}

export interface UpdateStockOutPayload {
  productId: string
  branchId?: string
  quantity: number
  sellingPrice: number
  dealerId?: string | null
  customerName?: string
  customerPhone?: string
  note?: string
  serialNumberIds?: string[]
}

export interface SalesFilters {
  page?: number
  limit?: number
  startDate?: string
  endDate?: string
  branchId?: string
  productId?: string
}

// ── Analytics ─────────────────────────────────────────────────────────────────
export interface MonthlyRevenue {
  key: string
  label: string
  revenue: number
  transactions: number
}

export interface YearlyRevenue {
  label: string
  revenue: number
  transactions: number
}

export interface BreakdownItem {
  name: string
  revenue: number
  transactions: number
}

export interface BreakdownData {
  topProducts: BreakdownItem[]
  topBranches: BreakdownItem[]
}