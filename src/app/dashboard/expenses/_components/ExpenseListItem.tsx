'use client'

import { Trash2, Loader2, Tag, StickyNote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import type { Expense } from '@/types/expenses.types'

// ─── helpers ─────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

const fmtTime = (d: string) =>
  new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })

const PM_COLORS: Record<string, string> = {
  CASH:  'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400',
  UPI:   'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400',
  BANK:  'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400',
  CARD:  'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400',
  OTHER: 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400',
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  expense: Expense
  deletingId: string | null
  onDelete: (id: string) => void
  canDelete: boolean   // ← permission prop
}

export function ExpenseListItem({ expense, deletingId, onDelete, canDelete }: Props) {
  const isDeleting = deletingId === expense.id

  return (
    <div className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">

      {/* Amount */}
      <div className="shrink-0 w-24 text-right">
        <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">
          {fmt(expense.amount)}
        </span>
      </div>

      <div className="w-px h-8 bg-zinc-200 dark:bg-zinc-700 shrink-0" />

      {/* Title + meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
            {expense.title || <span className="text-zinc-400 italic">Untitled</span>}
          </span>
          {expense.category && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 rounded-md px-1.5 py-0.5">
              <Tag className="w-2.5 h-2.5" />
              {expense.category}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-[11px] text-zinc-400">{fmtTime(expense.createdAt)}</span>
          {expense.notes && (
            <span className="text-[11px] text-zinc-400 truncate max-w-[200px] flex items-center gap-1">
              <StickyNote className="w-2.5 h-2.5 shrink-0" />
              {expense.notes}
            </span>
          )}
        </div>
      </div>

      {/* Payment badge + delete (only if canDelete) */}
      <div className="flex items-center gap-2 shrink-0">
        <span
          className={`hidden sm:inline-flex text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-md border ${
            PM_COLORS[expense.paymentMethod] || PM_COLORS.OTHER
          }`}
        >
          {expense.paymentMethod}
        </span>

        {canDelete && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this expense?</AlertDialogTitle>
                <AlertDialogDescription>
                  {fmt(expense.amount)} — {expense.title || 'Untitled'} will be permanently removed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(expense.id)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  )
}