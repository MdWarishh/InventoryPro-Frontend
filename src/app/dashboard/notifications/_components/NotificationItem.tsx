'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Trash2, AlertTriangle, ArrowDownCircle, ArrowUpCircle,
  Bell, ArrowLeftRight, Check, Loader2
} from 'lucide-react'
import { markAsRead, deleteNotification } from '@/services/notifications.service'
import type { Notification } from '@/types/notifications.types'

interface Props {
  notification: Notification
}

function getTypeConfig(type: string) {
  switch (type) {
    case 'LOW_STOCK':
      return {
        icon: AlertTriangle,
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-600',
        badge: 'bg-amber-100 text-amber-700 border border-amber-200',
        dot: 'bg-amber-500',
        label: 'Low Stock',
      }
    case 'STOCK_IN':
      return {
        icon: ArrowDownCircle,
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        iconBg: 'bg-emerald-100',
        iconColor: 'text-emerald-600',
        badge: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
        dot: 'bg-emerald-500',
        label: 'Stock In',
      }
    case 'STOCK_OUT':
      return {
        icon: ArrowUpCircle,
        bg: 'bg-red-50',
        border: 'border-red-200',
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
        badge: 'bg-red-100 text-red-700 border border-red-200',
        dot: 'bg-red-500',
        label: 'Stock Out',
      }
    case 'TRANSFER':
      return {
        icon: ArrowLeftRight,
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        badge: 'bg-blue-100 text-blue-700 border border-blue-200',
        dot: 'bg-blue-500',
        label: 'Transfer',
      }
    default:
      return {
        icon: Bell,
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        iconBg: 'bg-gray-100',
        iconColor: 'text-gray-500',
        badge: 'bg-gray-100 text-gray-600 border border-gray-200',
        dot: 'bg-gray-400',
        label: 'General',
      }
  }
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'abhi abhi'
  if (mins < 60) return `${mins}m pehle`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h pehle`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d pehle`
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export default function NotificationItem({ notification }: Props) {
  const qc = useQueryClient()
  const config = getTypeConfig(notification.type)
  const Icon = config.icon

  const readMutation = useMutation({
    mutationFn: () => markAsRead(notification.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteNotification(notification.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })

  return (
    <div
      className={`group relative flex gap-3 px-5 py-4 border-b border-gray-100 last:border-0 transition-all cursor-pointer
        ${notification.isRead ? 'bg-white' : 'bg-blue-50/30'}
        hover:bg-gray-50/80`}
    >
      {/* Unread dot */}
      {!notification.isRead && (
        <div className={`absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full ${config.dot}`} />
      )}

      {/* Icon */}
      <div className={`w-9 h-9 rounded-xl ${config.iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
        <Icon size={16} className={config.iconColor} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`text-sm font-semibold ${notification.isRead ? 'text-gray-600' : 'text-gray-900'}`}>
              {notification.title}
            </p>
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${config.badge}`}>
              {config.label}
            </span>
          </div>
          <span className="text-xs text-gray-400 shrink-0 mt-0.5 whitespace-nowrap">
            {timeAgo(notification.createdAt)}
          </span>
        </div>

        <p className={`text-sm mt-1 leading-relaxed ${notification.isRead ? 'text-gray-400' : 'text-gray-600'}`}>
          {notification.message}
        </p>

        {/* Actions row — sirf unread pe mark as read dikhega */}
        {!notification.isRead && (
          <button
            onClick={(e) => { e.stopPropagation(); readMutation.mutate() }}
            disabled={readMutation.isPending}
            className="mt-2 flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors disabled:opacity-50"
          >
            {readMutation.isPending
              ? <Loader2 size={11} className="animate-spin" />
              : <Check size={11} />
            }
            Mark as read
          </button>
        )}
      </div>

      {/* Delete button — hover pe dikhega */}
      <button
        onClick={(e) => { e.stopPropagation(); deleteMutation.mutate() }}
        disabled={deleteMutation.isPending}
        className="shrink-0 opacity-0 group-hover:opacity-100 mt-0.5 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
      >
        {deleteMutation.isPending
          ? <Loader2 size={14} className="animate-spin text-red-400" />
          : <Trash2 size={14} />
        }
      </button>
    </div>
  )
}