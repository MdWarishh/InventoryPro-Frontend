'use client'

import { useEffect, useState } from 'react'
import { branchesService } from '@/services/branches.service'
import type { BranchWithStats, UpdateBranchPayload } from '@/types/branches.types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

interface Props {
  branch: BranchWithStats | null
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function EditBranchModal({ branch, open, onClose, onSuccess }: Props) {
  const [form, setForm] = useState<UpdateBranchPayload>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (branch) {
      setForm({
        name: branch.name,
        code: branch.code ?? '',
        address: branch.address ?? '',
        phone: branch.phone ?? '',
        email: branch.email ?? '',
        isActive: branch.isActive,
      })
    }
  }, [branch])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    if (!branch) return
    if (!form.name?.trim()) {
      toast.error('Branch name is required.')
      return
    }
    try {
      setLoading(true)
      await branchesService.update(branch.id, form)
      toast.success('Branch updated successfully.')
      onSuccess()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update branch.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Branch</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="edit-name">Name <span className="text-destructive">*</span></Label>
            <Input
              id="edit-name"
              name="name"
              value={form.name ?? ''}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-code">Code</Label>
            <Input
              id="edit-code"
              name="code"
              value={form.code ?? ''}
              onChange={handleChange}
              className="uppercase"
              maxLength={10}
            />
            <p className="text-xs text-muted-foreground">Used as SKU prefix. Will be uppercased.</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-address">Address</Label>
            <Input
              id="edit-address"
              name="address"
              value={form.address ?? ''}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                name="phone"
                value={form.phone ?? ''}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                name="email"
                type="email"
                value={form.email ?? ''}
                onChange={handleChange}
              />
            </div>
          </div>

          {!branch?.isMainBranch && (
            <div className="flex items-center justify-between pt-1">
              <div>
                <Label>Active Status</Label>
                <p className="text-xs text-muted-foreground">Disable to deactivate this branch</p>
              </div>
              <Switch
                checked={form.isActive ?? true}
                onCheckedChange={(val) => setForm((prev) => ({ ...prev, isActive: val }))}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}