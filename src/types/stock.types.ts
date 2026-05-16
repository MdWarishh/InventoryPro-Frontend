// ─── Product & Stock Types ────────────────────────────────────────────────────

export interface ProductOption {
  id: string
  name: string
  sku: string
  hasSerialNumbers: boolean
  minStockAlert: number
  currentStock?: number
}

export interface ProductStock {
  productId: string
  branchId: string
  currentStock: number
  product: {
    id: string
    name: string
    sku: string
    hasSerialNumbers: boolean
    minStockAlert: number
    category?: { id: string; name: string; color: string }
  }
  branch: { id: string; name: string }
}

export interface SerialNumber {
  id: string
  serialNumber: string
  status: 'AVAILABLE' | 'SOLD' | 'DAMAGED'
  productId: string
  branchId: string
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
  sourceNote?: string
  referenceNo?: string
  product: { id: string; name: string; sku: string }
  branch: { id: string; name: string }
  dealer?: { id: string; name: string }
  serialNumbers: SerialNumber[]
}

// ─── Stock Out ────────────────────────────────────────────────────────────────

export interface StockOutPayload {
  productId: string
  branchId: string
  quantity: number
  sellingPrice: number
  customerName?: string
  customerPhone?: string
  serialNumberIds?: string[]
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
  product: { id: string; name: string; sku: string }
  branch: { id: string; name: string }
  serialNumbers: SerialNumber[]
  invoice?: { id: string; invoiceNumber: string }
}

// ─── History (combined IN + OUT) ──────────────────────────────────────────────

export type HistoryType = 'in' | 'out' | 'all'

export interface StockHistoryItem {
  id: string
  type: 'IN' | 'OUT'
  quantity: number
  date: string
  product: { id: string; name: string; sku: string; category?: { id: string; name: string; color: string }}
  branch: { id: string; name: string }
  dealer?: { id: string; name: string }
  serialNumbers: { id: string; serialNumber: string; status?: string }[]
  invoice?: { id: string; invoiceNumber: string }
  purchasePrice?: number
  sellingPrice?: number
  customerName?: string
  sourceNote?: string
}

export interface Pagination {
  total: number
  page: number
  limit: number
  pages: number
}

export interface PaginatedHistory {
  items: StockHistoryItem[]
  pagination: Pagination
}

// ─── Serial Search ────────────────────────────────────────────────────────────

export interface SerialSearchResult {
  id: string
  serialNumber: string
  status: 'AVAILABLE' | 'SOLD' | 'DAMAGED'
  product: { id: string; name: string; sku: string }
  branch: { id: string; name: string }
}

// ─── Branch & Dealer (for dropdowns) ─────────────────────────────────────────

export interface Branch {
  id: string
  name: string
  isMainBranch: boolean
}

export interface Dealer {
  id: string
  name: string
}