'use client'

import { useState, useEffect, useCallback } from 'react'
import { Eye } from 'lucide-react'
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { attendanceService } from '@/services/attendance.service'
import { StatusBadge } from './StatusBadge'
import type { AttendanceWithUser, GetAllAttendanceParams } from '@/types/attendance.types'

const fmt = (iso: string | null) =>
  iso ? new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

const fmtHours = (h: number | null) => {
  if (h === null) return '—'
  const hrs = Math.floor(h)
  const mins = Math.round((h - hrs) * 60)
  return `${hrs}h ${mins}m`
}

interface Props {
  filters: GetAllAttendanceParams
  onViewUser: (userId: string, userName: string) => void
}

export function AttendanceTable({ filters, onViewUser }: Props) {
  const [records, setRecords] = useState<AttendanceWithUser[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await attendanceService.getAll(filters)
      setRecords(res.records)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { fetchData() }, [fetchData])

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (records.length === 0) {
    return (
      <div className="py-16 text-center text-muted-foreground text-sm">
        No attendance records found.
      </div>
    )
  }

  return (
    <div className="rounded-xl border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40">
            <TableHead>Employee</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Check In</TableHead>
            <TableHead>Check Out</TableHead>
            <TableHead>Hours</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((r) => (
            <TableRow key={r.id} className="hover:bg-muted/30 transition-colors">
              <TableCell className="font-medium">{r.user.name}</TableCell>
              <TableCell className="text-muted-foreground">{fmtDate(r.date)}</TableCell>
              <TableCell>{fmt(r.checkInTime)}</TableCell>
              <TableCell>{fmt(r.checkOutTime)}</TableCell>
              <TableCell>{fmtHours(r.totalHours)}</TableCell>
              <TableCell><StatusBadge status={r.status} /></TableCell>
              <TableCell>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => onViewUser(r.user.id, r.user.name)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}