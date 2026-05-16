'use client'

import { useEffect, useState } from 'react'
import type { Product, CreateProductPayload } from '@/types/products.types'
import type { Category } from '@/types/categories.types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'

interface Dealer {
  id: string
  name: string
}

interface ProductModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (payload: CreateProductPayload) => Promise<void>
  categories: Category[]
  dealers?: Dealer[]
  editProduct?: Product | null
  loading?: boolean
}

const defaultForm: CreateProductPayload = {
  name: '',
  sku: '',
  categoryId: '',
  purchasePrice: 0,
  sellingPrice: 0,
  minStockAlert: 10,
  gstRate: 18,
  unit: 'pcs',
  hasSerialNumbers: false,
}

export default function ProductModal({
  open,
  onClose,
  onSubmit,
  categories,
  dealers = [],
  editProduct,
  loading,
}: ProductModalProps) {
  const [form, setForm] = useState<CreateProductPayload>(defaultForm)
  const [dealerId, setDealerId] = useState('')

  useEffect(() => {
    if (editProduct) {
      setForm({
        name: editProduct.name,
        sku: editProduct.sku,
        categoryId: editProduct.categoryId,
        purchasePrice: editProduct.purchasePrice,
        sellingPrice: editProduct.sellingPrice,
        minStockAlert: editProduct.minStockAlert,
        gstRate: editProduct.gstRate,
        unit: editProduct.unit,
        hsnCode: editProduct.hsnCode,
        barcode: editProduct.barcode,
        description: editProduct.description,
        hasSerialNumbers: editProduct.hasSerialNumbers,
      })
    } else {
      setForm(defaultForm)
      setDealerId('')
    }
  }, [editProduct, open])

  const set = (field: keyof CreateProductPayload, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(form)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-1">
          {/* Product Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name">
              Product Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g. Samsung Galaxy S24"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              required
            />
          </div>

          {/* SKU + Category */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                placeholder="e.g. SAM-GS24"
                value={form.sku || ''}
                onChange={(e) => set('sku', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>
                Category <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.categoryId || ''}
                onValueChange={(v) => set('categoryId', v)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="purchasePrice">
                Purchase Price (₹) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="purchasePrice"
                type="number"
                min={0}
                step="0.01"
                placeholder="0.00"
                value={form.purchasePrice}
                onChange={(e) => set('purchasePrice', parseFloat(e.target.value) || 0)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sellingPrice">
                Sale Price (₹) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="sellingPrice"
                type="number"
                min={0}
                step="0.01"
                placeholder="0.00"
                value={form.sellingPrice}
                onChange={(e) => set('sellingPrice', parseFloat(e.target.value) || 0)}
                required
              />
            </div>
          </div>

          {/* Unit + GST + Min Stock */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Unit</Label>
              <Select value={form.unit || 'pcs'} onValueChange={(v) => set('unit', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['pcs', 'kg', 'g', 'l', 'ml', 'box', 'set'].map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="gstRate">GST (%)</Label>
              <Input
                id="gstRate"
                type="number"
                min={0}
                max={100}
                value={form.gstRate}
                onChange={(e) => set('gstRate', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="minStockAlert">Low Stock At</Label>
              <Input
                id="minStockAlert"
                type="number"
                min={0}
                value={form.minStockAlert}
                onChange={(e) => set('minStockAlert', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <Separator />

          {/* HSN + Barcode */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="hsnCode">HSN Code</Label>
              <Input
                id="hsnCode"
                placeholder="e.g. 8517"
                value={form.hsnCode || ''}
                onChange={(e) => set('hsnCode', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="barcode">Barcode</Label>
              <Input
                id="barcode"
                placeholder="e.g. 8901234567890"
                value={form.barcode || ''}
                onChange={(e) => set('barcode', e.target.value)}
              />
            </div>
          </div>

          {/* Supplier */}
          {dealers.length > 0 && (
            <div className="space-y-1.5">
              <Label>Supplier / Dealer</Label>
              <Select value={dealerId || 'none'} onValueChange={(v) => setDealerId(v === 'none' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="No supplier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No supplier</SelectItem>
                  {dealers.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Serial Numbers Toggle */}
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">Track Serial Numbers</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Each unit will require a unique serial number during stock in/out
              </p>
            </div>
            <Switch
              checked={!!form.hasSerialNumbers}
              onCheckedChange={(v) => set('hasSerialNumbers', v)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : editProduct ? 'Update Product' : 'Add Product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}