'use client'

import { useState, useEffect, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { X, Trash2, Loader2, ArrowDownCircle, Hash, CheckCircle2, AlertCircle, ScanLine } from 'lucide-react'
import { stockIn } from '@/services/stock.service'
import type { StockInPayload } from '@/types/stock.types'
import api from '@/lib/axios'
import { useAuthStore } from '@/store/auth.store'

interface Props { onClose: () => void }

export default function StockInModal({ onClose }: Props) {
  const qc = useQueryClient()
  const user = useAuthStore(s => s.user)
  const isSuperAdmin = user?.role === 'SUPER_ADMIN'
  const userBranchId = user?.branchId ?? user?.branch?.id ?? ''

  const [productId, setProductId] = useState('')
  const [branchId, setBranchId] = useState(isSuperAdmin ? '' : userBranchId)
  const [quantity, setQuantity] = useState(1)
  const [purchasePrice, setPurchasePrice] = useState('')
  const [dealerId, setDealerId] = useState('')
  const [sourceNote, setSourceNote] = useState('')
  const [referenceNo, setReferenceNo] = useState('')
  const [date, setDate] = useState('')
  const [serialInput, setSerialInput] = useState('')
  const [serialNumbers, setSerialNumbers] = useState<string[]>([])
  const [duplicateError, setDuplicateError] = useState('')
  const [error, setError] = useState('')
  const serialInputRef = useRef<HTMLInputElement>(null)

  // ── Fetch products
  const { data: products = [] } = useQuery({
    queryKey: ['products-list'],
    queryFn: async () => {
      const { data } = await api.get('/products', { params: { limit: 999 } })
      return data.data?.items ?? data.data ?? []
    },
  })

  // ── Fetch branches (SUPER_ADMIN only)
  const { data: branches = [] } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => { const { data } = await api.get('/branches'); return data.data ?? [] },
    enabled: isSuperAdmin,
  })

  // ── Fetch dealers
  const { data: dealers = [] } = useQuery({
    queryKey: ['dealers'],
    queryFn: async () => { const { data } = await api.get('/dealers'); return data.data ?? [] },
  })

  const selectedProduct = products.find((p: any) => p.id === productId)
  const requiresSerials = selectedProduct?.hasSerialNumbers === true

  // Reset serials on product change
  useEffect(() => {
    setSerialNumbers([])
    setSerialInput('')
    setDuplicateError('')
  }, [productId])

  // Auto-sync quantity with serial count
  useEffect(() => {
    if (requiresSerials) setQuantity(serialNumbers.length || 1)
  }, [serialNumbers, requiresSerials])

  const addSerial = () => {
    const val = serialInput.trim().toUpperCase()
    if (!val) return
    if (serialNumbers.includes(val)) {
      setDuplicateError(`"${val}" already added`)
      return
    }
    setSerialNumbers(p => [...p, val])
    setSerialInput('')
    setDuplicateError('')
    serialInputRef.current?.focus()
  }

  const removeSerial = (sn: string) => {
    setSerialNumbers(p => p.filter(s => s !== sn))
    setDuplicateError('')
  }

  const serialMatchesQty = !requiresSerials || serialNumbers.length === quantity
  const serialProgressColor =
    serialNumbers.length === 0 ? 'bg-gray-200' :
    serialNumbers.length < quantity ? 'bg-amber-400' :
    'bg-emerald-500'

  const mutation = useMutation({
    mutationFn: (p: StockInPayload) => stockIn(p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stock-history'] })
      qc.invalidateQueries({ queryKey: ['current-stock'] })
      onClose()
    },
    onError: (e: any) => setError(e?.response?.data?.message || 'Failed to add stock.'),
  })

  const handleSubmit = () => {
    setError('')
    if (!productId) return setError('Please select a product.')
    if (!branchId) return setError('Please select a branch.')
    if (!purchasePrice) return setError('Purchase price is required.')
    if (requiresSerials && serialNumbers.length === 0)
      return setError('Serial numbers are required for this product.')
    if (requiresSerials && serialNumbers.length !== Number(quantity))
      return setError(`Need ${quantity} serial number(s), you added ${serialNumbers.length}.`)

    mutation.mutate({
      productId, branchId,
      quantity: requiresSerials ? serialNumbers.length : Number(quantity),
      purchasePrice: Number(purchasePrice),
      dealerId: dealerId || undefined,
      sourceNote: sourceNote || undefined,
      referenceNo: referenceNo || undefined,
      date: date || undefined,
      serialNumbers: requiresSerials ? serialNumbers : undefined,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[93vh] flex flex-col">

        {/* ── Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
              <ArrowDownCircle size={18} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Stock In</h2>
              <p className="text-xs text-gray-400">Record incoming inventory</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* ── Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">

          {/* Product */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Product <span className="text-red-500">*</span>
            </label>
            <select
              value={productId}
              onChange={e => setProductId(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
            >
              <option value="">Select product…</option>
              {products.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.sku}{p.hasSerialNumbers ? ' 🔖' : ''}
                </option>
              ))}
            </select>
            {selectedProduct?.hasSerialNumbers && (
              <p className="mt-1 text-xs text-amber-600 flex items-center gap-1">
                <ScanLine size={11} /> This product requires serial numbers
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
                value={requiresSerials ? serialNumbers.length : quantity}
                readOnly={requiresSerials}
                onChange={e => !requiresSerials && setQuantity(Number(e.target.value))}
                className={`w-full border rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all
                  ${requiresSerials ? 'bg-gray-50 border-gray-100 text-gray-500 cursor-not-allowed' : 'border-gray-200'}`}
              />
              {requiresSerials && (
                <p className="mt-0.5 text-xs text-gray-400">Auto-set by serial count</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all" />
            </div>
          </div>

          {/* Branch + Source */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Branch</label>
              {isSuperAdmin ? (
                <select value={branchId} onChange={e => setBranchId(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all">
                  <option value="">Select branch…</option>
                  {branches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              ) : (
                <input readOnly value={user?.branch?.name || 'My Branch'}
                  className="w-full border border-gray-100 rounded-xl px-3.5 py-2.5 text-sm text-gray-500 bg-gray-50 cursor-not-allowed" />
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">From Source</label>
              <input type="text" placeholder="e.g., Warehouse"
                value={sourceNote} onChange={e => setSourceNote(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all" />
            </div>
          </div>

          {/* Purchase Price + Dealer */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Purchase Price (₹) <span className="text-red-500">*</span>
              </label>
              <input type="number" min={0} placeholder="0.00"
                value={purchasePrice} onChange={e => setPurchasePrice(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Dealer</label>
              <select value={dealerId} onChange={e => setDealerId(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all">
                <option value="">None</option>
                {dealers.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>

          {/* Reference No */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Reference No.</label>
            <input type="text" placeholder="e.g., PO-2024-001"
              value={referenceNo} onChange={e => setReferenceNo(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all" />
          </div>

          {/* ── SERIAL NUMBERS — only when hasSerialNumbers */}
          {requiresSerials && (
            <div className="border border-dashed border-emerald-200 bg-emerald-50/40 rounded-2xl p-4 space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Hash size={14} className="text-emerald-600" />
                  <span className="text-sm font-semibold text-gray-700">Serial Numbers</span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Progress pill */}
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    serialNumbers.length === 0 ? 'bg-gray-100 text-gray-500' :
                    serialNumbers.length < quantity ? 'bg-amber-100 text-amber-700' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    {serialNumbers.length} / {quantity}
                  </span>
                  {serialNumbers.length === quantity && quantity > 0 && (
                    <CheckCircle2 size={14} className="text-emerald-500" />
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${serialProgressColor}`}
                  style={{ width: `${quantity > 0 ? Math.min((serialNumbers.length / quantity) * 100, 100) : 0}%` }}
                />
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <input
                  ref={serialInputRef}
                  type="text"
                  placeholder="Scan or type serial number, press Enter"
                  value={serialInput}
                  onChange={e => { setSerialInput(e.target.value); setDuplicateError('') }}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSerial())}
                  className={`flex-1 border rounded-xl px-3.5 py-2.5 text-sm font-mono text-gray-900 placeholder-gray-400 placeholder:font-sans focus:outline-none focus:ring-2 transition-all
                    ${duplicateError ? 'border-red-300 focus:ring-red-300/30 focus:border-red-400' : 'border-gray-200 focus:ring-emerald-500/30 focus:border-emerald-400'}`}
                />
                <button type="button" onClick={addSerial}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-all active:scale-95">
                  Add
                </button>
              </div>

              {duplicateError && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={11} /> {duplicateError}
                </p>
              )}

              {/* Serial list */}
              {serialNumbers.length > 0 && (
                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-0.5">
                  {serialNumbers.map((sn, i) => (
                    <div key={sn}
                      className="flex items-center gap-3 px-3 py-2 bg-white border border-gray-100 rounded-xl group hover:border-red-100 transition-colors">
                      <span className="text-xs text-gray-300 w-5 text-right tabular-nums">{i + 1}</span>
                      <span className="text-sm text-gray-800 font-mono flex-1 tracking-wide">{sn}</span>
                      <button type="button"
                        onClick={() => removeSerial(sn)}
                        className="text-gray-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {serialNumbers.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-2">
                  No serial numbers added yet. Type above and press Enter or click Add.
                </p>
              )}
            </div>
          )}

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Note</label>
            <input type="text" placeholder="Optional note"
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all" />
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
            className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95">
            {mutation.isPending
              ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
              : 'Add Stock'
            }
          </button>
        </div>
      </div>
    </div>
  )
}