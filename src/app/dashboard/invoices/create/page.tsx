'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createInvoice } from '@/services/invoice.service'
import type { CreateInvoicePayload } from '@/types/invoices.types'
import { productsService } from '@/services/products.service'
import { serialService } from '@/services/serial.service'
import { dealersService } from '@/services/dealers.service'
import { useAuthStore } from '@/store/auth.store'
import type { Product } from '@/types/products.types'
import type { SerialNumber } from '@/types/serial.types'
import type { Dealer } from '@/types/dealers.types'
import {
  Plus, Trash2, Search, ChevronLeft, Loader2, X, Hash,
  ChevronDown, ChevronUp, CreditCard, Banknote, Smartphone,
  Building2, CheckCircle2, AlertCircle,
} from 'lucide-react'

// ── Types ────────────────────────────────────────────────────────────────────
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
  // dealer invoice mode mein serials dealer ke assigned hain
  isDealerSerial?: boolean
}

type PaymentMode = 'CASH' | 'UPI' | 'CARD'

const emptyItem = (): LineItem => ({
  productId: '', productName: '', sku: '',
  quantity: 1, sellingPrice: 0, gstRate: 18,
  hasSerialNumbers: false,
  availableSerials: [], serialsLoading: false,
  selectedSerialIds: [], showSerials: false,
  isDealerSerial: false,
})

const inputCls = `w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg
  bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white
  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors`

