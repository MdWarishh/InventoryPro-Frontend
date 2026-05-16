import apiClient from '@/lib/axios'
import type {
  Expense,
  ExpenseListRes,
  ExpenseStatsRes,
  CreateExpensePayload,
  ExpenseFilters,
  StatsFilters,
} from '@/types/expenses.types'

// ─── Query String Helper ──────────────────────────────────────────────────────

function qs(params: object) {
  const p = Object.entries(params as Record<string, unknown>).filter(
    ([, v]) => v !== undefined && v !== null && v !== ''
  )
  return p.length ? '?' + new URLSearchParams(p.map(([k, v]) => [k, String(v)])).toString() : ''
}

// ─── EXPENSES SERVICE ────────────────────────────────────────────────────────

export const expensesService = {
  getAll: async (f: ExpenseFilters = {}) => {
    const { data } = await apiClient.get(`/expenses${qs(f)}`)
    return data as ExpenseListRes
  },

  getStats: async (f: StatsFilters = {}) => {
    const { data } = await apiClient.get(`/expenses/stats${qs(f)}`)
    return data as ExpenseStatsRes
  },

  create: async (payload: CreateExpensePayload) => {
    const { data } = await apiClient.post('/expenses', payload)
    return data as { data: Expense; message: string }
  },

  update: async (id: string, payload: Partial<CreateExpensePayload>) => {
    const { data } = await apiClient.put(`/expenses/${id}`, payload)
    return data as { data: Expense; message: string }
  },

  delete: async (id: string) => {
    const { data } = await apiClient.delete(`/expenses/${id}`)
    return data as { message: string }
  },
}