'use client'

import { useState, useEffect } from 'react'
import { Settings2, Save, Clock } from 'lucide-react'
import {
  Sheet, SheetContent, SheetHeader,
  SheetTitle, SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { attendanceService } from '@/services/attendance.service'
import type { AttendanceSettings } from '@/types/attendance.types'

interface Props {
  open: boolean
  onClose: () => void
  onSaved: () => void
}

export function AttendanceSettingsSheet({ open, onClose, onSaved }: Props) {
  const [settings, setSettings] = useState<AttendanceSettings | null>(null)
  const [minHours, setMinHours] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    attendanceService.getSettings()
      .then((s) => {
        setSettings(s)
        setMinHours(s?.minimumWorkingHours != null ? String(s.minimumWorkingHours) : '')
        setStartTime(s?.workStartTime ?? '')
        setEndTime(s?.workEndTime ?? '')
      })
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false))
  }, [open])

  const handleSave = async () => {
    setSaving(true)
    try {
      await attendanceService.updateSettings({
        minimumWorkingHours: minHours !== '' ? Number(minHours) : null,
        workStartTime: startTime || null,
        workEndTime: endTime || null,
      })
      toast.success('Settings saved successfully!')
      onSaved()
      onClose()
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleClear = () => {
    setMinHours('')
    setStartTime('')
    setEndTime('')
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" />
            Attendance Settings
          </SheetTitle>
          <SheetDescription>
            Configure working hours and checkout restrictions for your branch.
          </SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">

            {/* Min working hours */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Minimum Working Hours Before Checkout
              </Label>
              <Input
                type="number"
                min={0}
                max={24}
                step={0.5}
                placeholder="e.g. 6 (leave empty to disable)"
                value={minHours}
                onChange={(e) => setMinHours(e.target.value)}
                className="h-10"
              />
              <p className="text-xs text-muted-foreground">
                Employees won't be able to check out before completing this many hours.
                Leave empty to allow checkout any time.
              </p>
            </div>

            <Separator />

            {/* Work timing (informational) */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wide text-xs">
                Work Timing (Informational)
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Start Time</Label>
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">End Time</Label>
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="h-10"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                These are display-only and don't restrict check-in/out timing.
              </p>
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleClear}
                disabled={saving}
              >
                Clear All
              </Button>
              <Button
                className="flex-1"
                onClick={handleSave}
                disabled={saving}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}