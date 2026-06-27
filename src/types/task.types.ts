// ─── Enums ───────────────────────────────────────────────────

export type TaskStatus   = 'TODO' | 'IN_PROGRESS' | 'DONE'
export type TaskPriority = 'HIGH' | 'MEDIUM' | 'LOW'
export type TaskType     = 'ASSIGNED' | 'PERSONAL'

// ─── Core ────────────────────────────────────────────────────

export interface TaskUser {
  id: string
  name: string
  email: string
  role: string
  branchId: string | null
}

export interface TaskComment {
  id: string
  taskId: string
  userId: string
  content: string
  createdAt: string
  user: TaskUser
}

export interface TaskActivity {
  id: string
  taskId: string
  userId: string
  action: string
  createdAt: string
  user: TaskUser
}

export interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  type: TaskType
  dueDate: string | null
  createdBy: string
  assignedTo: string
  branchId: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
  createdByUser: TaskUser
  assignedToUser: TaskUser
  _count?: { comments: number }
  comments?: TaskComment[]
  activities?: TaskActivity[]
}

// ─── Responses ────────────────────────────────────────────────

export interface MyTasksResponse {
  assigned: Task[]
  personal: Task[]
}

export interface AllTasksResponse {
  tasks: Task[]
  total: number
  page: number
  limit: number
}

export interface ScoreboardEntry {
  user: TaskUser
  completed: number
  total: number
  weightedScore: number
  completionRate: number
}

export interface TaskStats {
  dailyCompletion: { date: string; count: number }[]
  statusBreakdown: { status: TaskStatus; _count: number }[]
  priorityBreakdown: { priority: TaskPriority; _count: number }[]
}

// ─── Payloads ─────────────────────────────────────────────────

export interface CreateTaskPayload {
  title: string
  description?: string | null
  priority?: TaskPriority
  dueDate?: string | null
  assignedTo?: string        // admin ke liye
}

export interface UpdateTaskPayload {
  title?: string
  description?: string | null
  priority?: TaskPriority
  dueDate?: string | null
  status?: TaskStatus
  assignedTo?: string
}

export interface GetTasksParams {
  status?: TaskStatus
  priority?: TaskPriority
  assignedTo?: string
  type?: TaskType
  page?: number
  limit?: number
}