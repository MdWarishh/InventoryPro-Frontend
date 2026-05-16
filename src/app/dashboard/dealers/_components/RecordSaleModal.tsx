'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, AlertCircle, Loader2, ArrowRight, Hash, IndianRupee, CalendarDays, FileText } from 'lucide-react'
import { branchesService, dealersService } from '@/services/dealers.service'
import type { CreateDealerStockOutPayload, StockSummaryItem, Branch, UnbilledSerial } from '@/types/dealers.types'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateDealerStockOutPayload & { serialNumberIds?: string[] }) => Promise<void>
  dealerName: string
  dealerId: string
  stockSummary: StockSummaryItem[]
}

const EMPTY: CreateDealerStockOutPayload = {
  productId: '', branchId: '', quantity: 1, salePrice: 0, date: '', notes: '',
}

export default function RecordSaleModal({ open, onClose, onSubmit, dealerName, dealerId, stockSummary }: Props) {
  const [form, setForm] = useState<CreateDealerStockOutPayload>(EMPTY)
  const [branches, setBranches] = useState<Branch[]>([])
  const [loadingBranches, setLoadingBranches] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Serial number state
  const [dealerSerials, setDealerSerials] = useState<UnbilledSerial[]>([])
  const [selectedSerialIds, setSelectedSerialIds] = useState<string[]>([])
  const [loadingSerials, setLoadingSerials] = useState(false)

  const availableProducts = stockSummary.filter((s) => s.balance > 0)
  const selectedSummary = stockSummary.find((s) => s.product.id === form.productId)
  const isSerialProduct = selectedSummary?.product.hasSerialNumbers ?? false
  const maxQty = selectedSummary?.balance ?? 0
  const effectiveQty = isSerialProduct ? selectedSerialIds.length : form.quantity
  const total = effectiveQty * form.salePrice

  // Reset + load branches on open
  useEffect(() => {
    if (!open) return
    setForm(EMPTY)
    setError(null)
    setDealerSerials([])
    setSelectedSerialIds([])

    setLoadingBranches(true)
    branchesService.getAll()
      .then((res) => setBranches(res.data))
      .catch(() => {})
      .finally(() => setLoadingBranches(false))
  }, [open])

  // Fetch dealer's TRANSFERRED serials when serial product selected
  // branchId serial fetch mein mat bhejo — serials stockInId se linked hain, branchId se nahi
  useEffect(() => {
    setSelectedSerialIds([])
    setDealerSerials([])
    if (!form.productId || !isSerialProduct || !dealerId) return

    setLoadingSerials(true)
    dealersService.getDealerSerials(dealerId, form.productId)
      .then((res) => setDealerSerials(res.data))
      .catch(() => setDealerSerials([]))
      .finally(() => setLoadingSerials(false))
  }, [form.productId, isSerialProduct, dealerId])

  // Serial products: quantity = selected serials count
  useEffect(() => {
    if (isSerialProduct) {
      setForm((f) => ({ ...f, quantity: selectedSerialIds.length || 1 }))
    }
  }, [selectedSerialIds, isSerialProduct])

  const toggleSerial = (id: string) => {
    setSelectedSerialIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const set = (k: keyof CreateDealerStockOutPayload) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({
        ...f,
        [k]: e.target.type === 'number' ? Number(e.target.value) : e.target.value,
      }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!form.productId) return setError('Please select a product')
    if (!form.branchId) return setError('Please select a branch')
    if (isSerialProduct && selectedSerialIds.length === 0) return setError('Please select serial numbers')
    if (!isSerialProduct && form.quantity < 1) return setError('Quantity must be at least 1')
    if (!isSerialProduct && form.quantity > maxQty) return setError(`Dealer only has ${maxQty} units of this product`)
    try {
      setSaving(true)
      await onSubmit({
        ...form,
        quantity: isSerialProduct ? selectedSerialIds.length : form.quantity,
        ...(isSerialProduct && { serialNumberIds: selectedSerialIds }),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record sale')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col p-0 gap-0">

        {/* Header */}
        <DialogHeader className="flex-none px-5 py-4 border-b bg-muted/40 rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold">Record Dealer Sale</DialogTitle>
              <DialogDescription className="text-[11px] mt-0.5">
                Record a sale made by{' '}
                <span className="font-semibold text-foreground">{dealerName}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {availableProducts.length === 0 ? (
          <div className="flex flex-col items-center py-16 px-6 gap-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="font-semibold text-foreground">No stock with this dealer</p>
            <p className="text-sm text-muted-foreground">Give stock to dealer first before recording a sale</p>
            <Button variant="outline" onClick={onClose} className="mt-2">Close</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

              <SectionLabel>Sale Details</SectionLabel>

              {/* Product */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  Product <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={form.productId}
                  onValueChange={(v) => {
                    const s = stockSummary.find((x) => x.product.id === v)
                    setForm((f) => ({ ...f, productId: v, salePrice: s?.product.sellingPrice ?? 0, quantity: 1 }))
                    setSelectedSerialIds([])
                  }}
                >
                  <SelectTrigger className="h-10 text-sm">
                    <SelectValue placeholder="Select a product…" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProducts.map(({ product, balance }) => (
                      <SelectItem key={product.id} value={product.id}>
                        <span className="font-medium">{product.name}</span>
                        <span className="text-muted-foreground ml-2 text-xs">— {balance} units</span>
                        {product.hasSerialNumbers && (
                          <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-violet-50 text-violet-500 font-semibold border border-violet-100">S/N</span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedSummary && (
                  <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-muted/50 border rounded-lg">
                    {selectedSummary.product.sku && (
                      <Badge variant="outline" className="font-mono text-[10px] px-1.5 h-4">
                        {selectedSummary.product.sku}
                      </Badge>
                    )}
                    <Badge className="text-[10px] h-5 bg-primary/10 text-primary hover:bg-primary/10 border-0">
                      {selectedSummary.balance} with dealer
                    </Badge>
                    <Badge variant="outline" className="text-[10px] h-5 text-blue-600 border-blue-200 bg-blue-50">
                      Given: {selectedSummary.given}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] h-5 text-emerald-600 border-emerald-200 bg-emerald-50">
                      Sold: {selectedSummary.sold}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Branch */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  Branch <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={form.branchId}
                  onValueChange={(v) => setForm((f) => ({ ...f, branchId: v }))}
                  disabled={loadingBranches}
                >
                  <SelectTrigger className="h-10 text-sm">
                    <SelectValue placeholder="Select a branch…" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((b) => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Serial Numbers — only for serialized products */}
              {isSerialProduct && form.productId && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold flex items-center gap-1.5">
                      <Hash className="w-3 h-3" />
                      Select Serial Numbers Sold <span className="text-destructive">*</span>
                    </Label>
                    <span className={`text-xs font-semibold tabular-nums px-2 py-0.5 rounded-full ${
                      selectedSerialIds.length > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {selectedSerialIds.length} selected
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Pick the serial numbers that were sold by the dealer</p>

                  {loadingSerials ? (
                    <div className="flex items-center gap-2 py-3 px-3 bg-muted/50 rounded-lg border">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Loading serial numbers…</span>
                    </div>
                  ) : dealerSerials.length === 0 ? (
                    <div className="py-3 px-3 bg-amber-50 rounded-lg border border-amber-100">
                      <p className="text-xs text-amber-600 font-medium">
                        No serial numbers found with this dealer for the selected product.
                      </p>
                    </div>
                  ) : (
                    <div className="border border-border rounded-lg overflow-hidden">
                      <div className="max-h-44 overflow-y-auto divide-y divide-border">
                        {dealerSerials.map((serial) => {
                          const isSelected = selectedSerialIds.includes(serial.id)
                          return (
                            <button
                              key={serial.id}
                              type="button"
                              onClick={() => toggleSerial(serial.id)}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                                isSelected ? 'bg-emerald-50 hover:bg-emerald-100' : 'bg-background hover:bg-muted/50'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded flex items-center justify-center border flex-shrink-0 transition-all ${
                                isSelected ? 'bg-emerald-600 border-emerald-600' : 'border-border bg-background'
                              }`}>
                                {isSelected && (
                                  <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                                    <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                )}
                              </div>
                              <span className={`font-mono text-xs font-semibold ${isSelected ? 'text-emerald-700' : 'text-foreground'}`}>
                                {serial.serialNumber}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <Separator />
              <SectionLabel>Quantity & Price</SectionLabel>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    Quantity <span className="text-destructive">*</span>
                    {!isSerialProduct && maxQty > 0 && (
                      <span className="text-muted-foreground font-normal ml-1">(max {maxQty})</span>
                    )}
                  </Label>
                  {isSerialProduct ? (
                    <div className="h-10 border border-border rounded-md flex items-center px-3 bg-muted/50 text-sm font-semibold text-muted-foreground tabular-nums select-none">
                      {selectedSerialIds.length || '—'}
                      <span className="ml-1.5 text-xs font-normal">(from serials)</span>
                    </div>
                  ) : (
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                      <Input
                        type="number" min={1} max={maxQty}
                        value={form.quantity} onChange={set('quantity')} required
                        className="pl-8 h-10 text-sm"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    Sale Price <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                    <Input
                      type="number" min={0} step={0.01}
                      value={form.salePrice} onChange={set('salePrice')} required
                      className="pl-8 h-10 text-sm"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">Price dealer sold at</p>
                </div>
              </div>

              {effectiveQty > 0 && form.salePrice > 0 && (
                <div className="flex items-center justify-between px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <span className="text-xs text-emerald-600">
                    {effectiveQty} × ₹{form.salePrice.toLocaleString('en-IN')}
                  </span>
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-3 h-3 text-emerald-400" />
                    <span className="text-base font-bold text-emerald-700 tabular-nums">
                      ₹{total.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              )}

              <Separator />
              <SectionLabel optional>Additional Info</SectionLabel>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Date</Label>
                  <div className="relative">
                    <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                    <Input type="date" value={form.date} onChange={set('date')} className="pl-8 h-10 text-sm" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Notes</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                    <Input value={form.notes} onChange={set('notes')} placeholder="Optional" className="pl-8 h-10 text-sm" />
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2.5 px-3.5 py-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-xs">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <DialogFooter className="flex-none px-5 py-4 border-t bg-muted/40 rounded-b-lg sm:justify-between">
              <div className="hidden sm:block">
                {effectiveQty > 0 && form.salePrice > 0 ? (
                  <span className="text-xs text-muted-foreground">
                    Total <span className="font-semibold text-foreground tabular-nums">₹{total.toLocaleString('en-IN')}</span>
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground/50">Fill in quantity & price</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" onClick={onClose} className="h-9 text-sm">Cancel</Button>
                <Button type="submit" disabled={saving} className="h-9 text-sm gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                  {saving
                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Recording…</>
                    : <><TrendingUp className="w-3.5 h-3.5" /> Record Sale</>
                  }
                </Button>
              </div>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

function SectionLabel({ children, optional }: { children: React.ReactNode; optional?: boolean }) {
  return (
    <div className="flex items-center gap-2 pb-1 border-b">
      <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">{children}</span>
      {optional && (
        <Badge variant="secondary" className="text-[10px] h-4 px-1.5 normal-case tracking-normal font-normal">optional</Badge>
      )}
    </div>
  )
}