'use client'

import { useState, useEffect } from 'react'
import { Pencil, Save, Trash2, Clock } from 'lucide-react'
import {
  Sheet, SheetContent, SheetHeader,
  SheetTitle, SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { attendanceService } from '@/services/attendance.service'
import type { AttendanceWithUser, AttendanceStatus } from '@/types/attendance.types'

interface Props {
  record: AttendanceWithUser | null
  open: boolean
  onClose: () => void
  onSaved: () => void
}

const toTimeInput = (iso: string | null): string => {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toTimeString().slice(0, 5)
}

const toISO = (date: string, time: string): string | null => {
  if (!time) return null
  return new Date(`${date}T${time}:00`).toISOString()
}

const STATUS_OPTIONS: { value: AttendanceStatus; label: string }[] = [
  { value: 'PRESENT',  label: '✅ Present'  },
  { value: 'HALF_DAY', label: '🌓 Half Day' },
  { value: 'ABSENT',   label: '❌ Absent'   },
  { value: 'LEAVE',    label: '🏖️ Leave'    },
]

export function AdminEditAttendanceSheet({ record, open, onClose, onSaved }: Props) {
  const [checkIn,  setCheckIn]  = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [status,   setStatus]   = useState<AttendanceStatus>('ABSENT')
  const [notes,    setNotes]    = useState('')
  const [saving,   setSaving]   = useState(false)

  useEffect(() => {
    if (!record) return
    setCheckIn(toTimeInput(record.checkInTime))
    setCheckOut(toTimeInput(record.checkOutTime))
    setStatus(record.status)
    setNotes(record.notes ?? '')
  }, [record])

  const handleSave = async () => {
    if (!record) return
    setSaving(true)
    try {
      const dateStr = record.date.slice(0, 10)
      await attendanceService.editAttendance(record.id, {
        checkInTime:  checkIn  ? toISO(dateStr, checkIn)  : null,
        checkOutTime: checkOut ? toISO(dateStr, checkOut) : null,
        status,
        notes: notes || null,
      })
      toast.success('Attendance updated successfully!')
      onSaved()
      onClose()
    } catch {
      toast.error('Failed to update attendance')
    } finally {
      setSaving(false)
    }
  }

  if (!record) return null

  const dateLabel = new Date(record.date).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <Sheet open={open} onOpenChange={onClose}>
      {/* 
        SheetContent ko flex column banaya:
        - Header fixed top pe
        - Middle scrollable
        - Footer (Save button) fixed bottom pe
      */}
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">

        {/* ── Fixed Header ── */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <SheetTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-primary" />
            Edit Attendance
          </SheetTitle>
          <SheetDescription className="text-left">
            <span className="font-medium text-foreground">{record.user.name}</span>
            <span className="mx-1.5 text-muted-foreground">·</span>
            <span>{dateLabel}</span>
          </SheetDescription>
        </SheetHeader>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Status */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as AttendanceStatus)}>
              <SelectTrigger className="h-10 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Timing */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Timing
            </Label>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Check-in Time</Label>
                <Input
                  type="time"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="h-10 w-full"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Check-out Time</Label>
                <Input
                  type="time"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="h-10 w-full"
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Dono times set hone par total hours aur status automatically recalculate ho jayega.
            </p>

            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2 -ml-2"
              onClick={() => { setCheckIn(''); setCheckOut('') }}
              disabled={!checkIn && !checkOut}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Clear both times
            </Button>
          </div>

          <Separator />

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Notes
              <span className="ml-1 text-xs font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              placeholder="Reason for edit, leave details, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none h-24 w-full"
            />
          </div>

        </div>

        {/* ── Fixed Footer — always visible ── */}
        <div className="shrink-0 border-t px-6 py-4 bg-background">
          <div className="flex gap-3">
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
              onClick={handleSave}
              disabled={saving}
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

      </SheetContent>
    </Sheet>
  )
}