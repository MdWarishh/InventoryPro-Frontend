'use client'

import { useState } from 'react'
import { Loader2, AlertTriangle } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { salesService } from '@/services/sales.service'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface SaleToDelete {
  id: string
  productName: string
  quantity: number
}

interface Props {
  sale: SaleToDelete
  onClose: () => void
}

export function DeleteSaleDialog({ sale, onClose }: Props) {
  const qc = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const mut = useMutation({
    mutationFn: () => salesService.delete(sale.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sales'] })
      qc.invalidateQueries({ queryKey: ['sales-summary'] })
      qc.invalidateQueries({ queryKey: ['sales-monthly'] })
      qc.invalidateQueries({ queryKey: ['sales-yearly'] })
      qc.invalidateQueries({ queryKey: ['sales-breakdown'] })
      qc.invalidateQueries({ queryKey: ['sales-list'] })
      qc.invalidateQueries({ queryKey: ['serials-available'] })
      onClose()
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message ?? 'Failed to delete sale. Please try again.')
    },
  })

  return (
    <Dialog open onOpenChange={(open) => !open && !mut.isPending && onClose()}>
      <DialogContent className="w-full max-w-sm p-0 gap-0 overflow-hidden rounded-2xl border-gray-200 dark:border-gray-800 shadow-2xl bg-white dark:bg-gray-900">
        <DialogHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center shrink-0">
              <AlertTriangle size={18} className="text-red-600 dark:text-red-400" />
            </div>
            <DialogTitle className="text-lg font-bold text-gray-900 dark:text-gray-50">Delete Sale?</DialogTitle>
          </div>
        </DialogHeader>

        <div className="px-6 pb-5 space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            This will permanently delete the sale of{' '}
            <span className="font-semibold text-gray-800 dark:text-gray-200">
              {sale.quantity} × {sale.productName}
            </span>
            . Stock and serial numbers (if any) will be reverted automatically. This action cannot be undone.
          </p>

          {error && (
            <Alert variant="destructive" className="border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-900/20">
              <AlertDescription className="text-sm text-red-600 dark:text-red-400">{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={mut.isPending}
            className="h-10 px-5 text-sm font-medium border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => mut.mutate()}
            disabled={mut.isPending}
            className="h-10 px-6 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white gap-2 shadow-sm shadow-red-200 dark:shadow-red-900/40"
          >
            {mut.isPending && <Loader2 size={13} className="animate-spin" />}
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}