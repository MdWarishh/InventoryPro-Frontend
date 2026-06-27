'use client'

import { cn } from '@/lib/utils'
import type { Permission, ModuleKey } from '@/types/users.types'
import { ALL_MODULES } from '@/types/users.types'

interface PermissionEditorProps {
  permissions: Permission[]
  onChange: (permissions: Permission[]) => void
}

const PERM_KEYS: { key: keyof Omit<Permission, 'module'>; label: string; short: string }[] = [
  { key: 'canView',   label: 'View',   short: 'V' },
  { key: 'canCreate', label: 'Create', short: 'C' },
  { key: 'canEdit',   label: 'Edit',   short: 'E' },
  { key: 'canDelete', label: 'Delete', short: 'D' },
]

const GROUPS = ['Core', 'Catalog', 'Operations', 'Other']

const GROUP_COLORS: Record<string, { dot: string; label: string; header: string }> = {
  Core:       { dot: 'bg-violet-500',  label: 'text-violet-700 dark:text-violet-400',  header: 'bg-violet-50 dark:bg-violet-900/20 border-violet-100 dark:border-violet-800/40' },
  Catalog:    { dot: 'bg-sky-500',     label: 'text-sky-700 dark:text-sky-400',        header: 'bg-sky-50 dark:bg-sky-900/20 border-sky-100 dark:border-sky-800/40' },
  Operations: { dot: 'bg-emerald-500', label: 'text-emerald-700 dark:text-emerald-400',header: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/40' },
  Other:      { dot: 'bg-amber-500',   label: 'text-amber-700 dark:text-amber-400',    header: 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/40' },
}

export function PermissionEditor({ permissions, onChange }: PermissionEditorProps) {
  const getPerms = (module: ModuleKey): Permission =>
    permissions.find(p => p.module === module) ?? {
      module, canView: false, canCreate: false, canEdit: false, canDelete: false,
    }

  const update = (module: ModuleKey, key: keyof Omit<Permission, 'module'>, value: boolean) => {
    const current = getPerms(module)
    let updated: Permission = { ...current, [key]: value }

    if (key === 'canView' && !value) {
      updated = { ...updated, canCreate: false, canEdit: false, canDelete: false }
    }
    if ((key === 'canCreate' || key === 'canEdit' || key === 'canDelete') && value) {
      updated = { ...updated, canView: true }
    }

    onChange(permissions.map(p => p.module === module ? updated : p))
  }

  const toggleGroupCol = (group: string, key: keyof Omit<Permission, 'module'>) => {
    const groupModules = ALL_MODULES.filter(m => m.group === group).map(m => m.key)
    const allOn = groupModules.every(mod => getPerms(mod)[key])
    onChange(
      permissions.map(p => {
        if (!groupModules.includes(p.module)) return p
        const updated = { ...p, [key]: !allOn }
        if (key === 'canView' && allOn) return { ...updated, canCreate: false, canEdit: false, canDelete: false }
        if ((key === 'canCreate' || key === 'canEdit' || key === 'canDelete') && !allOn) return { ...updated, canView: true }
        return updated
      })
    )
  }

  const activeCount = permissions.filter(p => p.canView || p.canCreate || p.canEdit || p.canDelete).length

  return (
    <div className="space-y-3">
      {/* Summary bar */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-slate-400 dark:text-gray-500 uppercase tracking-widest">
          Page Permissions
        </span>
        <span className={cn(
          'text-[11px] font-bold px-2.5 py-0.5 rounded-full',
          activeCount > 0
            ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400'
            : 'bg-slate-100 dark:bg-gray-800 text-slate-400 dark:text-gray-500'
        )}>
          {activeCount} / {ALL_MODULES.length} modules
        </span>
      </div>

      {/* Groups */}
      {GROUPS.map(group => {
        const groupModules = ALL_MODULES.filter(m => m.group === group)
        const colors = GROUP_COLORS[group]

        return (
          <div key={group} className="rounded-xl border border-slate-200/80 dark:border-gray-700/60 overflow-hidden">
            {/* Group header */}
            <div className={cn('grid items-center border-b px-3 py-2', colors.header)}
              style={{ gridTemplateColumns: '1fr repeat(4, 44px)' }}>
              <div className="flex items-center gap-2">
                <div className={cn('w-1.5 h-1.5 rounded-full', colors.dot)} />
                <span className={cn('text-[11px] font-bold uppercase tracking-wider', colors.label)}>
                  {group}
                </span>
              </div>
              {PERM_KEYS.map(pk => {
                const allOn = groupModules.every(m => getPerms(m.key)[pk.key])
                return (
                  <button
                    key={pk.key}
                    type="button"
                    onClick={() => toggleGroupCol(group, pk.key)}
                    title={`Toggle all ${pk.label}`}
                    className={cn(
                      'w-[44px] flex items-center justify-center text-[10px] font-bold uppercase tracking-wide py-1 rounded transition-colors',
                      allOn
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300'
                    )}
                  >
                    {pk.short}
                  </button>
                )
              })}
            </div>

            {/* Module rows */}
            {groupModules.map((mod, idx) => {
              const perms = getPerms(mod.key)
              const isActive = perms.canView || perms.canCreate || perms.canEdit || perms.canDelete

              return (
                <div
                  key={mod.key}
                  className={cn(
                    'grid items-center px-3 py-2.5 transition-colors',
                    idx !== groupModules.length - 1 && 'border-b border-slate-100 dark:border-gray-800',
                    isActive
                      ? 'bg-white dark:bg-gray-900'
                      : 'bg-slate-50/60 dark:bg-gray-800/40',
                    'hover:bg-slate-50 dark:hover:bg-gray-800/70'
                  )}
                  style={{ gridTemplateColumns: '1fr repeat(4, 44px)' }}
                >
                  {/* Module name */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={cn(
                      'text-[13px] font-mono shrink-0',
                      isActive ? 'text-slate-500 dark:text-gray-400' : 'text-slate-300 dark:text-gray-600'
                    )}>
                      {mod.icon}
                    </span>
                    <span className={cn(
                      'text-[13px] font-medium truncate',
                      isActive ? 'text-slate-700 dark:text-gray-200' : 'text-slate-400 dark:text-gray-600'
                    )}>
                      {mod.label}
                    </span>
                    {isActive && (
                      <span className="shrink-0 w-1 h-1 rounded-full bg-emerald-400 dark:bg-emerald-500" />
                    )}
                  </div>

                  {/* Checkboxes */}
                  {PERM_KEYS.map(pk => (
                    <div key={pk.key} className="flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => update(mod.key, pk.key, !perms[pk.key])}
                        className={cn(
                          'w-5 h-5 rounded-[5px] border-[1.5px] transition-all duration-150 flex items-center justify-center',
                          perms[pk.key]
                            ? 'bg-indigo-600 dark:bg-indigo-500 border-indigo-600 dark:border-indigo-500 shadow-sm shadow-indigo-200 dark:shadow-indigo-900/40'
                            : 'border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-indigo-400 dark:hover:border-indigo-500'
                        )}
                      >
                        {perms[pk.key] && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}