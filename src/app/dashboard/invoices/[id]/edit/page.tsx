'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getInvoiceById, updateInvoice } from '@/services/invoice.service'
import type { CreateInvoicePayload, Invoice } from '@/types/invoices.types'
import { productsService } from '@/services/products.service'
import { serialService } from '@/services/serial.service'
import { useAuthStore } from '@/store/auth.store'
import type { Product } from '@/types/products.types'
import type { SerialNumber } from '@/types/serial.types'
import settingsService from '@/services/settings.service'
import {
  Plus, Trash2, Search, ChevronLeft, Loader2, X, Hash,
  ChevronDown, ChevronUp,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────
interface LineItem {
  productId: string
  productName: string
  sku: string
  quantity: number
  sellingPrice: number
  gstRate: number
  hasSerialNumbers: boolean
  availableSerials: SerialNumber[]
  serialsLoading: boolean
  selectedSerialIds: string[]
  showSerials: boolean
}

const emptyItem = (): LineItem => ({
  productId: '', productName: '', sku: '',
  quantity: 1, sellingPrice: 0, gstRate: 18,
  hasSerialNumbers: false,
  availableSerials: [], serialsLoading: false,
  selectedSerialIds: [], showSerials: false,
})

const inputCls = `w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg
  bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white
  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors`

// ═════════════════════════════════════════════════════════════════════════════
export default function EditInvoicePage() {
  const router  = useRouter()
  const { id }  = useParams<{ id: string }>()
  const { user } = useAuthStore()

  // ── Page state ────────────────────────────────────────────────────────────
  const [pageLoading, setPageLoading] = useState(true)
  const [invoice,     setInvoice]     = useState<Invoice | null>(null)

  // ── Form fields ───────────────────────────────────────────────────────────
  const [customerName,    setCustomerName]    = useState('')
  const [customerPhone,   setCustomerPhone]   = useState('')
  const [customerEmail,   setCustomerEmail]   = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [customerGST,     setCustomerGST]     = useState('')
  const [date,     setDate]     = useState(new Date().toISOString().split('T')[0])
  const [discount, setDiscount] = useState(0)
  const [notes,    setNotes]    = useState('')

  const [items, setItems] = useState<LineItem[]>([emptyItem()])

  // ── Product search state ──────────────────────────────────────────────────
  const [productSearch,  setProductSearch]  = useState<string[]>([''])
  const [productResults, setProductResults] = useState<Product[][]>([[]])
  const [showDropdown,   setShowDropdown]   = useState<boolean[]>([false])
  const [dropLoading,    setDropLoading]    = useState<boolean[]>([false])
  const searchTimers = useRef<ReturnType<typeof setTimeout>[]>([])

  // ── Payment modes ─────────────────────────────────────────────────────────
  const [paymentModes, setPaymentModes] = useState<string[]>(['Cash'])
  const [paymentMode,  setPaymentMode]  = useState('Cash')

  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState('')

  const fmt = (n: number) => new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2 }).format(n)

  // ── Load payment modes ────────────────────────────────────────────────────
  useEffect(() => {
    settingsService.getSettings(user?.branchId ?? null)
      .then(s => {
        if ((s as any).customPaymentModes?.length) {
          setPaymentModes((s as any).customPaymentModes)
        }
      })
      .catch(() => {})
  }, [user?.branchId])

  // ── Load existing invoice & pre-fill form ─────────────────────────────────
  useEffect(() => {
    if (!id) return

    getInvoiceById(id)
      .then(async (inv) => {
        setInvoice(inv)

        // ── Basic fields ──
        setCustomerName(inv.customerName ?? '')
        setCustomerPhone(inv.customerPhone ?? '')
        setCustomerEmail(inv.customerEmail ?? '')
        setCustomerAddress(inv.customerAddress ?? '')
        setCustomerGST(inv.customerGST ?? '')
        setDiscount(inv.discount ?? 0)
        setNotes(inv.notes ?? '')
        setPaymentMode(inv.paymentMode ?? 'Cash')

        // Date — backend returns ISO string, input[type=date] needs YYYY-MM-DD
        if (inv.date) {
          setDate(new Date(inv.date).toISOString().split('T')[0])
        }

        // ── Pre-fill line items from existing stockOuts ────────────────────
        // For each stockOut:
        //   1. productId is directly on stockOut record
        //   2. For serial-tracked products, fetch available serials PLUS
        //      re-add already-sold serials so they appear selected
        const preFilledItems: LineItem[] = []
        const preFilledSearch: string[]  = []

        for (const so of inv.stockOuts) {
          const alreadySelectedIds = so.serialNumbers.map(sn => sn.id)
          const hasSerials = alreadySelectedIds.length > 0 || so.serialNumbers.length > 0

          // Fetch AVAILABLE serials for this product so user can change selection
          let availableSerials: SerialNumber[] = []
        if (hasSerials && so.productId) {
            try {
              // getAvailable returns only AVAILABLE status serials
              const avail = await serialService.getAvailable(so.productId, user?.branchId ?? undefined)

              // Merge: available serials + already-used serials (currently SOLD)
              // so that existing selection stays visible and checked
              const alreadyUsedAsSerialNumbers: SerialNumber[] = so.serialNumbers.map(sn => ({
                id: sn.id,
                serialNumber: sn.serialNumber,
                status: 'SOLD' as const,  // currently sold — will be freed on update
                productId: so.productId ?? '', 
                branchId: user?.branchId ?? '',
                createdAt: '',
                updatedAt: '',
              }))

              // Deduplicate: avail may not contain SOLD ones, so just concat
              availableSerials = [...alreadyUsedAsSerialNumbers, ...avail]
            } catch {
              // If fetch fails, at least show already-selected serials
              availableSerials = so.serialNumbers.map(sn => ({
                id: sn.id,
                serialNumber: sn.serialNumber,
                status: 'SOLD' as const,
                productId: so.productId ?? '', 
                branchId: user?.branchId ?? '',
                createdAt: '',
                updatedAt: '',
              }))
            }
          }

        preFilledItems.push({
  productId:         so.productId ?? '',   // ✅ null → empty string
  productName:       so.product?.name ?? so.productName ?? '',  // ✅ optional chaining
  sku:               '',
  quantity:          so.quantity,
  sellingPrice:      so.sellingPrice,
  gstRate:           so.product?.gstRate ?? 18,   // ✅ optional chaining
  hasSerialNumbers:  hasSerials,
  availableSerials,
  serialsLoading:    false,
  selectedSerialIds: alreadySelectedIds,
  showSerials:       hasSerials,
})
          preFilledSearch.push(so.product?.name ?? so.productName ?? '')
        }

        setItems(preFilledItems)
        setProductSearch(preFilledSearch)
        setProductResults(preFilledItems.map(() => []))
        setShowDropdown(preFilledItems.map(() => false))
        setDropLoading(preFilledItems.map(() => false))
      })
      .catch(() => {
        setError('Failed to load invoice.')
      })
      .finally(() => setPageLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // ── Derived totals ────────────────────────────────────────────────────────
  const subtotal  = items.reduce((s, it) => s + it.sellingPrice * it.quantity, 0)
  const gstAmount = items.reduce((s, it) => s + (it.sellingPrice * it.quantity * it.gstRate) / 100, 0)
  const total     = subtotal + gstAmount - discount

  // ── Product search handlers ───────────────────────────────────────────────
  const fetchProducts = useCallback(async (query: string, idx: number) => {
    setDropLoading(prev => { const n = [...prev]; n[idx] = true; return n })
    try {
      const res = await productsService.getAll({ search: query || undefined, limit: 20 })
      setProductResults(prev => { const n = [...prev]; n[idx] = res.products ?? []; return n })
    } catch {
      setProductResults(prev => { const n = [...prev]; n[idx] = []; return n })
    } finally {
      setDropLoading(prev => { const n = [...prev]; n[idx] = false; return n })
    }
  }, [])

  const handleSearchChange = (idx: number, val: string) => {
    setProductSearch(prev => { const n = [...prev]; n[idx] = val; return n })
    setShowDropdown(prev => { const n = [...prev]; n[idx] = true; return n })
    clearTimeout(searchTimers.current[idx])
    searchTimers.current[idx] = setTimeout(() => fetchProducts(val, idx), 300)
  }

  const handleFocus = (idx: number) => {
    setShowDropdown(prev => { const n = [...prev]; n[idx] = true; return n })
    if ((productResults[idx] ?? []).length === 0) {
      fetchProducts(productSearch[idx] ?? '', idx)
    }
  }

  const handleBlur = (idx: number) => {
    setTimeout(() => {
      setShowDropdown(prev => { const n = [...prev]; n[idx] = false; return n })
    }, 200)
  }

  // Product select → fetch available serials for that product
  const selectProduct = async (idx: number, product: Product) => {
    setItems(prev => {
      const n = [...prev]
      n[idx] = {
        ...n[idx],
        productId:         product.id,
        productName:       product.name,
        sku:               product.sku,
        sellingPrice:      product.sellingPrice ?? 0,
        gstRate:           product.gstRate,
        hasSerialNumbers:  product.hasSerialNumbers,
        selectedSerialIds: [],
        availableSerials:  [],
        showSerials:       product.hasSerialNumbers,
        serialsLoading:    product.hasSerialNumbers,
      }
      return n
    })
    setProductSearch(prev => { const n = [...prev]; n[idx] = product.name; return n })
    setShowDropdown(prev => { const n = [...prev]; n[idx] = false; return n })

    if (product.hasSerialNumbers) {
      try {
        const serials = await serialService.getAvailable(product.id, user?.branchId ?? undefined)
        setItems(prev => {
          const n = [...prev]
          n[idx] = { ...n[idx], availableSerials: serials, serialsLoading: false }
          return n
        })
      } catch {
        setItems(prev => {
          const n = [...prev]
          n[idx] = { ...n[idx], serialsLoading: false }
          return n
        })
      }
    }
  }

  const toggleSerial = (itemIdx: number, serialId: string) => {
    setItems(prev => {
      const n    = [...prev]
      const item = n[itemIdx]
      const has  = item.selectedSerialIds.includes(serialId)
      const updated = has
        ? item.selectedSerialIds.filter(id => id !== serialId)
        : [...item.selectedSerialIds, serialId]
      n[itemIdx] = { ...item, selectedSerialIds: updated, quantity: updated.length || 1 }
      return n
    })
  }

  const addRow = () => {
    setItems(p => [...p, emptyItem()])
    setProductSearch(p => [...p, ''])
    setProductResults(p => [...p, []])
    setShowDropdown(p => [...p, false])
    setDropLoading(p => [...p, false])
  }

  const removeRow = (idx: number) => {
    if (items.length === 1) return
    setItems(p => p.filter((_, i) => i !== idx))
    setProductSearch(p => p.filter((_, i) => i !== idx))
    setProductResults(p => p.filter((_, i) => i !== idx))
    setShowDropdown(p => p.filter((_, i) => i !== idx))
    setDropLoading(p => p.filter((_, i) => i !== idx))
  }

  const updateItem = (idx: number, field: keyof LineItem, val: number) => {
    setItems(prev => { const n = [...prev]; n[idx] = { ...n[idx], [field]: val }; return n })
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setError('')
    if (!customerName.trim()) { setError('Customer name is required.'); return }
    if (items.some(it => !it.productId)) { setError('Please select a product for all rows.'); return }
    if (items.some(it => it.hasSerialNumbers && it.selectedSerialIds.length === 0)) {
      setError('Select serial numbers for all serial-tracked products.'); return
    }

    setSubmitting(true)
    try {
      const payload: CreateInvoicePayload = {
        branchId: invoice?.branchId ?? user?.branchId ?? '',
        customerName, customerPhone, customerEmail, customerAddress,
        customerGST: customerGST || undefined,
        date, discount,
        notes:       notes || undefined,
        paymentMode,
        items: items.map(it => ({
          productId:       it.productId,
          quantity:        it.quantity,
          sellingPrice:    it.sellingPrice,
          serialNumberIds: it.selectedSerialIds.length ? it.selectedSerialIds : undefined,
        })),
      }
      await updateInvoice(id, payload)
      router.push(`/dashboard/invoices/${id}`)
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to update invoice.')
      setSubmitting(false)
    }
  }

  // ── Loading / not-found states ────────────────────────────────────────────
  if (pageLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <Loader2 className="animate-spin text-indigo-600" size={32} />
    </div>
  )

  if (!invoice) return (
    <div className="min-h-screen flex items-center justify-center text-gray-500 dark:text-gray-400">
      Invoice not found.
    </div>
  )

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6">

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Invoice</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              #{invoice.invoiceNumber} — editing will recalculate stock
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200
            dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
            <X size={15} className="flex-shrink-0" />{error}
          </div>
        )}

        <div className="space-y-4">

          {/* Invoice date */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">
              Invoice Details
            </h2>
            <div className="w-52">
              <label className="block text-xs font-medium text-gray-500 mb-1">Invoice Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          {/* Customer */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">
              Customer Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Name *',     val: customerName,    fn: setCustomerName,    ph: 'Customer name' },
                { label: 'Phone',      val: customerPhone,   fn: setCustomerPhone,   ph: 'Phone number' },
                { label: 'Email',      val: customerEmail,   fn: setCustomerEmail,   ph: 'Email (optional)' },
                { label: 'GST Number', val: customerGST,     fn: setCustomerGST,     ph: 'GSTIN (optional)' },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-xs font-medium text-gray-500 mb-1">{f.label}</label>
                  <input
                    value={f.val}
                    onChange={e => f.fn(e.target.value)}
                    placeholder={f.ph}
                    className={inputCls}
                  />
                </div>
              ))}
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Address</label>
                <textarea
                  value={customerAddress}
                  onChange={e => setCustomerAddress(e.target.value)}
                  placeholder="Customer address"
                  rows={2}
                  className={`${inputCls} resize-none`}
                />
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">
              Items
            </h2>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-visible">

                  {/* Row */}
                  <div
                    className="grid gap-3 p-3 items-start"
                    style={{ gridTemplateColumns: '1fr 70px 110px 70px 100px 36px' }}
                  >
                    {/* Product search */}
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Product</label>
                      <div className="relative">
                        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
                        <input
                          value={productSearch[idx] ?? ''}
                          onChange={e => handleSearchChange(idx, e.target.value)}
                          onFocus={() => handleFocus(idx)}
                          onBlur={() => handleBlur(idx)}
                          placeholder="Search product..."
                          className={`${inputCls} pl-8`}
                        />
                        {showDropdown[idx] && (
                          <div className="absolute z-[100] top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800
                            border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                            {dropLoading[idx] ? (
                              <div className="flex items-center gap-2 px-3 py-4 text-xs text-gray-400">
                                <Loader2 size={13} className="animate-spin" /> Loading...
                              </div>
                            ) : (productResults[idx] ?? []).length === 0 ? (
                              <div className="px-3 py-4 text-xs text-gray-400 text-center">No products found</div>
                            ) : (
                              (productResults[idx] ?? []).map(p => (
                                <div
                                  key={p.id}
                                  onMouseDown={() => selectProduct(idx, p)}
                                  className="px-3 py-2.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/30
                                    cursor-pointer border-b border-gray-50 dark:border-gray-700/50 last:border-0"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-900 dark:text-white text-sm">{p.name}</span>
                                    {p.hasSerialNumbers && (
                                      <span className="flex items-center gap-0.5 text-[10px] bg-amber-100 dark:bg-amber-900/40
                                        text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full font-semibold">
                                        <Hash size={9} /> Serial
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-400 mt-0.5">
                                    {p.sku} · ₹{fmt(p.sellingPrice ?? 0)} · GST {p.gstRate}%
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                      {item.sku && (
                        <div className="mt-1 text-xs text-gray-400 pl-1 truncate">{item.sku}</div>
                      )}
                    </div>

                    {/* Qty */}
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Qty</label>
                      <input
                        type="number" min={1}
                        value={item.quantity}
                        disabled={item.hasSerialNumbers}
                        onChange={e => updateItem(idx, 'quantity', Number(e.target.value))}
                        className={`${inputCls} text-center disabled:opacity-60 disabled:cursor-not-allowed`}
                      />
                    </div>

                    {/* Rate */}
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Rate (₹)</label>
                      <input
                        type="number" min={0} step="0.01"
                        value={item.sellingPrice}
                        onChange={e => updateItem(idx, 'sellingPrice', Number(e.target.value))}
                        className={inputCls}
                      />
                    </div>

                    {/* GST% */}
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">GST%</label>
                      <input
                        type="number" min={0}
                        value={item.gstRate}
                        onChange={e => updateItem(idx, 'gstRate', Number(e.target.value))}
                        className={`${inputCls} text-center`}
                      />
                    </div>

                    {/* Amount */}
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Amount</label>
                      <div className="py-2 text-sm font-semibold text-gray-900 dark:text-white text-right pr-1">
                        ₹{fmt(item.sellingPrice * item.quantity)}
                      </div>
                    </div>

                    {/* Remove */}
                    <div className="pt-5">
                      <button
                        onClick={() => removeRow(idx)}
                        disabled={items.length === 1}
                        className="p-1.5 text-gray-400 hover:text-red-500 disabled:opacity-30 transition-colors rounded"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Serial numbers */}
                  {item.hasSerialNumbers && item.productId && (
                    <div className="border-t border-amber-100 dark:border-amber-900/30 bg-amber-50/60 dark:bg-amber-900/10">
                      <button
                        onClick={() => setItems(prev => {
                          const n = [...prev]
                          n[idx] = { ...n[idx], showSerials: !n[idx].showSerials }
                          return n
                        })}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium
                          text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                      >
                        <span className="flex items-center gap-1.5">
                          <Hash size={13} />
                          Serial Numbers
                          {item.selectedSerialIds.length > 0 && (
                            <span className="rounded-full px-1.5 py-0.5 text-[10px] font-bold ml-1 text-white bg-amber-600">
                              {item.selectedSerialIds.length} selected
                            </span>
                          )}
                        </span>
                        {item.showSerials ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>

                      {item.showSerials && (
                        <div className="px-4 pb-3">
                          {item.serialsLoading ? (
                            <div className="flex items-center gap-2 py-3 text-xs text-gray-400">
                              <Loader2 size={13} className="animate-spin" /> Loading serials...
                            </div>
                          ) : item.availableSerials.length === 0 ? (
                            <div className="py-3 text-xs text-gray-400">No available serial numbers.</div>
                          ) : (
                            <div className="flex flex-wrap gap-2 pt-1">
                              {item.availableSerials.map(sn => {
                                const sel = item.selectedSerialIds.includes(sn.id)
                                // Highlight already-selected (originally sold) ones differently
                                const isOriginal = sn.status === 'SOLD'
                                return (
                                  <button
                                    key={sn.id}
                                    onClick={() => toggleSerial(idx, sn.id)}
                                    title={isOriginal ? 'Originally on this invoice' : ''}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium border transition-all
                                      ${sel
                                        ? 'bg-amber-600 border-amber-600 text-white shadow-sm'
                                        : isOriginal
                                          ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400'
                                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-amber-400'
                                      }`}
                                  >
                                    {sn.serialNumber}
                                  </button>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={addRow}
              className="mt-4 flex items-center gap-1.5 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 transition-colors"
            >
              <Plus size={15} /> Add Item
            </button>
          </div>

          {/* Notes + Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Notes</h2>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Any notes for this invoice..."
                rows={4}
                className={`${inputCls} resize-none`}
              />
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 flex flex-col gap-4">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span><span>₹{fmt(subtotal)}</span>
                </div>
                {items.filter(it => it.productId && it.gstRate > 0).map((it, i) => (
                  <div key={i} className="flex justify-between text-gray-500 dark:text-gray-500 text-xs pl-2">
                    <span className="truncate max-w-[160px]">GST {it.gstRate}% · {it.productName || 'Item'}</span>
                    <span>₹{fmt((it.sellingPrice * it.quantity * it.gstRate) / 100)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-gray-600 dark:text-gray-400 font-medium">
                  <span>Total GST</span>
                  <span className="text-orange-600 dark:text-orange-400">₹{fmt(gstAmount)}</span>
                </div>
                <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                  <span>Discount</span>
                  <input
                    type="number" min={0} step="0.01"
                    value={discount}
                    onChange={e => setDiscount(Number(e.target.value))}
                    className="w-28 px-2 py-1 text-right border border-gray-200 dark:border-gray-700 rounded-lg
                      bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white
                      focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="border-t border-gray-100 dark:border-gray-800 pt-2 flex justify-between font-bold text-gray-900 dark:text-white text-base">
                  <span>Total</span><span>₹{fmt(total)}</span>
                </div>
              </div>

              {/* Payment mode */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Paid Via</p>
                <div className="relative">
                  <select
                    value={paymentMode}
                    onChange={e => setPaymentMode(e.target.value)}
                    className="w-full appearance-none px-3 py-2.5 text-sm rounded-lg border border-gray-200
                      dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white
                      focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer pr-8"
                  >
                    {paymentModes.map(mode => (
                      <option key={mode} value={mode}>{mode}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pb-6">
            <button
              onClick={() => router.back()}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900
                border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white
                bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-60"
            >
              {submitting && <Loader2 size={15} className="animate-spin" />}
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}