'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Package, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useNotificationStore } from '@/store/notification.store'
import { navItems } from '@/config/nav.config'
import type { NavItem } from '@/config/nav.config'
import { BranchSelector } from '@/components/shared/BranchSelector'
import { useBranchStore } from '@/store/branch.store'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const { user, hasPermission } = useAuth()
  const unreadCount = useNotificationStore((s) => s.unreadCount)

  const {
    branches,
    selectedBranchId,
    setSelectedBranch,
    setUserBranch,
    fetchBranches,
  } = useBranchStore()

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({})

  // SUPER_ADMIN login hone pe branches fetch karo
  // aur user ka apna branch userBranchId mein set karo
  useEffect(() => {
    if (user?.role === 'SUPER_ADMIN') {
      fetchBranches()
    }
    // user.branchId → jis branch se login kiya
    if (user?.branchId) {
      setUserBranch(user.branchId)
    }
  }, [user?.role, user?.branchId])

  useEffect(() => {
    if (pathname.startsWith('/dashboard/settings')) {
      setOpenMenus((prev) => ({ ...prev, '/dashboard/settings': true }))
    }
  }, [pathname])

  const toggleMenu = (href: string) => {
    setOpenMenus((prev) => ({ ...prev, [href]: !prev[href] }))
  }

  const visibleItems = navItems.filter((item) => {
    if (item.module) {
      return hasPermission(item.module, 'canView')
    }
    return true
  })

  const getBadgeCount = (badge?: string) => {
    if (badge === 'notifications') return unreadCount
    return 0
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname === href
  }

  const isParentActive = (item: NavItem) => {
    if (item.children) {
      return item.children.some((c) => pathname.startsWith(c.href))
    }
    return isActive(item.href)
  }

  return (
    <aside
      className={cn(
        'relative flex flex-col h-full border-r border-slate-200 dark:border-slate-800',
        'bg-white dark:bg-[#0f0f14]',
        'transition-all duration-300 ease-in-out',
        collapsed ? 'w-[68px]' : 'w-[240px]'
      )}
    >
      {/* ── Logo ── */}
      <div
        className={cn(
          'flex items-center h-16 px-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0',
          collapsed ? 'justify-center' : 'gap-3'
        )}
      >
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-600">
          <Package className="h-4 w-4 text-white" strokeWidth={2} />
        </div>
        {!collapsed && (
          <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
            InvenTrack Pro
          </span>
        )}
      </div>

      {/* ── Branch Selector (SUPER_ADMIN only) ── */}
      {user?.role === 'SUPER_ADMIN' && (
        <div className={cn('flex-shrink-0 pt-3', collapsed && 'px-2')}>
          <BranchSelector
            branches={branches}
            selectedBranchId={selectedBranchId}
            onChange={setSelectedBranch}
            collapsed={collapsed}
          />
          {!collapsed && (
            <div className="mx-4 border-b border-slate-100 dark:border-slate-800" />
          )}
        </div>
      )}

      {/* ── Nav Items ── */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 scrollbar-thin">
        {visibleItems.map((item) => {
          const Icon = item.icon
          const badge = getBadgeCount(item.badge)
          const hasChildren = !!item.children?.length
          const parentActive = isParentActive(item)
          const isOpen = openMenus[item.href] ?? false

          // ── Item WITH submenu ──────────────────
          if (hasChildren) {
            return (
              <div key={item.href} className="mb-0.5">
                <button
                  type="button"
                  onClick={() => {
                    if (collapsed) return
                    toggleMenu(item.href)
                  }}
                  className={cn(
                    'group relative w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
                    parentActive
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200',
                    collapsed && 'justify-center px-0'
                  )}
                >
                  {parentActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-r-full bg-indigo-600 dark:bg-indigo-400" />
                  )}

                  <Icon
                    className={cn(
                      'h-4 w-4 flex-shrink-0 transition-colors',
                      parentActive
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-500 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                    )}
                  />

                  {!collapsed && (
                    <>
                      <span className="flex-1 truncate text-left">{item.label}</span>
                      <ChevronDown
                        className={cn(
                          'h-3.5 w-3.5 flex-shrink-0 transition-transform duration-200 text-slate-400',
                          isOpen && 'rotate-180'
                        )}
                      />
                    </>
                  )}

                  {collapsed && (
                    <div className="pointer-events-none absolute left-full ml-3 z-50 hidden group-hover:flex items-center">
                      <div className="rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg whitespace-nowrap dark:bg-slate-700">
                        {item.label}
                      </div>
                    </div>
                  )}
                </button>

                {!collapsed && isOpen && (
                  <div className="mt-0.5 ml-3 pl-3 border-l-2 border-slate-100 dark:border-slate-800 space-y-0.5 pb-1">
                    {item.children!
                      .filter((c) => !c.roles || (user?.role && c.roles.includes(user.role as any)))
                      .map((child) => {
                        const ChildIcon = child.icon
                        const childActive = pathname === child.href

                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-all duration-150',
                              childActive
                                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400'
                                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-500 dark:hover:bg-slate-800/60 dark:hover:text-slate-300'
                            )}
                          >
                            <ChildIcon
                              className={cn(
                                'h-3.5 w-3.5 flex-shrink-0',
                                childActive
                                  ? 'text-indigo-600 dark:text-indigo-400'
                                  : 'text-slate-400 dark:text-slate-600'
                              )}
                            />
                            <span className="truncate">{child.label}</span>
                            {childActive && (
                              <span className="ml-auto w-1 h-1 rounded-full bg-indigo-500" />
                            )}
                          </Link>
                        )
                      })}
                  </div>
                )}
              </div>
            )
          }

          // ── Regular nav item ────────────────────────────────────
          const active = isActive(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 mb-0.5',
                active
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200',
                collapsed && 'justify-center px-0'
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-r-full bg-indigo-600 dark:bg-indigo-400" />
              )}

              <Icon
                className={cn(
                  'h-4 w-4 flex-shrink-0 transition-colors',
                  active
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-500 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                )}
              />

              {!collapsed && (
                <span className="flex-1 truncate">{item.label}</span>
              )}

              {badge > 0 && (
                <span
                  className={cn(
                    'flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white bg-red-500',
                    collapsed && 'absolute -top-0.5 -right-0.5 h-3.5 min-w-3.5 text-[9px]'
                  )}
                >
                  {badge > 99 ? '99+' : badge}
                </span>
              )}

              {collapsed && (
                <div className="pointer-events-none absolute left-full ml-3 z-50 hidden group-hover:flex items-center">
                  <div className="rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg whitespace-nowrap dark:bg-slate-700">
                    {item.label}
                    {badge > 0 && (
                      <span className="ml-1.5 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px]">
                        {badge}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* ── User Info ── */}
      {!collapsed && user && (
        <div className="flex-shrink-0 border-t border-slate-200 dark:border-slate-800 p-3">
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/40">
              <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-400">
                {user.name?.charAt(0)?.toUpperCase() ?? 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                {user.name}
              </p>
              <p className="truncate text-[10px] text-slate-400 dark:text-slate-500">
                {user.role.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Collapse Toggle ── */}
      <button
        onClick={onToggle}
        className={cn(
          'absolute -right-3 top-20 z-10',
          'flex h-6 w-6 items-center justify-center rounded-full',
          'border border-slate-200 bg-white text-slate-500 shadow-sm',
          'hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md',
          'dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400',
          'dark:hover:border-indigo-600 dark:hover:text-indigo-400',
          'transition-all duration-150'
        )}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? (
          <ChevronRight className="h-3.5 w-3.5" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5" />
        )}
      </button>
    </aside>
  )
}