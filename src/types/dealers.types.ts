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
  historicalIn?: number
  historicalOut?: number
  isHistoricalOnly?: boolean
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
export interface MainInvoiceStockOut {
  id: string
  quantity: number
  sellingPrice: number
  productName: string | null          // ✅ add kiya — manual items ka naam
  product: { name: string; sku?: string } | null   // ✅ optional banaya
  serialNumbers: { id: string; serialNumber: string }[]
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
  branchId?: string
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
  productName?: string   
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
  branchId?: string
}

export interface HistoryFilters {
  page?: number
  limit?: number
  startDate?: string
  endDate?: string
}

export interface DealersOverviewStats {
  totalWholesaleRevenue: number
  totalSale: number
  allProfit: number
  productsInHand: number
  lowStockItems: number
}

export interface DealersOverviewStatsRes {
  data: DealersOverviewStats
}

// ─── Historical Stock ─────────────────────────────────────────────────────────

export type DealerHistoricalType = 'IN' | 'OUT'

export interface DealerHistoricalStock {
  id: string
  dealerId: string
  productId?: string | null
  productName: string
  serialNumbers: string[]
  type: DealerHistoricalType
  quantity: number
  purchasePrice: number
  salePrice: number
  date: string
  notes?: string | null
  createdAt: string
  product?: Product | null
}

export interface AddHistoricalStockPayload {
  productId?: string
  productName: string
  type: DealerHistoricalType
  quantity: number
  purchasePrice: number
  salePrice: number
  serialNumbers: string[]
  date: string
  notes?: string
}

export interface HistoricalStockRes {
  data: {
    records: DealerHistoricalStock[]
    pagination: Pagination
  }
}

export interface CreateSalesReturnPayload {
  productId: string
  branchId: string
  quantity: number
  serialNumberIds?: string[]
  notes?: string
  date?: string
  productName?: string   // ✅ ye bhi add karo
}

export interface AssignedProductSerial {
  id: string
  serialNumber: string
  type: 'transferred' | 'dealer_historical' | 'manual'
  billed?: boolean
  historicalStockId?: string
}

export interface AssignedProduct {
  type: 'inventory' | 'historical_linked' | 'manual'
  productId: string | null
  productName: string
  sku: string | null
  sellingPrice: number
  gstRate: number
  hasSerialNumbers: boolean
  quantity: number
  serials: AssignedProductSerial[]
}

export interface AssignedProductsRes {
  data: {
    dealer: Pick<Dealer, 'id' | 'name' | 'phone' | 'email' | 'address' | 'gstNumber'>
    products: AssignedProduct[]
  }
}