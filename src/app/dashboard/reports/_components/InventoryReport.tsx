'use client'
import { useState, useEffect } from 'react'
import type { StockValuationReport, LowStockItem } from '@/types/reports.types'
import { reportsService } from '@/services/reports.service'

interface Props {
  isSuperAdmin?: boolean
  branches?: { id: string; name: string }[]
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

type InvTab = 'valuation' | 'lowstock'

export default function InventoryReport({ isSuperAdmin, branches }: Props) {
  const [tab, setTab] = useState<InvTab>('valuation')
  const [branchId, setBranchId] = useState('')
  const [valuation, setValuation] = useState<StockValuationReport | null>(null)
  const [lowStock, setLowStock] = useState<LowStockItem[]>([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const PER_PAGE = 15

  useEffect(() => {
    setLoading(true)
    const bid = branchId || undefined
    if (tab === 'valuation') {
      reportsService.getStockValuation(bid).then(setValuation).finally(() => setLoading(false))
    } else {
      reportsService.getLowStock(bid).then(setLowStock).finally(() => setLoading(false))
    }
  }, [tab, branchId])

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const type = tab === 'valuation' ? 'stock-valuation' : 'low-stock'
      await reportsService.downloadReport(type, { branchId: branchId || undefined })
    } finally {
      setDownloading(false)
    }
  }

  const valFiltered = (valuation?.items || []).filter(
    i =>
      i.productName.toLowerCase().includes(search.toLowerCase()) ||
      i.sku.toLowerCase().includes(search.toLowerCase()) ||
      i.category.toLowerCase().includes(search.toLowerCase())
  )
  const lowFiltered = lowStock.filter(
    i =>
      i.productName.toLowerCase().includes(search.toLowerCase()) ||
      i.sku.toLowerCase().includes(search.toLowerCase())
  )
  const items = tab === 'valuation' ? valFiltered : lowFiltered
  const totalPages = Math.ceil(items.length / PER_PAGE)
  const paginated = items.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const outOfStock = lowStock.filter(i => i.currentStock === 0).length

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Toggle */}
          <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <button
              onClick={() => { setTab('valuation'); setPage(1); setSearch('') }}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                tab === 'valuation'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
              Stock Valuation
            </button>
            <button
              onClick={() => { setTab('lowstock'); setPage(1); setSearch('') }}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                tab === 'lowstock'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              Low Stock Alerts
              {lowStock.length > 0 && (
                <span className="ml-1 h-5 min-w-[20px] flex items-center justify-center px-1.5 text-xs font-semibold bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-full">
                  {lowStock.length}
                </span>
              )}
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {isSuperAdmin && branches && branches.length > 0 && (
              <select
                value={branchId}
                onChange={e => { setBranchId(e.target.value); setPage(1) }}
                className="h-9 px-3 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400 transition-all"
              >
                <option value="">All Branches</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            )}
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="h-9 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {downloading ? (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              )}
              Export
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <div className="text-center">
            <svg className="animate-spin w-8 h-8 text-gray-400 dark:text-gray-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading inventory data...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Valuation Summary */}
          {tab === 'valuation' && valuation && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Purchase Value</p>
                <p className="text-2xl font-semibold text-blue-700 dark:text-blue-400 mt-1">{fmt(valuation.summary.totalPurchaseValue)}</p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Selling Value</p>
                <p className="text-2xl font-semibold text-emerald-700 dark:text-emerald-400 mt-1">{fmt(valuation.summary.totalSellingValue)}</p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Products</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-50 mt-1">{valuation.items.length}</p>
              </div>
            </div>
          )}

          {/* Low Stock Summary */}
          {tab === 'lowstock' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Low Stock Items</p>
                  <p className="text-2xl font-semibold text-amber-600 dark:text-amber-400 mt-1">{lowStock.length}</p>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Out of Stock</p>
                  <p className={`text-2xl font-semibold mt-1 ${outOfStock > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-50'}`}>
                    {outOfStock}
                  </p>
                </div>
              </div>

              {lowFiltered.length > 0 && (
                <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl">
                  <svg width="16" height="16" fill="none" stroke="#d97706" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  <span className="text-sm text-amber-800 dark:text-amber-300">
                    <strong>{lowFiltered.length} products</strong> are at or below minimum stock threshold
                  </span>
                </div>
              )}
            </>
          )}

          {/* Table */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 shrink-0">
                {tab === 'valuation' ? 'Current Inventory' : 'Low Stock Items'}
              </h3>
              <input
                type="text"
                placeholder="Search product, SKU..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
                className="h-8 w-full max-w-xs px-3 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400 focus:bg-white dark:focus:bg-gray-700 transition-all"
              />
            </div>

            <div className="overflow-x-auto">
              {tab === 'valuation' ? (
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                      {['Product', 'Category', 'Stock', 'Sale Price', 'Value', 'Status'].map((h, i) => (
                        <th key={h} className={`px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide ${i >= 2 ? 'text-right' : 'text-left'}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {(paginated as typeof valFiltered).map((item, i) => {
                      const isLow = item.currentStock <= 5
                      const isOut = item.currentStock === 0
                      return (
                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="px-5 py-3.5">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.productName}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">{item.sku}</p>
                          </td>
                          <td className="px-5 py-3.5 text-sm text-gray-500 dark:text-gray-400">{item.category}</td>
                          <td className="px-5 py-3.5 text-sm text-gray-900 dark:text-gray-100 text-right font-medium">{item.currentStock.toLocaleString('en-IN')}</td>
                          <td className="px-5 py-3.5 text-sm text-gray-600 dark:text-gray-400 text-right">{fmt(item.sellingPrice)}</td>
                          <td className="px-5 py-3.5 text-sm font-semibold text-gray-900 dark:text-gray-100 text-right">{fmt(item.sellingValue)}</td>
                          <td className="px-5 py-3.5 text-right">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                              isOut
                                ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                : isLow
                                ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                                : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            }`}>
                              {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                    {paginated.length === 0 && (
                      <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-gray-400 dark:text-gray-500">No items found</td></tr>
                    )}
                  </tbody>
                </table>
              ) : (
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                      {['Product', 'Category', 'Branch', 'Current Stock', 'Min Alert', 'Shortage'].map((h, i) => (
                        <th key={h} className={`px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide ${i >= 3 ? 'text-right' : 'text-left'}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {(paginated as LowStockItem[]).map(item => (
                      <tr key={item.productId} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-5 py-3.5">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.productName}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">{item.sku}</p>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-gray-500 dark:text-gray-400">{item.category}</td>
                        <td className="px-5 py-3.5 text-sm text-gray-600 dark:text-gray-400">{item.branch}</td>
                        <td className="px-5 py-3.5 text-right">
                          <span className={`inline-flex items-center justify-center h-7 min-w-[28px] px-2 rounded-lg text-xs font-semibold ${
                            item.currentStock === 0
                              ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                              : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                          }`}>
                            {item.currentStock}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-gray-600 dark:text-gray-400 text-right">{item.minStockAlert}</td>
                        <td className="px-5 py-3.5 text-right">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                            -{item.shortage}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {paginated.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-5 py-12 text-center text-sm text-gray-400 dark:text-gray-500">
                          {search ? 'No items match your search' : 'No low stock items 🎉'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {totalPages > 1 && (
              <div className="px-5 py-3.5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, items.length)} of {items.length}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >‹</button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{page} / {totalPages}</span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >›</button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}