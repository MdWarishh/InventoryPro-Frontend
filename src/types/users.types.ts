export type UserRole = 'SUPER_ADMIN' | 'BRANCH_ADMIN' | 'STAFF'

export type ModuleKey =
  | 'DASHBOARD' | 'USERS' | 'STOCK' | 'MEETINGS' | 'REPORTS'
  | 'BRANCHES' | 'NOTIFICATIONS' | 'PRODUCTS' | 'CATEGORIES'
  | 'DEALERS' | 'SETTINGS' | 'SALES' | 'STOCK_TRANSFER'
  | 'EXPENSES' | 'ATTENDANCE'   // ← ADD

export interface Permission {
  module: ModuleKey
  canView: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
}

export interface UserBranch {
  id: string
  name: string
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  branchId: string | null
  branch: UserBranch | null
  isActive: boolean
  createdAt: string
  permissions: Permission[]
}

export interface CreateUserPayload {
  name: string
  email: string
  password: string
  role: UserRole
  branchId?: string | null
  permissions?: Permission[]
}

export interface UpdateUserPayload {
  name?: string
  role?: UserRole
  branchId?: string | null
  isActive?: boolean
  permissions?: Permission[]
}

export interface ResetPasswordPayload {
  newPassword: string
}

export interface UsersResponse {
  users: User[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

export interface UserFilters {
  page?: number
  limit?: number
  search?: string
  branchId?: string
  role?: UserRole
}

export const ALL_MODULES: { key: ModuleKey; label: string; icon: string; group: string }[] = [
  { key: 'DASHBOARD',      label: 'Dashboard',       icon: '▦',  group: 'Core' },
  { key: 'USERS',          label: 'Users',            icon: '◉',  group: 'Core' },
  { key: 'BRANCHES',       label: 'Branches',         icon: '⬡',  group: 'Core' },
  { key: 'SETTINGS',       label: 'Settings',         icon: '⚙',  group: 'Core' },
  { key: 'PRODUCTS',       label: 'Products',         icon: '▣',  group: 'Catalog' },
  { key: 'CATEGORIES',     label: 'Categories',       icon: '◈',  group: 'Catalog' },
  { key: 'DEALERS',        label: 'Dealers',          icon: '◎',  group: 'Catalog' },
  { key: 'STOCK',          label: 'Stock',            icon: '▤',  group: 'Operations' },
  { key: 'STOCK_TRANSFER', label: 'Stock Transfer',   icon: '⇄',  group: 'Operations' },
  { key: 'SALES',          label: 'Sales',            icon: '◆',  group: 'Operations' },
  { key: 'EXPENSES',       label: 'Expenses',         icon: '₹',  group: 'Operations' },  // ← ADD
  { key: 'ATTENDANCE',     label: 'Attendance',       icon: '◷',  group: 'Operations' },  // ← ADD
  { key: 'MEETINGS',       label: 'Meetings',         icon: '▷',  group: 'Other' },
  { key: 'NOTIFICATIONS',  label: 'Notifications',    icon: '◐',  group: 'Other' },
  { key: 'REPORTS',        label: 'Reports',          icon: '▨',  group: 'Other' },
]

export const DEFAULT_PERMISSIONS = (): Permission[] =>
  ALL_MODULES.map(m => ({
    module: m.key,
    canView: false,
    canCreate: false,
    canEdit: false,
    canDelete: false,
  }))