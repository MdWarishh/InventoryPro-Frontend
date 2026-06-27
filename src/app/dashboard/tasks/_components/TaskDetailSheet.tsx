'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Clock, MessageSquare, Activity, Loader2 } from 'lucide-react'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { taskService } from '@/services/task.service'
import type { Task } from '@/types/task.types'
import { cn } from '@/lib/utils'

interface Props {
  taskId: string | null
  open: boolean
  onClose: () => void
  onRefetch: () => void
}

const STATUS_COLOR = {
  TODO:        'bg-slate-100 text-slate-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  DONE:        'bg-green-100 text-green-700',
}

const PRIORITY_COLOR = {
  HIGH:   'bg-red-100 text-red-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  LOW:    'bg-green-100 text-green-700',
}

export function TaskDetailSheet({ taskId, open, onClose, onRefetch }: Props) {
  const [task, setTask]       = useState<Task | null>(null)
  const [loading, setLoading] = useState(false)
  const [comment, setComment] = useState('')
  const [sending, setSending] = useState(false)
  const [tab, setTab]         = useState<'comments' | 'activity'>('comments')
  const bottomRef             = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!taskId || !open) return
    setLoading(true)
    taskService.getTaskById(taskId)
      .then(setTask)
      .catch(() => toast.error('Failed to load task'))
      .finally(() => setLoading(false))
  }, [taskId, open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [task?.comments?.length])

  const handleSendComment = async () => {
    if (!comment.trim() || !taskId) return
    setSending(true)
    try {
      await taskService.addComment(taskId, comment.trim())
      setComment('')
      // Reload task to get updated comments
      const updated = await taskService.getTaskById(taskId)
      setTask(updated)
      onRefetch()
    } catch {
      toast.error('Failed to add comment')
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendComment()
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col p-0">

        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          {loading || !task ? (
            <div className="h-6 bg-muted animate-pulse rounded w-48" />
          ) : (
            <>
              <SheetTitle className="text-base leading-snug pr-6">{task.title}</SheetTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge className={cn('text-xs', STATUS_COLOR[task.status])}>
                  {task.status.replace('_', ' ')}
                </Badge>
                <Badge className={cn('text-xs', PRIORITY_COLOR[task.priority])}>
                  {task.priority}
                </Badge>
                {task.dueDate && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(task.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                )}
              </div>
              {task.description && (
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{task.description}</p>
              )}
              <div className="text-xs text-muted-foreground mt-1">
                Assigned to <span className="font-medium text-foreground">{task.assignedToUser.name}</span>
                {' · '}by <span className="font-medium text-foreground">{task.createdByUser.name}</span>
              </div>
            </>
          )}
        </SheetHeader>

        {/* Tabs */}
        <div className="flex border-b shrink-0 px-6">
          {(['comments', 'activity'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'flex items-center gap-1.5 py-3 text-sm font-medium border-b-2 mr-6 transition-colors',
                tab === t
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {t === 'comments'
                ? <MessageSquare className="h-3.5 w-3.5" />
                : <Activity className="h-3.5 w-3.5" />}
              {t === 'comments' ? 'Comments' : 'Activity'}
              {t === 'comments' && task?.comments?.length
                ? <span className="ml-1 text-xs bg-muted rounded-full px-1.5">{task.comments.length}</span>
                : null}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : tab === 'comments' ? (
            <div className="space-y-4">
              {!task?.comments?.length && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No comments yet. Be the first to comment!
                </p>
              )}
              {task?.comments?.map((c) => (
                <div key={c.id} className="flex gap-3">
                  {/* Avatar */}
                  <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                    {c.user.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-medium">{c.user.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(c.createdAt).toLocaleString('en-IN', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-sm mt-0.5 leading-relaxed">{c.content}</p>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          ) : (
            <div className="space-y-3">
              {!task?.activities?.length && (
                <p className="text-sm text-muted-foreground text-center py-8">No activity yet.</p>
              )}
              {task?.activities?.map((a) => (
                <div key={a.id} className="flex gap-3 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <div>
                    <span className="font-medium">{a.user.name}</span>
                    <span className="text-muted-foreground"> {a.action}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(a.createdAt).toLocaleString('en-IN', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comment input — fixed bottom */}
        {tab === 'comments' && (
          <div className="shrink-0 border-t px-6 py-4 bg-background">
            <div className="flex gap-2 items-end">
              <Textarea
                placeholder="Write a comment... (Enter to send)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={handleKeyDown}
                className="resize-none min-h-[40px] max-h-[120px] text-sm"
                rows={1}
              />
              <Button
                size="icon"
                onClick={handleSendComment}
                disabled={!comment.trim() || sending}
                className="h-10 w-10 shrink-0"
              >
                {sending
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        )}

      </SheetContent>
    </Sheet>
  )
}