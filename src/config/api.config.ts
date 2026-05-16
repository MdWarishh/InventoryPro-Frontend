export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    me: '/auth/me',
    changePassword: '/auth/change-password',
  },
  branches: '/branches',
  products: '/products',
  categories: '/categories',
  stockIn: '/stock-in',
  stockOut: '/stock-out',
  invoices: '/invoices',
  dealers: '/dealers',
  reports: '/reports',
  bulkUpload: '/bulk-upload',
  meetings: '/meetings',
  notifications: '/notifications',
  settings: '/settings',
  stockTransfer: '/stock-transfer',
  serialNumbers: '/serial-numbers',
} as const