'use client'

import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { Trophy, TrendingUp, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { taskService } from '@/services/task.service'
import type { TaskStats, ScoreboardEntry } from '@/types/task.types'
import { cn } from '@/lib/utils'

const STATUS_COLORS  = { TODO: '#94a3b8', IN_PROGRESS: '#3b82f6', DONE: '#22c55e' }
const PRIORITY_COLORS = { HIGH: '#ef4444', MEDIUM: '#f59e0b', LOW: '#22c55e' }

const MEDAL = ['🥇', '🥈', '🥉']

interface Props {
  branchId?: string
}

export function TaskStatsCharts({ branchId }: Props) {
  const [stats,      setStats]      = useState<TaskStats | null>(null)
  const [scoreboard, setScoreboard] = useState<ScoreboardEntry[]>([])
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      taskService.getTaskStats(),
      taskService.getScoreboard(branchId),
    ])
      .then(([s, sc]) => { setStats(s); setScoreboard(sc) })
      .finally(() => setLoading(false))
  }, [branchId])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-56 rounded-xl" />
        ))}
      </div>
    )
  }

  // Format daily data for bar chart
  const dailyData = stats?.dailyCompletion.map((d) => ({
    day: new Date(d.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }),
    completed: d.count,
  })) ?? []

  // Status pie data
  const statusData = (stats?.statusBreakdown ?? []).map((s) => ({
    name: s.status.replace('_', ' '),
    value: s._count,
    color: STATUS_COLORS[s.status] ?? '#94a3b8',
  }))

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

      {/* ── Daily Completion Bar Chart ── */}
      <Card className="md:col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Last 7 Days
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dailyData.every((d) => d.completed === 0) ? (
            <div className="h-36 flex items-center justify-center text-sm text-muted-foreground">
              No completions yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={dailyData} barSize={20}>
                <XAxis dataKey="day" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis hide allowDecimals={false} />
                <Tooltip
                  formatter={(v) => [v, 'Completed']}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Bar dataKey="completed" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* ── Status Donut ── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            My Task Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {statusData.length === 0 ? (
            <div className="h-36 flex items-center justify-center text-sm text-muted-foreground">
              No tasks yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  formatter={(value) => <span style={{ fontSize: 11 }}>{value}</span>}
                  iconSize={8}
                />
                <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* ── Scoreboard ── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            Branch Scoreboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          {scoreboard.length === 0 ? (
            <div className="h-36 flex items-center justify-center text-sm text-muted-foreground">
              No data yet
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[150px] overflow-y-auto pr-1">
              {scoreboard.slice(0, 8).map((entry, i) => (
                <div key={entry.user.id} className="flex items-center gap-2.5">
                  <span className="text-base w-5 text-center shrink-0">
                    {MEDAL[i] ?? `${i + 1}.`}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{entry.user.name}</p>
                    <div className="mt-0.5 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{
                          width: `${Math.min(
                            100,
                            scoreboard[0].weightedScore > 0
                              ? (entry.weightedScore / scoreboard[0].weightedScore) * 100
                              : 0,
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-primary">{entry.weightedScore} pts</p>
                    <p className="text-[10px] text-muted-foreground">{entry.completionRate}%</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  )
}