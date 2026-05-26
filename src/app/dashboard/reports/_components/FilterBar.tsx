'use client'
import { useState } from 'react'
import type { ReportsFilter, GSTFilter, GSTType } from '@/types/reports.types'

interface Branch { id: string; name: string }

interface FilterBarProps {
  mode: 'range' | 'gst' | 'none'
  isSuperAdmin?: boolean
  branches?: Branch[]
  onFilterChange: (filters: ReportsFilter | GSTFilter) => void
  onDownload?: () => void
  downloadLabel?: string
  downloading?: boolean
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i)

export default function FilterBar({
  mode,
  isSuperAdmin,
  branches = [],
  onFilterChange,
  onDownload,
  downloadLabel,
  downloading,
}: FilterBarProps) {
  const today = new Date().toISOString().split('T')[0]
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .split('T')[0]

  const [start, setStart] = useState(monthStart)
  const [end, setEnd] = useState(today)
  const [branchId, setBranchId] = useState('')
  const [groupBy, setGroupBy] = useState<'day' | 'month'>('day')
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(currentYear)
  const [gstType, setGstType] = useState<GSTType>('summary')

  const apply = () => {
    if (mode === 'gst') {
      onFilterChange({ branchId: branchId || undefined, month, year, type: gstType })
    } else {
      onFilterChange({
        startDate: start,
        endDate: end,
        branchId: branchId || undefined,
        groupBy,
      })
    }
  }

  const preset = (days: number) => {
    const e = new Date()
    const s = new Date()
    s.setDate(s.getDate() - days)
    setStart(s.toISOString().split('T')[0])
    setEnd(e.toISOString().split('T')[0])
  }

  const inputCls =
    'h-9 px-3 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400 focus:border-transparent transition-all'

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 mb-5">
      <div className="flex flex-wrap items-end gap-3">
        {/* Preset Buttons */}
        {mode === 'range' && (
          <div className="flex items-center gap-1.5">
            {[{ l: '7D', d: 7 }, { l: '30D', d: 30 }, { l: '90D', d: 90 }].map(p => (
              <button
                key={p.l}
                onClick={() => preset(p.d)}
                className="h-9 px-3 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all"
              >
                {p.l}
              </button>
            ))}
          </div>
        )}

        {/* Date Range */}
        {mode === 'range' && (
          <>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">From</label>
              <input
                type="date"
                value={start}
                max={end}
                onChange={e => setStart(e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">To</label>
              <input
                type="date"
                value={end}
                min={start}
                max={today}
                onChange={e => setEnd(e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Group By</label>
              <select
                value={groupBy}
                onChange={e => setGroupBy(e.target.value as 'day' | 'month')}
                className={inputCls}
              >
                <option value="day">Day</option>
                <option value="month">Month</option>
              </select>
            </div>
          </>
        )}

        {/* GST Filters */}
        {mode === 'gst' && (
          <>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Month</label>
              <select
                value={month}
                onChange={e => setMonth(Number(e.target.value))}
                className={inputCls}
              >
                {MONTHS.map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Year</label>
              <select
                value={year}
                onChange={e => setYear(Number(e.target.value))}
                className={inputCls}
              >
                {YEARS.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Report Type</label>
              <select
                value={gstType}
                onChange={e => setGstType(e.target.value as GSTType)}
                className={inputCls}
              >
                <option value="summary">Summary</option>
                <option value="gstr1">GSTR-1 (Sales)</option>
                <option value="gstr2">GSTR-2 (Purchase)</option>
              </select>
            </div>
          </>
        )}

        {/* Branch Filter */}
        {isSuperAdmin && branches.length > 0 && (
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Branch</label>
            <select
              value={branchId}
              onChange={e => setBranchId(e.target.value)}
              className={inputCls}
            >
              <option value="">All Branches</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Apply Button */}
        <button
          onClick={apply}
          className="h-9 px-4 text-sm font-medium text-white bg-gray-900 dark:bg-gray-100 dark:text-gray-900 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors flex items-center gap-2 self-end"
        >
          Apply
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {onDownload && <div className="flex-1" />}

        {/* Download Button */}
        {onDownload && (
          <button
            onClick={onDownload}
            disabled={downloading}
            className="h-9 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 self-end"
          >
            {downloading ? (
              <svg className="animate-spin w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            )}
            {downloadLabel || 'Export Excel'}
          </button>
        )}
      </div>
    </div>
  )
}