'use client'

import { X, Loader2, Shield } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { usersService } from '@/services/users.service'
import type { User, UserRole, Permission } from '@/types/users.types'
import { DEFAULT_PERMISSIONS } from '@/types/users.types'
import type { Branch } from '@/types/products.types'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { PermissionEditor } from './PermissionEditor'

// ─── Schemas ──────────────────────────────────────────────────────────────────
const createSchema = z.object({
  name:     z.string().min(2, 'At least 2 characters'),
  email:    z.string().email('Invalid email'),
  password: z.string().min(6, 'At least 6 characters'),
  role:     z.enum(['SUPER_ADMIN', 'BRANCH_ADMIN', 'STAFF']),
  branchId: z.string().optional().or(z.literal('')),
})

const editSchema = z.object({
  name:     z.string().min(2, 'At least 2 characters'),
  role:     z.enum(['SUPER_ADMIN', 'BRANCH_ADMIN', 'STAFF']),
  branchId: z.string().optional().or(z.literal('')),
  isActive: z.boolean(),
})

type CreateForm = z.infer<typeof createSchema>
type EditForm   = z.infer<typeof editSchema>

const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN:  'Super Admin',
  BRANCH_ADMIN: 'Branch Admin',
  STAFF:        'Staff',
}

// ─── Shared helpers ───────────────────────────────────────────────────────────
function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
      {children}{required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
  )
}

function inputCls(err?: boolean) {
  return cn(
    'w-full h-10 px-3.5 border rounded-lg text-sm text-slate-800 bg-white placeholder-slate-300',
    'focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all',
    err ? 'border-rose-400 bg-rose-50/40' : 'border-slate-200 hover:border-slate-300'
  )
}

function selectCls() {
  return 'w-full h-10 px-3.5 border border-slate-200 hover:border-slate-300 rounded-lg text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all'
}

function ApiError({ error }: { error: unknown }) {
  const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Something went wrong'
  return (
    <div className="px-4 py-3 bg-rose-50 border border-rose-200 rounded-lg">
      <p className="text-sm text-rose-600 font-medium">{msg}</p>
    </div>
  )
}

// ─── Tab types ────────────────────────────────────────────────────────────────
type ModalTab = 'info' | 'permissions'

// ─── ModalShell ───────────────────────────────────────────────────────────────
function ModalShell({
  title, subtitle, onClose, children, tab, onTabChange, showTabs = true,
}: {
  title: string
  subtitle?: string
  onClose: () => void
  children: React.ReactNode
  tab?: ModalTab
  onTabChange?: (t: ModalTab) => void
  showTabs?: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        style={{ animation: 'modalIn 0.18s cubic-bezier(0.34,1.56,0.64,1)' }}>

        {/* Header */}
        <div className="px-6 pt-5 pb-4 shrink-0 border-b border-slate-100">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[17px] font-bold text-slate-900 leading-tight">{title}</h2>
              {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
            </div>
            <button onClick={onClose}
              className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
              <X size={15} />
            </button>
          </div>

          {/* Tabs */}
          {showTabs && tab && onTabChange && (
            <div className="flex gap-1 mt-4 p-1 bg-slate-100 rounded-lg w-fit">
              {(['info', 'permissions'] as ModalTab[]).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => onTabChange(t)}
                  className={cn(
                    'px-4 py-1.5 rounded-md text-[12px] font-semibold transition-all duration-150 capitalize flex items-center gap-1.5',
                    tab === t
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  )}
                >
                  {t === 'permissions' && <Shield size={11} />}
                  {t === 'info' ? 'Basic Info' : 'Permissions'}
                </button>
              ))}
            </div>
          )}
        </div>

        {children}
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  )
}

function ModalFooter({ onClose, loading, label }: { onClose: () => void; loading: boolean; label: string }) {
  return (
    <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-100 shrink-0 bg-slate-50/60">
      <button type="button" onClick={onClose}
        className="h-9 px-5 text-[13px] font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-white hover:border-slate-300 transition-all">
        Cancel
      </button>
      <button type="submit" disabled={loading}
        className="h-9 px-6 text-[13px] font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all disabled:opacity-50 flex items-center gap-2 shadow-sm shadow-indigo-200">
        {loading && <Loader2 size={12} className="animate-spin" />}
        {label}
      </button>
    </div>
  )
}

