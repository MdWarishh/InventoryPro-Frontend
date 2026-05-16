import api from '@/lib/axios'
import type { NotificationResponse, NotificationType } from '@/types/notifications.types'

// GET /api/notifications?page=&limit=&unreadOnly=&type=
export const getNotifications = async (params?: {
  page?: number
  limit?: number
  unreadOnly?: boolean
  type?: NotificationType        // ← type filter add kiya
}): Promise<NotificationResponse> => {
  const { data } = await api.get('/notifications', { params })
  return data.data
}

// PATCH /api/notifications/:id/read
export const markAsRead = async (id: string): Promise<void> => {
  await api.patch(`/notifications/${id}/read`)
}

// PATCH /api/notifications/read-all
export const markAllAsRead = async (): Promise<void> => {
  await api.patch('/notifications/read-all')
}

// DELETE /api/notifications/:id
export const deleteNotification = async (id: string): Promise<void> => {
  await api.delete(`/notifications/${id}`)
}