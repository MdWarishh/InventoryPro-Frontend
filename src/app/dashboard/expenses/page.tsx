'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { History, Wallet, ShieldOff } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AddExpenseForm } from './_components/AddExpenseForm'
import { ExpenseList } from './_components/ExpenseList'
import { ExpenseStatsCards } from './_components/ExpenseStatsCards'
import { HistoryFilters } from './_components/HistoryFilters'
import {
  useExpenses,
  useExpenseStats,
  getCurrentMonthRange,
} from '@/hooks/useExpenses'
import { useAuth } from '@/hooks/useAuth'
import type { ExpenseFilters, StatsFilters } from '@/types/expenses.types'

// ─── No Access State ─────────────────────────────────────────────────────────

function NoAccess() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto">
          <ShieldOff className="w-6 h-6 text-zinc-400" />
        </div>
        <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Access Denied</p>
        <p className="text-xs text-zinc-400">You don't have permission to view expenses.</p>
      </div>
    </div>
  )
}

// ─── Current Month Tab ────────────────────────────────────────────────────────

interface TabProps {
  canCreate: boolean
  canDelete: boolean
}

function CurrentMonthTab({ canCreate, canDelete }: TabProps) {
  const { startDate, endDate, month, year } = getCurrentMonthRange()
  const [key, setKey] = useState(0)
  const refresh = useCallback(() => setKey((k) => k + 1), [])

  const { expenses, isLoading: listLoading, refetch: refetchList } = useExpenses({ startDate, endDate })
  const { stats, isLoading: statsLoading, refetch: refetchStats } = useExpenseStats({ month, year })

  const handleSuccess = () => {
    refetchList()
    refetchStats()
    refresh()
  }

  const monthLabel = new Date(year, month - 1).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="space-y-4">
      <ExpenseStatsCards stats={stats} isLoading={statsLoading} label={monthLabel} />

      {canCreate && <AddExpenseForm onSuccess={handleSuccess} />}

      <ExpenseList
        key={key}
        expenses={expenses}
        isLoading={listLoading}
        onDeleted={handleSuccess}
        canDelete={canDelete}
      />
    </div>
  )
}

// ─── History Tab ─────────────────────────────────────────────────────────────

function HistoryTab({ canDelete }: { canDelete: boolean }) {
  const [listFilters, setListFilters] = useState<ExpenseFilters>({})
  const [statsFilters, setStatsFilters] = useState<StatsFilters>({})
  const [key, setKey] = useState(0)

  const { expenses, isLoading: listLoading, refetch: refetchList } = useExpenses(listFilters)
  const { stats, isLoading: statsLoading, refetch: refetchStats } = useExpenseStats(statsFilters)

  const handleFilter = (f: Partial<ExpenseFilters>) => {
    setListFilters(f)
    setStatsFilters({ startDate: f.startDate, endDate: f.endDate })
    refetchList()
    refetchStats()
    setKey((k) => k + 1)
  }

  return (
    <div className="space-y-4">
      <HistoryFilters onFilter={handleFilter} isHistory />
      <ExpenseStatsCards stats={stats} isLoading={statsLoading} label="Selected Period" />
      <ExpenseList
        key={key}
        expenses={expenses}
        isLoading={listLoading}
        onDeleted={() => { refetchList(); refetchStats() }}
        canDelete={canDelete}
      />
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ExpensesPage() {
  const { hasPermission } = useAuth()

  const canView   = hasPermission('EXPENSES', 'canView')
  const canCreate = hasPermission('EXPENSES', 'canCreate')
  const canDelete = hasPermission('EXPENSES', 'canDelete')

  if (!canView) return <NoAccess />

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
            <Wallet className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Expenses</h1>
            <p className="text-xs text-zinc-500 mt-0.5">Track and manage your business expenses</p>
          </div>
        </div>

        <Tabs defaultValue="current">
          <TabsList className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1 h-auto rounded-xl shadow-sm">
            <TabsTrigger
              value="current"
              className="text-xs font-medium rounded-lg data-[state=active]:bg-violet-600 data-[state=active]:text-white data-[state=active]:shadow-sm px-4 py-1.5 gap-1.5"
            >
              <Wallet className="w-3.5 h-3.5" />
              This Month
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="text-xs font-medium rounded-lg data-[state=active]:bg-violet-600 data-[state=active]:text-white data-[state=active]:shadow-sm px-4 py-1.5 gap-1.5"
            >
              <History className="w-3.5 h-3.5" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="mt-4">
            <CurrentMonthTab canCreate={canCreate} canDelete={canDelete} />
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <HistoryTab canDelete={canDelete} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}