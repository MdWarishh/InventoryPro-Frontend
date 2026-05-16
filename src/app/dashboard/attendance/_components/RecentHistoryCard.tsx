'use client'

import { useState, useEffect } from 'react'
import { History } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { attendanceService } from '@/services/attendance.service'
import { StatusBadge } from './StatusBadge'
import type { AttendanceWithUser } from '@/types/attendance.types'

const fmt = (iso: string | null) =>
  iso ? new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'

const fmtDay = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })

const fmtHours = (h: number | null) => {
  if (h === null) return '—'
  const hrs = Math.floor(h)
  const mins = Math.round((h - hrs) * 60)
  return `${hrs}h ${mins}m`
}

interface Props {
  userId: string
}

export function RecentHistoryCard({ userId }: Props) {
  const [records, setRecords] = useState<AttendanceWithUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Last 7 days
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - 6)
    const fmt2 = (d: Date) => d.toISOString().split('T')[0]

    attendanceService
      .getAll({ startDate: fmt2(start), endDate: fmt2(end), userId, limit: 7 })
      .then((res) => setRecords(res.records))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [userId])

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <History className="h-4 w-4 text-primary" />
          Recent History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        ) : records.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-6">No recent records</p>
        ) : (
          <div className="space-y-1">
            {records.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-muted/40 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium">{fmtDay(r.date)}</p>
                  <p className="text-xs text-muted-foreground">
                    {fmt(r.checkInTime)} → {fmt(r.checkOutTime)}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-right">
                  <span className="text-xs text-muted-foreground">{fmtHours(r.totalHours)}</span>
                  <StatusBadge status={r.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}