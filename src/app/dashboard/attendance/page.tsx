'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarDays, ShieldCheck, CalendarOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CheckInCard } from './_components/CheckInCard'
import { TodayTimelineCard } from './_components/TodayTimelineCard'
import { RecentHistoryCard } from './_components/RecentHistoryCard'
import { MonthSummaryCard } from './_components/MonthSummaryCard'
import { MarkLeaveSheet } from './_components/MarkLeaveSheet'
import { useTodayAttendance } from '@/hooks/useTodayAttendance'
import { useAuth } from '@/hooks/useAuth'

export default function AttendancePage() {
  const router = useRouter()
  const { user, isSuperAdmin, isBranchAdmin } = useAuth()
  const isAdmin = isSuperAdmin || isBranchAdmin

  const { attendance, refresh } = useTodayAttendance()
  const [leaveOpen, setLeaveOpen] = useState(false)

  // Super admin ko seedha admin dashboard pe redirect karo
  useEffect(() => {
    if (isSuperAdmin) {
      router.replace('/dashboard/attendance/admin')
    }
  }, [isSuperAdmin, router])

  if (!user) return null
  if (isSuperAdmin) return null

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-5xl mx-auto w-full">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-primary" />
            Attendance
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mark Leave button — sabke liye (non-super admin) */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLeaveOpen(true)}
          >
            <CalendarOff className="h-4 w-4 mr-2" />
            Mark Leave
          </Button>

          {/* Admin Dashboard button — sirf branch admin ke liye */}
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard/attendance/admin')}
            >
              <ShieldCheck className="h-4 w-4 mr-2" />
              Admin Dashboard
            </Button>
          )}
        </div>
      </div>

      {/* Top row — Check In card + Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CheckInCard onStatusChange={refresh} />
        <TodayTimelineCard attendance={attendance} />
      </div>

      {/* Bottom row — Month summary + Recent history */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MonthSummaryCard userId={user.id} />
        <RecentHistoryCard userId={user.id} />
      </div>

      {/* Mark Leave Sheet */}
      <MarkLeaveSheet
        open={leaveOpen}
        onClose={() => setLeaveOpen(false)}
        onSaved={refresh}
      />
    </div>
  )
}