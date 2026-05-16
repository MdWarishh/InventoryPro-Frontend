'use client'

import { Search, AlertTriangle, X } from 'lucide-react'
import type { Category } from '@/types/categories.types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface Branch {
  id: string
  name: string
}

interface ProductsFiltersProps {
  search: string
  onSearchChange: (v: string) => void
  categoryId: string
  onCategoryChange: (v: string) => void
  branchId: string
  onBranchChange: (v: string) => void
  lowStock: boolean
  onLowStockToggle: () => void
  categories: Category[]
  branches: Branch[]
}

export default function ProductsFilters({
  search,
  onSearchChange,
  categoryId,
  onCategoryChange,
  branchId,
  onBranchChange,
  lowStock,
  onLowStockToggle,
  categories,
  branches,
}: ProductsFiltersProps) {
  const hasActiveFilters = categoryId || branchId || lowStock

  const clearAll = () => {
    onCategoryChange('')
    onBranchChange('')
    if (lowStock) onLowStockToggle()
  }

  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[220px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name or SKU..."
          className="pl-9 bg-background"
        />
      </div>

      {/* Category */}
      <Select value={categoryId || 'all'} onValueChange={(v) => onCategoryChange(v === 'all' ? '' : v)}>
        <SelectTrigger className="w-[160px] bg-background">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Branch */}
      {branches.length > 0 && (
        <Select value={branchId || 'all'} onValueChange={(v) => onBranchChange(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-[160px] bg-background">
            <SelectValue placeholder="All Branches" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Branches</SelectItem>
            {branches.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Low Stock Toggle */}
      <Button
        variant={lowStock ? 'secondary' : 'outline'}
        size="sm"
        onClick={onLowStockToggle}
        className={cn(
          'gap-2 transition-all',
          lowStock && 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800'
        )}
      >
        <AlertTriangle className="w-3.5 h-3.5" />
        Low Stock
        {lowStock && (
          <Badge className="ml-1 h-4 px-1 text-[10px] bg-amber-500 text-white">ON</Badge>
        )}
      </Button>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAll}
          className="gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <X className="w-3.5 h-3.5" />
          Clear
        </Button>
      )}
    </div>
  )
}