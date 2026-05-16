'use client'

import { AlertTriangle } from 'lucide-react'
import type { Dealer } from '@/types/dealers.types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface Props {
  dealer: Dealer | null
  onConfirm: () => Promise<void>
  onClose: () => void
  loading?: boolean
}

export default function DeleteConfirmModal({ dealer, onConfirm, onClose, loading }: Props) {
  return (
    <Dialog open={!!dealer} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-destructive" />
            </div>
            <div>
              <DialogTitle className="text-base">Deactivate Dealer</DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                This action can be reversed later
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Are you sure you want to deactivate{' '}
          <span className="font-semibold text-foreground">{dealer?.name}</span>?
          They will no longer appear in the active dealers list.
        </p>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
            className="gap-2"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Deactivating...
              </>
            ) : (
              'Yes, Deactivate'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}