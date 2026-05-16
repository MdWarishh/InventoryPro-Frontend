export interface SaleProduct {
  id: string
  name: string
  sku: string
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
}

export interface SalesSummary {
  totalRevenue: number
  totalTransactions: number
}

export interface StockOutsResponse {
  stockOuts: StockOut[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
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

export interface SalesFilters {
  page?: number
  limit?: number
  startDate?: string
  endDate?: string
  branchId?: string
  productId?: string
}