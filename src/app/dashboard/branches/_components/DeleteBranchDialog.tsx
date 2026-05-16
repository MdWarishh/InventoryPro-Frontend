'use client'

import { useState } from 'react'
import { branchesService } from '@/services/branches.service'
import type { BranchWithStats } from '@/types/branches.types'
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
import { toast } from 'sonner'

interface Props {
  branch: BranchWithStats | null
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function DeleteBranchDialog({ branch, open, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    if (!branch) return
    try {
      setLoading(true)
      await branchesService.remove(branch.id)
      toast.success('Branch deactivated successfully.')
      onSuccess()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to deactivate branch.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Deactivate Branch?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to deactivate{' '}
            <span className="font-medium text-foreground">{branch?.name}</span>?
            This will mark the branch as inactive. This action can be reversed by editing the branch.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? 'Deactivating...' : 'Deactivate'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}