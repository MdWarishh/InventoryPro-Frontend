'use client'

import { useState, useMemo, useEffect } from 'react'
import { Settings2, RefreshCw, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { attendanceService } from '@/services/attendance.service'
import { AttendanceTable } from '../_components/AttendanceTable'
import { UserCalendarSheet } from '../_components/UserCalendarSheet'
import { AdminStatsCards } from './_components/AdminStatsCards'
import { AdminFiltersBar } from './_components/AdminFiltersBar'
import { AttendanceSettingsSheet } from './_components/AttendanceSettingsSheet'
import { AdminEditAttendanceSheet } from './_components/AdminEditAttendanceSheet'
import { useAttendanceStats } from '@/hooks/useAttendanceStats'
import { useBranchFilter } from '@/hooks/useBranchFilter'
import { useBranchStore } from '@/store/branch.store'
import type { AttendanceWithUser } from '@/types/attendance.types'

const now = new Date()

export default function AdminAttendancePage() {
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [calendarUser, setCalendarUser] = useState<{ id: string; name: string } | null>(null)
  const [editRecord, setEditRecord] = useState<AttendanceWithUser | null>(null)  // ← NEW
  const [autoAbsentLoading, setAutoAbsentLoading] = useState(false)
  const [tableKey, setTableKey] = useState(0)

  const { branchId: globalBranchId } = useBranchFilter()
  const branches = useBranchStore((s) => s.branches)

  useEffect(() => {
    setTableKey((k) => k + 1)
  }, [globalBranchId])

  const filters = useMemo(
    () => ({ month, year, branchId: globalBranchId || undefined }),
    [month, year, globalBranchId]
  )

  const { stats, loading: statsLoading, refetch: refetchStats } = useAttendanceStats(filters)

  const handleAutoAbsent = async () => {
    setAutoAbsentLoading(true)
    try {
      const result = await attendanceService.triggerAutoAbsent()
      toast.success(`Auto-absent complete — ${result.marked} users marked absent.`)
      setTableKey((k) => k + 1)
      refetchStats()
    } catch {
      toast.error('Auto-absent failed')
    } finally {
      setAutoAbsentLoading(false)
    }
  }

  const handleSettingsSaved = () => {
    setTableKey((k) => k + 1)
    refetchStats()
  }

  // Edit save hone ke baad table + stats refresh karo
  const handleEditSaved = () => {
    setTableKey((k) => k + 1)
    refetchStats()
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-7xl mx-auto w-full">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-primary" />
            Attendance
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Monitor employee attendance and working hours
            {globalBranchId && (
              <span className="ml-2 text-indigo-500 font-medium">
                · {branches.find(b => b.id === globalBranchId)?.name}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAutoAbsent}
            disabled={autoAbsentLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoAbsentLoading ? 'animate-spin' : ''}`} />
            Run Auto-Absent
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings2 className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats */}
      <AdminStatsCards stats={stats} loading={statsLoading} />

      {/* Filters + Table */}
      <div className="flex flex-col gap-4">
        <AdminFiltersBar
          month={month}
          year={year}
          onMonthChange={(m) => { setMonth(m); setTableKey((k) => k + 1) }}
          onYearChange={(y) => { setYear(y); setTableKey((k) => k + 1) }}
          onReset={() => {
            setMonth(now.getMonth() + 1)
            setYear(now.getFullYear())
            setTableKey((k) => k + 1)
          }}
        />

        {/*
          AttendanceTable ko onEditRecord prop pass karo.
          Table mein har row pe edit button dikhao (pencil icon).
          Wo button click hone pe yahan setEditRecord call hoga.
        */}
        <AttendanceTable
          key={tableKey}
          filters={filters}
          onViewUser={(id, name) => setCalendarUser({ id, name })}
          onEditRecord={(record) => setEditRecord(record)}  // ← NEW prop
        />
      </div>

      {/* Settings sheet */}
      <AttendanceSettingsSheet
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSaved={handleSettingsSaved}
      />

      {/* User calendar sheet */}
      <UserCalendarSheet
        userId={calendarUser?.id ?? null}
        userName={calendarUser?.name ?? ''}
        open={!!calendarUser}
        onClose={() => setCalendarUser(null)}
      />

      {/* NEW: Edit attendance sheet — sirf super admin ke liye */}
      <AdminEditAttendanceSheet
        record={editRecord}
        open={!!editRecord}
        onClose={() => setEditRecord(null)}
        onSaved={handleEditSaved}
      />
    </div>
  )
}