'use client'

import { useState, useEffect, useRef } from 'react'
import {
  History, Package, Search, X, Plus, Loader2,
  ArrowDownToLine, Calendar, IndianRupee,
  Hash, FileText, AlertCircle, CheckCircle2,
} from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { productsService } from '@/services/dealers.service'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AddHistoricalStockPayload {
  productId?: string
  productName: string
  type: 'IN'           // ✅ always IN — OUT ka koi option nahi
  quantity: number
  purchasePrice: number
  salePrice: number
  serialNumbers: string[]
  date: string
  notes?: string
}

interface ProductOption {
  id: string
  name: string
  sku: string
  purchasePrice?: number
  sellingPrice?: number
}

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (data: AddHistoricalStockPayload) => Promise<void>
  dealerName: string
  loading?: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const today = () => new Date().toISOString().slice(0, 10)

const EMPTY = (): AddHistoricalStockPayload => ({
  productId: undefined,
  productName: '',
  type: 'IN',           // ✅ hardcoded IN
  quantity: 0,
  purchasePrice: 0,
  salePrice: 0,
  serialNumbers: [],
  date: today(),
  notes: '',
})

// ─── Component ────────────────────────────────────────────────────────────────

export default function AddHistoricalStockModal({
  open, onClose, onSubmit, dealerName, loading,
}: Props) {
  const [form, setForm] = useState<AddHistoricalStockPayload>(EMPTY())

  // Product search
  const [query, setQuery] = useState('')
  const [products, setProducts] = useState<ProductOption[]>([])
  const [searching, setSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ProductOption | null>(null)
  const [isManual, setIsManual] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Serial numbers
  const [serialInput, setSerialInput] = useState('')
  const serialInputRef = useRef<HTMLInputElement>(null)

  // Quantity = serial count
  const quantity = form.serialNumbers.length
  const serialsEntered = form.serialNumbers.length > 0

  // Reset on open
  useEffect(() => {
    if (!open) return
    setForm(EMPTY())
    setQuery('')
    setProducts([])
    setShowDropdown(false)
    setSelectedProduct(null)
    setIsManual(false)
    setSerialInput('')
  }, [open])

  // Product search debounce
  useEffect(() => {
    if (isManual || query.trim().length < 2) {
      setProducts([])
      setShowDropdown(false)
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        setSearching(true)
        const res = await productsService.getAll({ search: query })
        setProducts(res.data as ProductOption[])
        setShowDropdown(true)
      } catch {
        setProducts([])
      } finally {
        setSearching(false)
      }
    }, 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, isManual])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selectProduct = (p: ProductOption) => {
    setSelectedProduct(p)
    setQuery(p.name)
    setShowDropdown(false)
    setForm(prev => ({
      ...prev,
      productId: p.id,
      productName: p.name,
      purchasePrice: p.purchasePrice ?? 0,
      salePrice: p.sellingPrice ?? 0,
    }))
  }

  const clearProduct = () => {
    setSelectedProduct(null)
    setQuery('')
    setForm(prev => ({ ...prev, productId: undefined, productName: '', purchasePrice: 0, salePrice: 0 }))
  }

  const enableManual = () => {
    setIsManual(true)
    setShowDropdown(false)
    setSelectedProduct(null)
    setForm(prev => ({ ...prev, productId: undefined, productName: query || '' }))
  }

  const addSerial = () => {
    const trimmed = serialInput.trim().toUpperCase()
    if (!trimmed) return
    if (form.serialNumbers.includes(trimmed)) {
      setSerialInput('')
      return
    }
    setForm(prev => ({ ...prev, serialNumbers: [...prev.serialNumbers, trimmed] }))
    setSerialInput('')
    serialInputRef.current?.focus()
  }

  const removeSerial = (s: string) => {
    setForm(prev => ({ ...prev, serialNumbers: prev.serialNumbers.filter(x => x !== s) }))
  }

  const handleSerialKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); addSerial() }
  }

  const set = <K extends keyof AddHistoricalStockPayload>(k: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }))

  const canSubmit =
    !loading &&
    form.productName.trim().length > 0 &&
    serialsEntered

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    await onSubmit({ ...form, quantity })
  }

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col p-0 gap-0">

        {/* Header */}
        <DialogHeader className="flex-none px-6 py-5 border-b bg-muted/40 rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
              <History className="w-4 h-4 text-indigo-500" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Add Historical Stock</DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                Stock jo pehle se{' '}
                <span className="font-medium text-foreground">{dealerName}</span>{' '}
                ko diya tha — record karo
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Info banner */}
        <div className="flex-none mx-6 mt-4 flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-800">
          <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
            Ye entry sirf <strong>dealer ke record mein add hogi</strong> — aapki real-time inventory stock
            bilkul affect nahi hogi.
          </p>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

            {/* ✅ Stock Type toggle REMOVED — sirf IN hoga */}

            {/* Product Search */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                Product <span className="text-destructive">*</span>
              </Label>

              {selectedProduct && !isManual ? (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-950/20 dark:border-blue-800">
                  <Package className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span className="text-sm font-medium text-foreground flex-1">{selectedProduct.name}</span>
                  <Badge variant="outline" className="font-mono text-[10px] px-1.5 py-0 h-4">{selectedProduct.sku}</Badge>
                  <button type="button" onClick={clearProduct} className="text-muted-foreground hover:text-foreground transition-colors ml-1">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="relative" ref={dropdownRef}>
                  <div className="relative">
                    {searching
                      ? <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground animate-spin" />
                      : <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    }
                    <Input
                      value={isManual ? form.productName : query}
                      onChange={e => {
                        if (isManual) {
                          setForm(prev => ({ ...prev, productName: e.target.value }))
                        } else {
                          setQuery(e.target.value)
                        }
                      }}
                      placeholder={isManual ? 'Type product name manually…' : 'Search existing products…'}
                      className="pl-9 h-10 text-sm"
                    />
                    {isManual && (
                      <button
                        type="button"
                        onClick={() => { setIsManual(false); setQuery('') }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {showDropdown && !isManual && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-1 rounded-lg border bg-popover shadow-md overflow-hidden">
                      {products.length === 0 ? (
                        <div className="px-3 py-4 text-center">
                          <p className="text-xs text-muted-foreground mb-2">No products found</p>
                          <button
                            type="button"
                            onClick={enableManual}
                            className="text-xs text-primary font-medium hover:underline flex items-center gap-1 mx-auto"
                          >
                            <Plus className="w-3 h-3" />
                            Enter name manually
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="max-h-48 overflow-y-auto">
                            {products.map(p => (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => selectProduct(p)}
                                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-muted/60 transition-colors"
                              >
                                <Package className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                <span className="text-sm font-medium flex-1">{p.name}</span>
                                <Badge variant="outline" className="font-mono text-[10px] px-1.5 py-0 h-4 shrink-0">{p.sku}</Badge>
                              </button>
                            ))}
                          </div>
                          <div className="border-t px-3 py-2">
                            <button
                              type="button"
                              onClick={enableManual}
                              className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              Enter name manually instead
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {!isManual && query.trim().length < 2 && (
                    <button
                      type="button"
                      onClick={enableManual}
                      className="mt-1.5 text-[11px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Or enter product name manually (for products not in inventory)
                    </button>
                  )}
                </div>
              )}
            </div>

            <Separator />

            {/* Date */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Date
              </Label>
              <Input
                type="date"
                value={form.date}
                onChange={set('date')}
                className="h-10 text-sm max-w-[200px]"
              />
            </div>

            {/* Prices */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold flex items-center gap-1">
                  <IndianRupee className="w-3 h-3" /> Purchase Price
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={form.purchasePrice}
                  onChange={e => setForm(prev => ({ ...prev, purchasePrice: Number(e.target.value) }))}
                  placeholder="0"
                  className="h-10 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold flex items-center gap-1">
                  <IndianRupee className="w-3 h-3" /> Sale Price
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={form.salePrice}
                  onChange={e => setForm(prev => ({ ...prev, salePrice: Number(e.target.value) }))}
                  placeholder="0"
                  className="h-10 text-sm"
                />
              </div>
            </div>

            <Separator />

            {/* Serial Numbers — MANDATORY */}
            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Hash className="w-4 h-4 text-primary" />
                  Serial Numbers <span className="text-destructive">*</span>
                </div>
                <Badge
                  variant="secondary"
                  className={cn(
                    serialsEntered
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : ''
                  )}
                >
                  {quantity} {quantity === 1 ? 'unit' : 'units'}
                </Badge>
              </div>

              <div className="flex gap-2">
                <Input
                  ref={serialInputRef}
                  placeholder={`Add serial #${form.serialNumbers.length + 1}…`}
                  value={serialInput}
                  onChange={e => setSerialInput(e.target.value)}
                  onKeyDown={handleSerialKeyDown}
                  className="font-mono uppercase h-9 text-sm"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={addSerial}
                  disabled={!serialInput.trim()}
                  className="h-9 px-3 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>

              {form.serialNumbers.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {form.serialNumbers.map((sn, i) => (
                    <span
                      key={sn}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-background border border-border text-xs font-mono"
                    >
                      <span className="text-muted-foreground">{i + 1}.</span>
                      {sn}
                      <button
                        type="button"
                        onClick={() => removeSerial(sn)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {!serialsEntered && (
                <p className="text-xs text-muted-foreground">
                  Serial numbers daalo — quantity automatically set ho jayegi
                </p>
              )}
              {serialsEntered && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {quantity} unit{quantity > 1 ? 's' : ''} record honge
                </p>
              )}
            </div>

            <Separator />

            {/* Notes */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1">
                <FileText className="w-3 h-3" /> Notes
                <span className="text-muted-foreground font-normal ml-1">(optional)</span>
              </Label>
              <Textarea
                value={form.notes}
                onChange={set('notes')}
                rows={2}
                placeholder="Koi additional context… (e.g. pehle se diya tha, purana stock)"
                className="text-sm resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="flex-none px-6 py-4 border-t bg-muted/40 rounded-b-lg gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="h-9 text-sm">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit}
              className="h-9 text-sm gap-2 min-w-36 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</>
                : <><ArrowDownToLine className="w-3.5 h-3.5" /> Add Stock In</>
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}