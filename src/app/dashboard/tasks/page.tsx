'use client'

import { useState, useEffect } from 'react'
import { ClipboardList, Plus, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/useAuth'
import { usersService } from '@/services/users.service'
import { useMyTasks } from '@/hooks/useMyTasks'
import { TaskCard } from './_components/TaskCard'
import { TaskDetailSheet } from './_components/TaskDetailSheet'
import { CreateTaskSheet } from './_components/CreateTaskSheet'
import { TaskStatsCharts } from './_components/TaskStatsCharts'
import { Skeleton } from '@/components/ui/skeleton'
import { taskService } from '@/services/task.service'
import type { Task, TaskStatus, TaskPriority } from '@/types/task.types'
import type { TaskUser } from '@/types/task.types'
import { useBranchFilter } from '@/hooks/useBranchFilter'
import { useBranchStore } from '@/store/branch.store'

export default function TasksPage() {
  const { user, isSuperAdmin, isBranchAdmin } = useAuth()
  const isAdmin = isSuperAdmin || isBranchAdmin

  const [statusFilter,   setStatusFilter]   = useState<TaskStatus | 'ALL'>('ALL')
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'ALL'>('ALL')
  const [createOpen,     setCreateOpen]     = useState(false)
  const [detailTaskId,   setDetailTaskId]   = useState<string | null>(null)
  const [branchUsers,    setBranchUsers]    = useState<TaskUser[]>([])
  const [adminTasks,     setAdminTasks]     = useState<Task[]>([])
  const [adminLoading,   setAdminLoading]   = useState(false)

  // Global branch filter from sidebar
  const { branchId: globalBranchId } = useBranchFilter()
  const branches = useBranchStore((s) => s.branches)

  const params = {
    ...(statusFilter   !== 'ALL' && { status:   statusFilter   }),
    ...(priorityFilter !== 'ALL' && { priority: priorityFilter }),
    ...(globalBranchId           && { branchId: globalBranchId }),
  }

  const { data: myTasks, loading: myLoading, refetch } = useMyTasks(params)

  // Admin: branch users + all tasks load karo
  useEffect(() => {
    if (!isAdmin) return

    usersService.getAll()
      .then((res) => {
        const filtered = isSuperAdmin
          ? res.users
          : res.users.filter((u) => u.branchId === user?.branchId)
        setBranchUsers(filtered as unknown as TaskUser[])
      })
      .catch(() => {})

    setAdminLoading(true)
    taskService.getAllTasks(params)
      .then((res) => setAdminTasks(res.tasks))
      .catch(() => {})
      .finally(() => setAdminLoading(false))

  // globalBranchId change hone pe bhi re-fetch ho
  }, [isAdmin, statusFilter, priorityFilter, globalBranchId])

  const handleRefetch = () => {
    refetch()
    if (isAdmin) {
      taskService.getAllTasks(params).then((res) => setAdminTasks(res.tasks)).catch(() => {})
    }
  }

  if (!user) return null

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-6xl mx-auto w-full">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary" />
            Tasks
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track your work and team progress
          </p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Charts */}
      <TaskStatsCharts branchId={globalBranchId ?? user.branchId ?? undefined} />

      {/* Active branch indicator */}
      {globalBranchId && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
          Showing tasks for:{' '}
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
            {branches.find((b) => b.id === globalBranchId)?.name ?? 'Selected Branch'}
          </span>
          <span className="text-[10px]">(change from sidebar)</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
          <SelectTrigger className="h-8 w-36 text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="TODO">To Do</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="DONE">Done</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as any)}>
          <SelectTrigger className="h-8 w-36 text-xs">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Priorities</SelectItem>
            <SelectItem value="HIGH">🔴 High</SelectItem>
            <SelectItem value="MEDIUM">🟡 Medium</SelectItem>
            <SelectItem value="LOW">🟢 Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Task Lists */}
      <Tabs defaultValue="my-tasks">
        <TabsList className="mb-4">
          <TabsTrigger value="my-tasks">My Tasks</TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="all-tasks">
              All Tasks
              {adminTasks.length > 0 && (
                <span className="ml-1.5 text-[10px] bg-primary/10 text-primary rounded-full px-1.5">
                  {adminTasks.length}
                </span>
              )}
            </TabsTrigger>
          )}
        </TabsList>

        {/* ── MY TASKS TAB ── */}
        <TabsContent value="my-tasks" className="space-y-6">

          {/* Assigned to me */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Assigned to Me ({myTasks.assigned.length})
            </h2>
            {myLoading
              ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
              : myTasks.assigned.length === 0
                ? <p className="text-sm text-muted-foreground py-4 text-center">No assigned tasks.</p>
                : myTasks.assigned.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      canDelete={isAdmin}
                      onRefetch={handleRefetch}
                      onClick={() => setDetailTaskId(task.id)}
                    />
                  ))
            }
          </div>

          <div className="border-t" />

          {/* My personal tasks */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              My Personal Tasks ({myTasks.personal.length})
            </h2>
            {myLoading
              ? Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
              : myTasks.personal.length === 0
                ? (
                  <div className="py-8 text-center">
                    <p className="text-sm text-muted-foreground">No personal tasks yet.</p>
                    <Button variant="outline" size="sm" className="mt-3" onClick={() => setCreateOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" /> Add your first task
                    </Button>
                  </div>
                )
                : myTasks.personal.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      canDelete
                      onRefetch={handleRefetch}
                      onClick={() => setDetailTaskId(task.id)}
                    />
                  ))
            }
          </div>
        </TabsContent>

        {/* ── ALL TASKS TAB (admin only) ── */}
        {isAdmin && (
          <TabsContent value="all-tasks" className="space-y-3">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {globalBranchId
                  ? `${branches.find((b) => b.id === globalBranchId)?.name ?? 'Branch'} Tasks (${adminTasks.length})`
                  : `All Branch Tasks (${adminTasks.length})`
                }
              </h2>
              {isSuperAdmin && (
                <Button size="sm" variant="outline" onClick={() => setCreateOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Assign Task
                </Button>
              )}
            </div>

            {adminLoading
              ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
              : adminTasks.length === 0
                ? (
                  <div className="py-12 text-center">
                    <p className="text-sm text-muted-foreground">No tasks found.</p>
                    {isSuperAdmin && (
                      <Button variant="outline" size="sm" className="mt-3" onClick={() => setCreateOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" /> Assign first task
                      </Button>
                    )}
                  </div>
                )
                : adminTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      canDelete
                      onRefetch={handleRefetch}
                      onClick={() => setDetailTaskId(task.id)}
                    />
                  ))
            }
          </TabsContent>
        )}
      </Tabs>

      {/* Create / Assign Task Sheet */}
      <CreateTaskSheet
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSaved={handleRefetch}
        isAdmin={isAdmin}
        branchUsers={branchUsers}
      />

      {/* Task Detail Sheet */}
      <TaskDetailSheet
        taskId={detailTaskId}
        open={!!detailTaskId}
        onClose={() => setDetailTaskId(null)}
        onRefetch={handleRefetch}
      />
    </div>
  )
}