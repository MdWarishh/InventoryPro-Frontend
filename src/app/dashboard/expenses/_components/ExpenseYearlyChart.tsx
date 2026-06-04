'use client'

import { useMemo, useState } from 'react'
import { TrendingUp, TrendingDown, Calendar, IndianRupee } from 'lucide-react'
import { useExpenseStats } from '@/hooks/useExpenses'

// ─── Types ────────────────────────────────────────────────────────────────────

interface MonthData {
  month: string
  shortMonth: string
  total: number
  count: number
  index: number
}

// ─── Hook: fetch all 12 months ────────────────────────────────────────────────

function useYearlyExpenseStats(year: number) {
  const months = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        year,
      })),
    [year]
  )

  // Fetch each month independently
  const jan  = useExpenseStats({ month: 1,  year })
  const feb  = useExpenseStats({ month: 2,  year })
  const mar  = useExpenseStats({ month: 3,  year })
  const apr  = useExpenseStats({ month: 4,  year })
  const may  = useExpenseStats({ month: 5,  year })
  const jun  = useExpenseStats({ month: 6,  year })
  const jul  = useExpenseStats({ month: 7,  year })
  const aug  = useExpenseStats({ month: 8,  year })
  const sep  = useExpenseStats({ month: 9,  year })
  const oct  = useExpenseStats({ month: 10, year })
  const nov  = useExpenseStats({ month: 11, year })
  const dec  = useExpenseStats({ month: 12, year })

  const allStats = [jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec]

  const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const MONTH_FULL   = ['January','February','March','April','May','June','July','August','September','October','November','December']

  const data: MonthData[] = allStats.map((s, i) => ({
    index: i,
    month: MONTH_FULL[i],
    shortMonth: MONTH_LABELS[i],
    total: s.stats?.total ?? 0,
    count: s.stats?.count ?? 0,
  }))

  const isLoading = allStats.some((s) => s.isLoading)

  return { data, isLoading }
}

// ─── Format helpers ───────────────────────────────────────────────────────────

function formatAmount(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
  if (n >= 1000)   return `₹${(n / 1000).toFixed(1)}K`
  return `₹${n.toLocaleString('en-IN')}`
}