// ═════════════════════════════════════════════════════════════════════════════
export default function CreateInvoicePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuthStore()

  const dealerIdFromUrl = searchParams.get('dealerId')

  const [dealers,          setDealers]          = useState<Dealer[]>([])
  const [dealersLoading,   setDealersLoading]   = useState(false)
  const [selectedDealerId, setSelectedDealerId] = useState<string>(dealerIdFromUrl ?? '')
  const [selectedDealer,   setSelectedDealer]   = useState<Dealer | null>(null)
  const [dealerSearch,     setDealerSearch]      = useState('')
  const [showDealerDrop,   setShowDealerDrop]   = useState(false)
  const [unbilledLoading,  setUnbilledLoading]  = useState(false)

  // Dealer mode mein product search band rehta hai — sirf dealer ke products show honge
  const isDealerMode = !!selectedDealerId

  const [customerName,    setCustomerName]    = useState('')
  const [customerPhone,   setCustomerPhone]   = useState('')
  const [customerEmail,   setCustomerEmail]   = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [customerGST,     setCustomerGST]     = useState('')
  const [date,    setDate]    = useState(new Date().toISOString().split('T')[0])
  const [discount, setDiscount] = useState(0)
  const [notes,   setNotes]   = useState('')
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('CASH')

  const [items, setItems] = useState<LineItem[]>([emptyItem()])

  // Product search state — sirf non-dealer mode mein use hota hai
  const [productSearch,  setProductSearch]  = useState<string[]>([''])
  const [productResults, setProductResults] = useState<Product[][]>([[]])
  const [showDropdown,   setShowDropdown]   = useState<boolean[]>([false])
  const [dropLoading,    setDropLoading]    = useState<boolean[]>([false])
  const searchTimers = useRef<ReturnType<typeof setTimeout>[]>([])

  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState('')

  // Load dealers
  useEffect(() => {
    setDealersLoading(true)
    dealersService.getAll({ limit: 200 })
      .then(res => setDealers(res.data ?? []))
      .catch(() => {})
      .finally(() => setDealersLoading(false))
  }, [])

  // URL se dealerId aaya hai toh auto-load
  useEffect(() => {
    if (!dealerIdFromUrl) return
    dealersService.getById(dealerIdFromUrl)
      .then(res => {
        const d = res.data
        setSelectedDealer(d)
        setSelectedDealerId(d.id)
        setDealerSearch(d.name)
        prefillCustomerFromDealer(d)
        loadDealerUnbilledStock(d.id)
      })
      .catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dealerIdFromUrl])

  const prefillCustomerFromDealer = (d: Dealer) => {
    setCustomerName(d.name)
    setCustomerPhone(d.phone ?? '')
    setCustomerEmail(d.email ?? '')
    setCustomerAddress(d.address ?? '')
    setCustomerGST(d.gstNumber ?? '')
  }

  // Dealer ke unbilled products fetch karo aur items mein pre-fill karo
  // Ye sirf dealer mode mein call hota hai
  const loadDealerUnbilledStock = async (dealerId: string) => {
    setUnbilledLoading(true)
    try {
      const res = await dealersService.getUnbilledStock(dealerId)
      const products = res?.data?.products ?? []

      if (!products.length) {
        // Koi unbilled stock nahi — empty state
        setItems([emptyItem()])
        setProductSearch([''])
        setProductResults([[]])
        setShowDropdown([false])
        setDropLoading([false])
        return
      }

      // Dealer ke UNBILLED serials wale products — pre-fill with all serials selected
      const preFilledItems: LineItem[] = products.map((p: any) => ({
        productId:         p.productId,
        productName:       p.productName,
        sku:               p.sku,
        quantity:          p.quantity,          // = unbilled serials count
        sellingPrice:      p.sellingPrice,
        gstRate:           p.gstRate ?? 18,
        hasSerialNumbers:  p.hasSerialNumbers,
        // Dealer ke UNBILLED serials — sab pre-selected
        selectedSerialIds: p.serials.map((s: any) => s.id),
        availableSerials:  p.serials.map((s: any) => ({
          id: s.id,
          serialNumber: s.serialNumber,
          status: 'TRANSFERRED' as const,
          productId: p.productId,
          branchId: '',
          createdAt: '',
          updatedAt: '',
        })),
        serialsLoading: false,
        showSerials:    p.hasSerialNumbers,
        isDealerSerial: true,   // flag: ye serials dealer ke hain, branch ke nahi
      }))

      setItems(preFilledItems)
      setProductSearch(preFilledItems.map(i => i.productName))
      setProductResults(preFilledItems.map(() => []))
      setShowDropdown(preFilledItems.map(() => false))
      setDropLoading(preFilledItems.map(() => false))
    } catch {
      // silently fail
    } finally {
      setUnbilledLoading(false)
    }
  }

  const handleSelectDealer = (dealer: Dealer) => {
    setSelectedDealer(dealer)
    setSelectedDealerId(dealer.id)
    setDealerSearch(dealer.name)
    setShowDealerDrop(false)
    prefillCustomerFromDealer(dealer)
    loadDealerUnbilledStock(dealer.id)
  }

  const clearDealer = () => {
    setSelectedDealer(null)
    setSelectedDealerId('')
    setDealerSearch('')
    setCustomerName('')
    setCustomerPhone('')
    setCustomerEmail('')
    setCustomerAddress('')
    setCustomerGST('')
    // Normal mode mein wapas — empty item with product search
    setItems([emptyItem()])
    setProductSearch([''])
    setProductResults([[]])
    setShowDropdown([false])
    setDropLoading([false])
  }

  const filteredDealers = dealers.filter(d =>
    d.name.toLowerCase().includes(dealerSearch.toLowerCase()) ||
    (d.phone ?? '').includes(dealerSearch)
  )

  const subtotal  = items.reduce((s, it) => s + it.sellingPrice * it.quantity, 0)
  const gstAmount = items.reduce((s, it) => s + (it.sellingPrice * it.quantity * it.gstRate) / 100, 0)
  const total     = subtotal + gstAmount - discount
  const fmt = (n: number) => new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2 }).format(n)

  // ── Normal (non-dealer) mode ke liye product search ──────────────────────
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

  // ── Normal mode: product select → AVAILABLE branch serials fetch ──────────
  // Dealer mode mein ye call nahi hota — serials already pre-filled hain
  const selectProduct = async (idx: number, product: Product) => {
    setItems(prev => {
      const n = [...prev]
      n[idx] = {
        ...n[idx],
        productId:         product.id,
        productName:       product.name,
        sku:               product.sku,
        sellingPrice:      product.sellingPrice,
        gstRate:           product.gstRate,
        hasSerialNumbers:  product.hasSerialNumbers,
        selectedSerialIds: [],
        availableSerials:  [],
        showSerials:       product.hasSerialNumbers,
        serialsLoading:    product.hasSerialNumbers,
        isDealerSerial:    false,
      }
      return n
    })
    setProductSearch(prev => { const n = [...prev]; n[idx] = product.name; return n })
    setShowDropdown(prev => { const n = [...prev]; n[idx] = false; return n })

    if (product.hasSerialNumbers) {
      try {
        // Customer invoice → sirf AVAILABLE branch serials (dealer ke TRANSFERRED nahi)
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
      const n = [...prev]
      const item = n[itemIdx]
      const has = item.selectedSerialIds.includes(serialId)
      const updated = has
        ? item.selectedSerialIds.filter(id => id !== serialId)
        : [...item.selectedSerialIds, serialId]
      n[itemIdx] = { ...item, selectedSerialIds: updated, quantity: updated.length || 1 }
      return n
    })
  }

  // Dealer mode mein new row add nahi hota — sirf dealer ke products
  const addRow = () => {
    if (isDealerMode) return
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
        branchId: user?.branchId ?? '',
        customerName, customerPhone, customerEmail, customerAddress,
        customerGST: customerGST || undefined,
        date, discount,
        notes: notes || undefined,
        paymentMode,
        // Dealer mode mein dealerId pass karo — backend dealer invoice path use karega
        ...(selectedDealerId && { dealerId: selectedDealerId }),
        items: items.map(it => ({
          productId:       it.productId,
          quantity:        it.quantity,
          sellingPrice:    it.sellingPrice,
          serialNumberIds: it.selectedSerialIds.length ? it.selectedSerialIds : undefined,
        })),
      }
      const inv = await createInvoice(payload)
      router.push(`/dashboard/invoices/${inv.id}`)
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to create invoice.')
      setSubmitting(false)
    }
  }

  const paymentOptions: { value: PaymentMode; label: string; icon: React.ReactNode }[] = [
    { value: 'CASH', label: 'Cash',  icon: <Banknote size={15} /> },
    { value: 'UPI',  label: 'UPI',   icon: <Smartphone size={15} /> },
    { value: 'CARD', label: 'Card',  icon: <CreditCard size={15} /> },
  ]

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6">

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isDealerMode ? 'Create Dealer Invoice' : 'Create Invoice'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isDealerMode
                ? `Billing unbilled stock for ${selectedDealer?.name}`
                : 'Fill details and generate invoice'}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
            <X size={15} className="flex-shrink-0" />{error}
          </div>
        )}

        <div className="space-y-4">

          {/* Invoice date */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">Invoice Details</h2>
            <div className="w-52">
              <label className="block text-xs font-medium text-gray-500 mb-1">Invoice Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls} />
            </div>
          </div>

          {/* Dealer (optional) */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Building2 size={13} /> Dealer
                <span className="normal-case tracking-normal font-normal text-gray-400">
                  (optional — dealer select karo to unke unbilled products auto-fill honge)
                </span>
              </h2>
              {selectedDealer && (
                <button onClick={clearDealer} className="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1">
                  <X size={12} /> Clear
                </button>
              )}
            </div>

            {selectedDealer ? (
              <div className="flex items-center gap-3 px-4 py-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl">
                <CheckCircle2 size={16} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">{selectedDealer.name}</p>
                  {selectedDealer.phone && <p className="text-xs text-indigo-500">{selectedDealer.phone}</p>}
                </div>
                {unbilledLoading && (
                  <div className="flex items-center gap-1.5 text-xs text-indigo-500">
                    <Loader2 size={12} className="animate-spin" /> Loading unbilled stock...
                  </div>
                )}
              </div>
            ) : (
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
                <input
                  value={dealerSearch}
                  onChange={e => { setDealerSearch(e.target.value); setShowDealerDrop(true) }}
                  onFocus={() => setShowDealerDrop(true)}
                  onBlur={() => setTimeout(() => setShowDealerDrop(false), 200)}
                  placeholder={dealersLoading ? 'Loading dealers...' : 'Search dealer by name or phone...'}
                  disabled={dealersLoading}
                  className={`${inputCls} pl-9`}
                />
                {showDealerDrop && filteredDealers.length > 0 && (
                  <div className="absolute z-[100] top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800
                    border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl max-h-56 overflow-y-auto">
                    {filteredDealers.map(d => (
                      <div key={d.id} onMouseDown={() => handleSelectDealer(d)}
                        className="px-3 py-2.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 cursor-pointer
                          border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{d.name}</p>
                        {(d.phone || d.city) && (
                          <p className="text-xs text-gray-400 mt-0.5">{[d.phone, d.city].filter(Boolean).join(' · ')}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {showDealerDrop && dealerSearch && filteredDealers.length === 0 && (
                  <div className="absolute z-[100] top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800
                    border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg px-3 py-4 text-xs text-gray-400 text-center">
                    No dealers found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Customer */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">Customer Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Name *',     val: customerName,    fn: setCustomerName,    ph: 'Customer name' },
                { label: 'Phone',      val: customerPhone,   fn: setCustomerPhone,   ph: 'Phone number' },
                { label: 'Email',      val: customerEmail,   fn: setCustomerEmail,   ph: 'Email (optional)' },
                { label: 'GST Number', val: customerGST,     fn: setCustomerGST,     ph: 'GSTIN (optional)' },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-xs font-medium text-gray-500 mb-1">{f.label}</label>
                  <input value={f.val} onChange={e => f.fn(e.target.value)} placeholder={f.ph} className={inputCls} />
                </div>
              ))}
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Address</label>
                <textarea value={customerAddress} onChange={e => setCustomerAddress(e.target.value)}
                  placeholder="Customer address" rows={2} className={`${inputCls} resize-none`} />
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Items</h2>
              {/* Dealer mode mein info banner */}
              {isDealerMode && !unbilledLoading && (
                <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-800">
                  <AlertCircle size={12} />
                  Sirf dealer ke unbilled products show ho rahe hain
                </div>
              )}
            </div>

            {unbilledLoading ? (
              <div className="flex items-center gap-2 py-8 text-sm text-gray-400 justify-center">
                <Loader2 size={16} className="animate-spin" /> Loading dealer's unbilled stock...
              </div>
            ) : isDealerMode && items.every(i => !i.productId) ? (
              // Dealer mode mein koi unbilled stock nahi
              <div className="py-10 text-center text-sm text-gray-400">
                <p className="font-medium text-gray-500 dark:text-gray-400 mb-1">No unbilled stock</p>
                <p className="text-xs">Is dealer ke paas koi unbilled stock nahi hai.</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div key={idx} className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-visible">

                      {/* Row */}
                      <div className="grid gap-3 p-3 items-start"
                        style={{ gridTemplateColumns: '1fr 70px 110px 70px 100px 36px' }}>

                        {/* Product — dealer mode mein readonly */}
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">
                            Product
                            {item.isDealerSerial && (
                              <span className="ml-2 text-[10px] bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded-full font-semibold">
                                Dealer Stock
                              </span>
                            )}
                          </label>

                          {isDealerMode && item.productId ? (
                            // Dealer mode — product name readonly dikho
                            <div className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium">
                              {item.productName}
                            </div>
                          ) : (
                            // Normal mode — product search
                            <div className="relative">
                              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
                              <input
                                value={productSearch[idx] ?? ''}
                                onChange={e => handleSearchChange(idx, e.target.value)}
                                onFocus={() => handleFocus(idx)}
                                onBlur={() => handleBlur(idx)}
                                placeholder="Search or click to browse..."
                                className={`${inputCls} pl-8`}
                              />
                              {showDropdown[idx] && (
                                <div className="absolute z-[100] top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800
                                  border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                                  {dropLoading[idx] ? (
                                    <div className="flex items-center gap-2 px-3 py-4 text-xs text-gray-400">
                                      <Loader2 size={13} className="animate-spin" /> Loading products...
                                    </div>
                                  ) : (productResults[idx] ?? []).length === 0 ? (
                                    <div className="px-3 py-4 text-xs text-gray-400 text-center">No products found</div>
                                  ) : (
                                    (productResults[idx] ?? []).map(p => (
                                      <div key={p.id} onMouseDown={() => selectProduct(idx, p)}
                                        className="px-3 py-2.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/30
                                          cursor-pointer border-b border-gray-50 dark:border-gray-700/50 last:border-0">
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
                                          {p.sku} · ₹{fmt(p.sellingPrice)} · GST {p.gstRate}%
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                          {item.sku && (
                            <div className="mt-1 text-xs text-gray-400 pl-1 truncate">{item.sku}</div>
                          )}
                        </div>

                        {/* Qty */}
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">Qty</label>
                          <input type="number" min={1}
                            value={item.quantity}
                            disabled={item.hasSerialNumbers}
                            onChange={e => updateItem(idx, 'quantity', Number(e.target.value))}
                            className={`${inputCls} text-center disabled:opacity-60 disabled:cursor-not-allowed`}
                          />
                        </div>

                        {/* Rate */}
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">Rate (₹)</label>
                          <input type="number" min={0} step="0.01"
                            value={item.sellingPrice}
                            onChange={e => updateItem(idx, 'sellingPrice', Number(e.target.value))}
                            className={inputCls}
                          />
                        </div>

                        {/* GST% */}
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">GST%</label>
                          <input type="number" min={0}
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

                        {/* Remove — dealer mode mein bhi allow karo (partial billing) */}
                        <div className="pt-5">
                          <button onClick={() => removeRow(idx)} disabled={items.length === 1}
                            className="p-1.5 text-gray-400 hover:text-red-500 disabled:opacity-30 transition-colors rounded">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      {/* Serial numbers */}
                      {item.hasSerialNumbers && item.productId && (
                        <div className={`border-t ${item.isDealerSerial
                          ? 'border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/60 dark:bg-indigo-900/10'
                          : 'border-amber-100 dark:border-amber-900/30 bg-amber-50/60 dark:bg-amber-900/10'
                        }`}>
                          <button
                            onClick={() => setItems(prev => {
                              const n = [...prev]
                              n[idx] = { ...n[idx], showSerials: !n[idx].showSerials }
                              return n
                            })}
                            className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium transition-colors
                              ${item.isDealerSerial
                                ? 'text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                                : 'text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                              }`}
                          >
                            <span className="flex items-center gap-1.5">
                              <Hash size={13} />
                              {item.isDealerSerial ? 'Dealer Serial Numbers' : 'Serial Numbers'}
                              {item.selectedSerialIds.length > 0 && (
                                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ml-1 text-white
                                  ${item.isDealerSerial ? 'bg-indigo-600' : 'bg-amber-600'}`}>
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
                                    return (
                                      <button key={sn.id} onClick={() => toggleSerial(idx, sn.id)}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium border transition-all
                                          ${sel
                                            ? item.isDealerSerial
                                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                                              : 'bg-amber-600 border-amber-600 text-white shadow-sm'
                                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-indigo-400'
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

                {/* Add Item — sirf normal mode mein */}
                {!isDealerMode && (
                  <button onClick={addRow}
                    className="mt-4 flex items-center gap-1.5 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 transition-colors">
                    <Plus size={15} /> Add Item
                  </button>
                )}
              </>
            )}
          </div>

          {/* Notes + Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Notes</h2>
              <textarea value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Any notes for this invoice..." rows={4}
                className={`${inputCls} resize-none`} />
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
                  <input type="number" min={0} step="0.01" value={discount}
                    onChange={e => setDiscount(Number(e.target.value))}
                    className="w-28 px-2 py-1 text-right border border-gray-200 dark:border-gray-700 rounded-lg
                      bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white
                      focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="border-t border-gray-100 dark:border-gray-800 pt-2 flex justify-between font-bold text-gray-900 dark:text-white text-base">
                  <span>Total</span><span>₹{fmt(total)}</span>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Paid Via</p>
                <div className="flex gap-2">
                  {paymentOptions.map(opt => (
                    <button key={opt.value} type="button" onClick={() => setPaymentMode(opt.value)}
                      className={`flex-1 flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl border text-xs font-semibold transition-all
                        ${paymentMode === opt.value
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 hover:border-indigo-400 hover:text-indigo-600'
                        }`}>
                      {opt.icon}{opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pb-6">
            <button onClick={() => router.back()}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900
                border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white
                bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-60">
              {submitting && <Loader2 size={15} className="animate-spin" />}
              {submitting ? 'Creating...' : isDealerMode ? 'Create Dealer Invoice' : 'Create & View Invoice'}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}