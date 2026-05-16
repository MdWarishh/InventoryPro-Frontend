'use client'

import { Filter } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

const MONTHS = [
  { value: '1', label: 'January' }, { value: '2', label: 'February' },
  { value: '3', label: 'March' }, { value: '4', label: 'April' },
  { value: '5', label: 'May' }, { value: '6', label: 'June' },
  { value: '7', label: 'July' }, { value: '8', label: 'August' },
  { value: '9', label: 'September' }, { value: '10', label: 'October' },
  { value: '11', label: 'November' }, { value: '12', label: 'December' },
]

const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: 3 }, (_, i) => currentYear - i)

interface Props {
  month: number
  year: number
  onMonthChange: (m: number) => void
  onYearChange: (y: number) => void
}

export function AttendanceFilters({ month, year, onMonthChange, onYearChange }: Props) {
  return (
    <div className="flex items-end gap-3 flex-wrap">
      <Filter className="h-4 w-4 text-muted-foreground mb-2" />
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Month</Label>
        <Select value={String(month)} onValueChange={(v) => onMonthChange(Number(v))}>
          <SelectTrigger className="w-36 h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((m) => (
              <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Year</Label>
        <Select value={String(year)} onValueChange={(v) => onYearChange(Number(v))}>
          <SelectTrigger className="w-28 h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {YEARS.map((y) => (
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}