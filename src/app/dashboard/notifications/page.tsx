'use client'

import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Bell, Loader2 } from 'lucide-react'
import { getNotifications } from '@/services/notifications.service'
import NotificationItem from './_components/NotificationItem'
import NotificationHeader from './_components/NotificationHeader'
import { useAuthStore } from '@/store/auth.store'
import { tokenStorage } from '@/lib/axios'
import type { NotificationType } from '@/types/notifications.types'

type FilterType = NotificationType | 'ALL'

const LIMIT = 20

export default function NotificationsPage() {
  const qc = useQueryClient()
  const user = useAuthStore(s => s.user)

  const [unreadOnly, setUnreadOnly] = useState(false)
  const [activeType, setActiveType] = useState<FilterType>('ALL')
  const [page, setPage] = useState(1)

  // ── Fetch notifications (type filter bhi pass karo)
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['notifications', page, unreadOnly, activeType],
    queryFn: () => getNotifications({
      page,
      limit: LIMIT,
      unreadOnly,
      type: activeType === 'ALL' ? undefined : activeType,
    }),
    placeholderData: (prev) => prev,
  })

  const notifications = data?.notifications ?? []
  const pagination = data?.pagination
  const unreadCount = data?.unreadCount ?? 0

  // ── SSE — real-time notification listener
  useEffect(() => {
    if (!user) return
    const token = tokenStorage.getAccess()
    if (!token) return

    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
    const url = `${apiBase}/sse?token=${token}`
    const es = new EventSource(url)

    es.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data)
        if (payload.type === 'notification') {
          qc.invalidateQueries({ queryKey: ['notifications'] })
        }
      } catch {}
    }

    es.onerror = () => es.close()
    return () => es.close()
  }, [user, qc])

  const handleToggleUnread = (val: boolean) => {
    setUnreadOnly(val)
    setPage(1)
  }

  const handleTypeChange = (type: FilterType) => {
    setActiveType(type)
    setPage(1)
  }

  return (
    <div className="max-w-2xl mx-auto">

      {/* Header with filters */}
      <NotificationHeader
        unreadCount={unreadCount}
        total={pagination?.total ?? 0}
        unreadOnly={unreadOnly}
        activeType={activeType}
        onToggleUnreadOnly={handleToggleUnread}
        onTypeChange={handleTypeChange}
      />

      {/* Notification list */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 size={24} className="animate-spin text-gray-400 dark:text-gray-500" />
            <p className="text-sm text-gray-400 dark:text-gray-500">Loading notifications...</p>
          </div>

        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Bell size={24} className="text-gray-300 dark:text-gray-600" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {unreadOnly
                  ? 'Koi unread notification nahi hai'
                  : activeType !== 'ALL'
                    ? `Koi ${activeType.replace('_', ' ').toLowerCase()} notification nahi hai`
                    : 'Koi notification nahi hai'
                }
              </p>
              {(unreadOnly || activeType !== 'ALL') && (
                <button
                  onClick={() => { handleToggleUnread(false); handleTypeChange('ALL') }}
                  className="text-xs text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 mt-1 transition-colors"
                >
                  Saari notifications dekho →
                </button>
              )}
            </div>
          </div>

        ) : (
          <>
            {/* Subtle loading overlay jab refetch ho */}
            {isFetching && !isLoading && (
              <div className="flex items-center gap-2 px-5 py-2.5 bg-blue-50/60 dark:bg-blue-950/40 border-b border-blue-100 dark:border-blue-900">
                <Loader2 size={12} className="animate-spin text-blue-400 dark:text-blue-500" />
                <p className="text-xs text-blue-500 dark:text-blue-400">Refreshing...</p>
              </div>
            )}

            {notifications.map(n => (
              <NotificationItem key={n.id} notification={n} />
            ))}
          </>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between mt-5">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Page {page} of {pagination.pages} · {pagination.total} total
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300 rounded-xl disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all bg-white dark:bg-gray-900 shadow-sm"
            >
              ← Prev
            </button>
            <button
              onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
              disabled={page >= pagination.pages}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300 rounded-xl disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all bg-white dark:bg-gray-900 shadow-sm"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}