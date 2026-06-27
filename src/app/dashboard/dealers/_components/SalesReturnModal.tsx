'use client'

import { useState, useEffect } from 'react'
import {
  Undo2, AlertCircle, Loader2, Hash, CalendarDays, FileText,
} from 'lucide-react'
import { branchesService, dealersService } from '@/services/dealers.service'
import type { StockSummaryItem, Branch } from '@/types/dealers.types'
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

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CreateSalesReturnPayload {
  productId: string
  branchId: string
  quantity: number
  serialNumberIds?: string[]
  notes?: string
  date?: string
}

interface DealerSerial {
  id: string
  serialNumber: string
  status: string
  dealerBillingStatus: string | null
  historicalStockId?: string | null
  isManual?: boolean
}

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateSalesReturnPayload) => Promise<void>
  dealerName: string
  dealerId: string
  stockSummary: StockSummaryItem[]
}

const EMPTY: CreateSalesReturnPayload = {
  productId: '', branchId: '', quantity: 1, notes: '', date: '',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getProductKey = (product: StockSummaryItem['product']) =>
  product.id ?? `manual__${product.name}`

// ─── Component ────────────────────────────────────────────────────────────────

export default function SalesReturnModal({
  open, onClose, onSubmit, dealerName, dealerId, stockSummary,
}: Props) {
  const [form, setForm] = useState<CreateSalesReturnPayload>(EMPTY)
  const [branches, setBranches] = useState<Branch[]>([])
  const [loadingBranches, setLoadingBranches] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Serial state
  const [dealerSerials, setDealerSerials] = useState<DealerSerial[]>([])
  const [selectedSerialIds, setSelectedSerialIds] = useState<string[]>([])
  const [loadingSerials, setLoadingSerials] = useState(false)

  const availableProducts = stockSummary.filter((s) => s.balance > 0)

  const selectedSummary = stockSummary.find((s) => getProductKey(s.product) === form.productId)
  const isHistoricalManual = selectedSummary ? !selectedSummary.product.id : false
  const isSerialProduct = selectedSummary?.product.hasSerialNumbers ?? false

  // Serial section — real serial product + manual historical dono ke liye
  const showSerialSection = (isSerialProduct || isHistoricalManual) && !!form.productId

  const maxQty = selectedSummary?.balance ?? 0
  const effectiveQty = (isSerialProduct || isHistoricalManual) ? selectedSerialIds.length : form.quantity

  // Reset on open + load branches
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

  // Fetch serials jab product select ho
  useEffect(() => {
    setSelectedSerialIds([])
    setDealerSerials([])
    if (!form.productId || !dealerId) return
    if (!isSerialProduct && !isHistoricalManual) return

    setLoadingSerials(true)

    const actualProductId = isHistoricalManual ? undefined : form.productId
    const productName = isHistoricalManual ? selectedSummary?.product.name : undefined

    dealersService.getDealerSerials(dealerId, actualProductId, undefined, productName)
      .then((res) => setDealerSerials(res.data))
      .catch(() => setDealerSerials([]))
      .finally(() => setLoadingSerials(false))
  }, [form.productId, dealerId, isSerialProduct, isHistoricalManual])

  // Serial qty sync
  useEffect(() => {
    if (isSerialProduct || isHistoricalManual) {
      setForm((f) => ({ ...f, quantity: selectedSerialIds.length || 1 }))
    }
  }, [selectedSerialIds, isSerialProduct, isHistoricalManual])

  const toggleSerial = (id: string) => {
    setSelectedSerialIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const set = (k: keyof CreateSalesReturnPayload) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({
        ...f,
        [k]: e.target.type === 'number' ? Number(e.target.value) : e.target.value,
      }))

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setError(null)
  if (!form.productId) return setError('Please select a product')
  if (!form.branchId) return setError('Please select a branch to return stock to')
  if ((isSerialProduct || isHistoricalManual) && selectedSerialIds.length === 0)
    return setError('Please select serial numbers to return')
  if (!isSerialProduct && !isHistoricalManual && form.quantity < 1)
    return setError('Quantity must be at least 1')
  if (!isSerialProduct && !isHistoricalManual && form.quantity > maxQty)
    return setError(`Dealer only has ${maxQty} units to return`)

  try {
    setSaving(true)

    const actualProductId = isHistoricalManual ? '' : form.productId

    await onSubmit({
      ...form,
      productId: actualProductId,
      quantity: (isSerialProduct || isHistoricalManual) ? selectedSerialIds.length : form.quantity,
      ...((isSerialProduct || isHistoricalManual) && selectedSerialIds.length > 0 && {
        serialNumberIds: selectedSerialIds,
      }),
      ...(isHistoricalManual && { productName: selectedSummary?.product.name }),  // ✅ ye line add karo
    })
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to record return')
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
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0 dark:bg-amber-950/30 dark:border-amber-800">
              <Undo2 className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold">Sales Return</DialogTitle>
              <DialogDescription className="text-[11px] mt-0.5">
                Return stock from{' '}
                <span className="font-semibold text-foreground">{dealerName}</span>{' '}
                back to branch
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {availableProducts.length === 0 ? (
          <div className="flex flex-col items-center py-16 px-6 gap-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
              <Undo2 className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="font-semibold text-foreground">No stock with this dealer</p>
            <p className="text-sm text-muted-foreground">Dealer has no balance stock to return</p>
            <Button variant="outline" onClick={onClose} className="mt-2">Close</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

              <SectionLabel>Return Details</SectionLabel>

              {/* Product */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  Product <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={form.productId}
                  onValueChange={(v) => {
                    setForm((f) => ({ ...f, productId: v, quantity: 1 }))
                    setSelectedSerialIds([])
                  }}
                >
                  <SelectTrigger className="h-10 text-sm">
                    <SelectValue placeholder="Select product to return…" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProducts.map(({ product, balance }) => {
                      const key = getProductKey(product)
                      return (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <span>{product.name}</span>
                            {product.sku && (
                              <span className="text-[10px] font-mono text-muted-foreground">
                                {product.sku}
                              </span>
                            )}
                            <Badge variant="secondary" className="text-[10px] h-4 px-1.5 ml-1">
                              {balance} with dealer
                            </Badge>
                            {!product.id && (
                              <Badge variant="outline" className="text-[10px] h-4 px-1.5 text-amber-600 border-amber-200 bg-amber-50">
                                Manual
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Branch */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  Return to Branch <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={form.branchId}
                  onValueChange={(v) => setForm((f) => ({ ...f, branchId: v }))}
                  disabled={loadingBranches}
                >
                  <SelectTrigger className="h-10 text-sm">
                    <SelectValue placeholder={loadingBranches ? 'Loading branches…' : 'Select branch…'} />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((b) => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">Stock will be added back to this branch</p>
              </div>

              {/* Serial Numbers — real serial product + manual historical dono ke liye */}
              {showSerialSection && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">
                      Select Serials to Return <span className="text-destructive">*</span>
                    </Label>
                    {selectedSerialIds.length > 0 && (
                      <Badge variant="outline" className="text-[10px] h-4 px-1.5 border-amber-300 text-amber-700 bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:bg-amber-950/30">
                        {selectedSerialIds.length} selected
                      </Badge>
                    )}
                  </div>

                  {loadingSerials ? (
                    <div className="flex items-center gap-2 py-3 px-3 bg-muted/50 rounded-lg">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Loading serial numbers…</span>
                    </div>
                  ) : dealerSerials.length === 0 ? (
                    <div className="py-3 px-3 bg-amber-50 rounded-lg border border-amber-100 dark:bg-amber-950/20 dark:border-amber-900">
                      <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                        No serial numbers found with this dealer for the selected product.
                      </p>
                    </div>
                  ) : (
                    <div className="border border-border rounded-lg overflow-hidden">
                      {/* Select All */}
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedSerialIds.length === dealerSerials.length) {
                            setSelectedSerialIds([])
                          } else {
                            setSelectedSerialIds(dealerSerials.map((s) => s.id))
                          }
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-left bg-muted/40 hover:bg-muted/70 border-b border-border transition-colors"
                      >
                        <div className={`w-4 h-4 rounded flex items-center justify-center border flex-shrink-0 transition-all ${
                          selectedSerialIds.length === dealerSerials.length
                            ? 'bg-amber-500 border-amber-500'
                            : selectedSerialIds.length > 0
                            ? 'bg-amber-200 border-amber-400'
                            : 'border-border bg-background'
                        }`}>
                          {selectedSerialIds.length > 0 && (
                            <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                              <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        <span className="text-xs font-semibold text-muted-foreground">
                          {selectedSerialIds.length === dealerSerials.length ? 'Deselect all' : 'Select all'}
                          <span className="ml-1 font-normal">({dealerSerials.length} serials)</span>
                        </span>
                      </button>

                      {/* Serial list */}
                      <div className="max-h-44 overflow-y-auto divide-y divide-border">
                        {dealerSerials.map((serial) => {
                          const isSelected = selectedSerialIds.includes(serial.id)
                          return (
                            <button
                              key={serial.id}
                              type="button"
                              onClick={() => toggleSerial(serial.id)}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                                isSelected
                                  ? 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/20 dark:hover:bg-amber-950/30'
                                  : 'bg-background hover:bg-muted/50'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded flex items-center justify-center border flex-shrink-0 transition-all ${
                                isSelected ? 'bg-amber-500 border-amber-500' : 'border-border bg-background'
                              }`}>
                                {isSelected && (
                                  <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                                    <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                )}
                              </div>
                              <span className={`font-mono text-xs font-semibold ${isSelected ? 'text-amber-700 dark:text-amber-400' : 'text-foreground'}`}>
                                {serial.serialNumber}
                              </span>
                              {serial.isManual && (
                                <Badge variant="outline" className="ml-auto text-[9px] h-4 px-1 font-normal text-amber-600 border-amber-200 bg-amber-50">
                                  Historical
                                </Badge>
                              )}
                              {!serial.isManual && serial.dealerBillingStatus && (
                                <Badge variant="outline" className="ml-auto text-[9px] h-4 px-1 font-normal">
                                  {serial.dealerBillingStatus}
                                </Badge>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <Separator />
              <SectionLabel>Quantity & Info</SectionLabel>

              <div className="grid grid-cols-2 gap-3">
                {/* Quantity */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    Quantity <span className="text-destructive">*</span>
                    {!isSerialProduct && !isHistoricalManual && maxQty > 0 && (
                      <span className="text-muted-foreground font-normal ml-1">(max {maxQty})</span>
                    )}
                  </Label>
                  {(isSerialProduct || isHistoricalManual) ? (
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

                {/* Date */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Date</Label>
                  <div className="relative">
                    <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                    <Input
                      type="date" value={form.date} onChange={set('date')}
                      className="pl-8 h-10 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Notes</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                  <Input
                    value={form.notes} onChange={set('notes')}
                    placeholder="Reason for return (optional)"
                    className="pl-8 h-10 text-sm"
                  />
                </div>
              </div>

              {/* Return summary banner */}
              {effectiveQty > 0 && form.branchId && (
                <div className="flex items-center justify-between px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl dark:bg-amber-950/20 dark:border-amber-900">
                  <span className="text-xs text-amber-700 dark:text-amber-400">
                    Returning <span className="font-bold">{effectiveQty}</span> unit{effectiveQty !== 1 ? 's' : ''} back to branch
                  </span>
                  <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-700 bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:bg-transparent">
                    Stock restored
                  </Badge>
                </div>
              )}

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
                {effectiveQty > 0 ? (
                  <span className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground tabular-nums">{effectiveQty}</span> unit{effectiveQty !== 1 ? 's' : ''} will be returned
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground/50">Select product & quantity</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" onClick={onClose} className="h-9 text-sm">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="h-9 text-sm gap-2 bg-amber-500 hover:bg-amber-600 text-white dark:bg-amber-600 dark:hover:bg-amber-700"
                >
                  {saving
                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing…</>
                    : <><Undo2 className="w-3.5 h-3.5" /> Confirm Return</>
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