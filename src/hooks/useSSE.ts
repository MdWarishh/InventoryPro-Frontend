import { useEffect, useRef } from 'react'
import { useAuthStore } from '@/store/auth.store'
import { useNotificationStore } from '@/store/notification.store'
import { tokenStorage } from '@/lib/axios'
import { API_BASE_URL } from '@/config/api.config'
import type { SSEEvent, Notification } from '@/types/notifications.types'

// ─── useSSE Hook ──────────────────────────────────────────────────────────────
// Connects to /api/sse with Bearer token
// Handles: notification, low_stock, meeting_reminder, bulk_upload_complete

export function useSSE() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const addNotification = useNotificationStore((s) => s.addNotification)
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reconnectAttempts = useRef(0)

  const connect = () => {
    const token = tokenStorage.getAccess()
    if (!token || !isAuthenticated) return

    // EventSource doesn't support headers — pass token as query param
    const url = `${API_BASE_URL}/sse?token=${encodeURIComponent(token)}`
    const es = new EventSource(url, { withCredentials: true })
    eventSourceRef.current = es

    es.onopen = () => {
      reconnectAttempts.current = 0
    }

    es.onmessage = (event) => {
      try {
        const parsed: SSEEvent = JSON.parse(event.data)

        switch (parsed.type) {
          case 'connected':
            // Connection confirmed
            break

          case 'notification':
          case 'low_stock':
          case 'meeting_reminder':
          case 'bulk_upload_complete':
            if (parsed.data) {
              addNotification(parsed.data as Notification)
            }
            break
        }
      } catch {
        // Ignore parse errors
      }
    }

    es.onerror = () => {
      es.close()
      eventSourceRef.current = null

      // Exponential backoff: 2s, 4s, 8s ... max 30s
      const delay = Math.min(1000 * 2 ** reconnectAttempts.current, 30000)
      reconnectAttempts.current += 1

      if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
      reconnectTimer.current = setTimeout(() => {
        if (isAuthenticated) connect()
      }, delay)
    }
  }

  const disconnect = () => {
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      connect()
    } else {
      disconnect()
    }

    return disconnect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])
}