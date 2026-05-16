'use client'

import { useState, useMemo, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  X, Loader2, ArrowUpCircle, Search, ChevronDown,
  CheckSquare, Square, AlertCircle, ScanLine, Package
} from 'lucide-react'
import { stockOut, getAvailableSerials, getCurrentStock } from '@/services/stock.service'
import type { StockOutPayload } from '@/types/stock.types'
import api from '@/lib/axios'
import { useAuthStore } from '@/store/auth.store'

interface Props { onClose: () => void }

export default function StockOutModal({ onClose }: Props) {
  const qc = useQueryClient()
  const user = useAuthStore(s => s.user)
  const isSuperAdmin = user?.role === 'SUPER_ADMIN'
  const userBranchId = user?.branchId ?? user?.branch?.id ?? ''

  const [productId, setProductId] = useState('')
  const [branchId, setBranchId] = useState(isSuperAdmin ? '' : userBranchId)
  const [quantity, setQuantity] = useState(1)
  const [sellingPrice, setSellingPrice] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [date, setDate] = useState('')
  const [selectedSerialIds, setSelectedSerialIds] = useState<string[]>([])
  const [productSearch, setProductSearch] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [serialSearch, setSerialSearch] = useState('')
  const [error, setError] = useState('')

  // ── Fetch products
  const { data: allProducts = [] } = useQuery({
    queryKey: ['products-list'],
    queryFn: async () => {
      const { data } = await api.get('/products', { params: { limit: 999 } })
      return data.data?.items ?? data.data ?? []
    },
  })

  // ── Fetch branches
  const { data: branches = [] } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => { const { data } = await api.get('/branches'); return data.data ?? [] },
    enabled: isSuperAdmin,
  })

  // ── Current stock for badge display
  const { data: currentStock = [] } = useQuery({
    queryKey: ['current-stock', branchId],
    queryFn: () => getCurrentStock(branchId ? { branchId } : undefined),
  })

  const selectedProduct = allProducts.find((p: any) => p.id === productId)
  const requiresSerials = selectedProduct?.hasSerialNumbers === true

  // ── Available serials — fetch only when needed
  const { data: availableSerials = [], isLoading: serialsLoading } = useQuery({
    queryKey: ['available-serials', productId, branchId],
    queryFn: () => getAvailableSerials(productId, branchId || undefined),
    enabled: !!productId && requiresSerials && (!!branchId || !isSuperAdmin),
  })

  // Reset on product/branch change
  useEffect(() => {
    setSelectedSerialIds([])
    setSerialSearch('')
  }, [productId, branchId])

  // ── Filtered product list
  const filteredProducts = useMemo(() => {
    const q = productSearch.toLowerCase()
    if (!q) return allProducts
    return allProducts.filter((p: any) =>
      p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    )
  }, [allProducts, productSearch])

  // ── Filtered serials by search
  const filteredSerials = useMemo(() => {
    if (!serialSearch) return availableSerials
    return (availableSerials as any[]).filter((s: any) =>
      s.serialNumber.toLowerCase().includes(serialSearch.toLowerCase())
    )
  }, [availableSerials, serialSearch])

  const stockForProduct = (pid: string) =>
    (currentStock as any[]).find((s: any) => s.productId === pid)?.currentStock ?? null

  const toggleSerial = (id: string) => {
    setSelectedSerialIds(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  const selectAll = () => {
    setSelectedSerialIds((filteredSerials as any[]).map((s: any) => s.id))
  }

  const clearAll = () => setSelectedSerialIds([])

  const mutation = useMutation({
    mutationFn: (p: StockOutPayload) => stockOut(p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stock-history'] })
      qc.invalidateQueries({ queryKey: ['current-stock'] })
      qc.invalidateQueries({ queryKey: ['available-serials'] })
      onClose()
    },
    onError: (e: any) => setError(e?.response?.data?.message || 'Stock out failed.'),
  })

  const handleSubmit = () => {
    setError('')
    if (!productId) return setError('Please select a product.')
    if (!branchId) return setError('Please select a branch.')
    if (!sellingPrice) return setError('Selling price is required.')
    if (requiresSerials && selectedSerialIds.length === 0)
      return setError('Please select serial numbers for this product.')
    if (requiresSerials && selectedSerialIds.length !== Number(quantity))
      return setError(`You selected ${selectedSerialIds.length} serial(s) but quantity is ${quantity}.`)

    mutation.mutate({
      productId, branchId,
      quantity: requiresSerials ? selectedSerialIds.length : Number(quantity),
      sellingPrice: Number(sellingPrice),
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
      serialNumberIds: requiresSerials ? selectedSerialIds : undefined,
      notes: notes || undefined,
      date: date || undefined,
    })
  }

  const stockCount = productId ? stockForProduct(productId) : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[93vh] flex flex-col">

        {/* ── Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center">
              <ArrowUpCircle size={18} className="text-rose-500" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Stock Out</h2>
              <p className="text-xs text-gray-400">Record outgoing inventory / sale</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* ── Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">

          {/* ── Product — searchable dropdown */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Product <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(o => !o)}
                className={`w-full flex items-center justify-between border rounded-xl px-3.5 py-2.5 text-sm text-left transition-all focus:outline-none
                  ${productId ? 'border-rose-300 ring-2 ring-rose-300/20 text-gray-900' : 'border-gray-200 text-gray-400'}
                  ${dropdownOpen ? 'border-rose-300 ring-2 ring-rose-300/20' : ''}`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {selectedProduct ? (
                    <>
                      <Package size={14} className="text-gray-400 flex-shrink-0" />
                      <span className="truncate text-gray-900">{selectedProduct.name} — {selectedProduct.sku}</span>
                      {stockCount !== null && (
                        <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-semibold ${
                          stockCount <= (selectedProduct.minStockAlert || 5)
                            ? 'bg-red-100 text-red-600'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {stockCount} left
                        </span>
                      )}
                    </>
                  ) : (
                    <span>Select product…</span>
                  )}
                </div>
                <ChevronDown size={16} className={`text-gray-400 flex-shrink-0 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute z-20 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                    <div className="p-2 border-b border-gray-100">
                      <div className="relative">
                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                        <input
                          autoFocus
                          type="text"
                          placeholder="Search product or SKU…"
                          value={productSearch}
                          onChange={e => setProductSearch(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400/30"
                        />
                      </div>
                    </div>
                    <div className="max-h-52 overflow-y-auto divide-y divide-gray-50">
                      {filteredProducts.length === 0 ? (
                        <p className="px-4 py-4 text-sm text-gray-400 text-center">No products found</p>
                      ) : (
                        filteredProducts.map((p: any) => {
                          const stock = stockForProduct(p.id)
                          return (
                            <button key={p.id} type="button"
                              onClick={() => { setProductId(p.id); setDropdownOpen(false); setProductSearch('') }}
                              className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 text-left transition-colors
                                ${productId === p.id ? 'bg-rose-50' : ''}`}>
                              <div>
                                <p className="text-sm text-gray-900 font-medium">{p.name}</p>
                                <p className="text-xs text-gray-400 flex items-center gap-1.5">
                                  {p.sku}
                                  {p.hasSerialNumbers && (
                                    <span className="inline-flex items-center gap-0.5 text-amber-600">
                                      <ScanLine size={10} /> Serial
                                    </span>
                                  )}
                                </p>
                              </div>
                              {stock !== null && (
                                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${
                                  stock === 0 ? 'bg-red-100 text-red-600' :
                                  stock <= (p.minStockAlert || 5) ? 'bg-amber-100 text-amber-700' :
                                  'bg-emerald-100 text-emerald-700'
                                }`}>
                                  {stock} left
                                </span>
                              )}
                            </button>
                          )
                        })
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            {selectedProduct?.hasSerialNumbers && (
              <p className="mt-1 text-xs text-amber-600 flex items-center gap-1">
                <ScanLine size={11} /> Serial selection required for this product
              </p>
            )}
          </div>

          {/* Qty + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number" min={1}
                value={requiresSerials ? selectedSerialIds.length : quantity}
                readOnly={requiresSerials}
                onChange={e => !requiresSerials && setQuantity(Number(e.target.value))}
                className={`w-full border rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-400/30 focus:border-rose-400 transition-all
                  ${requiresSerials ? 'bg-gray-50 border-gray-100 text-gray-500 cursor-not-allowed' : 'border-gray-200'}`}
              />
              {requiresSerials && (
                <p className="mt-0.5 text-xs text-gray-400">Auto-set by serial selection</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-400/30 focus:border-rose-400 transition-all" />
            </div>
          </div>

          {/* Branch */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Branch</label>
              {isSuperAdmin ? (
                <select value={branchId} onChange={e => setBranchId(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-400/30 focus:border-rose-400 transition-all">
                  <option value="">Select branch…</option>
                  {branches.map((b: any) => (
                    <option key={b.id} value={b.id}>{b.name}{b.isMainBranch ? ' (Main)' : ''}</option>
                  ))}
                </select>
              ) : (
                <input readOnly value={user?.branch?.name || 'My Branch'}
                  className="w-full border border-gray-100 rounded-xl px-3.5 py-2.5 text-sm text-gray-500 bg-gray-50 cursor-not-allowed" />
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Selling Price (₹) <span className="text-red-500">*</span>
              </label>
              <input type="number" min={0} placeholder="0.00"
                value={sellingPrice} onChange={e => setSellingPrice(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-400/30 focus:border-rose-400 transition-all" />
            </div>
          </div>

          {/* Customer */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Customer Name</label>
              <input type="text" placeholder="Optional"
                value={customerName} onChange={e => setCustomerName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-400/30 focus:border-rose-400 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Customer Phone</label>
              <input type="text" placeholder="Optional"
                value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-400/30 focus:border-rose-400 transition-all" />
            </div>
          </div>

          {/* ── SERIAL NUMBER SELECTION — only when hasSerialNumbers */}
          {requiresSerials && productId && (
            <div className="border border-dashed border-rose-200 bg-rose-50/30 rounded-2xl p-4 space-y-3">

              {/* Header row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ScanLine size={14} className="text-rose-500" />
                  <span className="text-sm font-semibold text-gray-700">Select Serial Numbers</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    selectedSerialIds.length === 0 ? 'bg-gray-100 text-gray-500' :
                    selectedSerialIds.length < quantity ? 'bg-amber-100 text-amber-700' :
                    'bg-rose-100 text-rose-700'
                  }`}>
                    {selectedSerialIds.length} selected
                  </span>
                </div>
              </div>

              {serialsLoading ? (
                <div className="flex items-center justify-center py-6 gap-2 text-gray-400">
                  <Loader2 size={14} className="animate-spin" />
                  <span className="text-sm">Loading serials…</span>
                </div>
              ) : availableSerials.length === 0 ? (
                <div className="text-center py-5 text-sm text-gray-400">
                  <ScanLine size={20} className="mx-auto mb-1.5 text-gray-200" />
                  No available serial numbers for this product
                </div>
              ) : (
                <>
                  {/* Search + bulk actions */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                      <input
                        type="text"
                        placeholder="Search serial…"
                        value={serialSearch}
                        onChange={e => setSerialSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400/30 focus:border-rose-400 transition-all font-mono"
                      />
                    </div>
                    <button type="button" onClick={selectAll}
                      className="px-3 py-2 text-xs font-semibold text-rose-600 bg-white border border-rose-200 rounded-xl hover:bg-rose-50 transition-colors">
                      All
                    </button>
                    <button type="button" onClick={clearAll}
                      className="px-3 py-2 text-xs font-semibold text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                      Clear
                    </button>
                  </div>

                  {/* Serial list */}
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-0.5">
                    {filteredSerials.length === 0 ? (
                      <p className="text-center text-xs text-gray-400 py-3">No matching serials</p>
                    ) : (
                      (filteredSerials as any[]).map((s: any) => {
                        const checked = selectedSerialIds.includes(s.id)
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => toggleSerial(s.id)}
                            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl border text-left transition-all active:scale-[0.99]
                              ${checked
                                ? 'bg-rose-50 border-rose-200 ring-1 ring-rose-200'
                                : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                              }`}
                          >
                            {checked
                              ? <CheckSquare size={16} className="text-rose-500 flex-shrink-0" />
                              : <Square size={16} className="text-gray-300 flex-shrink-0" />
                            }
                            <span className={`text-sm font-mono flex-1 tracking-wide ${checked ? 'text-gray-900' : 'text-gray-600'}`}>
                              {s.serialNumber}
                            </span>
                            {checked && (
                              <span className="text-xs text-rose-500 font-semibold">✓</span>
                            )}
                          </button>
                        )
                      })
                    )}
                  </div>

                  <p className="text-xs text-gray-400 text-center">
                    {availableSerials.length} available · {selectedSerialIds.length} selected
                  </p>
                </>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Notes</label>
            <input type="text" placeholder="Optional note"
              value={notes} onChange={e => setNotes(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-400/30 focus:border-rose-400 transition-all" />
          </div>

          {error && (
            <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>

        {/* ── Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <button type="button" onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-all">
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} disabled={mutation.isPending}
            className="flex-1 px-4 py-2.5 bg-rose-500 hover:bg-rose-400 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95">
            {mutation.isPending
              ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
              : 'Stock Out'
            }
          </button>
        </div>
      </div>
    </div>
  )
}