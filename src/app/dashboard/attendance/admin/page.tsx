'use client'

import { useState, useMemo } from 'react'
import { Settings2, RefreshCw, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { attendanceService } from '@/services/attendance.service'
import { AttendanceTable } from '../_components/AttendanceTable'
import { UserCalendarSheet } from '../_components/UserCalendarSheet'
import { AdminStatsCards } from './_components/AdminStatsCards'
import { AdminFiltersBar } from './_components/AdminFiltersBar'
import { AttendanceSettingsSheet } from './_components/AttendanceSettingsSheet'
import { useAttendanceStats } from '@/hooks/useAttendanceStats'

const now = new Date()

export default function AdminAttendancePage() {
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [calendarUser, setCalendarUser] = useState<{ id: string; name: string } | null>(null)
  const [autoAbsentLoading, setAutoAbsentLoading] = useState(false)
  const [tableKey, setTableKey] = useState(0) // force table refetch

  const filters = useMemo(() => ({ month, year }), [month, year])
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
          onMonthChange={setMonth}
          onYearChange={setYear}
          onReset={() => {
            setMonth(now.getMonth() + 1)
            setYear(now.getFullYear())
          }}
        />

        <AttendanceTable
          key={tableKey}
          filters={filters}
          onViewUser={(id, name) => setCalendarUser({ id, name })}
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
    </div>
  )
}