'use client'

import { useState, useEffect, useRef } from 'react'
import { stockService } from '@/services/stock-transfer.service'
import { productsService } from '@/services/products.service'
import { branchesService } from '@/services/branches.service'
import { serialService } from '@/services/serial.service'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, Hash, CheckCircle2, Loader2, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { StockOutRecord } from '@/types/stock-transfer.types'

interface ProductOption { id: string; name: string; sku: string; hasSerialNumbers: boolean; brand?: string }
interface BranchOption { id: string; name: string }
interface SerialOption { id: string; serialNumber: string }

interface Props {
  open: boolean
  editRecord?: StockOutRecord | null
  onClose: () => void
  onSuccess: () => void
}

const INIT = {
  productId: '', branchId: '', quantity: '', sellingPrice: '',
  customerName: '', customerPhone: '', notes: '', date: '', brand: '',
}

const toDateInput = (iso?: string) => {
  if (!iso) return ''
  return new Date(iso).toISOString().slice(0, 10)
}

export default function StockOutModal({ open, editRecord, onClose, onSuccess }: Props) {
  const isEdit = !!editRecord

  const [form, setForm] = useState(INIT)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // ── Product search states ──────────────────────────────────────────────────
  const [products, setProducts] = useState<ProductOption[]>([])
  const [productSearch, setProductSearch] = useState('')
  const [loadingProducts, setLoadingProducts] = useState(false)
  const searchDebounceRef = useRef<NodeJS.Timeout>()

  // ── Other dropdown states ──────────────────────────────────────────────────
  const [branches, setBranches] = useState<BranchOption[]>([])
  const [loadingDropdowns, setLoadingDropdowns] = useState(false)

  // ── Serial states ──────────────────────────────────────────────────────────
  const [availableSerials, setAvailableSerials] = useState<SerialOption[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [loadingSerials, setLoadingSerials] = useState(false)

  // ✅ FIX: selectedProduct alag state — products array re-fetch se independent
  const [selectedProduct, setSelectedProduct] = useState<ProductOption | null>(null)

  const needsSerials = selectedProduct?.hasSerialNumbers
    ?? (isEdit ? !!(editRecord?.serialNumbers?.length) : false)
  const qty = Number(form.quantity) || 0
  const serialsReady = !needsSerials || (qty > 0 && selectedIds.length === qty)

  // ── Load branches on open ──────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return
    setLoadingDropdowns(true)
    branchesService.getAll()
      .then(b => setBranches((Array.isArray(b) ? b : []) as BranchOption[]))
      .catch(() => {})
      .finally(() => setLoadingDropdowns(false))
  }, [open])

  // ── Product search with debounce → backend call ────────────────────────────
  useEffect(() => {
    clearTimeout(searchDebounceRef.current)
    if (!open) return
    if (form.productId) return // ✅ product selected hai, dobara fetch mat karo
    searchDebounceRef.current = setTimeout(async () => {
      setLoadingProducts(true)
      try {
        const res = await productsService.getAll({ limit: 20, search: productSearch || undefined })
        setProducts((res.products ?? []) as ProductOption[])
      } catch {}
      finally { setLoadingProducts(false) }
    }, 300)
    return () => clearTimeout(searchDebounceRef.current)
  }, [productSearch, open, form.productId])

  // ── Pre-fill or reset form ─────────────────────────────────────────────────
  useEffect(() => {
    if (!open) {
      setForm(INIT)
      setAvailableSerials([])
      setSelectedIds([])
      setError('')
      setProductSearch('')
      setProducts([])
      setSelectedProduct(null) // ✅
      return
    }
    if (editRecord) {
      setForm({
        productId:     editRecord.productId ?? '',
        branchId:      editRecord.branchId ?? '',
        quantity:      String(editRecord.quantity ?? ''),
        sellingPrice:  String(editRecord.sellingPrice ?? ''),
        customerName:  editRecord.customerName ?? '',
        customerPhone: editRecord.customerPhone ?? '',
        notes:         editRecord.notes ?? '',
        date:          toDateInput(editRecord.date),
        brand:         editRecord.product?.brand ?? '',
      })
      // ✅ Edit mode mein selectedProduct directly set karo
      if (editRecord.product) {
        setSelectedProduct({
          id:               editRecord.productId ?? '',
          name:             editRecord.product.name ?? '',
          sku:              editRecord.product.sku ?? '',
          hasSerialNumbers: !!(editRecord.serialNumbers?.length),
          brand:            editRecord.product.brand ?? '',
        })
      }
      const existingIds = (editRecord.serialNumbers ?? []).map(s => s.id)
      setSelectedIds(existingIds)
    } else {
      setForm(INIT)
      setAvailableSerials([])
      setSelectedIds([])
      setError('')
      setSelectedProduct(null) // ✅
    }
  }, [open, editRecord])

  // ── Load available serials when product+branch set ─────────────────────────
  useEffect(() => {
    const productId = isEdit ? editRecord?.productId : form.productId
    const branchId  = isEdit ? editRecord?.branchId  : form.branchId
    if (!needsSerials || !productId || !branchId) {
      if (!isEdit) { setAvailableSerials([]); setSelectedIds([]) }
      return
    }
    setLoadingSerials(true)
    serialService.getAvailable(productId, branchId)
      .then(data => {
        if (isEdit && editRecord?.serialNumbers?.length) {
          const soldSerials: SerialOption[] = editRecord.serialNumbers.map(s => ({
            id: s.id,
            serialNumber: s.serialNumber,
          }))
          const availIds = new Set((data as SerialOption[]).map(s => s.id))
          const merged = [
            ...soldSerials.filter(s => !availIds.has(s.id)),
            ...(data as SerialOption[]),
          ]
          setAvailableSerials(merged)
        } else {
          setAvailableSerials(data as SerialOption[])
        }
      })
      .catch(() => setAvailableSerials([]))
      .finally(() => setLoadingSerials(false))
  }, [form.productId, form.branchId, needsSerials, isEdit])

  // ── Auto-fill brand (create mode only) ────────────────────────────────────
  useEffect(() => {
    if (isEdit) return
    set('brand', selectedProduct?.brand || '')
  }, [selectedProduct, isEdit])

  // ── Trim selectedIds if qty reduced ───────────────────────────────────────
  useEffect(() => {
    if (qty > 0 && selectedIds.length > qty) setSelectedIds(prev => prev.slice(0, qty))
  }, [qty])

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const toggleSerial = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id)
      if (qty > 0 && prev.length >= qty) { setError(`Can only select ${qty} serial(s)`); return prev }
      setError('')
      return [...prev, id]
    })
  }

  const autoSelect = () => { setSelectedIds(availableSerials.slice(0, qty).map(s => s.id)); setError('') }
  const clearAll = () => setSelectedIds([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (needsSerials && selectedIds.length !== qty) {
      setError(`Select exactly ${qty} serial(s). Selected: ${selectedIds.length}.`); return
    }
    try {
      setLoading(true)
      if (isEdit && editRecord) {
        await stockService.updateStockOut(editRecord.id, {
          quantity:        qty,
          sellingPrice:    Number(form.sellingPrice),
          customerName:    form.customerName || undefined,
          customerPhone:   form.customerPhone || undefined,
          notes:           form.notes || undefined,
          date:            form.date || undefined,
          serialNumberIds: needsSerials ? selectedIds : undefined,
        })
      } else {
        await stockService.stockOut({
          productId:       form.productId,
          branchId:        form.branchId,
          quantity:        qty,
          sellingPrice:    Number(form.sellingPrice),
          customerName:    form.customerName || undefined,
          customerPhone:   form.customerPhone || undefined,
          notes:           form.notes || undefined,
          date:            form.date || undefined,
          serialNumberIds: needsSerials ? selectedIds : undefined,
        })
      }
      onSuccess()
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5">
            <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400 text-xs font-bold px-2">
              OUT
            </Badge>
            {isEdit ? 'Edit Stock Out Record' : 'Record Stock Out'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-1">
          {error && (
            <div className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3.5 py-3 text-sm text-destructive">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          {/* Product Details */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Product Details</p>
            <div className="grid grid-cols-2 gap-3">

              {/* Product Search */}
              <div className="col-span-2 space-y-1.5">
                <Label>Product <span className="text-destructive">*</span></Label>
                {isEdit ? (
                  <div className="flex items-center gap-2 h-9 px-3 rounded-md border border-border bg-muted/50 text-sm text-foreground">
                    <span className="font-medium">{editRecord?.product?.name}</span>
                    <code className="text-xs text-muted-foreground">({editRecord?.product?.sku})</code>
                    <Badge variant="secondary" className="ml-auto text-[10px]">locked</Badge>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                      <Input
                        placeholder="Search product…"
                        value={productSearch}
                        onChange={e => { setProductSearch(e.target.value); set('productId', ''); setSelectedProduct(null) }} // ✅
                        className="pl-8 pr-3"
                      />
                      {loadingProducts && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin text-muted-foreground" />
                      )}
                    </div>
                    {!form.productId && products.length > 0 && (
                      <div className="border border-border rounded-md bg-background max-h-44 overflow-y-auto divide-y divide-border">
                        {products.map(p => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => { set('productId', p.id); setSelectedProduct(p); setProductSearch(`${p.name} (${p.sku})`) }} // ✅
                            className={cn(
                              'w-full text-left px-3 py-2 text-sm hover:bg-muted/60 transition-colors flex items-center justify-between gap-2',
                              form.productId === p.id && 'bg-primary/5 text-primary font-medium'
                            )}
                          >
                            <span>
                              {p.name}{' '}
                              <span className="text-muted-foreground font-mono text-xs">({p.sku})</span>
                            </span>
                            {p.hasSerialNumbers && <span className="text-xs">🔢</span>}
                          </button>
                        ))}
                      </div>
                    )}
                    {!form.productId && productSearch && products.length === 0 && !loadingProducts && (
                      <p className="text-xs text-muted-foreground px-1">No products found</p>
                    )}
                  </div>
                )}
              </div>

              {/* Branch */}
              <div className="col-span-2 space-y-1.5">
                <Label>Branch <span className="text-destructive">*</span></Label>
                {isEdit ? (
                  <div className="flex items-center gap-2 h-9 px-3 rounded-md border border-border bg-muted/50 text-sm text-foreground">
                    <span>{editRecord?.branch?.name}</span>
                    <Badge variant="secondary" className="ml-auto text-[10px]">locked</Badge>
                  </div>
                ) : (
                  <select
                    value={form.branchId}
                    onChange={e => set('branchId', e.target.value)}
                    disabled={loadingDropdowns}
                    required
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50"
                  >
                    <option value="">{loadingDropdowns ? 'Loading…' : 'Select branch'}</option>
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Quantity <span className="text-destructive">*</span></Label>
                <Input type="number" min="1" placeholder="0" value={form.quantity}
                  onChange={e => set('quantity', e.target.value)} required />
              </div>

              <div className="space-y-1.5">
                <Label>Selling Price (₹) <span className="text-destructive">*</span></Label>
                <Input type="number" min="0" placeholder="0.00" value={form.sellingPrice}
                  onChange={e => set('sellingPrice', e.target.value)} required />
              </div>
            </div>
          </div>

          {/* Serial Picker */}
          {needsSerials && (isEdit || (form.productId && form.branchId)) && (
            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Hash className="w-4 h-4 text-primary" />
                  {isEdit ? 'Serial Numbers' : 'Select Serial Numbers'}
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={cn(
                      selectedIds.length === qty && qty > 0
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : selectedIds.length > 0
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        : ''
                    )}
                  >
                    {selectedIds.length}/{qty || '?'} selected
                  </Badge>
                  {!loadingSerials && availableSerials.length > 0 && qty > 0 && (
                    <Button type="button" variant="ghost" size="sm" onClick={autoSelect}
                      className="h-7 text-xs text-primary hover:text-primary">
                      Auto-select {Math.min(qty, availableSerials.length)}
                    </Button>
                  )}
                  {selectedIds.length > 0 && (
                    <Button type="button" variant="ghost" size="sm" onClick={clearAll}
                      className="h-7 text-xs text-muted-foreground">
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              {loadingSerials ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-9 w-full" />)}
                </div>
              ) : availableSerials.length === 0 ? (
                <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                  <AlertCircle className="w-4 h-4" />
                  No available serial numbers for this product in this branch
                </div>
              ) : (
                <>
                  <div className="space-y-1 max-h-[200px] overflow-y-auto pr-1">
                    {availableSerials.map((s, i) => {
                      const checked = selectedIds.includes(s.id)
                      const isDisabled = !checked && qty > 0 && selectedIds.length >= qty
                      return (
                        <label
                          key={s.id}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2 rounded-md border text-sm cursor-pointer transition-all select-none',
                            checked
                              ? 'border-primary/40 bg-primary/5 text-foreground'
                              : 'border-transparent hover:border-border hover:bg-muted/50 text-muted-foreground',
                            isDisabled && 'opacity-40 cursor-not-allowed'
                          )}
                        >
                          <input type="checkbox" className="sr-only"
                            checked={checked} disabled={isDisabled} onChange={() => toggleSerial(s.id)} />
                          <div className={cn(
                            'w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors',
                            checked ? 'bg-primary border-primary' : 'border-input'
                          )}>
                            {checked && <CheckCircle2 className="w-3 h-3 text-primary-foreground" />}
                          </div>
                          <span className="text-xs text-muted-foreground w-5">{i + 1}.</span>
                          <span className="font-mono text-xs">{s.serialNumber}</span>
                        </label>
                      )
                    })}
                  </div>

                  {qty > 0 && selectedIds.length !== qty && (
                    <p className="text-xs text-muted-foreground">
                      {selectedIds.length < qty
                        ? `Select ${qty - selectedIds.length} more serial${qty - selectedIds.length > 1 ? 's' : ''}`
                        : `Deselect ${selectedIds.length - qty} serial${selectedIds.length - qty > 1 ? 's' : ''}`}
                    </p>
                  )}
                  {qty > 0 && selectedIds.length === qty && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {qty} serial{qty > 1 ? 's' : ''} selected
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          <Separator />

          {/* Customer Info */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Customer Info (Optional)</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Customer Name</Label>
                <Input placeholder="John Doe" value={form.customerName}
                  onChange={e => set('customerName', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Customer Phone</Label>
                <Input placeholder="+91 98765 43210" value={form.customerPhone}
                  onChange={e => set('customerPhone', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Date</Label>
                <Input type="date" value={form.date} onChange={e => set('date', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Notes</Label>
                <Input placeholder="Optional notes…" value={form.notes}
                  onChange={e => set('notes', e.target.value)} />
              </div>
              {/* <div className="col-span-2 space-y-1.5">
                <Label className="flex items-center gap-1.5">
                  Brand / Manufacturer
                  {form.brand && (
                    <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded-full">
                      auto-filled
                    </span>
                  )}
                </Label>
                <Input placeholder="e.g. Samsung, Apple…" value={form.brand}
                  onChange={e => set('brand', e.target.value)} />
              </div> */}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button
              type="submit"
              disabled={loading || (needsSerials && !serialsReady)}
              className="bg-rose-600 hover:bg-rose-700 text-white dark:bg-rose-700 dark:hover:bg-rose-600"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{isEdit ? 'Saving…' : 'Recording…'}</>
                : (isEdit ? 'Save Changes' : 'Record Stock Out')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}