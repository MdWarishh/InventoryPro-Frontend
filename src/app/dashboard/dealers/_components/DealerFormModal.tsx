'use client'

import { useState, useEffect } from 'react'
import {
  User, Phone, Mail, MapPin, Building2,
  FileText, Hash, Loader2,
} from 'lucide-react'
import type { Dealer, CreateDealerPayload } from '@/types/dealers.types'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/hooks/useAuth'
import { useBranchFilter } from '@/hooks/useBranchFilter'
import { useBranchStore } from '@/store/branch.store'

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateDealerPayload) => Promise<void>
  dealer?: Dealer | null
  loading?: boolean
}

const EMPTY: CreateDealerPayload = {
  name: '', phone: '', email: '', address: '',
  city: '', state: '', gstNumber: '',
  bankAccount: '', bankName: '', ifscCode: '', notes: '',
  branchId: '',
}

export default function DealerFormModal({ open, onClose, onSubmit, dealer, loading }: Props) {
  const [form, setForm] = useState<CreateDealerPayload>(EMPTY)
  const isEdit = !!dealer

  const { user } = useAuth()
  const isSuperAdmin = user?.role === 'SUPER_ADMIN'
  const { branchId: globalBranchId } = useBranchFilter()
  const branches = useBranchStore((s) => s.branches)

  useEffect(() => {
    if (!open) return
    setForm(
      dealer ? {
        name: dealer.name || '',
        phone: dealer.phone || '',
        email: dealer.email || '',
        address: dealer.address || '',
        city: dealer.city || '',
        state: dealer.state || '',
        gstNumber: dealer.gstNumber || '',
        bankAccount: dealer.bankAccount || '',
        bankName: dealer.bankName || '',
        ifscCode: dealer.ifscCode || '',
        notes: dealer.notes || '',
        branchId: '',
      } : {
        ...EMPTY,
        // Non-admin ka branch auto-set, SUPER_ADMIN ka sidebar wala branch default
        branchId: !isSuperAdmin
          ? (user?.branchId || '')
          : (globalBranchId || ''),
      }
    )
  }, [dealer, open])

  const set = (k: keyof CreateDealerPayload) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(form)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0">

        {/* Header */}
        <DialogHeader className="flex-none px-6 py-5 border-b bg-muted/40 rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                {isEdit ? 'Edit Dealer' : 'Add New Dealer'}
              </DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                {isEdit
                  ? `Updating details for ${dealer?.name}`
                  : 'Fill in the dealer information below'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

            {/* Basic Info */}
            <FormSection icon={<User className="w-3 h-3" />} label="Basic Information">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <Label className="text-xs font-semibold">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={form.name}
                    onChange={set('name')}
                    required
                    placeholder="e.g. Raj Medical Store"
                    className="h-10 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" className="pl-9 h-10 text-sm" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input type="email" value={form.email} onChange={set('email')} placeholder="dealer@example.com" className="pl-9 h-10 text-sm" />
                  </div>
                </div>
              </div>
            </FormSection>

            <Separator />

            {/* Branch Selector — sirf create mode mein */}
            {!isEdit && (
              <>
                <FormSection icon={<Building2 className="w-3 h-3" />} label="Branch Assignment">
                  {isSuperAdmin ? (
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">
                        Assign to Branch <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={form.branchId || ''}
                        onValueChange={(v) => setForm(p => ({ ...p, branchId: v }))}
                      >
                        <SelectTrigger className="h-10 text-sm">
                          <SelectValue placeholder="Select branch…" />
                        </SelectTrigger>
                        <SelectContent>
                          {branches.map((b) => (
                            <SelectItem key={b.id} value={b.id}>
                              {b.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-[11px] text-muted-foreground">
                        Dealer will be visible only for this branch
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-muted/60 border text-sm text-muted-foreground">
                      <Building2 className="w-3.5 h-3.5 shrink-0 text-primary" />
                      Dealer will be added to your branch:{' '}
                      <span className="font-semibold text-foreground">
                        {branches.find(b => b.id === user?.branchId)?.name ?? 'Your Branch'}
                      </span>
                    </div>
                  )}
                </FormSection>
                <Separator />
              </>
            )}

            {/* Address */}
            <FormSection icon={<MapPin className="w-3 h-3" />} label="Address">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <Label className="text-xs font-semibold">Street Address</Label>
                  <Input value={form.address} onChange={set('address')} placeholder="Street, Area" className="h-10 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">City</Label>
                  <Input value={form.city} onChange={set('city')} placeholder="Delhi" className="h-10 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">State</Label>
                  <Input value={form.state} onChange={set('state')} placeholder="Delhi" className="h-10 text-sm" />
                </div>
              </div>
            </FormSection>

            <Separator />

            {/* Business */}
            <FormSection icon={<Building2 className="w-3 h-3" />} label="Business Details">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">GST Number</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input value={form.gstNumber} onChange={set('gstNumber')} placeholder="07XXXXX1234X1ZX" className="pl-9 h-10 text-sm font-mono uppercase" />
                </div>
              </div>
            </FormSection>

            <Separator />

            {/* Notes */}
            <FormSection icon={<FileText className="w-3 h-3" />} label="Notes" optional>
              <Textarea value={form.notes} onChange={set('notes')} rows={3} placeholder="Any additional information…" className="text-sm resize-none" />
            </FormSection>
          </div>

          {/* Footer */}
          <DialogFooter className="flex-none px-6 py-4 border-t bg-muted/40 rounded-b-lg gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="h-9 text-sm">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                loading ||
                !form.name.trim() ||
                (!isEdit && isSuperAdmin && !form.branchId)  // SUPER_ADMIN ko branch select karni hogi
              }
              className="h-9 text-sm gap-2 min-w-32"
            >
              {loading
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</>
                : isEdit ? 'Update Dealer' : 'Create Dealer'
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function FormSection({ icon, label, optional, children }: {
  icon: React.ReactNode; label: string; optional?: boolean; children: React.ReactNode
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">{icon}</span>
        <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
        {optional && <span className="text-[10px] text-muted-foreground/60">(optional)</span>}
      </div>
      {children}
    </div>
  )
}