function formatFull(n: number) {
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// ─── Bar ──────────────────────────────────────────────────────────────────────

interface BarProps {
  d: MonthData
  maxVal: number
  isCurrentMonth: boolean
  isSelected: boolean
  onClick: () => void
  skeletonMode: boolean
}

function Bar({ d, maxVal, isCurrentMonth, isSelected, onClick, skeletonMode }: BarProps) {
  const pct = maxVal > 0 ? (d.total / maxVal) * 100 : 0
  const heightPct = Math.max(pct, d.total > 0 ? 4 : 0) // min visible height

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 flex-1 group focus:outline-none"
    >
      {/* Amount label on top */}
      <div
        className={`text-[10px] font-semibold transition-all duration-200 leading-none ${
          isSelected
            ? 'text-violet-600 dark:text-violet-400'
            : d.total > 0
            ? 'text-zinc-500 dark:text-zinc-400'
            : 'text-transparent'
        }`}
      >
        {!skeletonMode && d.total > 0 ? formatAmount(d.total) : ''}
      </div>

      {/* Bar container */}
      <div className="w-full flex flex-col justify-end" style={{ height: '140px' }}>
        {skeletonMode ? (
          <div
            className="w-full rounded-t-md bg-zinc-200 dark:bg-zinc-700 animate-pulse"
            style={{ height: `${20 + Math.random() * 60}%` }}
          />
        ) : (
          <div
            className={`w-full rounded-t-md transition-all duration-500 ease-out relative overflow-hidden
              ${
                isSelected
                  ? 'bg-violet-600 dark:bg-violet-500 shadow-lg shadow-violet-500/30'
                  : isCurrentMonth
                  ? 'bg-violet-400/70 dark:bg-violet-600/60 group-hover:bg-violet-500 dark:group-hover:bg-violet-500'
                  : d.total > 0
                  ? 'bg-zinc-300 dark:bg-zinc-600 group-hover:bg-violet-400 dark:group-hover:bg-violet-500'
                  : 'bg-zinc-100 dark:bg-zinc-800'
              }`}
            style={{ height: `${heightPct}%`, minHeight: d.total > 0 ? '6px' : '0px' }}
          >
            {/* Shimmer on selected */}
            {isSelected && (
              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/20" />
            )}
          </div>
        )}
      </div>

      {/* Month label */}
      <span
        className={`text-[11px] font-medium transition-colors ${
          isSelected
            ? 'text-violet-600 dark:text-violet-400'
            : isCurrentMonth
            ? 'text-zinc-700 dark:text-zinc-200'
            : 'text-zinc-400 dark:text-zinc-500'
        }`}
      >
        {d.shortMonth}
      </span>

      {/* Active dot */}
      <div
        className={`w-1 h-1 rounded-full transition-all ${
          isSelected ? 'bg-violet-600 dark:bg-violet-400' : 'bg-transparent'
        }`}
      />
    </button>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ExpenseYearlyChart() {
  const currentYear  = new Date().getFullYear()
  const currentMonth = new Date().getMonth() // 0-indexed

  const [selectedYear, setSelectedYear]   = useState(currentYear)
  const [selectedMonth, setSelectedMonth] = useState<number | null>(currentMonth)

  const { data, isLoading } = useYearlyExpenseStats(selectedYear)

  const maxVal     = useMemo(() => Math.max(...data.map((d) => d.total), 1), [data])
  const yearTotal  = useMemo(() => data.reduce((s, d) => s + d.total, 0), [data])
  const yearCount  = useMemo(() => data.reduce((s, d) => s + d.count, 0), [data])

  const selectedData  = selectedMonth !== null ? data[selectedMonth] : null
  const prevMonthData = selectedMonth !== null && selectedMonth > 0 ? data[selectedMonth - 1] : null

  const trend =
    selectedData && prevMonthData && prevMonthData.total > 0
      ? ((selectedData.total - prevMonthData.total) / prevMonthData.total) * 100
      : null

  const yearOptions = [currentYear, currentYear - 1, currentYear - 2]

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Yearly Overview</h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">Monthly expense breakdown</p>
            </div>
          </div>

          {/* Year Selector */}
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5">
            {yearOptions.map((y) => (
              <button
                key={y}
                onClick={() => { setSelectedYear(y); setSelectedMonth(y === currentYear ? currentMonth : null) }}
                className={`text-[11px] font-semibold px-3 py-1 rounded-md transition-all ${
                  selectedYear === y
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        </div>

        {/* Year summary */}
        <div className="flex items-center gap-4 mt-4">
          <div>
            <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium">Year Total</p>
            <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mt-0.5">
              {isLoading ? (
                <span className="inline-block w-24 h-6 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
              ) : (
                formatFull(yearTotal)
              )}
            </p>
          </div>
          <div className="w-px h-8 bg-zinc-200 dark:bg-zinc-700" />
          <div>
            <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium">Transactions</p>
            <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mt-0.5">
              {isLoading ? (
                <span className="inline-block w-12 h-6 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
              ) : (
                yearCount
              )}
            </p>
          </div>
          {selectedData && selectedData.total > 0 && (
            <>
              <div className="w-px h-8 bg-zinc-200 dark:bg-zinc-700" />
              <div>
                <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium">
                  {selectedData.month}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p className="text-xl font-bold text-violet-600 dark:text-violet-400">
                    {formatFull(selectedData.total)}
                  </p>
                  {trend !== null && (
                    <span
                      className={`flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                        trend > 0
                          ? 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400'
                          : 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400'
                      }`}
                    >
                      {trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {Math.abs(trend).toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="px-4 py-5">
        <div className="flex items-end gap-1.5">
          {data.map((d, i) => (
            <Bar
              key={d.shortMonth}
              d={d}
              maxVal={maxVal}
              isCurrentMonth={i === currentMonth && selectedYear === currentYear}
              isSelected={selectedMonth === i}
              onClick={() => setSelectedMonth(selectedMonth === i ? null : i)}
              skeletonMode={isLoading}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-violet-600" />
            <span className="text-[10px] text-zinc-400">Selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-violet-400/70 dark:bg-violet-600/60" />
            <span className="text-[10px] text-zinc-400">Current month</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-zinc-300 dark:bg-zinc-600" />
            <span className="text-[10px] text-zinc-400">Past months</span>
          </div>
          <div className="flex items-center gap-1.5 ml-auto">
            <IndianRupee className="w-3 h-3 text-zinc-400" />
            <span className="text-[10px] text-zinc-400">Click bar to inspect</span>
          </div>
        </div>
      </div>
    </div>
  )
}