// ─── Create Modal ─────────────────────────────────────────────────────────────
function CreateUserModal({ branches, onClose }: { branches: Branch[]; onClose: () => void }) {
  const qc = useQueryClient()
  const { isSuperAdmin } = useAuth()
  const [tab, setTab] = useState<ModalTab>('info')
  const [permissions, setPermissions] = useState<Permission[]>(DEFAULT_PERMISSIONS())

  const { register, handleSubmit, watch, formState: { errors } } = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: { name: '', email: '', password: '', role: 'STAFF', branchId: '' },
  })

  const role = watch('role')

  const mut = useMutation({
    mutationFn: (v: CreateForm) => usersService.create({
      name: v.name, email: v.email, password: v.password,
      role: v.role, branchId: v.branchId || null,
      permissions: permissions.filter(p => p.canView || p.canCreate || p.canEdit || p.canDelete),
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); onClose() },
  })

  const activePermsCount = permissions.filter(p => p.canView || p.canCreate || p.canEdit || p.canDelete).length

  return (
    <ModalShell
      title="Add New User"
      subtitle="Fill in basic details then configure page access"
      onClose={onClose}
      tab={tab}
      onTabChange={setTab}
      showTabs
    >
      <form onSubmit={handleSubmit(v => mut.mutate(v))} className="flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto">

          {/* Info Tab */}
          {tab === 'info' && (
            <div className="px-6 py-5 space-y-4">
              {mut.error && <ApiError error={mut.error} />}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label required>Full Name</Label>
                  <input {...register('name')} placeholder="e.g. Rahul Sharma" className={inputCls(!!errors.name)} />
                  {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name.message}</p>}
                </div>

                <div className="col-span-2">
                  <Label required>Email Address</Label>
                  <input {...register('email')} type="email" placeholder="rahul@company.com" className={inputCls(!!errors.email)} />
                  {errors.email && <p className="text-[11px] text-rose-500 mt-1">{errors.email.message}</p>}
                </div>

                <div className="col-span-2">
                  <Label required>Password</Label>
                  <input {...register('password')} type="password" placeholder="Min. 6 characters" className={inputCls(!!errors.password)} />
                  {errors.password && <p className="text-[11px] text-rose-500 mt-1">{errors.password.message}</p>}
                </div>

                <div>
                  <Label required>Role</Label>
                  <select {...register('role')} className={selectCls()}>
                    <option value="STAFF">Staff</option>
                    <option value="BRANCH_ADMIN">Branch Admin</option>
                    {isSuperAdmin && <option value="SUPER_ADMIN">Super Admin</option>}
                  </select>
                </div>
                <div>
                  <Label>Branch</Label>
                  <select {...register('branchId')} className={selectCls()} disabled={role === 'SUPER_ADMIN'}>
                    <option value="">No Branch</option>
                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Nudge to permissions tab */}
              <button type="button" onClick={() => setTab('permissions')}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 transition-colors group">
                <div className="flex items-center gap-2.5">
                  <Shield size={14} className="text-indigo-500" />
                  <span className="text-[13px] font-medium text-indigo-700">Configure page permissions</span>
                </div>
                <span className={cn(
                  'text-[11px] font-bold px-2 py-0.5 rounded-full',
                  activePermsCount > 0 ? 'bg-indigo-200 text-indigo-800' : 'bg-slate-200 text-slate-500'
                )}>
                  {activePermsCount} active
                </span>
              </button>
            </div>
          )}

          {/* Permissions Tab */}
          {tab === 'permissions' && (
            <div className="px-6 py-5">
              <PermissionEditor permissions={permissions} onChange={setPermissions} />
            </div>
          )}
        </div>

        <ModalFooter onClose={onClose} loading={mut.isPending} label="Create User" />
      </form>
    </ModalShell>
  )
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function EditUserModal({ user, branches, onClose }: { user: User; branches: Branch[]; onClose: () => void }) {
  const qc = useQueryClient()
  const { isSuperAdmin } = useAuth()
  const [tab, setTab] = useState<ModalTab>('info')

  // Initialise from user's existing permissions (fill missing modules with defaults)
  const [permissions, setPermissions] = useState<Permission[]>(() => {
    const existing = user.permissions ?? []
    return DEFAULT_PERMISSIONS().map(def => {
      const found = existing.find(p => p.module === def.module)
      return found ?? def
    })
  })

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<EditForm>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      name: user.name, role: user.role,
      branchId: user.branchId ?? '', isActive: user.isActive,
    },
  })

  const role = watch('role')
  const isActive = watch('isActive')

  const mut = useMutation({
    mutationFn: (v: EditForm) => usersService.update(user.id, {
      name: v.name, role: v.role,
      branchId: v.branchId || null,
      isActive: v.isActive,
      permissions: permissions.filter(p => p.canView || p.canCreate || p.canEdit || p.canDelete),
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); onClose() },
  })

  const activePermsCount = permissions.filter(p => p.canView || p.canCreate || p.canEdit || p.canDelete).length

  return (
    <ModalShell
      title="Edit User"
      subtitle={user.email}
      onClose={onClose}
      tab={tab}
      onTabChange={setTab}
      showTabs
    >
      <form onSubmit={handleSubmit(v => mut.mutate(v))} className="flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto">

          {tab === 'info' && (
            <div className="px-6 py-5 space-y-4">
              {mut.error && <ApiError error={mut.error} />}

              <div>
                <Label required>Full Name</Label>
                <input {...register('name')} className={inputCls(!!errors.name)} />
                {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <Label>Email</Label>
                <input value={user.email} disabled
                  className="w-full h-10 px-3.5 border border-slate-200 rounded-lg text-sm text-slate-400 bg-slate-50 cursor-not-allowed" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label required>Role</Label>
                  <select {...register('role')} className={selectCls()}>
                    <option value="STAFF">Staff</option>
                    <option value="BRANCH_ADMIN">Branch Admin</option>
                    {isSuperAdmin && <option value="SUPER_ADMIN">Super Admin</option>}
                  </select>
                </div>
                <div>
                  <Label>Branch</Label>
                  <select {...register('branchId')} className={selectCls()} disabled={role === 'SUPER_ADMIN'}>
                    <option value="">No Branch</option>
                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Active toggle */}
              <div className="flex items-center justify-between px-4 py-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <p className="text-[13px] font-semibold text-slate-700">Account Active</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Inactive users cannot log in</p>
                </div>
                <button
                  type="button"
                  onClick={() => setValue('isActive', !isActive)}
                  className={cn(
                    'w-11 h-6 rounded-full transition-all duration-200 relative shrink-0',
                    isActive ? 'bg-indigo-600' : 'bg-slate-300'
                  )}
                >
                  <div className={cn(
                    'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200',
                    isActive ? 'left-5' : 'left-0.5'
                  )} />
                </button>
              </div>

              {/* Nudge */}
              <button type="button" onClick={() => setTab('permissions')}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 transition-colors">
                <div className="flex items-center gap-2.5">
                  <Shield size={14} className="text-indigo-500" />
                  <span className="text-[13px] font-medium text-indigo-700">Manage page permissions</span>
                </div>
                <span className={cn(
                  'text-[11px] font-bold px-2 py-0.5 rounded-full',
                  activePermsCount > 0 ? 'bg-indigo-200 text-indigo-800' : 'bg-slate-200 text-slate-500'
                )}>
                  {activePermsCount} active
                </span>
              </button>
            </div>
          )}

          {tab === 'permissions' && (
            <div className="px-6 py-5">
              <PermissionEditor permissions={permissions} onChange={setPermissions} />
            </div>
          )}
        </div>

        <ModalFooter onClose={onClose} loading={mut.isPending} label="Save Changes" />
      </form>
    </ModalShell>
  )
}

