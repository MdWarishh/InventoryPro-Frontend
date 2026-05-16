'use client'

import { useState, useEffect, useCallback } from 'react'
import { attendanceService } from '@/services/attendance.service'
import type { GetAllAttendanceParams } from '@/types/attendance.types'

interface Stats {
  total: number
  present: number
  halfDay: number
  absent: number
  avgHours: number
}

export function useAttendanceStats(filters: GetAllAttendanceParams) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch all records (high limit) to compute stats
      const res = await attendanceService.getAll({ ...filters, limit: 1000, page: 1 })
      const records = res.records

      const present = records.filter((r) => r.status === 'PRESENT').length
      const halfDay = records.filter((r) => r.status === 'HALF_DAY').length
      const absent = records.filter((r) => r.status === 'ABSENT').length
      const totalHours = records.reduce((sum, r) => sum + (r.totalHours ?? 0), 0)
      const workedCount = records.filter((r) => r.totalHours != null).length

      setStats({
        total: records.length,
        present,
        halfDay,
        absent,
        avgHours: workedCount > 0 ? totalHours / workedCount : 0,
      })
    } catch {
      setStats(null)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { refetch() }, [refetch])

  return { stats, loading, refetch }
}