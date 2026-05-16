'use client'

import { useState } from 'react'
import { Search, X, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ExpenseFilters, PaymentMethod } from '@/types/expenses.types'

// ─── Month/Year Helpers ───────────────────────────────────────────────────────

const MONTHS = [
  { value: '1', label: 'January' }, { value: '2', label: 'February' },
  { value: '3', label: 'March' }, { value: '4', label: 'April' },
  { value: '5', label: 'May' }, { value: '6', label: 'June' },
  { value: '7', label: 'July' }, { value: '8', label: 'August' },
  { value: '9', label: 'September' }, { value: '10', label: 'October' },
  { value: '11', label: 'November' }, { value: '12', label: 'December' },
]

const YEARS = Array.from({ length: 5 }, (_, i) => {
  const y = new Date().getFullYear() - i
  return { value: String(y), label: String(y) }
})

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'CASH', label: 'Cash' },
  { value: 'UPI', label: 'UPI' },
  { value: 'BANK', label: 'Bank' },
  { value: 'CARD', label: 'Card' },
  { value: 'OTHER', label: 'Other' },
]

function monthToDateRange(month: string, year: string) {
  const m = parseInt(month) - 1
  const y = parseInt(year)
  const start = new Date(y, m, 1)
  const end = new Date(y, m + 1, 0)
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  onFilter: (f: Partial<ExpenseFilters>) => void
  isHistory?: boolean
}

export function HistoryFilters({ onFilter, isHistory = false }: Props) {
  const now = new Date()
  const [month, setMonth] = useState(String(now.getMonth() + 1))
  const [year, setYear] = useState(String(now.getFullYear()))
  const [paymentMethod, setPaymentMethod] = useState<string>('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [useCustomRange, setUseCustomRange] = useState(false)

  const apply = () => {
    if (useCustomRange && startDate) {
      onFilter({ startDate, endDate: endDate || undefined, paymentMethod: paymentMethod as PaymentMethod || undefined })
    } else {
      const range = monthToDateRange(month, year)
      onFilter({ ...range, paymentMethod: paymentMethod as PaymentMethod || undefined })
    }
  }

  const reset = () => {
    setMonth(String(now.getMonth() + 1))
    setYear(String(now.getFullYear()))
    setPaymentMethod('')
    setStartDate('')
    setEndDate('')
    setUseCustomRange(false)
    onFilter({})
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border-0 shadow-sm p-4">
      <div className="flex items-center gap-2 mb-3">
        <Filter className="w-4 h-4 text-zinc-400" />
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Filters</span>
        <button
          onClick={() => setUseCustomRange(!useCustomRange)}
          className="ml-auto text-[11px] text-violet-600 hover:text-violet-700 font-medium"
        >
          {useCustomRange ? 'Use month picker' : 'Use custom range'}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 items-end">
        {useCustomRange ? (
          <>
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 uppercase tracking-wide">From</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-8 text-xs w-36"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 uppercase tracking-wide">To</label>
              <Input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-8 text-xs w-36"
              />
            </div>
          </>
        ) : (
          <>
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 uppercase tracking-wide">Month</label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger className="h-8 text-xs w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => (
                    <SelectItem key={m.value} value={m.value} className="text-xs">
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 uppercase tracking-wide">Year</label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger className="h-8 text-xs w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map((y) => (
                    <SelectItem key={y.value} value={y.value} className="text-xs">
                      {y.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {/* Payment method */}
        <div className="space-y-1">
          <label className="text-[10px] text-zinc-400 uppercase tracking-wide">Payment</label>
          <Select value={paymentMethod || 'ALL'} onValueChange={(v) => setPaymentMethod(v === 'ALL' ? '' : v)}>
            <SelectTrigger className="h-8 text-xs w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs">All methods</SelectItem>
              {PAYMENT_METHODS.map((m) => (
                <SelectItem key={m.value} value={m.value} className="text-xs">
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 mt-auto">
          <Button size="sm" onClick={apply} className="h-8 text-xs bg-violet-600 hover:bg-violet-700 text-white px-4">
            Apply
          </Button>
          <Button size="sm" variant="outline" onClick={reset} className="h-8 text-xs px-3">
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}