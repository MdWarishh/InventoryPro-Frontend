'use client'

import { Pencil, Trash2, KeyRound, ChevronLeft, ChevronRight, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { User, UserRole } from '@/types/users.types'
import { ROLE_LABELS } from './UserModals'

// ─── Role Badge ───────────────────────────────────────────────────────────────
const ROLE_STYLES: Record<UserRole, string> = {
  SUPER_ADMIN:  'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400',
  BRANCH_ADMIN: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400',
  STAFF:        'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
}

function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span className={cn('inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold', ROLE_STYLES[role])}>
      {ROLE_LABELS[role]}
    </span>
  )
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ name, role }: { name: string; role: UserRole }) {
  const initial = name.charAt(0).toUpperCase()
  const bg: Record<UserRole, string> = {
    SUPER_ADMIN:  'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400',
    BRANCH_ADMIN: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400',
    STAFF:        'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
  }
  return (
    <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0', bg[role])}>
      {initial}
    </div>
  )
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium',
      active
        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
        : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
    )}>
      <span className={cn(
        'w-1.5 h-1.5 rounded-full',
        active ? 'bg-green-500 dark:bg-green-400' : 'bg-red-500 dark:bg-red-400'
      )} />
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}

// ─── Table Header ─────────────────────────────────────────────────────────────
function TableHeader() {
  return (
    <div className="hidden md:grid md:grid-cols-[2fr_2fr_1.2fr_1fr_1fr_100px] gap-4 px-6 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/40">
      {['USER', 'EMAIL', 'ROLE', 'BRANCH', 'STATUS', ''].map((col) => (
        <span key={col} className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{col}</span>
      ))}
    </div>
  )
}

// ─── User Row ─────────────────────────────────────────────────────────────────
interface RowProps {
  user: User
  canAdmin: boolean
  isSuperAdmin: boolean
  onEdit: (u: User) => void
  onDelete: (u: User) => void
  onResetPassword: (u: User) => void
  currentUserId: string
}

function UserRow({ user, canAdmin, isSuperAdmin, onEdit, onDelete, onResetPassword, currentUserId }: RowProps) {
  const isSelf = user.id === currentUserId

  return (
    <>
      {/* Desktop Row */}
      <div className={cn(
        'hidden md:grid md:grid-cols-[2fr_2fr_1.2fr_1fr_1fr_100px] gap-4 px-6 py-3.5 items-center',
        'hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0',
        !user.isActive && 'opacity-60'
      )}>
        {/* Name + Avatar */}
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={user.name} role={user.role} />
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
              {user.name}
              {isSelf && (
                <span className="ml-1.5 text-[10px] text-indigo-500 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-900/40 px-1.5 py-0.5 rounded">
                  You
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Email */}
        <span className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</span>

        {/* Role */}
        <RoleBadge role={user.role} />

        {/* Branch */}
        <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
          {user.branch?.name ?? <span className="text-gray-300 dark:text-gray-600">—</span>}
        </span>

        {/* Status */}
        <StatusBadge active={user.isActive} />

        {/* Actions */}
        <div className="flex items-center gap-0.5">
          {canAdmin && (
            <>
              <button
                type="button"
                onClick={() => onEdit(user)}
                title="Edit user"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
              >
                <Pencil size={13} />
              </button>
              <button
                type="button"
                onClick={() => onResetPassword(user)}
                title="Reset password"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-colors"
              >
                <KeyRound size={13} />
              </button>
              {isSuperAdmin && !isSelf && (
                <button
                  type="button"
                  onClick={() => onDelete(user)}
                  title="Deactivate user"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Card */}
      <div className={cn(
        'md:hidden px-4 py-4 border-b border-gray-100 dark:border-gray-800 last:border-0',
        'hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors',
        !user.isActive && 'opacity-60'
      )}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Avatar name={user.name} role={user.role} />
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                {user.name}
                {isSelf && (
                  <span className="ml-1.5 text-[10px] text-indigo-500 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-900/40 px-1.5 py-0.5 rounded">
                    You
                  </span>
                )}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{user.email}</p>
            </div>
          </div>
          <StatusBadge active={user.isActive} />
        </div>
        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <RoleBadge role={user.role} />
            {user.branch?.name && (
              <span className="text-xs text-gray-500 dark:text-gray-400">{user.branch.name}</span>
            )}
          </div>
          {canAdmin && (
            <div className="flex items-center gap-0.5">
              <button type="button" onClick={() => onEdit(user)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors">
                <Pencil size={13} />
              </button>
              <button type="button" onClick={() => onResetPassword(user)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-colors">
                <KeyRound size={13} />
              </button>
              {isSuperAdmin && !isSelf && (
                <button type="button" onClick={() => onDelete(user)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="hidden md:grid md:grid-cols-[2fr_2fr_1.2fr_1fr_1fr_100px] gap-4 px-6 py-4 items-center border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse shrink-0" />
            <div className="w-28 h-3.5 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
          </div>
          {[0,1,2,3].map((j) => <div key={j} className="w-20 h-3 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />)}
          <div />
        </div>
      ))}
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={`m${i}`} className="md:hidden px-4 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="w-32 h-3.5 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
              <div className="w-44 h-2.5 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

// ─── Pagination ───────────────────────────────────────────────────────────────
interface PaginationProps {
  page: number; totalPages: number; total: number; limit: number
  onPageChange: (p: number) => void
}

function Pagination({ page, totalPages, total, limit, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
    .reduce<(number | '...')[]>((acc, p, idx, arr) => {
      if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push('...')
      acc.push(p)
      return acc
    }, [])

  return (
    <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} users
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="w-7 h-7 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft size={13} />
        </button>
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`e${i}`} className="text-gray-300 dark:text-gray-600 text-xs px-1">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={cn(
                'w-7 h-7 rounded-lg text-xs font-medium transition-all',
                page === p
                  ? 'bg-indigo-600 dark:bg-indigo-500 text-white'
                  : 'border border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              )}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="w-7 h-7 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  )
}

// ─── Main Export ──────────────────────────────────────────────────────────────
interface UserTableProps {
  users: User[]
  isLoading: boolean
  canAdmin: boolean
  isSuperAdmin: boolean
  currentUserId: string
  onEdit: (u: User) => void
  onDelete: (u: User) => void
  onResetPassword: (u: User) => void
  page: number; totalPages: number; total: number; limit: number
  onPageChange: (p: number) => void
}

export function UserTable({
  users, isLoading, canAdmin, isSuperAdmin, currentUserId,
  onEdit, onDelete, onResetPassword,
  page, totalPages, total, limit, onPageChange,
}: UserTableProps) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
      <TableHeader />
      {isLoading ? <SkeletonRows /> : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
            <Users size={24} className="text-gray-300 dark:text-gray-600" />
          </div>
          <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">No users found</p>
        </div>
      ) : (
        <>
          {users.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              canAdmin={canAdmin}
              isSuperAdmin={isSuperAdmin}
              currentUserId={currentUserId}
              onEdit={onEdit}
              onDelete={onDelete}
              onResetPassword={onResetPassword}
            />
          ))}
          <Pagination page={page} totalPages={totalPages} total={total} limit={limit} onPageChange={onPageChange} />
        </>
      )}
    </div>
  )
}