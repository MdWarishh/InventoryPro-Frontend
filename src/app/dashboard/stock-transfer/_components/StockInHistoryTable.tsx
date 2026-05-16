import type { StockInRecord } from '@/types/stock-transfer.types'
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Package } from 'lucide-react'

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

interface Props {
  items: StockInRecord[]
  fetching: boolean
}

export default function StockInHistoryTable({ items, fetching }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent border-border">
          <TableHead className="w-[240px]">Product</TableHead>
          <TableHead>Branch</TableHead>
          <TableHead>Qty</TableHead>
          <TableHead>Purchase Price</TableHead>
          <TableHead>Dealer</TableHead>
          <TableHead>Ref No.</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {fetching ? (
          Array.from({ length: 6 }).map((_, i) => (
            <TableRow key={i} className="border-border">
              {[180, 80, 50, 90, 90, 80, 80].map((w, j) => (
                <TableCell key={j}><Skeleton className="h-4" style={{ width: w }} /></TableCell>
              ))}
            </TableRow>
          ))
        ) : items.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="py-16 text-center">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-medium text-foreground">No stock in records</p>
                  <p className="text-sm mt-0.5">Stock in history will appear here.</p>
                </div>
              </div>
            </TableCell>
          </TableRow>
        ) : items.map(r => (
          <TableRow key={r.id} className="border-border">
            <TableCell>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Package className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">{r.product?.name}</p>
                  <code className="text-[11px] text-muted-foreground">{r.product?.sku}</code>
                </div>
              </div>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">{r.branch?.name}</TableCell>
            <TableCell>
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-semibold">
                +{r.quantity}
              </Badge>
            </TableCell>
            <TableCell className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              {fmt(r.purchasePrice)}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {r.dealer?.name || <span className="text-border">—</span>}
            </TableCell>
            <TableCell>
              <code className="text-xs font-mono text-muted-foreground">
                {r.referenceNo || '—'}
              </code>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
              {fmtDate(r.date)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}