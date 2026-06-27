'use client'

import { useState } from 'react'
import { CalendarOff, Save } from 'lucide-react'
import {
  Sheet, SheetContent, SheetHeader,
  SheetTitle, SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { attendanceService } from '@/services/attendance.service'

interface Props {
  open: boolean
  onClose: () => void
  onSaved: () => void
}

export function MarkLeaveSheet({ open, onClose, onSaved }: Props) {
  const today = new Date().toISOString().slice(0, 10)
  const [date,   setDate]   = useState(today)
  const [notes,  setNotes]  = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (!date) {
      toast.error('Please select a date')
      return
    }

    setSaving(true)
    try {
      await attendanceService.markLeave({ date, notes: notes || null })
      toast.success('Leave marked successfully!')
      setNotes('')
      setDate(today)
      onSaved()
      onClose()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to mark leave')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2">
            <CalendarOff className="h-5 w-5 text-primary" />
            Mark Leave
          </SheetTitle>
          <SheetDescription>
            Select the date for which you want to apply leave.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5">

          {/* Date picker */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Leave Date</Label>
            <Input
              type="date"
              value={date}
              max={today}
              onChange={(e) => setDate(e.target.value)}
              className="h-10"
            />
            <p className="text-xs text-muted-foreground">
              Aaj ya koi bhi past date select karo. Future dates allowed nahi hain.
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Reason (optional)</Label>
            <Textarea
              placeholder="e.g. Sick leave, personal work, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none h-24"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={saving}
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Marking...' : 'Mark Leave'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}