// ─── Reset Password Modal ─────────────────────────────────────────────────────
function ResetPasswordModal({ user, onClose }: { user: User; onClose: () => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<{ newPassword: string }>({
    resolver: zodResolver(z.object({ newPassword: z.string().min(6, 'At least 6 characters') })),
  })

  const mut = useMutation({
    mutationFn: (v: { newPassword: string }) => usersService.resetPassword(user.id, v),
    onSuccess: onClose,
  })

  return (
    <ModalShell title="Reset Password" subtitle={`For ${user.name}`} onClose={onClose} showTabs={false}>
      <form onSubmit={handleSubmit(v => mut.mutate(v))} className="flex flex-col flex-1 overflow-hidden">
        <div className="px-6 py-5 space-y-4">
          {mut.error && <ApiError error={mut.error} />}
          <div>
            <Label required>New Password</Label>
            <input {...register('newPassword')} type="password" placeholder="Min. 6 characters" className={inputCls(!!errors.newPassword)} />
            {errors.newPassword && <p className="text-[11px] text-rose-500 mt-1">{errors.newPassword.message}</p>}
          </div>
        </div>
        <ModalFooter onClose={onClose} loading={mut.isPending} label="Reset Password" />
      </form>
    </ModalShell>
  )
}

export { CreateUserModal, EditUserModal, ResetPasswordModal, ROLE_LABELS }