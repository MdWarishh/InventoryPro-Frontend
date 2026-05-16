'use client'

import { SlidersHorizontal, RotateCcw } from 'lucide-react'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

const MONTHS = [
  { v: '1', l: 'January' }, { v: '2', l: 'February' },
  { v: '3', l: 'March' }, { v: '4', l: 'April' },
  { v: '5', l: 'May' }, { v: '6', l: 'June' },
  { v: '7', l: 'July' }, { v: '8', l: 'August' },
  { v: '9', l: 'September' }, { v: '10', l: 'October' },
  { v: '11', l: 'November' }, { v: '12', l: 'December' },
]

const now = new Date()
const YEARS = Array.from({ length: 3 }, (_, i) => now.getFullYear() - i)

interface Props {
  month: number
  year: number
  onMonthChange: (m: number) => void
  onYearChange: (y: number) => void
  onReset: () => void
}

export function AdminFiltersBar({ month, year, onMonthChange, onYearChange, onReset }: Props) {
  const isDefault =
    month === now.getMonth() + 1 && year === now.getFullYear()

  return (
    <div className="flex items-end gap-3 flex-wrap">
      <SlidersHorizontal className="h-4 w-4 text-muted-foreground mb-2.5 shrink-0" />

      <div className="flex flex-col gap-1">
        <Label className="text-xs text-muted-foreground">Month</Label>
        <Select value={String(month)} onValueChange={(v) => onMonthChange(Number(v))}>
          <SelectTrigger className="w-36 h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((m) => (
              <SelectItem key={m.v} value={m.v}>{m.l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
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

      {!isDefault && (
        <Button
          variant="ghost"
          size="sm"
          className="h-9 mb-0.5 text-muted-foreground hover:text-foreground"
          onClick={onReset}
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
          Reset
        </Button>
      )}
    </div>
  )
}