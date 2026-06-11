'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
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
import { BranchWithStats } from '@/types/branches.types'
import { branchesService } from '@/services/branches.service'
import { Badge } from '@/components/ui/badge'    


interface Dealer {
  id: string
  name: string
}

interface ProductModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (payload: CreateProductPayload, branchIds: string[]) => Promise<void>
  categories: Category[]
  dealers?: Dealer[]
  editProduct?: Product | null
  loading?: boolean
}

const defaultForm: CreateProductPayload = {
  name: '',
  sku: '',
  categoryId: '',
  minStockAlert: 10,
  unit: 'pcs',
  hasSerialNumbers: true,
  brand: '',
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
    const { user } = useAuth() 
  const isSuperAdmin = user?.role === 'SUPER_ADMIN'   
  const [form, setForm] = useState<CreateProductPayload>(defaultForm)
  const [dealerId, setDealerId] = useState('')
    const [branches, setBranches] = useState<BranchWithStats[]>([])
  const [selectedBranchIds, setSelectedBranchIds] = useState<string[]>([]) 
  

   useEffect(() => {
    if (open && isSuperAdmin) {
      branchesService.getAll().then(setBranches).catch(console.error)
    }
  }, [open, isSuperAdmin])


  useEffect(() => {
    if (editProduct) {
      setForm({
        name: editProduct.name,
        sku: editProduct.sku,
        categoryId: editProduct.categoryId,
        minStockAlert: editProduct.minStockAlert,
        unit: editProduct.unit,
        hsnCode: editProduct.hsnCode,
        barcode: editProduct.barcode,
        description: editProduct.description,
        hasSerialNumbers: editProduct.hasSerialNumbers,
        brand: editProduct.brand || '',
      })
    } else {
      setForm(defaultForm)
      setDealerId('')
    }
  }, [editProduct, open])

  const toggleBranch = (id: string) => {
    setSelectedBranchIds(prev =>
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    )
  }

    const allSelected = selectedBranchIds.length === 0

  const set = (field: keyof CreateProductPayload, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }))

   
// ✅ Yeh hona chahiye
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  await onSubmit(form, selectedBranchIds)
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
              <Label htmlFor="sku">SKU <span className="text-destructive">*</span></Label>
              <Input
                id="sku"
                placeholder="e.g. SAM-GS24"
                value={form.sku || ''}
                onChange={(e) => set('sku', e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>
                Category 
              </Label>
              <Select
                value={form.categoryId || ''}
                onValueChange={(v) => set('categoryId', v)}
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

            {/* ── Branch Selector — SUPER_ADMIN only ── */}
          {isSuperAdmin && !editProduct && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>
                  Add to Branch
                  <span className="ml-1.5 text-[10px] font-normal text-muted-foreground">(select none = all branches)</span>
                </Label>
                {selectedBranchIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedBranchIds([])}
                    className="text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-2"
                  >
                    Clear (all branches)
                  </button>
                )}
              </div>

              {/* All Branches pill */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedBranchIds([])}
                  className={`inline-flex items-center px-3 py-1.5 rounded-md border text-xs font-medium transition-colors ${
                    allSelected
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-300'
                      : 'bg-background border-border text-muted-foreground hover:bg-muted'
                  }`}
                >
                  All Branches
                  {allSelected && (
                    <Badge className="ml-1.5 h-4 px-1 text-[9px] bg-indigo-600 text-white">✓</Badge>
                  )}
                </button>

                {branches.map((b) => {
                  const selected = selectedBranchIds.includes(b.id)
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => toggleBranch(b.id)}
                      className={`inline-flex items-center px-3 py-1.5 rounded-md border text-xs font-medium transition-colors ${
                        selected
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-300'
                          : 'bg-background border-border text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {b.name}
                      {selected && (
                        <Badge className="ml-1.5 h-4 px-1 text-[9px] bg-indigo-600 text-white">✓</Badge>
                      )}
                    </button>
                  )
                })}
              </div>

              <p className="text-[11px] text-muted-foreground">
                {allSelected
                  ? 'Product will be added to all branches'
                  : `Adding to ${selectedBranchIds.length} branch${selectedBranchIds.length > 1 ? 'es' : ''} only`
                }
              </p>
            </div>
          )}

          {isSuperAdmin && !editProduct && <Separator />}

          {/* Unit + Min Stock */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Unit</Label>
              <Select value={form.unit || 'pcs'} onValueChange={(v) => set('unit', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['pcs', 'prs', 'box', 'set'].map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

          {/* Brand / Manufacturer */}
          <div className="space-y-1.5">
            <Label htmlFor="brand">Brand / Manufacturer</Label>
            <Input
              id="brand"
              placeholder="e.g. Samsung, Apple, Bosch"
              value={form.brand || ''}
              onChange={(e) => set('brand', e.target.value)}
            />
          </div>

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
            {/* <div className="space-y-1.5">
              <Label htmlFor="barcode">Barcode</Label>
              <Input
                id="barcode"
                placeholder="e.g. 8901234567890"
                value={form.barcode || ''}
                onChange={(e) => set('barcode', e.target.value)}
              />
            </div> */}
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
          {/* <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-4 py-3">
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
          </div> */}

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