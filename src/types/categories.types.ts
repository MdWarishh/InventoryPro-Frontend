export interface Category {
  id: string
  name: string
  description?: string | null
  color: string
  branchId?: string | null
  createdAt?: string
  updatedAt?: string
  _count?: {
    products: number
  }
}

export interface CategoriesResponse {
  categories: Category[]
}

export interface CategoryFilters {
  search?: string
}

export interface CreateCategoryPayload {
  name: string
  description?: string
  color?: string
  branchId?: string | null
}

export interface UpdateCategoryPayload {
  name?: string
  description?: string
  color?: string
}