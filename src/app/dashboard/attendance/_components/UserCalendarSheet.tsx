'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { attendanceService } from '@/services/attendance.service'
import { StatusBadge } from './StatusBadge'
import type { UserMonthlyAttendanceResponse, AttendanceStatus } from '@/types/attendance.types'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const STATUS_COLORS: Record<AttendanceStatus, string> = {
  PRESENT: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  HALF_DAY: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  ABSENT: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-200 dark:border-red-800',
  LEAVE: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-200 dark:border-blue-800',
}

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

interface Props {
  userId: string | null
  userName: string
  open: boolean
  onClose: () => void
}

export function UserCalendarSheet({ userId, userName, open, onClose }: Props) {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [data, setData] = useState<UserMonthlyAttendanceResponse | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchData = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try {
      const res = await attendanceService.getUserAttendance(userId, { month, year })
      setData(res)
    } finally {
      setLoading(false)
    }
  }, [userId, month, year])

  useEffect(() => { if (open) fetchData() }, [open, fetchData])

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  // Build calendar grid
  const buildCalendar = () => {
    const statusMap: Record<string, AttendanceStatus> = {}
    data?.records.forEach((r) => {
      const day = new Date(r.date).getUTCDate()
      statusMap[day] = r.status
    })

    const firstDay = new Date(year, month - 1, 1).getDay()
    const daysInMonth = new Date(year, month, 0).getDate()
    const cells: (number | null)[] = [
      ...Array(firstDay).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ]
    return { cells, statusMap }
  }

  const { cells, statusMap } = data ? buildCalendar() : { cells: [], statusMap: {} }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-lg">{userName}'s Attendance</SheetTitle>
        </SheetHeader>

        {/* Month navigator */}
        <div className="flex items-center justify-between mb-5">
          <Button variant="ghost" size="icon" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
          <span className="font-semibold">{MONTH_NAMES[month - 1]} {year}</span>
          <Button variant="ghost" size="icon" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
        </div>

        {/* Summary */}
        {data && (
          <div className="grid grid-cols-4 gap-2 mb-5">
            {[
              { label: 'Present', value: data.summary.present, color: 'text-emerald-600' },
              { label: 'Half Day', value: data.summary.halfDay, color: 'text-amber-600' },
              { label: 'Absent', value: data.summary.absent, color: 'text-red-600' },
              { label: 'Total Hrs', value: `${Math.round(data.summary.totalHours)}h`, color: 'text-primary' },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-muted/50 p-3 text-center">
                <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Calendar */}
        {loading ? (
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={i} className="h-10 rounded-lg" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-7 gap-1 mb-1">
              {DAY_LABELS.map((d) => (
                <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {cells.map((day, i) => (
                <div
                  key={i}
                  className={`h-10 rounded-lg border flex items-center justify-center text-sm font-medium transition-colors
                    ${day === null ? 'border-transparent' : statusMap[day]
                      ? STATUS_COLORS[statusMap[day]]
                      : 'border-muted text-muted-foreground'
                    }`}
                >
                  {day}
                </div>
              ))}
            </div>
            {/* Legend */}
            <div className="flex gap-3 mt-4 flex-wrap">
              {(['PRESENT', 'HALF_DAY', 'ABSENT', 'LEAVE'] as AttendanceStatus[]).map((s) => (
  <div key={s} className="flex items-center gap-1.5 text-xs text-muted-foreground">
    <span className={`h-3 w-3 rounded-sm border ${STATUS_COLORS[s]}`} />
    {s === 'PRESENT' ? 'Present' : s === 'HALF_DAY' ? 'Half Day' : s === 'ABSENT' ? 'Absent' : 'Leave'}
  </div>
))}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}