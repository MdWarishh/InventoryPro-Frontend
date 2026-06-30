'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getInvoiceById, updateInvoice } from '@/services/invoice.service'
import type { CreateInvoicePayload, Invoice } from '@/types/invoices.types'
import { productsService } from '@/services/products.service'
import { serialService } from '@/services/serial.service'
import { dealersService } from '@/services/dealers.service'
import { useAuthStore } from '@/store/auth.store'
import type { Product } from '@/types/products.types'
import type { SerialNumber } from '@/types/serial.types'
import settingsService from '@/services/settings.service'
import {
  Plus, Trash2, Search, ChevronLeft, Loader2, X, Hash,
  ChevronDown, ChevronUp, Building2,
} from 'lucide-react'
import { AssignedProduct, Dealer } from '@/types/dealers.types'
import AddProductPicker from '../../_components/AddProductPicker'

// ── Types ─────────────────────────────────────────────────────────────────────
interface LineItem {
  productId: string | null     // null = manual/historical free-text dealer product
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
  isDealerSerial?: boolean     // dealer mode — serials belong to the dealer, not branch stock
  isManualProduct?: boolean    // dealer mode — free-text product, no productId
}

const emptyItem = (): LineItem => ({
  productId: '', productName: '', sku: '',
  quantity: 1, sellingPrice: 0, gstRate: 0,
  hasSerialNumbers: false,
  availableSerials: [], serialsLoading: false,
  selectedSerialIds: [], showSerials: false,
  isDealerSerial: false, isManualProduct: false,
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
  const [isDealerInvoice, setIsDealerInvoice] = useState(false)
  const [dealerName,  setDealerName]  = useState('')

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

  // ── Product search state (normal-invoice mode only) ──────────────────────
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
  const [dealers, setDealers] = useState<Dealer[]>([])
const [dealersLoading, setDealersLoading] = useState(false)
const [selectedDealerId, setSelectedDealerId] = useState<string>('')
const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null)
const [dealerSearch, setDealerSearch] = useState('')
const [showDealerDrop, setShowDealerDrop] = useState(false)
const [unbilledLoading, setUnbilledLoading] = useState(false)
const [assignedProducts, setAssignedProducts] = useState<AssignedProduct[]>([])
const [showProductPicker, setShowProductPicker] = useState(false)


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

  useEffect(() => {
  setDealersLoading(true)
  dealersService.getAll({ limit: 200 })
    .then(res => setDealers(res.data ?? []))
    .catch(() => {})
    .finally(() => setDealersLoading(false))
}, [])

  // ── Load existing invoice & pre-fill form ─────────────────────────────────
  useEffect(() => {
    if (!id) return

    getInvoiceById(id)
      .then(async (inv) => {
        setInvoice(inv)

        setCustomerName(inv.customerName ?? '')
        setCustomerPhone(inv.customerPhone ?? '')
        setCustomerEmail(inv.customerEmail ?? '')
        setCustomerAddress(inv.customerAddress ?? '')
        setCustomerGST(inv.customerGST ?? '')
        setDiscount(inv.discount ?? 0)
        setNotes(inv.notes ?? '')
        setPaymentMode(inv.paymentMode ?? 'Cash')

        if (inv.date) {
          setDate(new Date(inv.date).toISOString().split('T')[0])
        }

        const dealerMode = !!inv.dealerId
setIsDealerInvoice(dealerMode)
setDealerName(inv.dealer?.name ?? '')
setSelectedDealerId(inv.dealerId ?? '')        
setSelectedDealer((inv.dealer as Dealer) ?? null)    
setDealerSearch(inv.dealer?.name ?? '')         

        if (dealerMode) {
          await prefillDealerItems(inv)
        } else {
          await prefillNormalItems(inv)
        }
      })
      .catch(() => {
        setError('Failed to load invoice.')
      })
      .finally(() => setPageLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const loadDealerUnbilledStock = async (dealerId: string, merge = false) => {
  setUnbilledLoading(true)
  try {
    const res = await dealersService.getUnbilledStock(dealerId)
    const products = res?.data?.products ?? []

    const newItems: LineItem[] = products.map((p: any) => {
      const mappedSerials = (p.serials ?? []).map((s: any) => ({
        id: s.id,
        serialNumber: s.serialNumber,
        status: s.type === 'manual' ? 'MANUAL' : s.type === 'dealer_historical' ? 'DEALER_HISTORICAL' : 'TRANSFERRED',
        productId: p.productId ?? undefined,
      }))
      const isManual = !p.productId
      return {
        productId: p.productId ?? null,
        productName: p.productName,
        sku: p.sku ?? '',
        quantity: 0,
        sellingPrice: p.sellingPrice ?? 0,
        gstRate: p.gstRate ?? 0,
        hasSerialNumbers: p.hasSerialNumbers || mappedSerials.length > 0,
        selectedSerialIds: [],
        availableSerials: mappedSerials,
        serialsLoading: false,
        showSerials: false,
        isDealerSerial: true,
        isManualProduct: isManual,
      }
    })

    if (merge) {
      // existing items already on invoice ke saath naye unbilled products jodo
      // (jo already item list me hai unhe duplicate mat karo)
      setItems(prev => {
        const existingKeys = new Set(prev.map(it => it.productId || it.productName))
        const toAdd = newItems.filter(it => !existingKeys.has(it.productId || it.productName))
        return [...prev, ...toAdd]
      })
      setProductSearch(prev => {
        const existingKeys = new Set(items.map(it => it.productId || it.productName))
        const toAdd = newItems.filter(it => !existingKeys.has(it.productId || it.productName))
        return [...prev, ...toAdd.map(i => i.productName)]
      })
    } else {
      setItems(newItems.length ? newItems : [emptyItem()])
      setProductSearch(newItems.map(i => i.productName))
    }
  } catch {
    // silently fail
  } finally {
    setUnbilledLoading(false)
  }
}

const handleSelectDealer = (dealer: Dealer) => {
  if (!confirm('Dealer change karne se current items reset ho jayenge. Continue?')) return
  setSelectedDealer(dealer)
  setSelectedDealerId(dealer.id)
  setDealerSearch(dealer.name)
  setDealerName(dealer.name)
  setShowDealerDrop(false)
  setItems([])
  setProductSearch([])
  dealersService.getAssignedProducts(dealer.id)
    .then(res => setAssignedProducts(res?.data?.products ?? []))
    .catch(() => setAssignedProducts([]))
}

const handleAddProductFromPicker = (p: AssignedProduct) => {
  const mappedSerials: SerialNumber[] = (p.serials ?? [])
    .filter(s => !s.billed)
    .map(s => ({
      id: s.id,
      serialNumber: s.serialNumber,
      status: (s.type === 'manual' ? 'MANUAL' : s.type === 'dealer_historical' ? 'DEALER_HISTORICAL' : 'TRANSFERRED') as any,
      productId: p.productId ?? '',
      branchId: user?.branchId ?? '',
      createdAt: '',
      updatedAt: '',
    }))

  const newItem: LineItem = {
    productId: p.productId ?? null,
    productName: p.productName,
    sku: p.sku ?? '',
    quantity: p.hasSerialNumbers ? 0 : 1,
    sellingPrice: p.sellingPrice ?? 0,
    gstRate: p.gstRate ?? 0,
    hasSerialNumbers: p.hasSerialNumbers || mappedSerials.length > 0,
    selectedSerialIds: [],
    availableSerials: mappedSerials,
    serialsLoading: false,
    showSerials: false,
    isDealerSerial: true,
    isManualProduct: !p.productId,
  }

  setItems(prev => [...prev, newItem])
  setProductSearch(prev => [...prev, p.productName])
  setProductResults(prev => [...prev, []])
  setShowDropdown(prev => [...prev, false])
  setDropLoading(prev => [...prev, false])
}

const filteredDealers = dealers.filter(d =>
  d.name.toLowerCase().includes(dealerSearch.toLowerCase()) ||
  (d.phone ?? '').includes(dealerSearch)
)

  // ── Pre-fill: NORMAL invoice (branch stock) ───────────────────────────────
  const prefillNormalItems = async (inv: Invoice) => {
    const preFilledItems: LineItem[] = []
    const preFilledSearch: string[]  = []

    for (const so of inv.stockOuts) {
      const alreadySelectedIds = so.serialNumbers.map(sn => sn.id)
      const hasSerials = alreadySelectedIds.length > 0

      let availableSerials: SerialNumber[] = []
      if (hasSerials && so.productId) {
        try {
          const avail = await serialService.getAvailable(so.productId, user?.branchId ?? undefined)
          const alreadyUsedAsSerialNumbers: SerialNumber[] = so.serialNumbers.map(sn => ({
            id: sn.id,
            serialNumber: sn.serialNumber,
            status: 'SOLD' as const,
            productId: so.productId ?? '',
            branchId: user?.branchId ?? '',
            createdAt: '',
            updatedAt: '',
          }))
          availableSerials = [...alreadyUsedAsSerialNumbers, ...avail]
        } catch {
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
        productId: so.productId ?? '',
        productName: so.product?.name ?? so.productName ?? '',
        sku: '',
        quantity: so.quantity,
        sellingPrice: so.sellingPrice,
        gstRate: so.gstRate ?? so.product?.gstRate ?? 0,
        hasSerialNumbers: hasSerials,
        availableSerials,
        serialsLoading: false,
        selectedSerialIds: alreadySelectedIds,
        showSerials: hasSerials,
        isDealerSerial: false,
        isManualProduct: false,
      })
      preFilledSearch.push(so.product?.name ?? so.productName ?? '')
    }

    setItems(preFilledItems.length ? preFilledItems : [emptyItem()])
    setProductSearch(preFilledSearch.length ? preFilledSearch : [''])
    setProductResults(preFilledItems.map(() => []))
    setShowDropdown(preFilledItems.map(() => false))
    setDropLoading(preFilledItems.map(() => false))
  }

  // ── Pre-fill: DEALER invoice ──────────────────────────────────────────────
  // Dealer can't be changed on edit, and we don't let users add brand-new
  // dealer line items here (same as the create flow, which auto-fills from
  // unbilled stock) — but price, quantity, GST, and serial selection are
  // all editable. Serial pool = serials already on this invoice + dealer's
  // currently unbilled stock for that same product.
 const prefillDealerItems = async (inv: Invoice) => {
  console.log('DEALER INVOICE STOCKOUTS:', inv.stockOuts)   
  console.log('DEALER ID:', inv.dealerId)
    let unbilledByProductId: Record<string, any> = {}
    if (inv.dealerId) {
      try {
        const res = await dealersService.getUnbilledStock(inv.dealerId)
        const products = res?.data?.products ?? []
        for (const p of products) {
          if (p.productId) unbilledByProductId[p.productId] = p
        }
      } catch {
        // if this fails, user still sees existing items — just can't swap serials
      }
    }

    const preFilledItems: LineItem[] = (inv.stockOuts ?? []).map(so => {
      const isManual = !so.productId

      // Serials already on this invoice for this product (dealer serials are
      // linked via dealerInvoiceId, not stockOutId, so they come from inv.dealerSerials)
      const originalSerials = (inv.dealerSerials ?? []).filter(s => s.productId === so.productId)
      const originalSerialObjs: SerialNumber[] = originalSerials.map(s => ({
        id: s.id,
        serialNumber: s.serialNumber,
        status: (s.historicalStockId ? 'DEALER_HISTORICAL' : 'TRANSFERRED') as any,
        productId: so.productId ?? '',
        branchId: user?.branchId ?? '',
        createdAt: '',
        updatedAt: '',
      }))

      // Fresh unbilled serials for this same product (so user can swap)
      const unbilled = so.productId ? unbilledByProductId[so.productId] : undefined
      const freshSerials: SerialNumber[] = (unbilled?.serials ?? []).map((s: any) => ({
        id: s.id,
        serialNumber: s.serialNumber,
        status: (s.type === 'manual' ? 'MANUAL' : s.type === 'dealer_historical' ? 'DEALER_HISTORICAL' : 'TRANSFERRED') as any,
        productId: so.productId ?? '',
        branchId: user?.branchId ?? '',
        createdAt: '',
        updatedAt: '',
      }))

      const mergedSerials = [
        ...originalSerialObjs,
        ...freshSerials.filter(f => !originalSerialObjs.some(o => o.id === f.id)),
      ]

      const hasSerials = mergedSerials.length > 0

      return {
        productId: so.productId,
        productName: so.product?.name ?? so.productName ?? '',
        sku: '',
        quantity: so.quantity,
        sellingPrice: so.sellingPrice,
        gstRate: so.gstRate ?? so.product?.gstRate ?? 0,
        hasSerialNumbers: hasSerials,
        availableSerials: mergedSerials,
        serialsLoading: false,
        selectedSerialIds: originalSerials.map(s => s.id),
        showSerials: hasSerials,
        isDealerSerial: true,
        isManualProduct: isManual,
      }
    })

    setItems(preFilledItems.length ? preFilledItems : [emptyItem()])
    setProductSearch(preFilledItems.map(i => i.productName))
    setProductResults(preFilledItems.map(() => []))
    setShowDropdown(preFilledItems.map(() => false))
    setDropLoading(preFilledItems.map(() => false))
    if (inv.dealerId) {
  try {
    const ap = await dealersService.getAssignedProducts(inv.dealerId)
    setAssignedProducts(ap?.data?.products ?? [])
  } catch {
    setAssignedProducts([])
  }
}
  }

  // ── Derived totals ────────────────────────────────────────────────────────
  const subtotal  = items.reduce((s, it) => s + it.sellingPrice * it.quantity, 0)
  const gstAmount = items.reduce((s, it) => s + (it.sellingPrice * it.quantity * (it.gstRate || 0)) / 100, 0)
  const total     = subtotal + gstAmount - discount

  // ── Product search handlers (normal mode only) ────────────────────────────
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

  const selectProduct = async (idx: number, product: Product) => {
    setItems(prev => {
      const n = [...prev]
      n[idx] = {
        ...n[idx],
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        sellingPrice: product.sellingPrice ?? 0,
        gstRate: product.gstRate,
        hasSerialNumbers: product.hasSerialNumbers,
        selectedSerialIds: [],
        availableSerials: [],
        showSerials: product.hasSerialNumbers,
        serialsLoading: product.hasSerialNumbers,
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
  if (isDealerInvoice) {
    setShowProductPicker(true)
    return
  }
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
  setItems(prev => {
    const n = [...prev]
    const item: any = { ...n[idx], [field]: val }

    if (field === 'quantity' && item.hasSerialNumbers && !item.isManualProduct) {
      const qty = Math.max(0, Math.floor(val))
      if (item.selectedSerialIds.length > qty) {
        item.selectedSerialIds = item.selectedSerialIds.slice(0, qty)
      } else if (item.selectedSerialIds.length < qty) {
        const remaining = qty - item.selectedSerialIds.length
        const unselected = item.availableSerials
          .filter((s: SerialNumber) => !item.selectedSerialIds.includes(s.id))
          .slice(0, remaining)
          .map((s: SerialNumber) => s.id)
        item.selectedSerialIds = [...item.selectedSerialIds, ...unselected]
      }
    }

    n[idx] = item
    return n
  })
}

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setError('')
    if (!customerName.trim()) { setError('Customer name is required.'); return }

    for (const it of items) {
      if (!isDealerInvoice && !it.productId) {
        setError('Please select a product for all rows.'); return
      }
      if (isDealerInvoice && !it.productId && !it.productName) {
        setError('Product name missing for one or more items.'); return
      }
      if (it.hasSerialNumbers && it.selectedSerialIds.length === 0) {
        setError(`Select serial numbers for "${it.productName}".`); return
      }
    }

    setSubmitting(true)
    try {
     const payload: CreateInvoicePayload = {
  branchId: invoice?.branchId ?? user?.branchId ?? '',
  customerName, customerPhone, customerEmail, customerAddress,
  customerGST: customerGST || undefined,
  date, discount,
  notes: notes || undefined,
  paymentMode,
  ...(selectedDealerId && { dealerId: selectedDealerId }),
  items: items.map(it => ({
    productId:       it.productId || null,
    productName:     it.productName,
    quantity:        it.quantity,
    sellingPrice:    it.sellingPrice,
    gstRate:         it.gstRate,
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

     {isDealerInvoice && (
  <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 mb-4">
    <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
      <Building2 size={13} /> Dealer
    </h2>

    {selectedDealer ? (
      <div className="flex items-center gap-3 px-4 py-3 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-xl">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-violet-900 dark:text-violet-100">{selectedDealer.name}</p>
          {selectedDealer.phone && <p className="text-xs text-violet-500">{selectedDealer.phone}</p>}
        </div>
        <button
          onClick={() => { setSelectedDealer(null); setSelectedDealerId(''); setDealerSearch('') }}
          className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1"
        >
          <X size={12} /> Change
        </button>
      </div>
    ) : (
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
        <input
          value={dealerSearch}
          onChange={e => { setDealerSearch(e.target.value); setShowDealerDrop(true) }}
          onFocus={() => setShowDealerDrop(true)}
          onBlur={() => setTimeout(() => setShowDealerDrop(false), 200)}
          placeholder="Search dealer..."
          className={`${inputCls} pl-9`}
        />
        {showDealerDrop && filteredDealers.length > 0 && (
          <div className="absolute z-[100] top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl max-h-56 overflow-y-auto">
            {filteredDealers.map(d => (
              <div key={d.id} onMouseDown={() => handleSelectDealer(d)}
                className="px-3 py-2.5 hover:bg-violet-50 dark:hover:bg-violet-900/30 cursor-pointer border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{d.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    )}
  </div>
)}

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
                    {/* Product */}
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">
                        Product
                        {item.isDealerSerial && (
                          <span className="ml-2 text-[10px] bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 px-1.5 py-0.5 rounded-full font-semibold">
                            {item.isManualProduct ? 'Manual Stock' : 'Dealer Stock'}
                          </span>
                        )}
                      </label>

                      {isDealerInvoice ? (
                        // Dealer mode — product fixed (same as create flow)
                        <div className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium">
                          {item.productName}
                        </div>
                      ) : (
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
                      )}
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
                        disabled={item.hasSerialNumbers && !item.isManualProduct}
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
                        type="number" min={0} max={100}
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
                  {item.hasSerialNumbers && (item.productId || item.isManualProduct) && (
                    <div className={`border-t ${item.isDealerSerial
                      ? 'border-violet-100 dark:border-violet-900/30 bg-violet-50/60 dark:bg-violet-900/10'
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
                            ? 'text-violet-700 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20'
                            : 'text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                          }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <Hash size={13} />
                          {item.isDealerSerial ? 'Dealer Serial Numbers' : 'Serial Numbers'}
                          {item.selectedSerialIds.length > 0 && (
                            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ml-1 text-white
                              ${item.isDealerSerial ? 'bg-violet-600' : 'bg-amber-600'}`}>
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
                                const isOriginal = ['SOLD', 'DEALER_HISTORICAL', 'TRANSFERRED'].includes(sn.status as string)
                                return (
                                  <button
                                    key={sn.id}
                                    onClick={() => toggleSerial(idx, sn.id)}
                                    title={isOriginal ? 'Originally on this invoice / available for this dealer' : ''}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium border transition-all
                                      ${sel
                                        ? item.isDealerSerial
                                          ? 'bg-violet-600 border-violet-600 text-white shadow-sm'
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

       <button onClick={addRow}
  className="mt-4 flex items-center gap-1.5 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 transition-colors">
  <Plus size={15} /> {isDealerInvoice ? 'Add Product' : 'Add Item'}
</button>

{showProductPicker && (
  <AddProductPicker
    products={assignedProducts}
    alreadyAddedKeys={new Set(items.map(i => i.productId || i.productName))}
    onSelect={handleAddProductFromPicker}
    onClose={() => setShowProductPicker(false)}
  />
)}
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
                {items.filter(it => (it.productId || it.productName) && it.gstRate > 0).map((it, i) => (
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