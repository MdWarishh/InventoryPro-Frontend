import apiClient from '@/lib/axios'
import type { ApiSuccess } from '@/types/auth.types'
import type {
  Task, MyTasksResponse, AllTasksResponse,
  ScoreboardEntry, TaskStats, TaskComment,
  CreateTaskPayload, UpdateTaskPayload, GetTasksParams,
} from '@/types/task.types'

export const taskService = {

  // ── User ─────────────────────────────────────────────────────

  getMyTasks: async (params?: GetTasksParams): Promise<MyTasksResponse> => {
    const { data } = await apiClient.get<ApiSuccess<MyTasksResponse>>('/tasks/my', { params })
    return data.data
  },

  createTask: async (payload: CreateTaskPayload): Promise<Task> => {
    const { data } = await apiClient.post<ApiSuccess<Task>>('/tasks', payload)
    return data.data
  },

  getTaskById: async (id: string): Promise<Task> => {
    const { data } = await apiClient.get<ApiSuccess<Task>>(`/tasks/${id}`)
    return data.data
  },

  updateTask: async (id: string, payload: UpdateTaskPayload): Promise<Task> => {
    const { data } = await apiClient.patch<ApiSuccess<Task>>(`/tasks/${id}`, payload)
    return data.data
  },

  deleteTask: async (id: string): Promise<void> => {
    await apiClient.delete(`/tasks/${id}`)
  },

  addComment: async (taskId: string, content: string): Promise<TaskComment> => {
    const { data } = await apiClient.post<ApiSuccess<TaskComment>>(
      `/tasks/${taskId}/comments`,
      { content },
    )
    return data.data
  },

  // ── Admin ─────────────────────────────────────────────────────

  getAllTasks: async (params?: GetTasksParams): Promise<AllTasksResponse> => {
    const { data } = await apiClient.get<ApiSuccess<AllTasksResponse>>('/tasks', { params })
    return data.data
  },

  getScoreboard: async (branchId?: string): Promise<ScoreboardEntry[]> => {
    const { data } = await apiClient.get<ApiSuccess<ScoreboardEntry[]>>('/tasks/meta/scores', {
      params: branchId ? { branchId } : undefined,
    })
    return data.data
  },

  getTaskStats: async (userId?: string): Promise<TaskStats> => {
    const { data } = await apiClient.get<ApiSuccess<TaskStats>>('/tasks/meta/stats', {
      params: userId ? { userId } : undefined,
    })
    return data.data
  },
}