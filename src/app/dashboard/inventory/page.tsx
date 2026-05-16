'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowDownCircle, ArrowUpCircle, ChevronDown, ChevronUp, Loader2, Search, X } from 'lucide-react'
import { getStockHistory, searchSerials } from '@/services/stock.service'
import StockInModal from './_components/StockInModal'
import StockOutModal from './_components/StockOutModal'
import { useAuthStore } from '@/store/auth.store'
import api from '@/lib/axios'

export default function InventoryPage() {
  const user = useAuthStore(s => s.user)
  const isSuperAdmin = user?.role === 'SUPER_ADMIN'

  const [showStockIn, setShowStockIn] = useState(false)
  const [showStockOut, setShowStockOut] = useState(false)
  const [filterType, setFilterType] = useState<'all' | 'in' | 'out'>('all')
  const [filterBranch, setFilterBranch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [serialQuery, setSerialQuery] = useState('')
  const [serialSearchActive, setSerialSearchActive] = useState(false)

  // Branches for filter
  const { data: branches = [] } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => { const { data } = await api.get('/branches'); return data.data ?? [] },
    enabled: isSuperAdmin,
  })

  // Stock IN history
  const { data: inData, isLoading: inLoading } = useQuery({
    queryKey: ['stock-history', 'in', page, filterBranch],
    queryFn: () => getStockHistory({ type: 'in', page, limit: 25, branchId: filterBranch || undefined }),
    enabled: filterType === 'all' || filterType === 'in',
  })

  // Stock OUT history
  const { data: outData, isLoading: outLoading } = useQuery({
    queryKey: ['stock-history', 'out', page, filterBranch],
    queryFn: () => getStockHistory({ type: 'out', page, limit: 25, branchId: filterBranch || undefined }),
    enabled: filterType === 'all' || filterType === 'out',
  })

  // Serial search
  const { data: serialResults = [], isLoading: serialLoading } = useQuery({
    queryKey: ['serial-search', serialQuery],
    queryFn: () => searchSerials(serialQuery),
    enabled: serialQuery.trim().length >= 2,
  })

  // Merge + sort by date
  const allItems = (() => {
    if (filterType === 'in') {
      return (inData?.items ?? []).map((i: any) => ({ ...i, _type: 'IN' }))
    }
    if (filterType === 'out') {
      return (outData?.items ?? []).map((o: any) => ({ ...o, _type: 'OUT' }))
    }
    const ins = (inData?.items ?? []).map((i: any) => ({ ...i, _type: 'IN' }))
    const outs = (outData?.items ?? []).map((o: any) => ({ ...o, _type: 'OUT' }))
    return [...ins, ...outs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  })()

  const isLoading = inLoading || outLoading
  const totalIn = inData?.pagination?.total ?? 0
  const totalOut = outData?.pagination?.total ?? 0
  const totalMovements = filterType === 'in' ? totalIn : filterType === 'out' ? totalOut : totalIn + totalOut

  const statusColor = (status: string) => {
    if (status === 'AVAILABLE') return 'text-emerald-600 bg-emerald-50'
    if (status === 'SOLD') return 'text-blue-600 bg-blue-50'
    return 'text-red-600 bg-red-50'
  }

  return (
    <div>
      {/* ── Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Movements</h1>
          <p className="text-sm text-gray-500 mt-0.5">{totalMovements} total movements</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowStockIn(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl transition-all shadow-sm">
            <ArrowDownCircle size={15} /> Stock In
          </button>
          <button onClick={() => setShowStockOut(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-xl transition-all shadow-sm">
            <ArrowUpCircle size={15} /> Stock Out
          </button>
        </div>
      </div>

      {/* ── Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {/* Type filter */}
        <select
          value={filterType}
          onChange={e => { setFilterType(e.target.value as any); setPage(1) }}
          className="border border-gray-200 rounded-lg px-3.5 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
        >
          <option value="all">All Types</option>
          <option value="in">Stock In</option>
          <option value="out">Stock Out</option>
        </select>

        {/* Branch filter */}
        {isSuperAdmin && (
          <select
            value={filterBranch}
            onChange={e => { setFilterBranch(e.target.value); setPage(1) }}
            className="border border-gray-200 rounded-lg px-3.5 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
          >
            <option value="">All Branches</option>
            {branches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        )}

        {/* Serial Search */}
        <div className="relative ml-auto">
          <div className={`flex items-center gap-2 border rounded-lg px-3.5 py-2 transition-all bg-white
            ${serialSearchActive ? 'border-blue-400 ring-2 ring-blue-500/20' : 'border-gray-200'}`}>
            <Search size={14} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Serial number search karo..."
              value={serialQuery}
              onChange={e => setSerialQuery(e.target.value)}
              onFocus={() => setSerialSearchActive(true)}
              onBlur={() => setTimeout(() => setSerialSearchActive(false), 150)}
              className="text-sm text-gray-900 placeholder-gray-400 outline-none w-56"
            />
            {serialQuery && (
              <button onClick={() => setSerialQuery('')} className="text-gray-300 hover:text-gray-500">
                <X size={13} />
              </button>
            )}
          </div>

          {/* Serial search results */}
          {serialSearchActive && serialQuery.trim().length >= 2 && (
            <div className="absolute top-full right-0 mt-1 w-80 bg-white border border-gray-200 rounded-xl z-30 shadow-xl overflow-hidden">
              {serialLoading ? (
                <div className="px-4 py-3 text-sm text-gray-400 text-center">Searching...</div>
              ) : serialResults.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-400 text-center">Koi result nahi.</div>
              ) : (
                (serialResults as any[]).map((r: any) => (
                  <div key={r.id} className="px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-mono text-gray-900 font-medium">{r.serialNumber}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(r.status)}`}>
                        {r.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{r.product?.name} · {r.branch?.name}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">

        {/* Table header */}
        <div className="grid grid-cols-[110px_1fr_70px_150px_180px_120px] gap-2 px-5 py-3.5 border-b border-gray-100 bg-gray-50/60">
          {['TYPE', 'PRODUCT', 'QTY', 'STOCK CHANGE', 'SOURCE/DEALER', 'DATE'].map(h => (
            <p key={h} className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</p>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-gray-400" />
          </div>
        ) : allItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <p className="text-sm text-gray-400">Koi movement nahi mili.</p>
          </div>
        ) : (
          allItems.map((item: any) => {
            const isIn = item._type === 'IN'
            const isExpanded = expandedId === item.id + item._type
            const hasSerials = item.serialNumbers?.length > 0

            return (
              <div key={`${item._type}-${item.id}`} className="border-b border-gray-50 last:border-0">
                <div className="grid grid-cols-[110px_1fr_70px_150px_180px_120px] gap-2 items-center px-5 py-4 hover:bg-gray-50/60 transition-colors">

                  {/* Type badge */}
                  <div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold
                      ${isIn ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                      {isIn ? <ArrowDownCircle size={11} /> : <ArrowUpCircle size={11} />}
                      {item._type}
                    </span>
                  </div>

                  {/* Product */}
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{item.product?.name}</p>
                    {item.branch && <p className="text-xs text-gray-400 mt-0.5">{item.branch.name}</p>}
                  </div>

                  {/* Qty */}
                  <p className={`text-sm font-bold ${isIn ? 'text-emerald-600' : 'text-red-500'}`}>
                    {isIn ? '+' : '-'}{item.quantity}
                  </p>

                  {/* Stock change — backend mein nahi hai, dash dikhao */}
                  <p className="text-sm text-gray-300">—</p>

                  {/* Source / Dealer */}
                  <p className={`text-sm truncate ${
                    isIn
                      ? (item.dealer?.name ? 'text-blue-600 font-medium' : 'text-gray-400')
                      : (item.customerName ? 'text-gray-700' : 'text-gray-300')
                  }`}>
                    {isIn ? (item.dealer?.name || item.sourceNote || '—') : (item.customerName || '—')}
                  </p>

                  {/* Date + Serial count */}
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-400">
                      {new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'numeric', year: 'numeric' })}
                    </p>
                    {hasSerials && (
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : item.id + item._type)}
                        className="flex items-center gap-0.5 text-gray-300 hover:text-gray-500 transition-colors"
                      >
                        {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        <span className="text-xs">{item.serialNumbers.length}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded serials */}
                {isExpanded && hasSerials && (
                  <div className="px-5 pb-4 bg-gray-50/40">
                    <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wider">Serial Numbers</p>
                    <div className="flex flex-wrap gap-1.5">
                      {item.serialNumbers.map((s: any) => (
                        <span key={s.id} className={`px-2.5 py-1 rounded-lg text-xs font-mono border
                          ${s.status === 'SOLD' ? 'bg-blue-50 border-blue-100 text-blue-600'
                            : s.status === 'DAMAGED' ? 'bg-red-50 border-red-100 text-red-500'
                            : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                          }`}>
                          {s.serialNumber}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* ── Pagination */}
      {totalMovements > 25 && (
        <div className="flex items-center justify-center gap-3 mt-5">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-4 py-2 border border-gray-200 text-sm text-gray-600 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-all bg-white">
            ← Prev
          </button>
          <span className="text-sm text-gray-400">Page {page}</span>
          <button onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 border border-gray-200 text-sm text-gray-600 rounded-lg hover:bg-gray-50 transition-all bg-white">
            Next →
          </button>
        </div>
      )}

      {showStockIn && <StockInModal onClose={() => setShowStockIn(false)} />}
      {showStockOut && <StockOutModal onClose={() => setShowStockOut(false)} />}
    </div>
  )
}