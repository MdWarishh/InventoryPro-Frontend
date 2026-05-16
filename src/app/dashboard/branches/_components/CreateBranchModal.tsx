'use client'

import { useState } from 'react'
import { branchesService } from '@/services/branches.service'
import type { CreateBranchPayload } from '@/types/branches.types'
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
import { toast } from 'sonner'

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

const defaultForm: CreateBranchPayload = {
  name: '',
  code: '',
  address: '',
  phone: '',
  email: '',
}

export default function CreateBranchModal({ open, onClose, onSuccess }: Props) {
  const [form, setForm] = useState<CreateBranchPayload>(defaultForm)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error('Branch name is required.')
      return
    }
    if (!form.code.trim()) {
      toast.error('Branch code is required.')
      return
    }
    try {
      setLoading(true)
      await branchesService.create(form)
      toast.success('Branch created successfully.')
      setForm(defaultForm)
      onSuccess()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create branch.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setForm(defaultForm)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Branch</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name <span className="text-destructive">*</span></Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. North Branch"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="code">Code <span className="text-destructive">*</span></Label>
            <Input
              id="code"
              name="code"
              placeholder="e.g. NTH"
              value={form.code}
              onChange={handleChange}
              className="uppercase"
              maxLength={10}
            />
            <p className="text-xs text-muted-foreground">Used as SKU prefix. Will be uppercased.</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              placeholder="Branch address"
              value={form.address}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                placeholder="+91 XXXXXXXXXX"
                value={form.phone}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="branch@example.com"
                value={form.email}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creating...' : 'Create Branch'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}