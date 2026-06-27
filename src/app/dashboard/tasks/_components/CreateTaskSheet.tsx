'use client'

import { useState, useEffect } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import {
  Sheet, SheetContent, SheetHeader,
  SheetTitle, SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { taskService } from '@/services/task.service'
import type { TaskPriority, CreateTaskPayload } from '@/types/task.types'
import type { TaskUser } from '@/types/task.types'

interface Props {
  open: boolean
  onClose: () => void
  onSaved: () => void
  isAdmin: boolean
  branchUsers?: TaskUser[]   // admin ke liye assign dropdown
}

export function CreateTaskSheet({ open, onClose, onSaved, isAdmin, branchUsers = [] }: Props) {
  const [title,       setTitle]       = useState('')
  const [description, setDescription] = useState('')
  const [priority,    setPriority]    = useState<TaskPriority>('MEDIUM')
  const [dueDate,     setDueDate]     = useState('')
  const [assignedTo,  setAssignedTo]  = useState<string>('__self__')
  const [saving,      setSaving]      = useState(false)

  // Reset on open
  useEffect(() => {
    if (open) {
      setTitle('')
      setDescription('')
      setPriority('MEDIUM')
      setDueDate('')
      setAssignedTo('__self__')
    }
  }, [open])

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Title is required')
      return
    }
    setSaving(true)
    try {
      const payload: CreateTaskPayload = {
        title: title.trim(),
        description: description.trim() || null,
        priority,
        dueDate: dueDate || null,
        assignedTo: assignedTo === '__self__' ? undefined : assignedTo,
      }
      await taskService.createTask(payload)
      toast.success('Task created!')
      onSaved()
      onClose()
    } catch {
      toast.error('Failed to create task')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">

        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <SheetTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            New Task
          </SheetTitle>
          <SheetDescription>
            {isAdmin ? 'Create a task for yourself or assign to someone.' : 'Add a personal task to your list.'}
          </SheetDescription>
        </SheetHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Title */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="e.g. Review monthly report"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-10"
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Description
              <span className="ml-1 text-xs font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              placeholder="Add more details about this task..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none h-24"
            />
          </div>

          <Separator />

          {/* Priority + Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HIGH">🔴 High</SelectItem>
                  <SelectItem value="MEDIUM">🟡 Medium</SelectItem>
                  <SelectItem value="LOW">🟢 Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Due Date
                <span className="ml-1 text-xs font-normal text-muted-foreground">(optional)</span>
              </Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-10"
              />
            </div>
          </div>

          {/* Assign To — sirf admin ke liye */}
          {isAdmin && branchUsers.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label className="text-sm font-medium">Assign To</Label>
                <Select value={assignedTo} onValueChange={setAssignedTo}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select user..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__self__">👤 Myself (Personal)</SelectItem>
                    {branchUsers.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name}
                        <span className="ml-2 text-xs text-muted-foreground">{u.role}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  "Myself" = personal task. User select karne pe assigned task banega.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t px-6 py-4 bg-background">
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleSave} disabled={saving || !title.trim()}>
              {saving
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating...</>
                : <><Plus className="h-4 w-4 mr-2" /> Create Task</>}
            </Button>
          </div>
        </div>

      </SheetContent>
    </Sheet>
  )
}