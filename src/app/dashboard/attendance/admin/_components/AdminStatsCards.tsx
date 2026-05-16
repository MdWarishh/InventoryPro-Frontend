'use client'

import { Users, UserCheck, UserMinus, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface Stats {
  total: number
  present: number
  halfDay: number
  absent: number
  avgHours: number
}

interface Props {
  stats: Stats | null
  loading: boolean
}

const cards = (s: Stats) => [
  {
    label: 'Total Records',
    value: s.total,
    icon: Users,
    color: 'text-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
  },
  {
    label: 'Present',
    value: s.present,
    icon: UserCheck,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
  },
  {
    label: 'Half Day',
    value: s.halfDay,
    icon: UserMinus,
    color: 'text-amber-600',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
  },
  {
    label: 'Absent',
    value: s.absent,
    icon: UserMinus,
    color: 'text-red-600',
    bg: 'bg-red-50 dark:bg-red-950/40',
  },
  {
    label: 'Avg Hours/Day',
    value: `${s.avgHours.toFixed(1)}h`,
    icon: Clock,
    color: 'text-purple-600',
    bg: 'bg-purple-50 dark:bg-purple-950/40',
  },
]

export function AdminStatsCards({ stats, loading }: Props) {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards(stats).map((c) => (
        <Card key={c.label} className="border-0 shadow-sm">
          <CardContent className="p-4 flex flex-col gap-2">
            <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center`}>
              <c.icon className={`h-4 w-4 ${c.color}`} />
            </div>
            <p className="text-2xl font-bold tracking-tight">{c.value}</p>
            <p className="text-xs text-muted-foreground">{c.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}