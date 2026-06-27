'use client'

import { useState } from 'react'
import { Clock, MessageSquare, Trash2, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { taskService } from '@/services/task.service'
import type { Task, TaskStatus } from '@/types/task.types'
import { cn } from '@/lib/utils'

const PRIORITY_MAP = {
  HIGH:   { label: 'High',   class: 'bg-red-100 text-red-700 border-red-200' },
  MEDIUM: { label: 'Medium', class: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  LOW:    { label: 'Low',    class: 'bg-green-100 text-green-700 border-green-200' },
}

const STATUS_CONFIG: Record<TaskStatus, {
  label: string
  next: TaskStatus
  nextLabel: string
  bg: string
  text: string
  dot: string
  ring: string
}> = {
  TODO: {
    label: 'To Do',
    next: 'IN_PROGRESS',
    nextLabel: 'Start Task',
    bg: 'bg-slate-100 hover:bg-blue-100',
    text: 'text-slate-500 hover:text-blue-600',
    dot: 'bg-slate-400',
    ring: 'ring-slate-300 hover:ring-blue-400',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    next: 'DONE',
    nextLabel: 'Mark Done',
    bg: 'bg-blue-100 hover:bg-green-100',
    text: 'text-blue-600 hover:text-green-600',
    dot: 'bg-blue-500',
    ring: 'ring-blue-300 hover:ring-green-400',
  },
  DONE: {
    label: 'Done',
    next: 'TODO',
    nextLabel: 'Reopen',
    bg: 'bg-green-100 hover:bg-slate-100',
    text: 'text-green-600 hover:text-slate-500',
    dot: 'bg-green-500',
    ring: 'ring-green-300 hover:ring-slate-300',
  },
}

interface Props {
  task: Task
  canDelete?: boolean
  onRefetch: () => void
  onClick: () => void
}

export function TaskCard({ task, canDelete, onRefetch, onClick }: Props) {
  const [updating, setUpdating] = useState(false)

  const isOverdue = task.dueDate && task.status !== 'DONE'
    && new Date(task.dueDate) < new Date()

  const cfg = STATUS_CONFIG[task.status]

  const handleStatusCycle = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setUpdating(true)
    try {
      await taskService.updateTask(task.id, { status: cfg.next })
      toast.success(`Marked as ${STATUS_CONFIG[cfg.next].label}`)
      onRefetch()
    } catch {
      toast.error('Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Delete this task?')) return
    try {
      await taskService.deleteTask(task.id)
      toast.success('Task deleted')
      onRefetch()
    } catch {
      toast.error('Failed to delete task')
    }
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative flex items-start gap-4 rounded-xl border bg-card p-4 cursor-pointer',
        'hover:shadow-md hover:border-primary/30 transition-all duration-200',
        task.status === 'DONE' && 'opacity-70',
        isOverdue && 'border-red-200 bg-red-50/30 dark:bg-red-950/10',
      )}
    >
      {/* ── Status Button — big, clear, clickable ── */}
      <button
        onClick={handleStatusCycle}
        disabled={updating}
        title={cfg.nextLabel}
        className={cn(
          'shrink-0 mt-0.5 flex flex-col items-center gap-1 rounded-lg px-2.5 py-2 ring-1 transition-all duration-150',
          'min-w-[72px]',
          cfg.bg, cfg.text, cfg.ring,
          updating && 'opacity-50 cursor-not-allowed',
        )}
      >
        {/* Dot indicator */}
        <span className={cn('h-2.5 w-2.5 rounded-full', cfg.dot)} />
        {/* Label */}
        <span className="text-[10px] font-semibold leading-none whitespace-nowrap">
          {cfg.label}
        </span>
        {/* Action hint */}
        <span className="text-[9px] leading-none opacity-70 whitespace-nowrap">
          {updating ? '...' : `→ ${cfg.nextLabel}`}
        </span>
      </button>

      {/* ── Content ── */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn(
            'text-sm font-medium leading-snug',
            task.status === 'DONE' && 'line-through text-muted-foreground',
          )}>
            {task.title}
          </p>
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {task.description && (
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{task.description}</p>
        )}

        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          {/* Priority */}
          <Badge variant="outline" className={cn('text-xs px-2 py-0.5', PRIORITY_MAP[task.priority].class)}>
            {PRIORITY_MAP[task.priority].label}
          </Badge>

          {/* Due date */}
          {task.dueDate && (
            <span className={cn(
              'flex items-center gap-1 text-xs',
              isOverdue ? 'text-red-500 font-medium' : 'text-muted-foreground',
            )}>
              <Clock className="h-3 w-3" />
              {new Date(task.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              {isOverdue && ' (Overdue)'}
            </span>
          )}

          {/* Comments */}
          {!!task._count?.comments && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MessageSquare className="h-3 w-3" />
              {task._count.comments}
            </span>
          )}

          {/* Assigned to (admin view mein helpful) */}
          {task.type === 'ASSIGNED' && (
            <span className="text-xs text-muted-foreground">
              👤 {task.assignedToUser.name}
              <span className="mx-1">·</span>
              by {task.createdByUser.name}
            </span>
          )}
        </div>
      </div>

      {/* ── Delete button ── */}
      {canDelete && (
        <button
          onClick={handleDelete}
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive p-1 rounded"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}