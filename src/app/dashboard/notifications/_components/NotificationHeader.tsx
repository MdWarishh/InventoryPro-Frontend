'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, CheckCheck, Loader2, AlertTriangle, ArrowDownCircle, ArrowUpCircle, ArrowLeftRight } from 'lucide-react'
import { markAllAsRead } from '@/services/notifications.service'
import type { NotificationType } from '@/types/notifications.types'

type FilterType = NotificationType | 'ALL'

interface Props {
  unreadCount: number
  total: number
  unreadOnly: boolean
  activeType: FilterType
  onToggleUnreadOnly: (val: boolean) => void
  onTypeChange: (type: FilterType) => void
}

const TYPE_TABS: { key: FilterType; label: string; icon?: React.ElementType }[] = [
  { key: 'ALL',       label: 'All' },
  { key: 'LOW_STOCK', label: 'Low Stock',  icon: AlertTriangle },
  { key: 'STOCK_IN',  label: 'Stock In',   icon: ArrowDownCircle },
  { key: 'STOCK_OUT', label: 'Stock Out',  icon: ArrowUpCircle },
  { key: 'TRANSFER',  label: 'Transfer',   icon: ArrowLeftRight },
  { key: 'GENERAL',   label: 'General',    icon: Bell },
]

export default function NotificationHeader({
  unreadCount, total, unreadOnly, activeType,
  onToggleUnreadOnly, onTypeChange,
}: Props) {
  const qc = useQueryClient()

  const markAllMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })

  return (
    <div className="mb-5 space-y-4">
      {/* Top row: title + actions */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
            <Bell size={18} className="text-blue-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
              {unreadCount > 0 && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-500 text-white">
                  {unreadCount}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{total} total notifications</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Unread filter toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            <button
              onClick={() => onToggleUnreadOnly(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                !unreadOnly ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => onToggleUnreadOnly(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                unreadOnly ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Unread
              {unreadCount > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  unreadOnly ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Mark all read */}
          {unreadCount > 0 && (
            <button
              onClick={() => markAllMutation.mutate()}
              disabled={markAllMutation.isPending}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-600 hover:text-blue-600 text-xs font-medium rounded-xl transition-all shadow-sm disabled:opacity-60"
            >
              {markAllMutation.isPending
                ? <Loader2 size={13} className="animate-spin" />
                : <CheckCheck size={13} />
              }
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Type filter tabs */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {TYPE_TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onTypeChange(key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
              activeType === key
                ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            {Icon && <Icon size={12} />}
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}