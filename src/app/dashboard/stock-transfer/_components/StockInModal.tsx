'use client'

import { useState, useEffect, useRef } from 'react'
import { stockService } from '@/services/stock-transfer.service'
import { productsService } from '@/services/products.service'
import { branchesService } from '@/services/branches.service'
import { dealersService } from '@/services/dealers.service'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Hash, X, CheckCircle2, Loader2, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { StockInRecord } from '@/types/stock-transfer.types'

interface ProductOption { id: string; name: string; sku: string; hasSerialNumbers: boolean; brand?: string }
interface BranchOption { id: string; name: string }
interface DealerOption { id: string; name: string }

interface Props {
  open: boolean
  editRecord?: StockInRecord | null
  onClose: () => void
  onSuccess: () => void
}

const INIT = {
  productId: '', branchId: '', quantity: '', purchasePrice: '',
  dealerId: '', sourceNote: '', referenceNo: '', date: '', brand: '',
}

const toDateInput = (iso?: string) => {
  if (!iso) return ''
  return new Date(iso).toISOString().slice(0, 10)
}

export default function StockInModal({ open, editRecord, onClose, onSuccess }: Props) {
  const isEdit = !!editRecord

  const [form, setForm] = useState(INIT)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [products, setProducts] = useState<ProductOption[]>([])
  const [productSearch, setProductSearch] = useState('')
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [loadingDropdowns, setLoadingDropdowns] = useState(false)
  const searchDebounceRef = useRef<NodeJS.Timeout>()

  const [branches, setBranches] = useState<BranchOption[]>([])
  const [dealers, setDealers] = useState<DealerOption[]>([])

  const [serialInput, setSerialInput] = useState('')
  const [serialNumbers, setSerialNumbers] = useState<string[]>([])
  const serialInputRef = useRef<HTMLInputElement>(null)

  // ✅ FIX: selectedProduct alag state mein — products array re-fetch se independent
  const [selectedProduct, setSelectedProduct] = useState<ProductOption | null>(null)

  const needsSerials = selectedProduct?.hasSerialNumbers ?? false
  const qty = Number(form.quantity) || 0
  const serialsComplete = !needsSerials || (qty > 0 && serialNumbers.length === qty)
  const remaining = qty - serialNumbers.length

  // Load branches + dealers on open
  useEffect(() => {
    if (!open) return
    setLoadingDropdowns(true)
    Promise.all([
      branchesService.getAll(),
      dealersService.getAll({ limit: 200 }),
    ])
      .then(([b, d]) => {
        setBranches((Array.isArray(b) ? b : []) as BranchOption[])
        setDealers((d.data ?? []) as DealerOption[])
      })
      .catch(() => {})
      .finally(() => setLoadingDropdowns(false))
  }, [open])

  // ✅ FIX: Search sirf tab chale jab productId set NAHI hai (user type kar rha ho)
  // Agar product already selected hai to re-fetch se products array replace nahi hogi
  useEffect(() => {
    clearTimeout(searchDebounceRef.current)
    if (!open) return
    if (form.productId) return // product selected hai, search mat karo

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

  // Reset on close / pre-fill on edit
  useEffect(() => {
    if (!open) {
      setForm(INIT)
      setSerialNumbers([])
      setSerialInput('')
      setError('')
      setProductSearch('')
      setProducts([])
      setSelectedProduct(null) // ✅ reset selected product
      return
    }
    if (editRecord) {
      setForm({
        productId:     editRecord.productId ?? '',
        branchId:      editRecord.branchId ?? '',
        quantity:      String(editRecord.quantity ?? ''),
        purchasePrice: String(editRecord.purchasePrice ?? ''),
        dealerId:      editRecord.dealer?.id ?? '',
        sourceNote:    editRecord.sourceNote ?? '',
        referenceNo:   editRecord.referenceNo ?? '',
        date:          toDateInput(editRecord.date),
        brand:         editRecord.product?.brand ?? '',
      })
      // ✅ Edit mode mein selectedProduct product info se set karo
      if (editRecord.product) {
        setSelectedProduct({
          id:               editRecord.productId ?? '',
          name:             editRecord.product.name ?? '',
          sku:              editRecord.product.sku ?? '',
          hasSerialNumbers: editRecord.product.hasSerialNumbers ?? false,
          brand:            editRecord.product.brand ?? '',
        })
      }
      const existingSerials = (editRecord.serialNumbers ?? [])
        .filter(s => s.status === 'AVAILABLE')
        .map(s => s.serialNumber)
      setSerialNumbers(existingSerials)
    } else {
      setForm(INIT)
      setSerialNumbers([])
      setSerialInput('')
      setError('')
      setSelectedProduct(null) // ✅
    }
  }, [open, editRecord])

  // Auto-fill brand when selectedProduct changes (create mode only)
  useEffect(() => {
    if (isEdit) return
    set('brand', selectedProduct?.brand || '')
  }, [selectedProduct, isEdit])

  // Reset serials on product change (create mode only)
  useEffect(() => {
    if (!isEdit) { setSerialNumbers([]); setSerialInput('') }
  }, [form.productId, isEdit])

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  // ✅ FIX: Product select handler — selectedProduct state set karo, search dobara trigger nahi hoga
  const handleProductSelect = (product: ProductOption) => {
    set('productId', product.id)
    setSelectedProduct(product)
    setProductSearch(`${product.name} (${product.sku})`)
    // products list hide karne ke liye clear kar sakte hain (optional UX)
    // setProducts([])
  }

  // ✅ FIX: Search input change — productId + selectedProduct dono clear
  const handleSearchChange = (value: string) => {
    setProductSearch(value)
    set('productId', '')
    setSelectedProduct(null) // serial section hide ho jaayega jab user dobara search kare
  }

  const addSerial = () => {
    const val = serialInput.trim().toUpperCase()
    if (!val) return
    if (serialNumbers.includes(val)) { setError(`"${val}" already added`); return }
    if (qty > 0 && serialNumbers.length >= qty) { setError(`Already have ${qty} serial(s). Increase qty first.`); return }
    setSerialNumbers(s => [...s, val])
    setSerialInput('')
    setError('')
    serialInputRef.current?.focus()
  }

  const removeSerial = (sn: string) => setSerialNumbers(s => s.filter(x => x !== sn))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (needsSerials) {
      if (qty === 0) { setError('Enter a quantity first.'); return }
      if (serialNumbers.length !== qty) { setError(`Need exactly ${qty} serial(s). You have ${serialNumbers.length}.`); return }
    }
    try {
      setLoading(true)
      if (isEdit && editRecord) {
        await stockService.updateStockIn(editRecord.id, {
          quantity:      qty,
          purchasePrice: Number(form.purchasePrice),
          dealerId:      form.dealerId || undefined,
          sourceNote:    form.sourceNote || undefined,
          referenceNo:   form.referenceNo || undefined,
          date:          form.date || undefined,
          serialNumbers: needsSerials ? serialNumbers : undefined,
        })
      } else {
        await stockService.stockIn({
          productId:     form.productId,
          branchId:      form.branchId,
          quantity:      qty,
          purchasePrice: Number(form.purchasePrice),
          dealerId:      form.dealerId || undefined,
          sourceNote:    form.sourceNote || undefined,
          referenceNo:   form.referenceNo || undefined,
          date:          form.date || undefined,
          serialNumbers: needsSerials ? serialNumbers : undefined,
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
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 text-xs font-bold px-2">
              IN
            </Badge>
            {isEdit ? 'Edit Stock In Record' : 'Record Stock In'}
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
                        onChange={e => handleSearchChange(e.target.value)} // ✅ fixed handler
                        className="pl-8 pr-3"
                      />
                      {loadingProducts && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin text-muted-foreground" />
                      )}
                    </div>
                    {/* Dropdown — sirf tab dikhao jab product selected NAHI hai */}
                    {!form.productId && products.length > 0 && (
                      <div className="border border-border rounded-md bg-background max-h-44 overflow-y-auto divide-y divide-border">
                        {products.map(p => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handleProductSelect(p)} // ✅ fixed handler
                            className={cn(
                              'w-full text-left px-3 py-2 text-sm hover:bg-muted/60 transition-colors flex items-center justify-between gap-2',
                              form.productId === p.id && 'bg-primary/5 text-primary font-medium'
                            )}
                          >
                            <span>{p.name} <span className="text-muted-foreground font-mono text-xs">({p.sku})</span></span>
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

              <div className="col-span-2 space-y-1.5">
                <Label>Branch <span className="text-destructive">*</span></Label>
                {isEdit ? (
                  <div className="flex items-center gap-2 h-9 px-3 rounded-md border border-border bg-muted/50 text-sm text-foreground">
                    <span>{editRecord?.branch?.name}</span>
                    <Badge variant="secondary" className="ml-auto text-[10px]">locked</Badge>
                  </div>
                ) : (
                  <Select value={form.branchId} onValueChange={v => set('branchId', v)} disabled={loadingDropdowns} required>
                    <SelectTrigger>
                      <SelectValue placeholder={loadingDropdowns ? 'Loading…' : 'Select branch'} />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map(b => (
                        <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Quantity <span className="text-destructive">*</span></Label>
                <Input type="number" min="1" placeholder="0" value={form.quantity}
                  onChange={e => set('quantity', e.target.value)} required />
              </div>

              <div className="space-y-1.5">
                <Label>Purchase Price (₹) <span className="text-destructive">*</span></Label>
                <Input type="number" min="0" placeholder="0.00" value={form.purchasePrice}
                  onChange={e => set('purchasePrice', e.target.value)} required />
              </div>
            </div>
          </div>

          {/* Serial Numbers */}
          {needsSerials && (
            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Hash className="w-4 h-4 text-primary" />
                  Serial Numbers {isEdit ? '' : 'Required'}
                </div>
                <Badge
                  variant="secondary"
                  className={cn(
                    serialNumbers.length === qty && qty > 0
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : serialNumbers.length > 0
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      : ''
                  )}
                >
                  {serialNumbers.length}/{qty || '?'}
                </Badge>
              </div>

              <div className="flex gap-2">
                <Input
                  ref={serialInputRef}
                  placeholder={qty === 0 ? 'Set quantity first…' : `Add serial #${serialNumbers.length + 1} of ${qty}…`}
                  value={serialInput}
                  onChange={e => { setSerialInput(e.target.value); setError('') }}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSerial() } }}
                  disabled={qty === 0}
                  className="font-mono uppercase"
                />
                <Button type="button" variant="secondary" onClick={addSerial}
                  disabled={qty === 0 || !serialInput.trim()}>
                  Add
                </Button>
              </div>

              {serialNumbers.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {serialNumbers.map((sn, i) => (
                    <span key={sn}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-background border border-border text-xs font-mono">
                      <span className="text-muted-foreground">{i + 1}.</span>
                      {sn}
                      <button type="button" onClick={() => removeSerial(sn)}
                        className="text-muted-foreground hover:text-destructive transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {qty > 0 && serialNumbers.length < qty && (
                <p className="text-xs text-muted-foreground">
                  {remaining === qty
                    ? `Add ${qty} serial number${qty > 1 ? 's' : ''} to continue`
                    : `${remaining} more serial${remaining > 1 ? 's' : ''} needed`}
                </p>
              )}
              {qty > 0 && serialNumbers.length === qty && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  All {qty} serial numbers added
                </p>
              )}
            </div>
          )}

          <Separator />

          {/* Additional Info */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Additional Info</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Dealer</Label>
                <Select value={form.dealerId || 'none'} onValueChange={v => set('dealerId', v === 'none' ? '' : v)} disabled={loadingDropdowns}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select dealer (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— None —</SelectItem>
                    {dealers.map(d => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Date</Label>
                <Input type="date" value={form.date} onChange={e => set('date', e.target.value)} />
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
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || (needsSerials && !serialsComplete)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-700 dark:hover:bg-emerald-600"
            >
              {loading
                ? (isEdit ? 'Saving…' : 'Recording…')
                : (isEdit ? 'Save Changes' : 'Record Stock In')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}