'use client'

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { Trash2 } from 'lucide-react'

interface DeleteConfirmModalProps {
  open: boolean
  productName: string
  onConfirm: () => Promise<void>
  onClose: () => void
  loading?: boolean
}

export default function DeleteConfirmModal({
  open,
  productName,
  onConfirm,
  onClose,
  loading,
}: DeleteConfirmModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
              <Trash2 className="w-4 h-4 text-destructive" />
            </div>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            Are you sure you want to delete{' '}
            <span className="font-semibold text-foreground">"{productName}"</span>?
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}