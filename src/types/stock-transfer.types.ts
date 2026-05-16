// ─── Shared lookup types ──────────────────────────────────────────────────────
export interface Branch {
  id: string
  name: string
}

export interface Product {
  id: string
  name: string
  sku: string
  hasSerialNumbers: boolean
  minStockAlert: number
  category?: { id: string; name: string; color: string }
}

export interface Dealer {
  id: string
  name: string
}

export interface SerialNumber {
  id: string
  serialNumber: string
  status: 'AVAILABLE' | 'SOLD' | 'DAMAGED'
  branchId: string
  productId: string
}

// ─── Pagination ───────────────────────────────────────────────────────────────
export interface Pagination {
  total: number
  page: number
  limit: number
  pages: number
}

// ─── Current Stock ────────────────────────────────────────────────────────────
export interface CurrentStock {
  id: string
  productId: string
  branchId: string
  currentStock: number
  product: Product
  branch: Branch
}

// ─── Stock In ─────────────────────────────────────────────────────────────────
export interface StockInPayload {
  productId: string
  branchId: string
  quantity: number
  purchasePrice: number
  dealerId?: string
  sourceNote?: string
  referenceNo?: string
  date?: string
  serialNumbers?: string[]
}

export interface StockInRecord {
  id: string
  productId: string
  branchId: string
  quantity: number
  purchasePrice: number
  date: string
  referenceNo?: string
  sourceNote?: string
  product?: { id: string; name: string; sku: string }
  branch?: { id: string; name: string }
  dealer?: { id: string; name: string }
  serialNumbers?: SerialNumber[]
}

// ─── Stock Out ────────────────────────────────────────────────────────────────
export interface StockOutPayload {
  productId: string
  branchId: string
  quantity: number
  sellingPrice: number
  customerName?: string
  customerPhone?: string
  customerEmail?: string
  customerAddress?: string
  serialNumberIds?: string[]
  invoiceId?: string
  notes?: string
  date?: string
}

export interface StockOutRecord {
  id: string
  productId: string
  branchId: string
  quantity: number
  sellingPrice: number
  date: string
  customerName?: string
  customerPhone?: string
  notes?: string
  product?: { id: string; name: string; sku: string }
  branch?: { id: string; name: string }
  invoice?: { id: string; invoiceNumber: string }
  serialNumbers?: SerialNumber[]
}

// ─── Transfer ─────────────────────────────────────────────────────────────────
export interface TransferStockPayload {
  fromBranchId: string
  toBranchId: string
  notes?: string
  items: { productId: string; quantity: number }[]
}

// ─── History ──────────────────────────────────────────────────────────────────
export type StockHistoryType = 'in' | 'out'

export interface StockHistoryFilters {
  page?: number
  limit?: number
  branchId?: string
  productId?: string
  startDate?: string
  endDate?: string
}

export interface StockHistoryResponse {
  items: (StockInRecord | StockOutRecord)[]
  pagination: Pagination
}

export interface CurrentStockFilters {
  branchId?: string
  categoryId?: string
  lowStock?: string
}