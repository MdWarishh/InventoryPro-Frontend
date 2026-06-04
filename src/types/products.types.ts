export interface Category {
  id: string
  name: string
  color?: string
}

export interface Branch {
  id: string
  name: string
}

export interface ProductStock {
  id: string
  branchId: string
  productId: string
  currentStock: number
  branch: Branch
}

export interface Product {
  id: string
  name: string
  sku: string
  barcode?: string
  description?: string
  categoryId: string
  category: Category
  unit: string
  purchasePrice?: number
  sellingPrice?: number
  gstRate: number
  hsnCode?: string
  minStockAlert: number
  images: string[]
  hasSerialNumbers: boolean
  brand?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  productStocks: ProductStock[]
}

export interface Pagination {
  total: number
  page: number
  limit: number
  pages: number
}

export interface ProductsResponse {
  products: Product[]
  pagination: Pagination
}

export interface ProductsQuery {
  page?: number
  limit?: number
  search?: string
  categoryId?: string
  branchId?: string
  lowStock?: boolean
}

export interface CreateProductPayload {
  name: string
  sku?: string
  description?: string
  categoryId: string
  categoryName?: string
  unit?: string
  purchasePrice?: number
  sellingPrice?: number
  gstRate?: number
  hsnCode?: string
  minStockAlert?: number
  barcode?: string
  hasSerialNumbers?: boolean
  brand?: string
  images?: File[]
}

export interface UpdateProductPayload extends Partial<CreateProductPayload> {}