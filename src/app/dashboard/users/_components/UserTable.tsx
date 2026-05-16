'use client'

import { Pencil, Trash2, KeyRound, ChevronLeft, ChevronRight, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { User, UserRole } from '@/types/users.types'
import { ROLE_LABELS } from './UserModals'

// ─── Role Badge ───────────────────────────────────────────────────────────────
const ROLE_STYLES: Record<UserRole, string> = {
  SUPER_ADMIN: 'bg-purple-100 text-purple-700',
  BRANCH_ADMIN: 'bg-indigo-100 text-indigo-700',
  STAFF: 'bg-gray-100 text-gray-600',
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
    SUPER_ADMIN: 'bg-purple-100 text-purple-700',
    BRANCH_ADMIN: 'bg-indigo-100 text-indigo-700',
    STAFF: 'bg-gray-100 text-gray-600',
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
      active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
    )}>
      <span className={cn('w-1.5 h-1.5 rounded-full', active ? 'bg-green-500' : 'bg-red-500')} />
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}

// ─── Table Header ─────────────────────────────────────────────────────────────
function TableHeader() {
  return (
    <div className="grid grid-cols-[2fr_2fr_1.2fr_1fr_1fr_100px] gap-4 px-6 py-3 border-b border-gray-200 bg-gray-50/80">
      {['USER', 'EMAIL', 'ROLE', 'BRANCH', 'STATUS', ''].map((col) => (
        <span key={col} className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{col}</span>
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
    <div className={cn(
      'grid grid-cols-[2fr_2fr_1.2fr_1fr_1fr_100px] gap-4 px-6 py-3.5 items-center',
      'hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0',
      !user.isActive && 'opacity-60'
    )}>
      {/* Name + Avatar */}
      <div className="flex items-center gap-3 min-w-0">
        <Avatar name={user.name} role={user.role} />
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">
            {user.name}
            {isSelf && <span className="ml-1.5 text-[10px] text-indigo-500 font-semibold bg-indigo-50 px-1.5 py-0.5 rounded">You</span>}
          </p>
        </div>
      </div>

      {/* Email */}
      <span className="text-sm text-gray-500 truncate">{user.email}</span>

      {/* Role */}
      <RoleBadge role={user.role} />

      {/* Branch */}
      <span className="text-sm text-gray-600 truncate">
        {user.branch?.name ?? <span className="text-gray-300">—</span>}
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
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              <Pencil size={13} />
            </button>
            <button
              type="button"
              onClick={() => onResetPassword(user)}
              title="Reset password"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
            >
              <KeyRound size={13} />
            </button>
            {isSuperAdmin && !isSelf && (
              <button
                type="button"
                onClick={() => onDelete(user)}
                title="Deactivate user"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={13} />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="grid grid-cols-[2fr_2fr_1.2fr_1fr_1fr_100px] gap-4 px-6 py-4 items-center border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded-full animate-pulse shrink-0" />
            <div className="w-28 h-3.5 bg-gray-100 rounded animate-pulse" />
          </div>
          {[0,1,2,3].map((j) => <div key={j} className="w-20 h-3 bg-gray-100 rounded animate-pulse" />)}
          <div />
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
    <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50/50">
      <p className="text-xs text-gray-500">
        Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} users
      </p>
      <div className="flex items-center gap-1">
        <button onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1}
          className="w-7 h-7 rounded-lg flex items-center justify-center border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">
          <ChevronLeft size={13} />
        </button>
        {pages.map((p, i) =>
          p === '...' ? <span key={`e${i}`} className="text-gray-300 text-xs px-1">…</span> : (
            <button key={p} onClick={() => onPageChange(p as number)}
              className={cn('w-7 h-7 rounded-lg text-xs font-medium transition-all',
                page === p ? 'bg-indigo-600 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-100')}>
              {p}
            </button>
          )
        )}
        <button onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page === totalPages}
          className="w-7 h-7 rounded-lg flex items-center justify-center border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">
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
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <TableHeader />
      {isLoading ? <SkeletonRows /> : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
            <Users size={24} className="text-gray-300" />
          </div>
          <p className="text-sm text-gray-400 font-medium">No users found</p>
        </div>
      ) : (
        <>
          {users.map((user) => (
            <UserRow key={user.id} user={user} canAdmin={canAdmin} isSuperAdmin={isSuperAdmin}
              currentUserId={currentUserId} onEdit={onEdit} onDelete={onDelete} onResetPassword={onResetPassword} />
          ))}
          <Pagination page={page} totalPages={totalPages} total={total} limit={limit} onPageChange={onPageChange} />
        </>
      )}
    </div>
  )
}