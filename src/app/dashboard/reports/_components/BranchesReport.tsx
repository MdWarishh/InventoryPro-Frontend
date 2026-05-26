'use client'
import { useState, useEffect } from 'react'
import type { AllBranchesReport, ReportsFilter } from '@/types/reports.types'
import { reportsService } from '@/services/reports.service'
import FilterBar from './FilterBar'

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

export default function BranchesReport() {
  const [data, setData] = useState<AllBranchesReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<ReportsFilter>({})

  useEffect(() => {
    setLoading(true)
    reportsService.getAllBranches(filters).then(setData).finally(() => setLoading(false))
  }, [filters])

  const maxSales = Math.max(...(data?.branches || []).map(b => b.totalSales), 1)

  return (
    <div className="space-y-5">
      <FilterBar
        mode="range"
        isSuperAdmin={false}
        onFilterChange={f => setFilters(f as ReportsFilter)}
      />

      {loading ? (
        <div className="flex items-center justify-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <div className="text-center">
            <svg className="animate-spin w-8 h-8 text-gray-400 dark:text-gray-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading branch data...</p>
          </div>
        </div>
      ) : data ? (
        <>
          {/* ── Summary Cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Combined Sales</p>
              <p className="text-2xl font-semibold text-blue-700 dark:text-blue-400 mt-1">{fmt(data.totals.totalSales)}</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Combined Purchase</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-50 mt-1">{fmt(data.totals.totalPurchase)}</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Stock Units</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-50 mt-1">{data.totals.totalStock.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Gross Profit</p>
              <p className={`text-2xl font-semibold mt-1 ${
                data.totals.grossProfit >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {fmt(data.totals.grossProfit)}
              </p>
            </div>
          </div>

          {/* ── Branch Performance Bar Chart ── */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Branch Performance</h3>
            <div className="space-y-4">
              {data.branches.map(b => (
                <div key={b.branchId}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{b.branchName}</span>
                      {b.isMainBranch && (
                        <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
                          Main
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{fmt(b.totalSales)}</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 dark:bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${(b.totalSales / maxSales) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Branch Details Table ── */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Branch Details</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    {['Branch', 'Sales Amt', 'Sales #', 'Purchase Amt', 'Purchase #', 'Stock', 'Gross Profit'].map((h, i) => (
                      <th
                        key={h}
                        className={`px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide ${i === 0 ? 'text-left' : 'text-right'}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {data.branches.map(b => (
                    <tr key={b.branchId} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400 flex-shrink-0" />
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{b.branchName}</span>
                          {b.isMainBranch && (
                            <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
                              Main
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm font-semibold text-gray-900 dark:text-gray-100 text-right">{fmt(b.totalSales)}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-600 dark:text-gray-400 text-right">{b.totalSalesCount.toLocaleString('en-IN')}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-600 dark:text-gray-400 text-right">{fmt(b.totalPurchase)}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-600 dark:text-gray-400 text-right">{b.totalPurchaseCount.toLocaleString('en-IN')}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-600 dark:text-gray-400 text-right">{b.currentStock.toLocaleString('en-IN')}</td>
                      <td className={`px-5 py-3.5 text-sm font-semibold text-right ${
                        b.grossProfit >= 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {fmt(b.grossProfit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 dark:bg-gray-800/60 border-t-2 border-gray-200 dark:border-gray-700">
                    <td className="px-5 py-3.5 text-sm font-semibold text-gray-900 dark:text-gray-100">Total</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-gray-900 dark:text-gray-100 text-right">{fmt(data.totals.totalSales)}</td>
                    <td />
                    <td className="px-5 py-3.5 text-sm font-semibold text-gray-900 dark:text-gray-100 text-right">{fmt(data.totals.totalPurchase)}</td>
                    <td />
                    <td className="px-5 py-3.5 text-sm font-semibold text-gray-900 dark:text-gray-100 text-right">{data.totals.totalStock.toLocaleString('en-IN')}</td>
                    <td className={`px-5 py-3.5 text-sm font-semibold text-right ${
                      data.totals.grossProfit >= 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {fmt(data.totals.grossProfit)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}