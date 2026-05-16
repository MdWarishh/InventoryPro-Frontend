'use client'

import { TrendingUp, Wallet, CalendarDays, BarChart3, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { ExpenseStats } from '@/types/expenses.types'

// ─── helpers ────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string
  value: string
  sub?: string
  icon: React.ReactNode
  accent: string
}

function StatCard({ label, value, sub, icon, accent }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden border-0 shadow-sm bg-white dark:bg-zinc-900">
      <div className={`absolute inset-0 opacity-[0.04] ${accent}`} />
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1">
              {label}
            </p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 truncate">{value}</p>
            {sub && (
              <p className="text-xs text-zinc-400 mt-1 truncate">{sub}</p>
            )}
          </div>
          <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${accent} bg-opacity-10`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="h-3 w-20 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse mb-3" />
            <div className="h-7 w-28 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse mb-2" />
            <div className="h-2 w-16 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  stats: ExpenseStats | null
  isLoading: boolean
  label?: string
}

export function ExpenseStatsCards({ stats, isLoading, label = 'This Month' }: Props) {
  if (isLoading) return <StatsSkeleton />

  if (!stats) return null

  const cards: StatCardProps[] = [
    {
      label: `Total (${label})`,
      value: fmt(stats.total),
      sub: `${stats.count} transaction${stats.count !== 1 ? 's' : ''}`,
      icon: <Wallet className="w-5 h-5 text-violet-600" />,
      accent: 'bg-violet-500',
    },
    {
      label: "Today's Spend",
      value: fmt(stats.todayTotal),
      sub: stats.todayTotal > 0 ? 'logged today' : 'no expenses today',
      icon: <CalendarDays className="w-5 h-5 text-blue-600" />,
      accent: 'bg-blue-500',
    },
    {
      label: 'Daily Average',
      value: fmt(stats.averageDaily),
      sub: 'per active day',
      icon: <TrendingUp className="w-5 h-5 text-emerald-600" />,
      accent: 'bg-emerald-500',
    },
    {
      label: 'Highest Day',
      value: stats.highestDay ? fmt(stats.highestDay.amount) : '—',
      sub: stats.highestDay ? fmtDate(stats.highestDay.date) : 'no data',
      icon: <BarChart3 className="w-5 h-5 text-amber-600" />,
      accent: 'bg-amber-500',
    },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((c) => (
          <StatCard key={c.label} {...c} />
        ))}
      </div>

      {/* Category + Payment breakdown */}
      {(stats.categoryBreakdown.length > 0 || stats.paymentMethodBreakdown.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Category breakdown */}
          {stats.categoryBreakdown.length > 0 && (
            <Card className="border-0 shadow-sm bg-white dark:bg-zinc-900">
              <CardContent className="p-5">
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-3">
                  By Category
                </p>
                <div className="space-y-2">
                  {stats.categoryBreakdown.slice(0, 5).map((c) => {
                    const pct = stats.total > 0 ? (c.amount / stats.total) * 100 : 0
                    return (
                      <div key={c.category}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-zinc-700 dark:text-zinc-300 truncate max-w-[60%]">
                            {c.category}
                          </span>
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100 shrink-0">
                            {fmt(c.amount)}
                          </span>
                        </div>
                        <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-violet-500 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment method breakdown */}
          {stats.paymentMethodBreakdown.length > 0 && (
            <Card className="border-0 shadow-sm bg-white dark:bg-zinc-900">
              <CardContent className="p-5">
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-3">
                  By Payment Method
                </p>
                <div className="flex flex-wrap gap-2">
                  {stats.paymentMethodBreakdown.map((p) => (
                    <div
                      key={p.method}
                      className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg px-3 py-2 flex-1 min-w-[120px]"
                    >
                      <Badge variant="outline" className="text-[10px] uppercase tracking-wide shrink-0">
                        {p.method}
                      </Badge>
                      <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                        {fmt(p.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}