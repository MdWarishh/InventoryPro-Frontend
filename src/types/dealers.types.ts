export interface Dealer {
  id: string
  name: string
  phone?: string
  email?: string
  address?: string
  city?: string
  state?: string
  gstNumber?: string
  bankAccount?: string
  bankName?: string
  ifscCode?: string
  isActive: boolean
  notes?: string
  createdAt: string
  updatedAt: string
  _count?: {
    stockIns?: number
    stockOuts?: number
    invoices?: number
  }
  stockIns?: StockInEntry[]
  stockOuts?: StockOutEntry[]
}

export interface Product {
  id: string
  name: string
  sku: string
  sellingPrice?: number
  purchasePrice?: number
  hasSerialNumbers?: boolean
}

export interface Branch {
  id: string
  name: string
  code?: string
}

export interface ProductStock {
  id: string
  productId: string
  branchId: string
  currentStock: number
  product: Product
  branch: Branch
}

// ─── Serial Number ────────────────────────────────────────────────────────────

export interface SerialNumberRef {
  id: string
  serialNumber: string
}

export interface StockInEntry {
  id: string
  productId: string
  branchId: string
  quantity: number
  purchasePrice: number
  dealerId?: string
  sourceNote?: string
  referenceNo?: string
  date: string
  createdAt: string
  product: Product
  branch: Branch
  serialNumbers?: SerialNumberRef[]
}

export interface StockOutEntry {
  id: string
  dealerId: string
  productId: string
  branchId: string
  quantity: number
  salePrice: number
  date: string
  notes?: string
  createdAt: string
  product: Product
  branch: Branch
  serialNumbers?: SerialNumberRef[]
}

export interface StockSummaryItem {
  product: Product
  given: number
  sold: number
  balance: number
  soldInMonth: number       
  salesReturn: number 
  availableSerialNumbers?: SerialNumberRef[]
}

export interface DealerInvoice {
  id: string
  invoiceNumber: string
  dealerId: string
  items: InvoiceItem[]
  totalAmount: number
  date: string
  notes?: string
  createdAt: string
  dealer?: Pick<Dealer, 'id' | 'name' | 'phone' | 'email' | 'address' | 'city' | 'state' | 'gstNumber'>
}

export interface InvoiceItem {
  productId: string
  productName: string
  sku?: string
  quantity: number
  salePrice: number
  total: number
}

export interface Pagination {
  total: number
  page: number
  limit: number
  pages: number
}

// ─── NEW: Unbilled Stock types ────────────────────────────────────────────────
// GET /dealers/:id/unbilled-stock response shape

export interface UnbilledSerial {
  id: string
  serialNumber: string
}

export interface UnbilledStockProduct {
  productId: string
  productName: string
  sku: string
  sellingPrice: number
  gstRate: number
  hasSerialNumbers: boolean
  quantity: number          // = serials.length
  serials: UnbilledSerial[]
}

export interface UnbilledStockRes {
  data: {
    dealer: Pick<Dealer, 'id' | 'name' | 'phone' | 'email' | 'address' | 'gstNumber'>
    products: UnbilledStockProduct[]
  }
}

// ─── NEW: Main invoices linked to dealer ──────────────────────────────────────
// GET /dealers/:id/main-invoices response shape

export interface MainInvoiceStockOut {
  id: string
  quantity: number
  product: { name: string }
  serialNumbers: { serialNumber: string }[]
}

export interface MainInvoice {
  id: string
  invoiceNumber: string
  branchId: string
  dealerId: string
  customerName: string
  customerPhone?: string
  customerEmail?: string
  customerAddress?: string
  customerGST?: string
  subtotal: number
  gstAmount: number
  discount: number
  totalAmount: number
  notes?: string
  paymentMode?: string
  date: string
  createdAt: string
  stockOuts: MainInvoiceStockOut[]
}

export interface MainInvoicesRes {
  data: {
    invoices: MainInvoice[]
    totalAmount: number
    pagination: Pagination
  }
}

// ─── Payloads ─────────────────────────────────────────────────────────────────

export interface CreateDealerPayload {
  name: string
  phone?: string
  email?: string
  address?: string
  city?: string
  state?: string
  gstNumber?: string
  bankAccount?: string
  bankName?: string
  ifscCode?: string
  notes?: string
}

export type UpdateDealerPayload = Partial<CreateDealerPayload>

export interface CreateDealerStockInPayload {
  productId: string
  branchId: string
  quantity: number
  costPrice: number
  date?: string
  referenceNo?: string
  notes?: string
  serialNumberIds?: string[]
}

export interface CreateDealerStockOutPayload {
  productId: string
  branchId: string
  quantity: number
  salePrice: number
  date?: string
  notes?: string
  serialNumberIds?: string[]
}

export interface CreateInvoicePayload {
  items: { productId: string; quantity: number; salePrice: number }[]
  notes?: string
  date?: string
}

export interface DealerFilters {
  page?: number
  limit?: number
  search?: string
}

export interface HistoryFilters {
  page?: number
  limit?: number
  startDate?: string
  endDate?: string
}