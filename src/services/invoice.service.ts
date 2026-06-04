import api from '@/lib/axios'
import type { CreateInvoicePayload, Invoice, PaginatedInvoices } from '@/types/invoices.types'

// GET /api/invoices
export const getAllInvoices = async (params?: {
  page?: number
  limit?: number
  branchId?: string
  search?: string
  startDate?: string
  endDate?: string
}): Promise<PaginatedInvoices> => {
  const { data } = await api.get('/invoices', { params })
  return { invoices: data.data, pagination: data.pagination }
}

// GET /api/invoices/:id
export const getInvoiceById = async (id: string): Promise<Invoice> => {
  const { data } = await api.get(`/invoices/${id}`)
  return data.data
}

// POST /api/invoices
export const createInvoice = async (payload: CreateInvoicePayload): Promise<Invoice> => {
  const { data } = await api.post('/invoices', payload)
  return data.data
}

// POST /api/invoices/reset-counter
export const resetCounter = async (branchId: string): Promise<void> => {
  await api.post('/invoices/reset-counter', { branchId })
}


// PUT /api/invoices/:id
export const updateInvoice = async (id: string, payload: CreateInvoicePayload): Promise<Invoice> => {
  const { data } = await api.put(`/invoices/${id}`, payload)
  return data.data
}

// DELETE /api/invoices/:id
export const deleteInvoice = async (id: string): Promise<void> => {
  await api.delete(`/invoices/${id}`)
}