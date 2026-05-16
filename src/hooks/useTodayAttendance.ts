'use client'

import { useState, useEffect, useCallback } from 'react'
import { attendanceService } from '@/services/attendance.service'
import type { Attendance } from '@/types/attendance.types'

/**
 * Shared hook so page.tsx can pass attendance to TodayTimelineCard
 * while CheckInCard handles check-in/out actions independently.
 */
export function useTodayAttendance() {
  const [attendance, setAttendance] = useState<Attendance | null>(null)

  const refresh = useCallback(async () => {
    try {
      const res = await attendanceService.getTodayStatus()
      setAttendance(res.attendance)
    } catch {
      // silently fail — CheckInCard handles its own error
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  return { attendance, refresh }
}