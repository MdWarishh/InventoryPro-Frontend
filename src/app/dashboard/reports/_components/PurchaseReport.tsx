'use client'
import { useState, useEffect } from 'react'
import type { PurchaseReport, ReportsFilter } from '@/types/reports.types'
import { reportsService } from '@/services/reports.service'
import FilterBar from './FilterBar'

interface Props {
  isSuperAdmin?: boolean
  branches?: { id: string; name: string }[]
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

export default function PurchaseReportView({ isSuperAdmin, branches }: Props) {
  const [data, setData] = useState<PurchaseReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<ReportsFilter>({})
  const [downloading, setDownloading] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const PER_PAGE = 15

  useEffect(() => {
    setLoading(true)
    reportsService.getPurchase(filters).then(setData).finally(() => setLoading(false))
  }, [filters])

  const handleDownload = async () => {
    setDownloading(true)
    try {
      await reportsService.downloadReport('purchase', filters as Record<string, string>)
    } finally {
      setDownloading(false)
    }
  }

  const filtered = (data?.items || []).filter(
    p =>
      p.product.name.toLowerCase().includes(search.toLowerCase()) ||
      p.product.sku.toLowerCase().includes(search.toLowerCase()) ||
      (p.dealer?.name || '').toLowerCase().includes(search.toLowerCase())
  )
  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <div className="space-y-5">
      <FilterBar
        mode="range"
        isSuperAdmin={isSuperAdmin}
        branches={branches}
        onFilterChange={f => { setFilters(f as ReportsFilter); setPage(1) }}
        onDownload={handleDownload}
        downloadLabel="Export Purchases"
        downloading={downloading}
      />

      {loading ? (
        <div className="flex items-center justify-center py-16 bg-white rounded-xl border border-gray-200">
          <div className="text-center">
            <svg className="animate-spin w-8 h-8 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm text-gray-500">Loading purchase data...</p>
          </div>
        </div>
      ) : data ? (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Purchase Value</p>
              <p className="text-2xl font-semibold text-blue-700 mt-1">{fmt(data.summary.totalPurchase)}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Transactions</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{data.summary.totalTransactions.toLocaleString('en-IN')}</p>
            </div>
            {data.summary.totalTransactions > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Avg. Purchase Value</p>
                <p className="text-2xl font-semibold text-cyan-700 mt-1">
                  {fmt(data.summary.totalPurchase / data.summary.totalTransactions)}
                </p>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
              <h3 className="text-sm font-semibold text-gray-900 shrink-0">Purchase Transactions</h3>
              <input
                type="text"
                placeholder="Search product, SKU, dealer..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
                className="h-8 w-full max-w-xs px-3 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {['Date', 'Product', 'SKU', 'Branch', 'Dealer', 'Qty', 'Price', 'Total', 'Ref No'].map((h, i) => (
                      <th
                        key={h}
                        className={`px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide ${i >= 5 && i <= 7 ? 'text-right' : 'text-left'}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginated.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 text-sm text-gray-600 whitespace-nowrap">
                        {new Date(p.date).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-medium text-gray-900">{p.product.name}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 text-xs font-mono font-medium bg-gray-100 text-gray-600 rounded">
                          {p.product.sku}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-600">{p.branch.name}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-600">
                        {p.dealer?.name || <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-900 text-right">{p.quantity}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-600 text-right">{fmt(p.purchasePrice)}</td>
                      <td className="px-5 py-3.5 text-sm font-semibold text-gray-900 text-right">
                        {fmt(p.purchasePrice * p.quantity)}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-600">
                        {p.referenceNo || <span className="text-gray-300">—</span>}
                      </td>
                    </tr>
                  ))}
                  {paginated.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-5 py-12 text-center text-sm text-gray-400">
                        No purchases found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

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
                  >‹</button>
                  <span className="text-sm text-gray-600">{page} / {totalPages}</span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >›</button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  )
}