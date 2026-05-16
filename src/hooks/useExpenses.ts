'use client'

import { useState, useEffect, useCallback } from 'react'
import { expensesService } from '@/services/expenses.service'
import type {
  Expense,
  ExpenseStats,
  ExpenseFilters,
  StatsFilters,
  CreateExpensePayload,
} from '@/types/expenses.types'
import { toast } from 'sonner'

// ─── Current Month Range Helper ──────────────────────────────────────────────

export function getCurrentMonthRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  }
}

// ─── useExpenses ─────────────────────────────────────────────────────────────

export function useExpenses(filters: ExpenseFilters = {}) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await expensesService.getAll(filters)
      setExpenses(res.data.expenses)
      setTotal(res.data.total)
    } catch {
      setError('Failed to load expenses.')
    } finally {
      setIsLoading(false)
    }
  }, [JSON.stringify(filters)])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { expenses, total, isLoading, error, refetch: fetch }
}

// ─── useExpenseStats ─────────────────────────────────────────────────────────

export function useExpenseStats(filters: StatsFilters = {}) {
  const [stats, setStats] = useState<ExpenseStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await expensesService.getStats(filters)
      setStats(res.data)
    } catch {
      setStats(null)
    } finally {
      setIsLoading(false)
    }
  }, [JSON.stringify(filters)])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { stats, isLoading, refetch: fetch }
}

// ─── useCreateExpense ─────────────────────────────────────────────────────────

export function useCreateExpense(onSuccess?: () => void) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const create = async (payload: CreateExpensePayload) => {
    setIsSubmitting(true)
    try {
      await expensesService.create(payload)
      toast.success('Expense added!')
      onSuccess?.()
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to add expense.'
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return { create, isSubmitting }
}

// ─── useDeleteExpense ────────────────────────────────────────────────────────

export function useDeleteExpense(onSuccess?: () => void) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const remove = async (id: string) => {
    setDeletingId(id)
    try {
      await expensesService.delete(id)
      toast.success('Expense deleted.')
      onSuccess?.()
    } catch {
      toast.error('Failed to delete expense.')
    } finally {
      setDeletingId(null)
    }
  }

  return { remove, deletingId }
}