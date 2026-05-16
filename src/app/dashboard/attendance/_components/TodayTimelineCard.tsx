'use client'

import { useEffect, useState } from 'react'
import { TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Attendance } from '@/types/attendance.types'

interface Props {
  attendance: Attendance | null
}

const toMinutes = (iso: string) => {
  const d = new Date(iso)
  return d.getHours() * 60 + d.getMinutes()
}

export function TodayTimelineCard({ attendance }: Props) {
  const [nowMin, setNowMin] = useState(
    new Date().getHours() * 60 + new Date().getMinutes(),
  )

  useEffect(() => {
    const id = setInterval(() => {
      const n = new Date()
      setNowMin(n.getHours() * 60 + n.getMinutes())
    }, 60_000)
    return () => clearInterval(id)
  }, [])

  const DAY_START = 7 * 60   // 7:00 AM
  const DAY_END = 22 * 60    // 10:00 PM
  const TOTAL = DAY_END - DAY_START

  const pct = (min: number) =>
    Math.min(100, Math.max(0, ((min - DAY_START) / TOTAL) * 100))

  const checkInMin = attendance?.checkInTime ? toMinutes(attendance.checkInTime) : null
  const checkOutMin = attendance?.checkOutTime ? toMinutes(attendance.checkOutTime) : null

  const barStart = checkInMin !== null ? pct(checkInMin) : null
  const barEnd = checkOutMin !== null ? pct(checkOutMin) : pct(nowMin)
  const barWidth = barStart !== null ? barEnd - barStart : 0

  const fmtMin = (min: number) => {
    const h = Math.floor(min / 60)
    const m = min % 60
    const ampm = h >= 12 ? 'PM' : 'AM'
    return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')} ${ampm}`
  }

  const hours = [7, 9, 11, 13, 15, 17, 19, 21]

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Today's Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Timeline bar */}
        <div className="relative">
          {/* Background track */}
          <div className="h-8 rounded-full bg-muted relative overflow-hidden">
            {/* Work bar */}
            {barStart !== null && (
              <div
                className="absolute top-0 h-full rounded-full bg-primary/80 transition-all duration-1000"
                style={{ left: `${barStart}%`, width: `${Math.max(barWidth, 0.5)}%` }}
              />
            )}
            {/* Now indicator */}
            <div
              className="absolute top-0 h-full w-0.5 bg-foreground/30"
              style={{ left: `${pct(nowMin)}%` }}
            />
          </div>

          {/* Hour labels */}
          <div className="flex justify-between mt-1">
            {hours.map((h) => (
              <span key={h} className="text-[10px] text-muted-foreground">
                {h > 12 ? `${h - 12}PM` : h === 12 ? '12PM' : `${h}AM`}
              </span>
            ))}
          </div>
        </div>

        {/* Legend */}
        {checkInMin !== null && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>
              <span className="font-medium text-foreground">In:</span>{' '}
              {fmtMin(checkInMin)}
            </span>
            {checkOutMin !== null ? (
              <span>
                <span className="font-medium text-foreground">Out:</span>{' '}
                {fmtMin(checkOutMin)}
              </span>
            ) : (
              <span>
                <span className="font-medium text-foreground">Now:</span>{' '}
                {fmtMin(nowMin)}
              </span>
            )}
          </div>
        )}

        {checkInMin === null && (
          <p className="text-xs text-muted-foreground text-center py-2">
            No activity recorded today
          </p>
        )}
      </CardContent>
    </Card>
  )
}