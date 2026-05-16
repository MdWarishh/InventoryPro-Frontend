import { create } from 'zustand'

import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from '@/services/notifications.service'

import type { Notification } from '@/types/notifications.types'

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean

  // Actions
  fetchNotifications: () => Promise<void>
  addNotification: (n: Notification) => void
  markRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
  remove: (id: string) => Promise<void>
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true })
    try {
      const res = await getNotifications()
      const notifications = res.notifications ?? []
      set({
        notifications,
        unreadCount: res.unreadCount ?? notifications.filter((n) => !n.isRead).length,
        isLoading: false,
      })
    } catch {
      set({ isLoading: false })
    }
  },

  // SSE / realtime push
  addNotification: (n: Notification) => {
    set((state) => ({
      notifications: [n, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }))
  },

  // Mark as read → remove from list + decrement badge
  markRead: async (id: string) => {
    const target = get().notifications.find((n) => n.id === id)
    await markAsRead(id)
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
      unreadCount:
        target && !target.isRead
          ? Math.max(0, state.unreadCount - 1)
          : state.unreadCount,
    }))
  },

  // Mark all read → clear entire list + reset badge
  markAllRead: async () => {
    await markAllAsRead()
    set({ notifications: [], unreadCount: 0 })
  },

  // Delete notification → remove from list + decrement badge if unread
  remove: async (id: string) => {
    const target = get().notifications.find((n) => n.id === id)
    await deleteNotification(id)
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
      unreadCount:
        target && !target.isRead
          ? Math.max(0, state.unreadCount - 1)
          : state.unreadCount,
    }))
  },
}))