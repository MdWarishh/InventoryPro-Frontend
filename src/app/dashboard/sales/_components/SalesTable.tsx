'use client'

import { ChevronLeft, ChevronRight, ShoppingCart, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
// Inline type — only fields SalesTable actually uses
interface SaleItem {
  id: string
  productId: string
  productName?: string | null 
  branchId?: string
  quantity: number
  sellingPrice?: number
  date: string
  dealerId?: string | null
  customerName?: string | null
  customerPhone?: string | null
  notes?: string | null
  product: {
    name: string
    sku: string
    category?: { name: string; color?: string } | null
  } | null   // ✅ product null ho sakta hai ab (manual product)
  dealer?: { name: string } | null
  serialNumbers?: { id: string; serialNumber: string }[]
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

// ─── Table Header ─────────────────────────────────────────────────────────────
function TableHeader() {
  return (
    <div className="hidden md:grid md:grid-cols-[2.6fr_1fr_1.1fr_1.1fr_1.3fr_1.3fr_0.9fr] gap-4 px-6 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40">
      {['Product', 'Qty', 'Price', 'Total', 'Dealer', 'Date', 'Actions'].map((col) => (
        <span key={col} className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{col}</span>
      ))}
    </div>
  )
}

// ─── Action Buttons (shared desktop + mobile) ─────────────────────────────────
function ActionButtons({
  onEdit, onDelete, compact,
}: { onEdit: () => void; onDelete: () => void; compact?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={onEdit}
        title="Edit sale"
        className={cn(
          'flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors',
          compact ? 'w-8 h-8' : 'w-8 h-8'
        )}
      >
        <Pencil size={13} />
      </button>
      <button
        type="button"
        onClick={onDelete}
        title="Delete sale"
        className={cn(
          'flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:border-red-300 dark:hover:border-red-800 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors',
          compact ? 'w-8 h-8' : 'w-8 h-8'
        )}
      >
        <Trash2 size={13} />
      </button>
    </div>
  )
}

// ─── Sale Row ─────────────────────────────────────────────────────────────────
function SaleRow({
  sale, onEdit, onDelete,
}: {
  sale: SaleItem
  onEdit: (sale: SaleItem) => void
  onDelete: (sale: SaleItem) => void
}) {
const catColor = sale.product?.category?.color || '#6366f1'
  const sellingPrice = sale.sellingPrice ?? 0
  const total = sellingPrice * sale.quantity

  return (
    <>
      {/* Desktop Row */}
      <div className="hidden md:grid md:grid-cols-[2.6fr_1fr_1.1fr_1.1fr_1.3fr_1.3fr_0.9fr] gap-4 px-6 py-3.5 items-center border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors group">

        {/* Product */}
       {/* Product */}
<div className="min-w-0">
  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
    {sale.product?.name ?? sale.productName ?? 'Unknown Product'}
  </p>
  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
    <span className="text-[11px] font-mono text-gray-400 dark:text-gray-500">
      {sale.product?.sku ?? 'N/A'}
    </span>
    {sale.product?.category && (
      <span
        className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
        style={{ backgroundColor: catColor + '18', color: catColor }}
      >
        {sale.product.category.name}
      </span>
    )}
  </div>
</div>

        {/* Qty */}
        <div>
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">
            {sale.quantity}
          </span>
        </div>

        {/* Price */}
        <span className="text-sm text-gray-500 dark:text-gray-400 tabular-nums">{fmt(sellingPrice)}</span>

        {/* Total */}
        <span className="text-sm font-bold text-gray-900 dark:text-gray-50 tabular-nums">{fmt(total)}</span>

        {/* Dealer */}
        <div>
          {sale.dealer?.name ? (
            <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{sale.dealer.name}</span>
          ) : (
            <Badge variant="secondary" className="text-[10px] bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-800/50 font-semibold rounded-full">
              Direct
            </Badge>
          )}
        </div>

        {/* Date */}
        <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums">{fmtDate(sale.date)}</span>

        {/* Actions */}
        <ActionButtons onEdit={() => onEdit(sale)} onDelete={() => onDelete(sale)} />
      </div>

      {/* Mobile Card */}
      <div className="md:hidden px-4 py-4 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
  {sale.product?.name ?? sale.productName ?? 'Unknown Product'}
</p>
<div className="flex items-center gap-2 mt-0.5 flex-wrap">
  <span className="text-[11px] font-mono text-gray-400 dark:text-gray-500">
    {sale.product?.sku ?? 'N/A'}
  </span>
  {sale.product?.category && (
    <span
      className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
      style={{ backgroundColor: catColor + '18', color: catColor }}
    >
      {sale.product.category.name}
    </span>
  )}
</div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-bold text-gray-900 dark:text-gray-50 tabular-nums">{fmt(total)}</p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 tabular-nums">×{sale.quantity} @ {fmt(sellingPrice)}</p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            {sale.dealer?.name ? (
              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">{sale.dealer.name}</span>
            ) : (
              <Badge variant="secondary" className="text-[10px] bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-800/50 font-semibold rounded-full">
                Direct Sale
              </Badge>
            )}
            <span className="text-[11px] text-gray-400 dark:text-gray-500 tabular-nums">{fmtDate(sale.date)}</span>
          </div>
          <ActionButtons compact onEdit={() => onEdit(sale)} onDelete={() => onDelete(sale)} />
        </div>
      </div>
    </>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="hidden md:grid md:grid-cols-[2.6fr_1fr_1.1fr_1.1fr_1.3fr_1.3fr_0.9fr] gap-4 px-6 py-4 items-center border-b border-gray-100 dark:border-gray-800">
          <div className="space-y-2">
            <Skeleton className="w-40 h-3.5 rounded dark:bg-gray-800" />
            <Skeleton className="w-24 h-2.5 rounded dark:bg-gray-800" />
          </div>
          {[0, 1, 2, 3, 4].map((j) => (
            <Skeleton key={j} className="w-16 h-3 rounded dark:bg-gray-800" />
          ))}
          <Skeleton className="w-16 h-7 rounded dark:bg-gray-800" />
        </div>
      ))}
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={`m${i}`} className="md:hidden px-4 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex justify-between gap-3">
            <div className="space-y-2 flex-1">
              <Skeleton className="w-40 h-3.5 rounded dark:bg-gray-800" />
              <Skeleton className="w-24 h-2.5 rounded dark:bg-gray-800" />
            </div>
            <div className="space-y-2 flex flex-col items-end">
              <Skeleton className="w-20 h-3.5 rounded dark:bg-gray-800" />
              <Skeleton className="w-14 h-2.5 rounded dark:bg-gray-800" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-800 flex justify-between">
            <Skeleton className="w-16 h-2.5 rounded dark:bg-gray-800" />
            <Skeleton className="w-16 h-7 rounded dark:bg-gray-800" />
          </div>
        </div>
      ))}
    </>
  )
}

