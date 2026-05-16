'use client'

import { Loader2, Trash2 } from 'lucide-react'
import { Modal } from './Modal'
import { cn } from '@/lib/utils'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  isLoading?: boolean
  title?: string
  description?: string
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  isLoading,
  title = 'Delete this item?',
  description = 'This action cannot be undone.',
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">{description}</p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-transparent dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className={cn(
            'flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white',
            'hover:bg-red-700 transition-colors disabled:opacity-60'
          )}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          Delete
        </button>
      </div>
    </Modal>
  )
}