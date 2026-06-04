export interface StockOut {
  id: string
  quantity: number
  sellingPrice: number
  product: {
    name: string
    gstRate?: number
    category?: { name: string } | null
  }
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
  // NEW: dealer link
  dealerId?: string
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
  // NEW: pass dealerId to trigger dealer invoice flow on backend
  dealerId?: string
  items: {
    productId: string
    quantity: number
    sellingPrice: number
    serialNumberIds?: string[]
  }[]
}