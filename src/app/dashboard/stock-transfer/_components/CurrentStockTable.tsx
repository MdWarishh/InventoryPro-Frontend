'use client'

import type { CurrentStock } from '@/types/stock-transfer.types'
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Package, ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useState, useMemo } from 'react'

interface Props {
  items: CurrentStock[]
  fetching: boolean
  search: string
}

function StockBadge({ stock, min }: { stock: number; min: number }) {
  const isEmpty = stock === 0
  const isLow = stock > 0 && stock <= min
  return (
    <Badge
      variant="secondary"
      className={cn(
        'font-semibold tabular-nums min-w-[2.5rem] justify-center',
        isEmpty && 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
        isLow && 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        !isEmpty && !isLow && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
      )}
    >
      {stock}
    </Badge>
  )
}

// ── SUPER_ADMIN: grouped by product ──────────────────────────────────────────
interface GroupedProduct {
  productId: string
  product: CurrentStock['product']
  totalStock: number
  branches: { branchId: string; branchName: string; stock: number }[]
}

function GroupedTable({ items, search }: { items: CurrentStock[]; search: string }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const grouped = useMemo<GroupedProduct[]>(() => {
    const map = new Map<string, GroupedProduct>()
    for (const s of items) {
      const existing = map.get(s.productId)
      if (existing) {
        existing.totalStock += s.currentStock
        existing.branches.push({ branchId: s.branchId, branchName: s.branch?.name ?? '—', stock: s.currentStock })
      } else {
        map.set(s.productId, {
          productId: s.productId,
          product: s.product,
          totalStock: s.currentStock,
          branches: [{ branchId: s.branchId, branchName: s.branch?.name ?? '—', stock: s.currentStock }],
        })
      }
    }
    return Array.from(map.values())
  }, [items])

  const toggle = (id: string) =>
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent border-border">
          <TableHead className="w-[280px]">Product</TableHead>
          <TableHead>SKU</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Min Alert</TableHead>
          <TableHead className="text-center">Total Stock</TableHead>
          <TableHead className="w-8" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {grouped.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="py-16 text-center">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-medium text-foreground">No products found</p>
                  <p className="text-sm mt-0.5">
                    {search ? `No results for "${search}"` : 'No stock data found'}
                  </p>
                </div>
              </div>
            </TableCell>
          </TableRow>
        ) : grouped.map(g => {
          const isOpen = expanded.has(g.productId)
          const min = g.product?.minStockAlert ?? 0
          return (
            <>
              {/* ── Product row ── */}
              <TableRow
                key={g.productId}
                className="border-border cursor-pointer hover:bg-muted/40"
                onClick={() => toggle(g.productId)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Package className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground text-sm truncate max-w-[180px]" title={g.product?.name}>
                        {g.product?.name}
                      </p>
                      {g.product?.brand && (
                        <p className="text-[11px] text-muted-foreground truncate max-w-[180px]">{g.product.brand}</p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    {g.product?.sku}
                  </code>
                </TableCell>
                <TableCell>
                  {g.product?.category ? (
                    <Badge
                      variant="secondary"
                      style={{
                        backgroundColor: g.product.category.color ? `${g.product.category.color}22` : undefined,
                        color: g.product.category.color || undefined,
                      }}
                    >
                      {g.product.category.name}
                    </Badge>
                  ) : <span className="text-muted-foreground">—</span>}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{min}</TableCell>
                <TableCell className="text-center">
                  <StockBadge stock={g.totalStock} min={min} />
                </TableCell>
                <TableCell>
                  <div className="flex justify-center text-muted-foreground">
                    {isOpen
                      ? <ChevronDown className="w-4 h-4" />
                      : <ChevronRight className="w-4 h-4" />}
                  </div>
                </TableCell>
              </TableRow>

              {/* ── Branch breakdown rows ── */}
              {isOpen && g.branches.map(b => (
                <TableRow key={`${g.productId}-${b.branchId}`} className="border-border bg-muted/20 hover:bg-muted/30">
                  <TableCell colSpan={2} className="pl-14">
                    <span className="text-xs text-muted-foreground">{b.branchName}</span>
                  </TableCell>
                  <TableCell colSpan={2} />
                  <TableCell className="text-center">
                    <StockBadge stock={b.stock} min={min} />
                  </TableCell>
                  <TableCell />
                </TableRow>
              ))}
            </>
          )
        })}
      </TableBody>
    </Table>
  )
}

// ── BRANCH_ADMIN / STAFF: flat table (original) ───────────────────────────────
function FlatTable({ items, search }: { items: CurrentStock[]; search: string }) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent border-border">
          <TableHead className="w-[280px]">Product</TableHead>
          <TableHead>SKU</TableHead>
          <TableHead>Branch</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Min Alert</TableHead>
          <TableHead className="text-center">Stock</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="py-16 text-center">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-medium text-foreground">No products found</p>
                  <p className="text-sm mt-0.5">
                    {search ? `No results for "${search}"` : 'No stock data found'}
                  </p>
                </div>
              </div>
            </TableCell>
          </TableRow>
        ) : items.map(s => (
          <TableRow key={s.id} className="border-border group">
            <TableCell>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Package className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-foreground text-sm truncate max-w-[180px]" title={s.product?.name}>
                    {s.product?.name}
                  </p>
                  {s.product?.brand && (
                    <p className="text-[11px] text-muted-foreground truncate max-w-[180px]">{s.product.brand}</p>
                  )}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                {s.product?.sku}
              </code>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">{s.branch?.name}</TableCell>
            <TableCell>
              {s.product?.category ? (
                <Badge
                  variant="secondary"
                  style={{
                    backgroundColor: s.product.category.color ? `${s.product.category.color}22` : undefined,
                    color: s.product.category.color || undefined,
                  }}
                >
                  {s.product.category.name}
                </Badge>
              ) : <span className="text-muted-foreground">—</span>}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">{s.product?.minStockAlert}</TableCell>
            <TableCell className="text-center">
              <StockBadge stock={s.currentStock} min={s.product?.minStockAlert ?? 0} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function CurrentStockTable({ items, fetching, search }: Props) {
  const { isSuperAdmin } = useAuth()

  const skeletonCols = isSuperAdmin ? [200, 80, 100, 60, 60, 24] : [200, 80, 100, 100, 60, 60]

  if (fetching) {
    return (
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-border">
            {isSuperAdmin
              ? ['Product', 'SKU', 'Category', 'Min Alert', 'Total Stock', ''].map((h, i) => <TableHead key={i}>{h}</TableHead>)
              : ['Product', 'SKU', 'Branch', 'Category', 'Min Alert', 'Stock'].map((h, i) => <TableHead key={i}>{h}</TableHead>)
            }
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 6 }).map((_, i) => (
            <TableRow key={i} className="border-border">
              {skeletonCols.map((w, j) => (
                <TableCell key={j}>
                  <Skeleton className="h-4" style={{ width: w }} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }

  return isSuperAdmin
    ? <GroupedTable items={items} search={search} />
    : <FlatTable items={items} search={search} />
}