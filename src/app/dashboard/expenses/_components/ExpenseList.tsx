'use client'

import { PackageOpen } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ExpenseListItem } from './ExpenseListItem'
import { useDeleteExpense } from '@/hooks/useExpenses'
import type { Expense } from '@/types/expenses.types'

// ─── helpers ─────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

function groupByDay(expenses: Expense[]) {
  const map: Record<string, Expense[]> = {}
  for (const e of expenses) {
    const key = e.date.split('T')[0]
    if (!map[key]) map[key] = []
    map[key].push(e)
  }
  return Object.entries(map).sort(([a], [b]) => b.localeCompare(a))
}

function formatDayLabel(dateStr: string) {
  const d = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const toKey = (dt: Date) => dt.toISOString().split('T')[0]
  if (toKey(d) === toKey(today)) return 'Today'
  if (toKey(d) === toKey(yesterday)) return 'Yesterday'
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })
}

// ─── Empty State ─────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
        <PackageOpen className="w-7 h-7 text-zinc-400" />
      </div>
      <p className="text-sm font-medium text-zinc-500">No expenses found</p>
      <p className="text-xs text-zinc-400 mt-1">Add your first expense above</p>
    </div>
  )
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function ListSkeleton() {
  return (
    <div className="space-y-2 p-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-2 px-4">
          <div className="w-20 h-5 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
          <div className="w-px h-8 bg-zinc-100 dark:bg-zinc-800" />
          <div className="flex-1 space-y-1.5">
            <div className="h-4 w-40 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
            <div className="h-3 w-24 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  expenses: Expense[]
  isLoading: boolean
  onDeleted: () => void
  canDelete: boolean   // ← permission prop
}

export function ExpenseList({ expenses, isLoading, onDeleted, canDelete }: Props) {
  const { remove, deletingId } = useDeleteExpense(onDeleted)

  return (
    <Card className="border-0 shadow-sm bg-white dark:bg-zinc-900">
      <CardHeader className="px-5 pt-5 pb-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Expenses</p>
          {!isLoading && (
            <span className="text-xs text-zinc-400">{expenses.length} entries</span>
          )}
        </div>
      </CardHeader>

      <CardContent className="px-1 py-2">
        {isLoading ? (
          <ListSkeleton />
        ) : expenses.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
            {groupByDay(expenses).map(([date, group]) => {
              const dayTotal = group.reduce((s, e) => s + e.amount, 0)
              return (
                <div key={date}>
                  <div className="flex items-center justify-between px-5 py-2 sticky top-0 bg-zinc-50/80 dark:bg-zinc-800/60 backdrop-blur-sm z-10">
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      {formatDayLabel(date)}
                    </span>
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      {fmt(dayTotal)}
                    </span>
                  </div>
                  <div>
                    {group.map((expense) => (
                      <ExpenseListItem
                        key={expense.id}
                        expense={expense}
                        deletingId={deletingId}
                        onDelete={remove}
                        canDelete={canDelete}   // ← pass down
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}