// ─── Branch Types ─────────────────────────────────────────────────────────────

export interface Branch {
  id: string
  name: string
  code: string | null        // Short code used in SKU prefix, e.g. "NTH", "STH"
  address: string | null
  phone: string | null
  email: string | null
  isMainBranch: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface BranchWithStats extends Branch {
  _count?: {
    users: number
    stockIns: number
    stockOuts: number
    productStocks: number
  }
  settings?: {
    companyName: string
    logo: string | null
    primaryColor: string | null
  } | null
  users?: {
    id: string
    name: string
    email: string
    role: string
    isActive: boolean
  }[]
}

export interface BranchStats {
  totalStock: number
  totalStockIn: number
  totalStockOut: number
}

export interface CreateBranchPayload {
  name: string
  code: string
  address?: string
  phone?: string
  email?: string
}

export interface UpdateBranchPayload {
  name?: string
  code?: string
  address?: string
  phone?: string
  email?: string
  isActive?: boolean
}