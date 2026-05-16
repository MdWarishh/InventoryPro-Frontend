// ─── Branch Types ─────────────────────────────────────────────────────────────

export interface Branch {
  id: string
  name: string
  address: string | null
  phone: string | null
  email: string | null
  isMain: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface BranchStats {
  totalUsers: number
  totalStockIn: number
  totalStockOut: number
  totalProducts: number
}

export interface BranchWithStats extends Branch {
  stats?: BranchStats
  _count?: { users: number }
}

export interface CreateBranchPayload {
  name: string
  address?: string
  phone?: string
  email?: string
}

export interface UpdateBranchPayload extends Partial<CreateBranchPayload> {
  isActive?: boolean
}

// ─── Category Types ───────────────────────────────────────────────────────────

export interface Category {
  id: string
  name: string
  description: string | null
  color: string
  createdAt: string
  updatedAt: string
  _count?: { products: number }
}

export interface CreateCategoryPayload {
  name: string
  description?: string
  color: string
}

export interface UpdateCategoryPayload extends Partial<CreateCategoryPayload> {}

// ─── Product Types ────────────────────────────────────────────────────────────

export type GstRate = 0 | 5 | 12 | 18 | 28
export type ProductUnit = 'pcs' | 'kg' | 'ltr' | 'box' | 'dozen' | 'mtr' | 'set' | 'pair'

export interface ProductStock {
  id: string
  productId: string
  branchId: string
  quantity: number
  branch?: Branch
}

export interface Product {
  id: string
  name: string
  sku: string
  description: string | null
  categoryId: string
  category?: Category
  unit: ProductUnit
  purchasePrice: number
  sellingPrice: number
  gstRate: GstRate
  hsnCode: string | null
  minStockAlert: number
  barcode: string | null
  images: string[]
  hasSerialNumbers: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
  stocks?: ProductStock[]
}

export interface CreateProductPayload {
  name: string
  sku?: string
  description?: string
  categoryId: string
  unit: ProductUnit
  purchasePrice: number
  sellingPrice: number
  gstRate: GstRate
  hsnCode?: string
  minStockAlert: number
  barcode?: string
  hasSerialNumbers: boolean
  images?: File[]
}

export interface UpdateProductPayload extends Partial<CreateProductPayload> {}

export interface ProductSearchParams {
  q?: string
  categoryId?: string
  lowStock?: boolean
  page?: number
  limit?: number
}

export interface ProductsResponse {
  data: Product[]
  total: number
  page: number
  limit: number
  totalPages: number
}