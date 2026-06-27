export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'STAFF'

export interface User {
  role: UserRole
  branchId?: string
}

// Dashboard
// Dashboard
export interface DashboardStats {
  totalStock: number
  lowStockCount: number
  todaySales: { amount: number; count: number }
  monthSales: { amount: number; count: number }
  totalProducts: number
  recentStockIns: RecentStock[]
  recentStockOuts: RecentStock[]
  // ✅ Naye fields — profit calculation ke liye (backend se aa rahe hain)
  totalRevenue: number
  totalExpense: number
  totalProfit: number
  monthProfit: number
}

export interface RecentStock {
  id: string
  date: string
  quantity: number
  product: { name: string; sku: string }
  branch: { name: string }
  sellingPrice?: number
  purchasePrice?: number
}

// Sales
export interface SaleItem {
  id: string
  date: string
  quantity: number
  sellingPrice: number
  customerName?: string
  customerPhone?: string
  product: { id: string; name: string; sku: string; category?: { name: string } }
  branch: { id: string; name: string }
  invoice?: { invoiceNumber: string }
}

export interface SalesChartPoint {
  date: string
  revenue: number
  quantity: number
  count: number
}

export interface SalesSummary {
  totalRevenue: number
  totalQuantity: number
  totalTransactions: number
}

export interface SalesReport {
  summary: SalesSummary
  chart: SalesChartPoint[]
  items: SaleItem[]
}

// Purchase
export interface PurchaseItem {
  id: string
  date: string
  quantity: number
  purchasePrice: number
  referenceNo?: string
  product: { id: string; name: string; sku: string }
  branch: { id: string; name: string }
  dealer?: { id: string; name: string }
}

export interface PurchaseReport {
  summary: { totalPurchase: number; totalTransactions: number }
  items: PurchaseItem[]
}

// Stock Valuation
export interface StockValuationItem {
  productName: string
  sku: string
  category: string
  branch: string
  currentStock: number
  purchasePrice: number
  sellingPrice: number
  purchaseValue: number
  sellingValue: number
}

export interface StockValuationReport {
  summary: { totalPurchaseValue: number; totalSellingValue: number; potentialProfit: number }
  items: StockValuationItem[]
}

// All Branches
export interface BranchReport {
  branchId: string
  branchName: string
  isMainBranch: boolean
  totalSales: number
  totalSalesCount: number
  totalPurchase: number
  totalPurchaseCount: number
  currentStock: number
  grossProfit: number
}

export interface AllBranchesReport {
  branches: BranchReport[]
  totals: { totalSales: number; totalPurchase: number; totalStock: number; grossProfit: number }
}

// GST
export type GSTType = 'summary' | 'gstr1' | 'gstr2'

export interface GSTSummary {
  month: number
  year: number
  outputTax: number
  inputTax: number
  netPayable: number
  byRate: { rate: number; taxableValue: number; cgst: number; sgst: number; totalTax: number }[]
}

export interface GSTR1Item {
  invoiceNumber: string
  invoiceDate: string
  customerName: string
  customerGST: string
  hsnCode: string
  productName: string
  quantity: number
  taxableValue: number
  gstRate: number
  cgst: number
  sgst: number
  igst: number
  totalTax: number
  invoiceValue: number
}

export interface GSTR2Item {
  date: string
  dealerName: string
  dealerGST: string
  hsnCode: string
  productName: string
  quantity: number
  taxableValue: number
  gstRate: number
  cgst: number
  sgst: number
  igst: number
  totalTax: number
}

// Low Stock
export interface LowStockItem {
  productId: string
  productName: string
  sku: string
  category: string
  branch: string
  currentStock: number
  minStockAlert: number
  shortage: number
}

// Filters
export interface DateRangeFilter {
  startDate?: string
  endDate?: string
}

export interface ReportsFilter extends DateRangeFilter {
  branchId?: string
  groupBy?: 'day' | 'month'
}

export interface GSTFilter {
  branchId?: string
  month: number
  year: number
  type?: GSTType
}

export type ReportTab = 'dashboard' | 'sales' | 'purchase' | 'inventory' | 'gst' | 'branches' | 'lowstock'
export type ReportDownloadType = 'sales' | 'purchase' | 'stock-valuation' | 'low-stock' | 'gst'
