'use client'

import { useState, useEffect } from 'react'
import { BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { attendanceService } from '@/services/attendance.service'

interface Props {
  userId: string
}

export function MonthSummaryCard({ userId }: Props) {
  const [data, setData] = useState<{
    present: number
    halfDay: number
    absent: number
    totalHours: number
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const now = new Date()
    attendanceService
      .getUserAttendance(userId, { month: now.getMonth() + 1, year: now.getFullYear() })
      .then((res) => setData(res.summary))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [userId])

  const monthName = new Date().toLocaleString('en-IN', { month: 'long' })

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          {monthName} Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading || !data ? (
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Present', value: data.present, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
              { label: 'Half Day', value: data.halfDay, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/40' },
              { label: 'Absent', value: data.absent, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/40' },
              { label: 'Total Hours', value: `${Math.round(data.totalHours)}h`, color: 'text-primary', bg: 'bg-primary/5' },
            ].map((s) => (
              <div key={s.label} className={`rounded-xl p-3 ${s.bg} text-center`}>
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}