import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { StockInRecord } from '@/types/stock-transfer.types'
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Package, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { stockService } from '@/services/stock-transfer.service'

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

interface Props {
  items: StockInRecord[]
  fetching: boolean
  onEdit: (record: StockInRecord) => void
  onDeleteSuccess?: () => void
}

export default function StockInHistoryTable({ items, fetching, onEdit, onDeleteSuccess }: Props) {
  const queryClient = useQueryClient()
  const [deleteTarget, setDeleteTarget] = useState<StockInRecord | null>(null)

  const deleteMutation = useMutation({
    mutationFn: (id: string) => stockService.deleteStockIn(id),
    onSuccess: () => {
      toast.success('Stock-in record deleted successfully.')
      queryClient.invalidateQueries({ queryKey: ['stock-history', 'in'] })
      queryClient.invalidateQueries({ queryKey: ['current-stock'] })
      setDeleteTarget(null)
      onDeleteSuccess?.()
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete record.')
      setDeleteTarget(null)
    },
  })

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-border">
            <TableHead className="w-[260px]">Product</TableHead>
            <TableHead>Branch</TableHead>
            <TableHead>Qty</TableHead>
            <TableHead>Purchase Price</TableHead>
            <TableHead>Dealer</TableHead>
            <TableHead>Ref No.</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fetching ? (
            Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={i} className="border-border">
                {[180, 80, 50, 90, 90, 80, 80, 60].map((w, j) => (
                  <TableCell key={j}><Skeleton className="h-4" style={{ width: w }} /></TableCell>
                ))}
              </TableRow>
            ))
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="py-16 text-center">
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
            <TableRow key={r.id} className="border-border group">
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Package className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground text-sm leading-tight">
                      {r.product?.name}
                    </p>
                    {r.product?.brand ? (
                      <p className="text-[11px] text-muted-foreground mt-0.5">{r.product.brand}</p>
                    ) : (
                      <code className="text-[11px] text-muted-foreground">{r.product?.sku}</code>
                    )}
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
              <TableCell>
                <div className="flex items-center gap-1 opacity-100  transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => onEdit(r)}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => setDeleteTarget(r)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Stock-In Record?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reverse the stock count for{' '}
              <span className="font-medium text-foreground">{deleteTarget?.product?.name}</span>{' '}
              (qty: {deleteTarget?.quantity}). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}