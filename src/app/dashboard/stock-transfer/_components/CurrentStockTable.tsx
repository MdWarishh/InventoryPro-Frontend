import type { CurrentStock } from '@/types/stock-transfer.types'
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Package } from 'lucide-react'
import { cn } from '@/lib/utils'

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

export default function CurrentStockTable({ items, fetching, search }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent border-border">
          <TableHead className="w-[260px]">Product</TableHead>
          <TableHead>SKU</TableHead>
          <TableHead>Branch</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Min Alert</TableHead>
          <TableHead className="text-center">Stock</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {fetching ? (
          Array.from({ length: 6 }).map((_, i) => (
            <TableRow key={i} className="border-border">
              {[200, 80, 100, 100, 60, 60].map((w, j) => (
                <TableCell key={j}>
                  <Skeleton className="h-4" style={{ width: w }} />
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : items.length === 0 ? (
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
                <span className="font-medium text-foreground max-w-[180px] truncate" title={s.product?.name}>
                  {s.product?.name}
                </span>
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