// ─── Pagination ───────────────────────────────────────────────────────────────
interface PaginationProps {
  page: number; totalPages: number; total: number; limit: number
  onPageChange: (p: number) => void
}

function Pagination({ page, totalPages, total, limit, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
    .reduce<(number | '...')[]>((acc, p, idx, arr) => {
      if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push('...')
      acc.push(p)
      return acc
    }, [])

  const from = (page - 1) * limit + 1
  const to = Math.min(page * limit, total)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-800/30">
      <p className="text-xs text-gray-400 dark:text-gray-500 order-2 sm:order-1">
        Showing{' '}
        <span className="font-semibold text-gray-600 dark:text-gray-300 tabular-nums">{from}–{to}</span>
        {' '}of{' '}
        <span className="font-semibold text-gray-600 dark:text-gray-300 tabular-nums">{total}</span>
        {' '}transactions
      </p>
      <div className="flex items-center gap-1 order-1 sm:order-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="w-7 h-7 rounded-lg border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 text-gray-500 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-gray-700 disabled:opacity-40"
        >
          <ChevronLeft size={13} />
        </Button>
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`e${i}`} className="text-gray-300 dark:text-gray-600 text-xs px-1">…</span>
          ) : (
            <Button
              key={p}
              variant={page === p ? 'default' : 'outline'}
              size="icon"
              onClick={() => onPageChange(p as number)}
              className={cn(
                'w-7 h-7 rounded-lg text-xs font-semibold transition-all',
                page === p
                  ? 'bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 border-indigo-600 dark:border-indigo-500 shadow-sm shadow-indigo-200 dark:shadow-indigo-900/40'
                  : 'border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-gray-700'
              )}
            >
              {p}
            </Button>
          )
        )}
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="w-7 h-7 rounded-lg border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 text-gray-500 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-gray-700 disabled:opacity-40"
        >
          <ChevronRight size={13} />
        </Button>
      </div>
    </div>
  )
}

// ─── Main Export ──────────────────────────────────────────────────────────────
interface SalesTableProps {
  sales: SaleItem[]
  isLoading: boolean
  page: number; totalPages: number; total: number; limit: number
  onPageChange: (p: number) => void
  onEdit: (sale: SaleItem) => void
  onDelete: (sale: SaleItem) => void
}

export function SalesTable({
  sales, isLoading, page, totalPages, total, limit, onPageChange, onEdit, onDelete,
}: SalesTableProps) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
      <TableHeader />
      {isLoading ? (
        <SkeletonRows />
      ) : sales.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
            <ShoppingCart size={26} className="text-gray-300 dark:text-gray-600" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">No sales recorded yet</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Record your first sale to see it here</p>
          </div>
        </div>
      ) : (
        <>
          {sales.map((sale) => (
            <SaleRow key={sale.id} sale={sale} onEdit={onEdit} onDelete={onDelete} />
          ))}
          <Pagination page={page} totalPages={totalPages} total={total} limit={limit} onPageChange={onPageChange} />
        </>
      )}
    </div>
  )
}