'use client'

import { Badge } from '@/components/ui/badge'
import type { AttendanceStatus } from '@/types/attendance.types'

interface Props {
  status: AttendanceStatus
}

const config: Record<AttendanceStatus, { label: string; className: string }> = {
  PRESENT: {
    label: 'Present',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800',
  },
  HALF_DAY: {
    label: 'Half Day',
    className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800',
  },
  ABSENT: {
    label: 'Absent',
    className: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800',
  },
  LEAVE: {
    label: 'Leave',
    className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800',
  },
}

export function StatusBadge({ status }: Props) {
  const { label, className } = config[status]
  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  )
}