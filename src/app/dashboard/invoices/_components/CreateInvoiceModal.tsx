'use client'

import { useState, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { X, Plus, Loader2, FileText, ChevronDown } from 'lucide-react'
import { createInvoice } from '@/services/invoice.service'
import type { CreateInvoicePayload } from '@/types/invoices.types'
import InvoiceItemRow, { type ItemRowData } from './InvoiceItemRow'
import api from '@/lib/axios'
import { useAuthStore } from '@/store/auth.store'
import { useRouter } from 'next/navigation'

interface Props { onClose: () => void }

const emptyItem = (): ItemRowData => ({
  productId: '', quantity: 1, sellingPrice: 0,
  serialNumberIds: [], gstRate: 0, productName: '',
  hasSerialNumbers: false, stock: 0,
})

export default function CreateInvoiceModal({ onClose }: Props) {
  const qc = useQueryClient()
  const router = useRouter()
  const user = useAuthStore(s => s.user)
  const isSuperAdmin = user?.role === 'SUPER_ADMIN'
  const userBranchId = user?.branchId ?? user?.branch?.id ?? ''

  const [branchId, setBranchId] = useState(isSuperAdmin ? '' : userBranchId)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [customerGST, setCustomerGST] = useState('')
  const [discount, setDiscount] = useState(0)
  const [notes, setNotes] = useState('')
  const [terms, setTerms] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [items, setItems] = useState<ItemRowData[]>([emptyItem()])
  const [error, setError] = useState('')

  // Fetch branches
  const { data: branches = [] } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => { const { data } = await api.get('/branches'); return data.data ?? [] },
    enabled: isSuperAdmin,
  })

  // Fetch settings for currency symbol
  const { data: settings } = useQuery({
    queryKey: ['settings', branchId || userBranchId],
    queryFn: async () => {
      const { data } = await api.get('/settings', { params: { branchId: branchId || userBranchId } })
      return data.data
    },
    enabled: !!(branchId || userBranchId),
  })

  const currencySymbol = settings?.currencySymbol || '₹'

  // ── Totals computation
  const totals = useMemo(() => {
    let subtotal = 0
    let gstAmount = 0
    for (const item of items) {
      if (!item.productId) continue
      const lineTotal = item.sellingPrice * item.quantity
      const lineGST = lineTotal * (item.gstRate / 100)
      subtotal += lineTotal
      gstAmount += lineGST
    }
    const totalAmount = subtotal + gstAmount - Number(discount)
    return { subtotal, gstAmount, totalAmount }
  }, [items, discount])

  const updateItem = (index: number, data: Partial<ItemRowData>) => {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, ...data } : item))
  }

  const removeItem = (index: number) => {
    setItems(prev => prev.length === 1 ? [emptyItem()] : prev.filter((_, i) => i !== index))
  }

  const mutation = useMutation({
    mutationFn: (payload: CreateInvoicePayload) => createInvoice(payload),
    onSuccess: (invoice) => {
      qc.invalidateQueries({ queryKey: ['invoices'] })
      qc.invalidateQueries({ queryKey: ['current-stock'] })
      onClose()
      router.push(`/dashboard/invoices/${invoice.id}`)
    },
    onError: (e: any) => setError(e?.response?.data?.message || 'Invoice create karne mein error aaya.'),
  })

  const handleSubmit = () => {
    setError('')
    if (!branchId) return setError('Branch select karo.')
    if (!customerName.trim()) return setError('Customer name daalo.')
    const validItems = items.filter(i => i.productId)
    if (validItems.length === 0) return setError('Kam se kam ek product add karo.')
    for (const item of validItems) {
      if (item.sellingPrice <= 0) return setError(`"${item.productName}" ka selling price daalo.`)
      if (item.quantity <= 0) return setError(`"${item.productName}" ki quantity daalo.`)
    }

    mutation.mutate({
      branchId, customerName, date,
      customerPhone: customerPhone || undefined,
      customerEmail: customerEmail || undefined,
      customerAddress: customerAddress || undefined,
      customerGST: customerGST || undefined,
      discount: Number(discount),
      notes: notes || undefined,
      terms: terms || undefined,
      items: validItems.map(i => ({
        productId: i.productId,
        quantity: i.quantity,
        sellingPrice: i.sellingPrice,
        serialNumberIds: i.serialNumberIds.length ? i.serialNumberIds : undefined,
      })),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl max-h-[94vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
              <FileText size={17} className="text-blue-500" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">New Invoice</h2>
              <p className="text-xs text-gray-400 mt-0.5">Invoice number auto-generate hoga</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {/* Branch + Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Branch <span className="text-red-500">*</span>
              </label>
              {isSuperAdmin ? (
                <select value={branchId} onChange={e => setBranchId(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all">
                  <option value="">Select branch</option>
                  {branches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              ) : (
                <input readOnly value={user?.branch?.name || ''}
                  className="w-full border border-gray-100 rounded-xl px-3.5 py-2.5 text-sm text-gray-500 bg-gray-50" />
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Invoice Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
            </div>
          </div>

          {/* Customer Details */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Customer Details</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Name <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Customer ka naam"
                  value={customerName} onChange={e => setCustomerName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Phone</label>
                <input type="tel" placeholder="+91 98765 43210"
                  value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Email</label>
                <input type="email" placeholder="email@example.com"
                  value={customerEmail} onChange={e => setCustomerEmail(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">GSTIN</label>
                <input type="text" placeholder="Customer GST number"
                  value={customerGST} onChange={e => setCustomerGST(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all uppercase" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-gray-500 mb-1.5">Address</label>
                <textarea rows={2} placeholder="Billing address"
                  value={customerAddress} onChange={e => setCustomerAddress(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none" />
              </div>
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Products / Items</p>
              {/* Column headers */}
              <div className="hidden md:grid grid-cols-[1fr_80px_110px_100px_36px] gap-3 text-xs text-gray-400 font-medium w-[520px]">
                <span>Product</span>
                <span className="text-center">Qty</span>
                <span>Price</span>
                <span className="text-right">Total (GST)</span>
                <span />
              </div>
            </div>

            <div className="space-y-2">
              {items.map((item, index) => (
                <InvoiceItemRow
                  key={index}
                  index={index}
                  item={item}
                  branchId={branchId || userBranchId}
                  onChange={data => updateItem(index, data)}
                  onRemove={() => removeItem(index)}
                  currencySymbol={currencySymbol}
                />
              ))}
            </div>

            <button type="button"
              onClick={() => setItems(prev => [...prev, emptyItem()])}
              className="mt-3 flex items-center gap-2 text-sm text-blue-500 hover:text-blue-600 font-medium transition-colors">
              <Plus size={15} /> Add Item
            </button>
          </div>

          {/* Notes + Terms */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Notes</label>
              <textarea rows={2} placeholder="Internal notes..."
                value={notes} onChange={e => setNotes(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Terms & Conditions</label>
              <textarea rows={2} placeholder="Payment terms..."
                value={terms} onChange={e => setTerms(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none" />
            </div>
          </div>

          {/* Totals summary */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
            <div className="space-y-2.5">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium">{currencySymbol}{totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>GST</span>
                <span className="font-medium">{currencySymbol}{totals.gstAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Discount</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-400">{currencySymbol}</span>
                  <input
                    type="number" min={0} value={discount}
                    onChange={e => setDiscount(Number(e.target.value))}
                    className="w-24 border border-gray-200 rounded-lg px-2.5 py-1 text-sm text-gray-900 text-right focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  />
                </div>
              </div>
              <div className="border-t border-gray-200 pt-2.5 flex justify-between">
                <span className="text-base font-bold text-gray-900">Total</span>
                <span className="text-lg font-bold text-blue-600">
                  {currencySymbol}{Math.max(0, totals.totalAmount).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
          <button type="button" onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-all">
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} disabled={mutation.isPending}
            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2">
            {mutation.isPending
              ? <><Loader2 size={14} className="animate-spin" /> Creating...</>
              : <><FileText size={14} /> Create Invoice</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}