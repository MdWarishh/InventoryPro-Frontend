'use client'
import { useState, useEffect } from 'react'
import type { SalesReport, ReportsFilter } from '@/types/reports.types'
import { reportsService } from '@/services/reports.service'
import FilterBar from './FilterBar'

interface Props {
  isSuperAdmin?: boolean
  branches?: { id: string; name: string }[]
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

function LoadingTable() {
  return (
    <div className="animate-pulse">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex gap-4 px-5 py-3.5 border-b border-gray-50">
          <div className="flex-1 h-3 bg-gray-100 rounded" />
          <div className="w-20 h-3 bg-gray-100 rounded" />
          <div className="w-16 h-3 bg-gray-100 rounded" />
        </div>
      ))}
    </div>
  )
}

export default function SalesReportView({ isSuperAdmin, branches }: Props) {
  const [data, setData] = useState<SalesReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<ReportsFilter>({ groupBy: 'day' })
  const [downloading, setDownloading] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const PER_PAGE = 15

  useEffect(() => {
    setLoading(true)
    reportsService.getSales(filters).then(setData).finally(() => setLoading(false))
  }, [filters])

  const handleDownload = async () => {
    setDownloading(true)
    try {
      await reportsService.downloadReport('sales', filters as Record<string, string>)
    } finally {
      setDownloading(false)
    }
  }

  const filtered = (data?.items || []).filter(
    s =>
      s.product.name.toLowerCase().includes(search.toLowerCase()) ||
      s.product.sku.toLowerCase().includes(search.toLowerCase()) ||
      (s.customerName || '').toLowerCase().includes(search.toLowerCase())
  )
  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const maxChart = Math.max(...(data?.chart || []).map(c => c.revenue), 1)

  return (
    <div className="space-y-5">
      <FilterBar
        mode="range"
        isSuperAdmin={isSuperAdmin}
        branches={branches}
        onFilterChange={f => { setFilters(f as ReportsFilter); setPage(1) }}
        onDownload={handleDownload}
        downloadLabel="Export Sales"
        downloading={downloading}
      />

      {loading ? (
        <div className="flex items-center justify-center py-16 bg-white rounded-xl border border-gray-200">
          <div className="text-center">
            <svg className="animate-spin w-8 h-8 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm text-gray-500">Loading sales data...</p>
          </div>
        </div>
      ) : data ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Revenue</p>
              <p className="text-2xl font-semibold text-blue-700 mt-1">{fmt(data.summary.totalRevenue)}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Quantity</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{data.summary.totalQuantity.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Transactions</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{data.summary.totalTransactions.toLocaleString('en-IN')}</p>
            </div>
            {data.summary.totalTransactions > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Avg. Order Value</p>
                <p className="text-2xl font-semibold text-cyan-700 mt-1">
                  {fmt(data.summary.totalRevenue / data.summary.totalTransactions)}
                </p>
              </div>
            )}
          </div>

          {/* Bar Chart */}
          {data.chart.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Revenue Trend</h3>
              <div className="flex items-end gap-1 h-48 overflow-x-auto pb-2">
                {data.chart.map(point => (
                  <div key={point.date} className="group flex flex-col items-center gap-1 flex-1 min-w-[32px]">
                    {/* Tooltip */}
                    <div className="hidden group-hover:flex flex-col items-center pointer-events-none mb-1">
                      <div className="bg-gray-900 text-white text-xs rounded-lg px-2.5 py-1.5 whitespace-nowrap">
                        <p className="font-semibold">{fmt(point.revenue)}</p>
                        <p className="text-gray-400">{point.count} sales</p>
                      </div>
                      <div className="w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900" />
                    </div>
                    {/* Bar */}
                    <div className="w-full flex items-end" style={{ height: '160px' }}>
                      <div
                        className="w-full bg-blue-500 group-hover:bg-blue-600 transition-colors rounded-t-sm"
                        style={{ height: `${Math.max((point.revenue / maxChart) * 100, 2)}%` }}
                      />
                    </div>
                    {/* Label */}
                    <span className="text-[10px] text-gray-400 truncate w-full text-center">
                      {filters.groupBy === 'month'
                        ? point.date.slice(0, 7)
                        : new Date(point.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Products */}
          {data.items.length > 0 && (() => {
            const productMap: Record<string, { name: string; qty: number; revenue: number }> = {}
            for (const s of data.items) {
              if (!productMap[s.product.id]) {
                productMap[s.product.id] = { name: s.product.name, qty: 0, revenue: 0 }
              }
              productMap[s.product.id].qty += s.quantity
              productMap[s.product.id].revenue += s.sellingPrice * s.quantity
            }
            const top = Object.values(productMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5)
            return (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900">Top Products by Revenue</h3>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Product</th>
                      <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Units Sold</th>
                      <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {top.map((p, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3.5 text-sm text-gray-900">{p.name}</td>
                        <td className="px-5 py-3.5 text-sm text-gray-600 text-right">{p.qty.toLocaleString('en-IN')}</td>
                        <td className="px-5 py-3.5 text-sm font-semibold text-gray-900 text-right">{fmt(p.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          })()}

          {/* Transactions Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
              <h3 className="text-sm font-semibold text-gray-900 shrink-0">Sales Transactions</h3>
              <input
                type="text"
                placeholder="Search product, SKU, customer..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
                className="h-8 w-full max-w-xs px-3 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Product</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">SKU</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Branch</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Qty</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Price</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginated.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 text-sm text-gray-600 whitespace-nowrap">
                        {new Date(s.date).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-medium text-gray-900">{s.product.name}</p>
                        {s.product.category && (
                          <p className="text-xs text-gray-400">{s.product.category.name}</p>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 text-xs font-mono font-medium bg-gray-100 text-gray-600 rounded">
                          {s.product.sku}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-600">{s.branch.name}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-900 text-right">{s.quantity}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-600 text-right">{fmt(s.sellingPrice)}</td>
                      <td className="px-5 py-3.5 text-sm font-semibold text-gray-900 text-right">{fmt(s.sellingPrice * s.quantity)}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-600">
                        {s.customerName || <span className="text-gray-300">—</span>}
                      </td>
                    </tr>
                  ))}
                  {paginated.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-5 py-12 text-center text-sm text-gray-400">
                        No transactions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    ‹
                  </button>
                  <span className="text-sm text-gray-600">{page} / {totalPages}</span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    ›
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  )
}