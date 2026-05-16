'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Bell,
  Sun,
  Moon,
  LogOut,
  User,
  KeyRound,
  ChevronDown,
  Menu,
  X,
  Check,
  Trash2,
  Clock,
  Package,
  AlertTriangle,
  Upload,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useThemeStore } from '@/store/theme.store'
import { useNotificationStore } from '@/store/notification.store'
import type { Notification } from '@/types/notifications.types'

// ─── Notification Icon by type ────────────────────────────────────────────────

const notificationConfig: Record<
  string,
  { icon: React.ElementType; color: string; bg: string }
> = {
  MEETING:      { icon: Clock,          color: 'text-blue-600 dark:text-blue-400',   bg: 'bg-blue-50 dark:bg-blue-900/20'   },
  LOW_STOCK:    { icon: AlertTriangle,  color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  BULK_UPLOAD:  { icon: Upload,         color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
  SYSTEM:       { icon: Package,        color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800'   },
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

// ─── Notification Dropdown ────────────────────────────────────────────────────

function NotificationDropdown({ onClose }: { onClose: () => void }) {
  const { notifications, markRead, markAllRead, remove, unreadCount } = useNotificationStore()
  const router = useRouter()

  // Sirf mark as read karo — list se automatically hat jayegi (store handle karta hai)
  const handleClick = async (n: Notification) => {
    await markRead(n.id)
  }

  const handleMarkAllRead = async () => {
    await markAllRead()
  }

  const handleViewAll = () => {
    router.push('/dashboard/notifications')
    onClose()
  }

  return (
    <div className="absolute right-0 top-full mt-2 w-80 z-50 rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900 overflow-hidden animate-in slide-in-from-top-2 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</span>
          {unreadCount > 0 && (
            <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-600 dark:bg-red-900/30 dark:text-red-400">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 font-medium"
          >
            <Check className="h-3 w-3" />
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-slate-400">
            <Bell className="h-8 w-8 mb-2 opacity-30" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          notifications.slice(0, 10).map((n) => {
            const cfg = notificationConfig[n.type] ?? notificationConfig['SYSTEM']
            const Icon = cfg.icon
            return (
              <div
                key={n.id}
                onClick={() => handleClick(n)}
                className={cn(
                  'flex gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50',
                  !n.isRead && 'bg-indigo-50/50 dark:bg-indigo-900/10'
                )}
              >
                <div className={cn('flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg', cfg.bg)}>
                  <Icon className={cn('h-4 w-4', cfg.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-xs font-medium truncate', n.isRead ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white')}>
                    {n.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {n.message}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">{timeAgo(n.createdAt)}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {!n.isRead && (
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 flex-shrink-0 mt-1" />
                  )}
                  {/* Trash button — delete notification (stopPropagation so row click nahi chale) */}
                  <button
                    onClick={(e) => { e.stopPropagation(); remove(n.id) }}
                    className="text-slate-300 hover:text-red-500 dark:text-slate-700 dark:hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Footer — View all button */}
      <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-2.5">
        <button
          onClick={handleViewAll}
          className="text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 font-medium w-full text-center"
        >
          View all notifications →
        </button>
      </div>
    </div>
  )
}

// ─── Header ───────────────────────────────────────────────────────────────────

interface HeaderProps {
  onMobileMenuToggle: () => void
  mobileMenuOpen: boolean
}

export function Header({ onMobileMenuToggle, mobileMenuOpen }: HeaderProps) {
  const router = useRouter()
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useThemeStore()
  const { unreadCount, fetchNotifications } = useNotificationStore()

  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const userRef = useRef<HTMLDivElement>(null)

  useEffect(() => { fetchNotifications() }, [fetchNotifications])

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false)
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    await logout()
    router.push('/auth/login')
  }

  return (
    <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-[#0f0f14] lg:px-6">
      {/* Left — mobile menu toggle */}
      <button
        onClick={onMobileMenuToggle}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
      >
        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Right — actions */}
      <div className="ml-auto flex items-center gap-1">
        {/* Theme Toggle */}
        {/* <button
          onClick={toggleTheme}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          aria-label="Toggle theme"
        >
          {theme === 'dark'
            ? <Sun className="h-4 w-4" />
            : <Moon className="h-4 w-4" />
          }
        </button> */}

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setShowNotifications((v) => !v); setShowUserMenu(false) }}
            className="relative flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
          {showNotifications && (
            <NotificationDropdown onClose={() => setShowNotifications(false)} />
          )}
        </div>

        {/* Divider */}
        <div className="mx-1 h-5 w-px bg-slate-200 dark:bg-slate-700" />

        {/* User Menu */}
        <div ref={userRef} className="relative">
          <button
            onClick={() => { setShowUserMenu((v) => !v); setShowNotifications(false) }}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex-shrink-0">
              <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-400">
                {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
              </span>
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                {user?.name}
              </p>
              <p className="text-[10px] text-slate-400 leading-tight">
                {user?.branch?.name ?? 'All Branches'}
              </p>
            </div>
            <ChevronDown className={cn('h-3.5 w-3.5 text-slate-400 transition-transform', showUserMenu && 'rotate-180')} />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-52 z-50 rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900 overflow-hidden animate-in slide-in-from-top-2 duration-200">
              {/* User info */}
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-900 dark:text-white">{user?.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
                <span className="mt-1.5 inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                  {user?.role?.replace('_', ' ')}
                </span>
              </div>

              {/* Menu items */}
              <div className="py-1">
                <button
                  onClick={() => { router.push('/dashboard/account'); setShowUserMenu(false) }}
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <User className="h-4 w-4 text-slate-400" />
                  Profile
                </button>
                <button
                  onClick={() => { router.push('/dashboard/change-password'); setShowUserMenu(false) }}
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <KeyRound className="h-4 w-4 text-slate-400" />
                  Change Password
                </button>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 py-1">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/10"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}