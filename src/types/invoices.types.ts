export interface StockOut {
  id: string
  productId: string | null        // ✅ null allow karo
  productName?: string | null     // ✅ add karo
  quantity: number
  sellingPrice: number
  gstRate?: number   
  product: {
    name: string
    gstRate?: number
    category?: { name: string } | null
  } | null                        // ✅ optional banaya
  serialNumbers: { id: string; serialNumber: string }[]
}

export interface BranchSettings {
  companyName?: string
  logo?: string
  address?: string
  phone?: string
  email?: string
  website?: string
  gstin?: string
  legalName?: string
  state?: string
  stateCode?: string
  primaryColor?: string
  footerColor?: string
  currencySymbol?: string
  fontFamily?: string
  invoiceFooter?: string
  invoiceTerms?: string
  placeOfSupply?: string
  placeOfSupplyCode?: string
  dueDateTerms?: string
  footerServices?: string
  bankAccountHolder?: string
  bankAccountNumber?: string
  bankIFSC?: string
  bankBranch?: string
  qrCodeImage?: string
  authorizedSignature?: string
}

export interface Invoice {
  id: string
  invoiceNumber: string
  branchId: string
  date: string
  createdAt: string
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
  terms?: string
  paymentMode?: string
  stockOuts: StockOut[]
  dealerId?: string
  dealerSerials?: {
    id: string
    serialNumber: string
    productId: string | null
    historicalStockId: string | null
  }[]
  dealer?: {
    id: string
    name: string
    phone?: string
    email?: string
    address?: string
    city?: string
    state?: string
    gstNumber?: string
  }
  branch?: {
    id: string
    name: string
    settings?: BranchSettings
  }
}

export interface PaginatedInvoices {
  invoices: Invoice[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

// ── Invoice Item — normal + dealer manual products dono support karta hai ──
export interface CreateInvoiceItem {
  productId: string | null    // null = manual/historical free-text product (dealer mode only)
  productName?: string        // manual products ke liye required, backend use karta hai
  quantity: number
  sellingPrice: number
  gstRate?: number            // backend ko pass karo — 0 allowed
  serialNumberIds?: string[]  // real UUIDs + hist_ prefix wale dono
}

export interface CreateInvoicePayload {
  branchId: string
  customerName: string
  customerPhone?: string
  customerEmail?: string
  customerAddress?: string
  customerGST?: string
  date?: string
  discount?: number
  notes?: string
  terms?: string
  paymentMode?: string
  dealerId?: string           // dealer invoice flow ke liye
  isDealerInvoice?: boolean
  items: CreateInvoiceItem[]
}