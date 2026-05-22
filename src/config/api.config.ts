export const API_BASE_URL = 'https://api.limrahearingcare.com/api'

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