'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Users } from 'lucide-react'
import { usersService } from '@/services/users.service'
import { branchesService } from '@/services/branches.service'
import { useAuth } from '@/hooks/useAuth'
import { useBranchFilter } from '@/hooks/useBranchFilter'
import type { User } from '@/types/users.types'
import type { Branch } from '@/types/products.types'

import { UserTable } from './_components/UserTable'
import { UserFilters } from './_components/UserFilters'
import { CreateUserModal, EditUserModal, ResetPasswordModal } from './_components/UserModals'
import { DeleteUserConfirm } from './_components/DeleteUserConfirm'

const LIMIT = 20

type ModalState =
  | { type: 'create' }
  | { type: 'edit'; user: User }
  | { type: 'reset'; user: User }
  | null

export default function UsersPage() {
  const { user: me, isBranchAdmin, isSuperAdmin } = useAuth()
  const canAdmin = isBranchAdmin || isSuperAdmin
  const qc = useQueryClient()

  // ── Global branch filter (sidebar se) ────────────────────────────────────
  const { branchId: globalBranchId } = useBranchFilter()

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [role, setRole] = useState('')
  const [branchId, setBranchId] = useState(globalBranchId ?? '')
  const [page, setPage] = useState(1)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  const [modal, setModal] = useState<ModalState>(null)
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)

  // Global branch change hone pe local branchId sync karo + page reset
  useEffect(() => {
    setBranchId(globalBranchId ?? '')
    setPage(1)
  }, [globalBranchId])

  const handleSearch = useCallback((val: string) => {
    setSearch(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => { setDebouncedSearch(val); setPage(1) }, 400)
  }, [])

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['users', page, debouncedSearch, role, branchId, globalBranchId],
    queryFn: () => usersService.getAll({
      page, limit: LIMIT,
      search: debouncedSearch || undefined,
      role: (role as any) || undefined,
      branchId: branchId || undefined,
    }),
    placeholderData: (prev) => prev,
  })

  const { data: branchRaw } = useQuery({
    queryKey: ['branches-all'],
    queryFn: () => branchesService.getAll(),
  })

  const branches: Branch[] = Array.isArray(branchRaw) ? branchRaw
    : (branchRaw as any)?.branches
    ?? (branchRaw as any)?.data ?? []

  const deleteMut = useMutation({
    mutationFn: (id: string) => usersService.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setDeleteTarget(null) },
  })

  const users = data?.users ?? []
  const pagination = data?.pagination

  return (
    <div className="min-h-screen bg-gray-50/40 dark:bg-gray-950">
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 flex items-center gap-2">
              <Users size={22} className="text-indigo-600 dark:text-indigo-400" />
              Users
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {pagination ? `${pagination.total} users total` : 'Loading...'}
              {isFetching && !isLoading && (
                <span className="ml-2 text-indigo-400 dark:text-indigo-500 text-xs animate-pulse">Refreshing...</span>
              )}
            </p>
          </div>
          {canAdmin && (
            <button
              onClick={() => setModal({ type: 'create' })}
              className="flex items-center gap-2 h-10 px-5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white text-sm font-semibold rounded-xl transition-all shadow-sm shadow-indigo-200 dark:shadow-indigo-900/40"
            >
              <Plus size={16} />
              Add User
            </button>
          )}
        </div>

        {/* Filters */}
        <UserFilters
          search={search} onSearch={handleSearch}
          role={role} onRole={(v) => { setRole(v); setPage(1) }}
          branchId={branchId} onBranch={(v) => { setBranchId(v); setPage(1) }}
          branches={branches}
          isSuperAdmin={isSuperAdmin}
        />

        {/* Table */}
        <UserTable
          users={users}
          isLoading={isLoading}
          canAdmin={canAdmin}
          isSuperAdmin={isSuperAdmin}
          currentUserId={me?.id ?? ''}
          onEdit={(u) => setModal({ type: 'edit', user: u })}
          onDelete={(u) => setDeleteTarget(u)}
          onResetPassword={(u) => setModal({ type: 'reset', user: u })}
          page={page}
          totalPages={pagination?.pages ?? 1}
          total={pagination?.total ?? 0}
          limit={LIMIT}
          onPageChange={setPage}
        />

        {/* Modals */}
        {modal?.type === 'create' && (
          <CreateUserModal branches={branches} onClose={() => setModal(null)} />
        )}
        {modal?.type === 'edit' && (
          <EditUserModal user={modal.user} branches={branches} onClose={() => setModal(null)} />
        )}
        {modal?.type === 'reset' && (
          <ResetPasswordModal user={modal.user} onClose={() => setModal(null)} />
        )}

        {/* Delete confirm */}
        {deleteTarget && (
          <DeleteUserConfirm
            userName={deleteTarget.name}
            isLoading={deleteMut.isPending}
            onConfirm={() => deleteMut.mutate(deleteTarget.id)}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </div>
    </div>
  )
}