'use client'

import { Search, X, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types/users.types'
import type { Branch } from '@/types/products.types'

interface UserFiltersProps {
  search: string
  onSearch: (v: string) => void
  role: string
  onRole: (v: string) => void
  branchId: string
  onBranch: (v: string) => void
  branches: Branch[]
  isSuperAdmin: boolean
}

export function UserFilters({
  search, onSearch, role, onRole, branchId, onBranch, branches, isSuperAdmin,
}: UserFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full h-9 pl-9 pr-8 border border-gray-200 rounded-lg text-sm text-gray-700
                     placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30
                     focus:border-indigo-400 transition-all bg-gray-50"
        />
        {search && (
          <button onClick={() => onSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X size={13} />
          </button>
        )}
      </div>

      {/* Role filter */}
      <div className="relative">
        <select
          value={role}
          onChange={(e) => onRole(e.target.value)}
          className="h-9 pl-3 pr-8 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 appearance-none cursor-pointer"
        >
          <option value="">All Roles</option>
          <option value="SUPER_ADMIN">Super Admin</option>
          <option value="BRANCH_ADMIN">Branch Admin</option>
          <option value="STAFF">Staff</option>
        </select>
        <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>

      {/* Branch filter — only super admin */}
      {isSuperAdmin && (
        <div className="relative">
          <select
            value={branchId}
            onChange={(e) => onBranch(e.target.value)}
            className="h-9 pl-3 pr-8 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 appearance-none cursor-pointer"
          >
            <option value="">All Branches</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      )}
    </div>
  )
}