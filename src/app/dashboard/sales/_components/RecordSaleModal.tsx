'use client'

import { Loader2, ShoppingCart, Hash } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { salesService } from '@/services/sales.service'
import { productsService } from '@/services/products.service'
import { dealersService } from '@/services/dealers.service'
import { branchesService } from '@/services/branches.service'
import { serialService } from '@/services/serial.service'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const schema = z.object({
  productId: z.string().min(1, 'Select a product'),
  branchId: z.string().optional(),
  quantity: z.number({ invalid_type_error: 'Enter quantity' }).min(1, 'Min 1'),
  sellingPrice: z.number({ invalid_type_error: 'Enter price' }).min(0, 'Must be ≥ 0'),
  dealerId: z.string().optional().or(z.literal('')),
  customerName: z.string().optional().or(z.literal('')),
  customerPhone: z.string().optional().or(z.literal('')),
  note: z.string().optional().or(z.literal('')),
})

type FormValues = z.infer<typeof schema>

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
      {children}
      {required && <span className="text-red-500 ml-0.5 normal-case tracking-normal">*</span>}
    </Label>
  )
}

interface Props { onClose: () => void }

export function RecordSaleModal({ onClose }: Props) {
  const qc = useQueryClient()
  const { isSuperAdmin, user } = useAuth()

  // Track selected serial number IDs separately (outside react-hook-form)
  const [selectedSerialIds, setSelectedSerialIds] = useState<string[]>([])
  const [serialError, setSerialError] = useState<string | null>(null)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { quantity: 1, sellingPrice: 0 },
  })

  const { data: productsData } = useQuery({
    queryKey: ['products-select'],
    queryFn: () => productsService.getAll({ limit: 100 }),
  })
  const products = productsData?.products ?? []

  const { data: dealersData } = useQuery({
    queryKey: ['dealers-select'],
    queryFn: () => dealersService.getAll({ limit: 100 }),
  })
  const dealers = dealersData?.data ?? []

  const { data: branchRaw } = useQuery({
    queryKey: ['branches-all'],
    queryFn: () => branchesService.getAll(),
    enabled: isSuperAdmin,
  })
  const branches = Array.isArray(branchRaw) ? branchRaw
    : (branchRaw as any)?.branches ?? (branchRaw as any)?.data ?? []

  const selectedProductId = watch('productId')
  const selectedBranchId = watch('branchId')
  // Non-superadmin ke liye user ka apna branchId use hoga
  const effectiveBranchId = isSuperAdmin ? selectedBranchId : (user?.branchId ?? undefined)
  const selectedProduct = products.find((p) => p.id === selectedProductId)
  const isSerialProduct = selectedProduct?.hasSerialNumbers ?? false
  const quantity = watch('quantity')

  // Fetch available serial numbers when product or branch changes
  const { data: availableSerials = [], isFetching: serialsFetching } = useQuery({
    queryKey: ['serials-available', selectedProductId, effectiveBranchId],
    queryFn: () => serialService.getAvailable(selectedProductId, effectiveBranchId),
    enabled: !!selectedProductId && isSerialProduct && !!effectiveBranchId,
  })

  // Reset serial selection when product or branch changes
  useEffect(() => {
    setSelectedSerialIds([])
    setSerialError(null)
  }, [selectedProductId, effectiveBranchId])

  // For serialized products, quantity = number of selected serials
  useEffect(() => {
    if (isSerialProduct) {
      setValue('quantity', selectedSerialIds.length || 1)
    }
  }, [selectedSerialIds, isSerialProduct, setValue])

  const handleProductChange = (id: string) => {
    setValue('productId', id)
    const prod = products.find((p) => p.id === id)
    if (prod) setValue('sellingPrice', prod.sellingPrice)
    setSelectedSerialIds([])
    setSerialError(null)
  }

  const toggleSerial = (id: string) => {
    setSerialError(null)
    setSelectedSerialIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const mut = useMutation({
    mutationFn: (v: FormValues) => {
      // Validate serial selection before submitting
      if (isSerialProduct && selectedSerialIds.length === 0) {
        throw new Error('Select at least one serial number')
      }
      return salesService.create({
        productId: v.productId,
        branchId: effectiveBranchId || undefined,
        quantity: isSerialProduct ? selectedSerialIds.length : v.quantity,
        sellingPrice: v.sellingPrice,
        dealerId: v.dealerId || null,
        customerName: v.customerName || undefined,
        customerPhone: v.customerPhone || undefined,
        note: v.note || undefined,
        serialNumberIds: isSerialProduct ? selectedSerialIds : undefined,
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sales'] })
      onClose()
    },
    onError: (err: any) => {
      if (err.message === 'Select at least one serial number') {
        setSerialError(err.message)
      }
    },
  })

  const apiErr = mut.error as any
  const apiErrMsg = apiErr?.message === 'Select at least one serial number'
    ? null  // shown inline near serial section
    : (apiErr?.response?.data?.message ?? (mut.isError ? 'Something went wrong' : null))

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full max-w-md p-0 gap-0 overflow-hidden rounded-2xl border-gray-200 shadow-2xl">

        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm shadow-indigo-200">
              <ShoppingCart size={16} className="text-white" />
            </div>
            <DialogTitle className="text-lg font-bold text-gray-900">Record Sale</DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit((v) => mut.mutate(v))}>
          <div className="px-6 py-5 space-y-5 max-h-[65vh] overflow-y-auto">

            {apiErrMsg && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertDescription className="text-sm text-red-600">{apiErrMsg}</AlertDescription>
              </Alert>
            )}

            {/* Product */}
            <div className="space-y-2">
              <FieldLabel required>Product</FieldLabel>
              <Select value={selectedProductId || ''} onValueChange={handleProductChange}>
                <SelectTrigger className={`h-10 border-gray-200 text-sm ${errors.productId ? 'border-red-400 bg-red-50/40' : ''}`}>
                  <SelectValue placeholder="Select a product…" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="text-sm">
                      <span className="font-medium">{p.name}</span>
                      <span className="text-gray-400 ml-2 font-mono text-xs">{p.sku}</span>
                      {p.hasSerialNumbers && (
                        <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-violet-50 text-violet-500 font-semibold border border-violet-100">S/N</span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.productId && <p className="text-xs text-red-500">{errors.productId.message}</p>}
            </div>

            {/* Branch — super admin only */}
            {isSuperAdmin && (
              <div className="space-y-2">
                <FieldLabel required>Branch</FieldLabel>
                <Select onValueChange={(val) => setValue('branchId', val)}>
                  <SelectTrigger className="h-10 border-gray-200 text-sm">
                    <SelectValue placeholder="Select branch…" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((b: any) => (
                      <SelectItem key={b.id} value={b.id} className="text-sm">{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* ── Serial Numbers Section ── */}
            {isSerialProduct && selectedProductId && effectiveBranchId && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <FieldLabel required>
                    <span className="flex items-center gap-1.5">
                      <Hash size={11} />
                      Serial Numbers
                    </span>
                  </FieldLabel>
                  <span className={`text-xs font-semibold tabular-nums px-2 py-0.5 rounded-full ${
                    selectedSerialIds.length > 0
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {selectedSerialIds.length} selected
                  </span>
                </div>

                {serialsFetching ? (
                  <div className="flex items-center gap-2 py-3 px-3 bg-gray-50 rounded-lg border border-gray-100">
                    <Loader2 size={13} className="animate-spin text-gray-400" />
                    <span className="text-xs text-gray-400">Loading serial numbers…</span>
                  </div>
                ) : availableSerials.length === 0 ? (
                  <div className="py-3 px-3 bg-amber-50 rounded-lg border border-amber-100">
                    <p className="text-xs text-amber-600 font-medium">No available serial numbers for this product{effectiveBranchId ? ' in selected branch' : ''}.</p>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="max-h-44 overflow-y-auto divide-y divide-gray-100">
                      {availableSerials.map((serial) => {
                        const isSelected = selectedSerialIds.includes(serial.id)
                        return (
                          <button
                            key={serial.id}
                            type="button"
                            onClick={() => toggleSerial(serial.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                              isSelected
                                ? 'bg-indigo-50 hover:bg-indigo-100'
                                : 'bg-white hover:bg-gray-50'
                            }`}
                          >
                            {/* Checkbox indicator */}
                            <div className={`w-4 h-4 rounded flex items-center justify-center border flex-shrink-0 transition-all ${
                              isSelected
                                ? 'bg-indigo-600 border-indigo-600'
                                : 'border-gray-300 bg-white'
                            }`}>
                              {isSelected && (
                                <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                                  <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </div>
                            <span className={`font-mono text-xs font-semibold ${isSelected ? 'text-indigo-700' : 'text-gray-700'}`}>
                              {serial.serialNumber}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {serialError && (
                  <p className="text-xs text-red-500">{serialError}</p>
                )}
              </div>
            )}

            {/* Quantity + Price */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <FieldLabel required>Quantity</FieldLabel>
                {isSerialProduct ? (
                  // For serialized products, quantity is driven by serial selection
                  <div className="h-10 border border-gray-200 rounded-md flex items-center px-3 bg-gray-50 text-sm font-semibold text-gray-500 tabular-nums select-none">
                    {selectedSerialIds.length || '—'}
                    <span className="ml-1.5 text-xs font-normal text-gray-400">(from serials)</span>
                  </div>
                ) : (
                  <Input
                    {...register('quantity', { valueAsNumber: true })}
                    type="number" min="1" placeholder="1"
                    className={`h-10 border-gray-200 text-sm ${errors.quantity ? 'border-red-400 bg-red-50/40' : ''}`}
                  />
                )}
                {errors.quantity && !isSerialProduct && <p className="text-xs text-red-500">{errors.quantity.message}</p>}
              </div>
              <div className="space-y-2">
                <FieldLabel required>Sale Price (₹)</FieldLabel>
                <Input
                  {...register('sellingPrice', { valueAsNumber: true })}
                  type="number" step="0.01" min="0" placeholder="0.00"
                  className={`h-10 border-gray-200 text-sm ${errors.sellingPrice ? 'border-red-400 bg-red-50/40' : ''}`}
                />
                {errors.sellingPrice && <p className="text-xs text-red-500">{errors.sellingPrice.message}</p>}
              </div>
            </div>

            {/* Total preview */}
            {selectedProduct && (
              <div className="flex items-center justify-between px-3.5 py-2.5 bg-indigo-50 border border-indigo-100 rounded-lg">
                <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wide">Estimated Total</span>
                <span className="text-sm font-bold text-indigo-700 tabular-nums">
                  {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
                    .format((watch('sellingPrice') ?? 0) * (isSerialProduct ? selectedSerialIds.length : (watch('quantity') ?? 0)))}
                </span>
              </div>
            )}

            <Separator className="bg-gray-100" />

            {/* Dealer */}
            <div className="space-y-2">
              <FieldLabel>Dealer</FieldLabel>
              <Select onValueChange={(val) => setValue('dealerId', val === '__direct__' ? '' : val)} defaultValue="__direct__">
                <SelectTrigger className="h-10 border-gray-200 text-sm">
                  <SelectValue placeholder="Direct sale (no dealer)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__direct__" className="text-sm text-gray-500">Direct sale (no dealer)</SelectItem>
                  {dealers.map((d) => (
                    <SelectItem key={d.id} value={d.id} className="text-sm">{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Customer Name + Phone */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <FieldLabel>Customer Name</FieldLabel>
                <Input {...register('customerName')} placeholder="Optional" className="h-10 border-gray-200 text-sm" />
              </div>
              <div className="space-y-2">
                <FieldLabel>Customer Phone</FieldLabel>
                <Input {...register('customerPhone')} placeholder="Optional" className="h-10 border-gray-200 text-sm" />
              </div>
            </div>

            {/* Note */}
            <div className="space-y-2">
              <FieldLabel>Note</FieldLabel>
              <Input {...register('note')} placeholder="Add a note…" className="h-10 border-gray-200 text-sm" />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-10 px-5 text-sm font-medium border-gray-200 text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={mut.isPending}
              className="h-10 px-6 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-sm shadow-indigo-200"
            >
              {mut.isPending && <Loader2 size={13} className="animate-spin" />}
              Record Sale
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}