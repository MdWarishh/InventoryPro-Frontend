export type PaymentMethod = 'CASH' | 'BANK' | 'UPI' | 'CARD' | 'OTHER'

export interface Expense {
  id: string
  title: string | null
  amount: number
  category: string | null
  paymentMethod: PaymentMethod
  notes: string | null
  date: string
  branchId: string | null
  createdBy: string
  createdAt: string
  updatedAt: string
  createdByUser?: { id: string; name: string }
}

export interface ExpenseStats {
  total: number
  count: number
  todayTotal: number
  averageDaily: number
  highestDay: { date: string; amount: number } | null
  categoryBreakdown: { category: string; amount: number }[]
  paymentMethodBreakdown: { method: string; amount: number }[]
  dailyBreakdown: { date: string; amount: number }[]
}

export interface ExpenseListRes {
  data: {
    expenses: Expense[]
    total: number
    page: number
    limit: number
  }
}

export interface ExpenseStatsRes {
  data: ExpenseStats
}

export interface CreateExpensePayload {
  title?: string
  amount: number
  category?: string
  paymentMethod?: PaymentMethod
  notes?: string
  date?: string
}

export interface ExpenseFilters {
  startDate?: string
  endDate?: string
  category?: string
  paymentMethod?: PaymentMethod
  page?: number
  limit?: number
  branchId?: string   // ← ADD: branch filter for SUPER_ADMIN
}

export interface StatsFilters {
  month?: number
  year?: number
  startDate?: string
  endDate?: string
  branchId?: string   // ← ADD: branch filter for SUPER_ADMIN
}