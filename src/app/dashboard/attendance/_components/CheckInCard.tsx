'use client'

import { useState, useEffect, useCallback } from 'react'
import { LogIn, LogOut, Clock, Timer } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { attendanceService } from '@/services/attendance.service'
import { StatusBadge } from './StatusBadge'
import type { TodayStatusResponse } from '@/types/attendance.types'

const fmt = (iso: string | null) =>
  iso ? new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'

const fmtHours = (h: number | null) => {
  if (h === null) return '—'
  const hrs = Math.floor(h)
  const mins = Math.round((h - hrs) * 60)
  return `${hrs}h ${mins}m`
}

interface Props {
  onStatusChange?: () => void
}

export function CheckInCard({ onStatusChange }: Props = {}) {
  const [data, setData] = useState<TodayStatusResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [remaining, setRemaining] = useState('')

  const fetchStatus = useCallback(async () => {
    try {
      const res = await attendanceService.getTodayStatus()
      setData(res)
    } catch {
      toast.error('Failed to load attendance status')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchStatus() }, [fetchStatus])

  // Countdown timer
  useEffect(() => {
    if (!data?.allowedCheckoutAt) { setRemaining(''); return }
    const tick = () => {
      const diff = new Date(data.allowedCheckoutAt!).getTime() - Date.now()
      if (diff <= 0) { setRemaining(''); return }
      const h = Math.floor(diff / 3_600_000)
      const m = Math.floor((diff % 3_600_000) / 60_000)
      const s = Math.floor((diff % 60_000) / 1000)
      setRemaining(`${h}h ${m}m ${s}s`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [data?.allowedCheckoutAt])

  const handleCheckIn = async () => {
    setActionLoading(true)
    try {
      await attendanceService.checkIn()
      toast.success('Checked in successfully!')
      fetchStatus()
      onStatusChange?.()
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Check-in failed')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCheckOut = async () => {
    setActionLoading(true)
    try {
      await attendanceService.checkOut()
      toast.success('Checked out successfully!')
      fetchStatus()
      onStatusChange?.()
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Check-out failed')
    } finally {
      setActionLoading(false)
    }
  }

  const att = data?.attendance
  const checkedIn = !!att?.checkInTime
  const checkedOut = !!att?.checkOutTime
  const checkoutAllowed = !data?.allowedCheckoutAt || new Date(data.allowedCheckoutAt) <= new Date()

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="h-48" />
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          Today's Attendance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Times row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-muted/50 p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">Check In</p>
            <p className="text-sm font-semibold">{fmt(att?.checkInTime ?? null)}</p>
          </div>
          <div className="rounded-xl bg-muted/50 p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">Check Out</p>
            <p className="text-sm font-semibold">{fmt(att?.checkOutTime ?? null)}</p>
          </div>
          <div className="rounded-xl bg-muted/50 p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">Hours</p>
            <p className="text-sm font-semibold">{fmtHours(att?.totalHours ?? null)}</p>
          </div>
        </div>

        {/* Status */}
        {att && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <StatusBadge status={att.status} />
          </div>
        )}

        {/* Countdown */}
        {checkedIn && !checkedOut && !checkoutAllowed && remaining && (
          <div className="flex items-center gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
            <Timer className="h-4 w-4 shrink-0" />
            <span>Checkout available after {fmt(data?.allowedCheckoutAt ?? null)} &mdash; <strong>{remaining}</strong> remaining</span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          <Button
            className="flex-1"
            variant={checkedIn ? 'outline' : 'default'}
            disabled={checkedIn || actionLoading}
            onClick={handleCheckIn}
          >
            <LogIn className="h-4 w-4 mr-2" />
            Check In
          </Button>
          <Button
            className="flex-1"
            variant={checkedOut ? 'outline' : 'default'}
            disabled={!checkedIn || checkedOut || !checkoutAllowed || actionLoading}
            onClick={handleCheckOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Check Out
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}