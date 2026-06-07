'use client'

import { useState, useEffect } from 'react'
import {
  Package, AlertCircle, Loader2, ArrowRight,
  Warehouse, Tag, Hash, CalendarDays, FileText, IndianRupee,
} from 'lucide-react'
import { productsService, branchesService } from '@/services/dealers.service'
import { serialService } from '@/services/serial.service'
import type { CreateDealerStockInPayload, Branch } from '@/types/dealers.types'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

interface ProductOption {
  id: string
  name: string
  sku: string
  purchasePrice: number
  sellingPrice: number
  hasSerialNumbers?: boolean
}

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateDealerStockInPayload & { serialNumberIds?: string[] }) => Promise<void>
  dealerName: string
}

const EMPTY = {
  productId: '', branchId: '', quantity: 1, costPrice: 0, date: '', referenceNo: '', notes: '',
}

export default function GiveStockModal({ open, onClose, onSubmit, dealerName }: Props) {
  const [form, setForm] = useState(EMPTY)
  const [products, setProducts] = useState<ProductOption[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [branchStock, setBranchStock] = useState<number | null>(null)
  const [loadingDropdowns, setLoadingDropdowns] = useState(false)
  const [loadingStock, setLoadingStock] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Serial number state
  const [availableSerials, setAvailableSerials] = useState<{ id: string; serialNumber: string }[]>([])
  const [selectedSerialIds, setSelectedSerialIds] = useState<string[]>([])
  const [loadingSerials, setLoadingSerials] = useState(false)

  const selectedProduct = products.find((p) => p.id === form.productId)
  const isSerialProduct = selectedProduct?.hasSerialNumbers ?? false

  // Load products + branches on open
  useEffect(() => {
    if (!open) return
    setForm(EMPTY)
    setError(null)
    setBranchStock(null)
    setAvailableSerials([])
    setSelectedSerialIds([])

    const load = async () => {
      setLoadingDropdowns(true)
      try {
        const [pRes, bRes] = await Promise.all([productsService.getAll(), branchesService.getAll()])
        setProducts(pRes.data)
        setBranches(bRes.data)
      } catch {
        setError('Failed to load products or branches')
      } finally {
        setLoadingDropdowns(false)
      }
    }
    load()
  }, [open])

  // Fetch branch stock when product + branch selected
  useEffect(() => {
    if (!form.productId || !form.branchId) { setBranchStock(null); return }
    const fetch = async () => {
      setLoadingStock(true)
      try {
        const res = await productsService.getStock(form.productId, form.branchId)
        const entry = res.data.find((s: { branchId: string }) => s.branchId === form.branchId)
        setBranchStock(entry?.currentStock ?? 0)
      } catch {
        setBranchStock(null)
      } finally {
        setLoadingStock(false)
      }
    }
    fetch()
  }, [form.productId, form.branchId])

  // Fetch available serials when serialized product + branch selected
  useEffect(() => {
    setSelectedSerialIds([])
    if (!form.productId || !form.branchId || !isSerialProduct) {
      setAvailableSerials([])
      return
    }
    const fetch = async () => {
      setLoadingSerials(true)
      try {
        const serials = await serialService.getAvailable(form.productId, form.branchId)
        setAvailableSerials(serials)
      } catch {
        setAvailableSerials([])
      } finally {
        setLoadingSerials(false)
      }
    }
    fetch()
  }, [form.productId, form.branchId, isSerialProduct])

  // For serial products: quantity driven by selection
  useEffect(() => {
    if (isSerialProduct) {
      setForm((f) => ({ ...f, quantity: selectedSerialIds.length || 1 }))
    }
  }, [selectedSerialIds, isSerialProduct])

  const handleProductChange = (productId: string) => {
    const product = products.find((p) => p.id === productId)
    setForm((f) => ({ ...f, productId, costPrice: product?.purchasePrice ?? 0 }))
    setSelectedSerialIds([])
  }

  const toggleSerial = (id: string) => {
    setSelectedSerialIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const set = (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.type === 'number' ? Number(e.target.value) : e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!form.productId) return setError('Please select a product')
    if (!form.branchId) return setError('Please select a branch')
    if (isSerialProduct && selectedSerialIds.length === 0) return setError('Please select serial numbers')
    if (form.quantity < 1) return setError('Quantity must be at least 1')
    if (branchStock !== null && form.quantity > branchStock)
      return setError(`Only ${branchStock} units available in this branch`)
    try {
      setSaving(true)
      await onSubmit({
        ...form,
        quantity: isSerialProduct ? selectedSerialIds.length : form.quantity,
        ...(isSerialProduct && { serialNumberIds: selectedSerialIds }),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to give stock')
    } finally {
      setSaving(false)
    }
  }

  const total = form.quantity * form.costPrice
  const stockStatus =
    branchStock === null ? null
    : branchStock === 0 ? 'empty'
    : branchStock < 10 ? 'low'
    : 'ok'

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col p-0 gap-0">

        {/* Header */}
        <DialogHeader className="flex-none px-5 py-4 border-b bg-muted/40 rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Package className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-sm font-bold leading-tight">Give Stock to Dealer</DialogTitle>
              <DialogDescription className="text-[11px] mt-0.5 flex items-center gap-1">
                <Warehouse className="w-2.5 h-2.5 shrink-0" />
                Branch inventory
                <ArrowRight className="w-2.5 h-2.5 shrink-0" />
                <span className="font-semibold text-foreground truncate">{dealerName}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
            {loadingDropdowns ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                <span className="text-sm">Loading data…</span>
              </div>
            ) : (
              <>
                <SectionLabel>Stock Details</SectionLabel>

                {/* Product */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    Product <span className="text-destructive">*</span>
                  </Label>
                  <Select value={form.productId} onValueChange={handleProductChange}>
                    <SelectTrigger className="h-10 text-sm">
                      <SelectValue placeholder="Select a product…" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          <span className="font-medium">{p.name}</span>
                          <span className="text-muted-foreground ml-2 text-xs">{p.sku}</span>
                          {p.hasSerialNumbers && (
                            <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-violet-50 text-violet-500 font-semibold border border-violet-100">S/N</span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedProduct && (
                    <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-muted/50 border rounded-lg text-xs">
                      <Badge variant="outline" className="font-mono text-[10px] px-1.5 h-4">
                        {selectedProduct.sku}
                      </Badge>
                      <span className="w-px h-3 bg-border" />
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Tag className="w-2.5 h-2.5" />
                        MRP ₹{selectedProduct.sellingPrice.toLocaleString('en-IN')}
                      </span>
                      <span className="text-muted-foreground">· Cost ₹{selectedProduct.purchasePrice.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>

                {/* Branch */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    From Branch <span className="text-destructive">*</span>
                  </Label>
                  <Select value={form.branchId} onValueChange={(v) => setForm((f) => ({ ...f, branchId: v }))}>
                    <SelectTrigger className="h-10 text-sm">
                      <SelectValue placeholder="Select a branch…" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name}{b.code ? ` (${b.code})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Branch stock indicator */}
                  {form.productId && form.branchId && (
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border ${
                      loadingStock ? 'bg-muted text-muted-foreground border-border'
                      : stockStatus === 'empty' ? 'bg-destructive/10 text-destructive border-destructive/20'
                      : stockStatus === 'low' ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {loadingStock ? (
                        <><Loader2 className="w-3 h-3 animate-spin" /> Checking stock…</>
                      ) : branchStock !== null ? (
                        <>
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            stockStatus === 'empty' ? 'bg-destructive' : stockStatus === 'low' ? 'bg-amber-500' : 'bg-emerald-500'
                          }`} />
                          {branchStock === 0 ? 'Out of stock in this branch' : <><strong>{branchStock}</strong>&nbsp;units available</>}
                        </>
                      ) : null}
                    </div>
                  )}
                </div>

                {/* Serial Numbers — only for serialized products */}
                {isSerialProduct && form.productId && form.branchId && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold flex items-center gap-1.5">
                        <Hash className="w-3 h-3" />
                        Serial Numbers <span className="text-destructive">*</span>
                      </Label>
                      <span className={`text-xs font-semibold tabular-nums px-2 py-0.5 rounded-full ${
                        selectedSerialIds.length > 0 ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {selectedSerialIds.length} selected
                      </span>
                    </div>

                    {loadingSerials ? (
                      <div className="flex items-center gap-2 py-3 px-3 bg-muted/50 rounded-lg border">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Loading serial numbers…</span>
                      </div>
                    ) : availableSerials.length === 0 ? (
                      <div className="py-3 px-3 bg-amber-50 rounded-lg border border-amber-100">
                        <p className="text-xs text-amber-600 font-medium">No available serial numbers in this branch for this product.</p>
                      </div>
                    ) : (
                      <div className="border border-border rounded-lg overflow-hidden">
                        <div className="max-h-44 overflow-y-auto divide-y divide-border">
                          {availableSerials.map((serial) => {
                            const isSelected = selectedSerialIds.includes(serial.id)
                            return (
                              <button
                                key={serial.id}
                                type="button"
                                onClick={() => toggleSerial(serial.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                                  isSelected ? 'bg-blue-50 hover:bg-blue-100' : 'bg-background hover:bg-muted/50'
                                }`}
                              >
                                <div className={`w-4 h-4 rounded flex items-center justify-center border flex-shrink-0 transition-all ${
                                  isSelected ? 'bg-blue-600 border-blue-600' : 'border-border bg-background'
                                }`}>
                                  {isSelected && (
                                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                                      <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  )}
                                </div>
                                <span className={`font-mono text-xs font-semibold ${isSelected ? 'text-blue-700' : 'text-foreground'}`}>
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
                <SectionLabel>Quantity & Pricing</SectionLabel>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">
                      Quantity <span className="text-destructive">*</span>
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
                          type="number" min={1} max={branchStock ?? undefined}
                          value={form.quantity} onChange={set('quantity')} required
                          className="pl-8 h-10 text-sm"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">
                      Cost Price <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                      <Input
                        type="number" min={0} step={0.01}
                        value={form.costPrice} onChange={set('costPrice')} required
                        className="pl-8 h-10 text-sm"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">Price given to dealer</p>
                  </div>
                </div>

                {/* Total Preview */}
                {(isSerialProduct ? selectedSerialIds.length : form.quantity) > 0 && form.costPrice > 0 && (
                  <div className="flex items-center justify-between px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl">
                    <span className="text-xs text-blue-500">
                      {isSerialProduct ? selectedSerialIds.length : form.quantity} × ₹{form.costPrice.toLocaleString('en-IN')}
                    </span>
                    <div className="flex items-center gap-2">
                      <ArrowRight className="w-3 h-3 text-blue-400" />
                      <span className="text-base font-bold text-blue-700 tabular-nums">
                        ₹{((isSerialProduct ? selectedSerialIds.length : form.quantity) * form.costPrice).toLocaleString('en-IN')}
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
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Notes</Label>
                  <Textarea value={form.notes} onChange={set('notes')} placeholder="Any additional notes…" rows={2} className="text-sm resize-none" />
                </div>

                {error && (
                  <div className="flex items-start gap-2.5 px-3.5 py-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-xs">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <DialogFooter className="flex-none px-5 py-4 border-t bg-muted/40 rounded-b-lg sm:justify-between">
            <div className="hidden sm:block">
              {(isSerialProduct ? selectedSerialIds.length : form.quantity) > 0 && form.costPrice > 0 ? (
                <span className="text-xs text-muted-foreground">
                  Total <span className="font-semibold text-foreground tabular-nums">
                    ₹{total.toLocaleString('en-IN')}
                  </span>
                </span>
              ) : (
                <span className="text-xs text-muted-foreground/50">Fill in quantity & price</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={onClose} className="h-9 text-sm">Cancel</Button>
              <Button type="submit" disabled={saving || loadingDropdowns} className="h-9 text-sm gap-2">
                {saving ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</>
                ) : (
                  <><Package className="w-3.5 h-3.5" /> Give Stock</>
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
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