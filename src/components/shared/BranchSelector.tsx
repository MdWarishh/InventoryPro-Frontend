'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Check, GitBranch, Layers, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useBranchStore } from '@/store/branch.store'
import type { Branch } from '@/store/branch.store'

interface BranchSelectorProps {
  branches: Branch[]
  selectedBranchId: string | null
  onChange: (branchId: string | null) => void
  collapsed?: boolean
}

export function BranchSelector({
  branches,
  selectedBranchId,
  onChange,
  collapsed = false,
}: BranchSelectorProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { userBranchId, isLoading, fetchBranches } = useBranchStore()

  // Fetch branches on mount (if not already loaded)
  useEffect(() => {
    if (branches.length === 0) {
      fetchBranches()
    }
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selectedBranch = branches.find((b) => b.id === selectedBranchId)

  const handleSelect = (branchId: string | null) => {
    onChange(branchId)
    setOpen(false)
  }

  // Collapsed mode: sirf icon dikhao
  if (collapsed) {
    return (
      <div className="flex justify-center py-2">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-500/10 cursor-pointer"
          title={selectedBranch?.name ?? 'All Branches'}
          onClick={() => setOpen(!open)}
        >
          <Layers className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        </div>
      </div>
    )
  }

  return (
    <div ref={ref} className="relative px-3 pb-2">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-150',
          'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800',
          'border border-slate-200 dark:border-slate-700',
          'text-slate-700 dark:text-slate-300',
          open && 'ring-2 ring-indigo-500/30 border-indigo-400 dark:border-indigo-500'
        )}
      >
        {/* Icon */}
        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-indigo-100 dark:bg-indigo-500/20">
          <Layers className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
        </div>

        {/* Label */}
        <div className="flex-1 min-w-0 text-left">
          {isLoading ? (
            <span className="text-xs text-slate-400">Loading...</span>
          ) : (
            <>
              <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none mb-0.5">
                Active Branch
              </p>
              <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200">
                {selectedBranch?.name ?? 'All Branches'}
              </p>
            </>
          )}
        </div>

        {isLoading ? (
          <Loader2 className="h-3.5 w-3.5 flex-shrink-0 text-slate-400 animate-spin" />
        ) : (
          <ChevronDown
            className={cn(
              'h-3.5 w-3.5 flex-shrink-0 text-slate-400 transition-transform duration-200',
              open && 'rotate-180'
            )}
          />
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className={cn(
            'absolute left-3 right-3 z-50 mt-1.5',
            'rounded-xl border border-slate-200 dark:border-slate-700',
            'bg-white dark:bg-[#1a1a24] shadow-xl shadow-slate-900/10 dark:shadow-slate-900/40',
            'overflow-hidden'
          )}
        >
          {/* Header */}
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Switch Branch
            </p>
          </div>

          <div className="max-h-56 overflow-y-auto py-1 scrollbar-thin">
            {/* All Branches Option */}
            <button
              type="button"
              onClick={() => handleSelect(null)}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-all duration-100',
                selectedBranchId === null
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400'
                  : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/60'
              )}
            >
              <div
                className={cn(
                  'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md',
                  selectedBranchId === null
                    ? 'bg-indigo-100 dark:bg-indigo-500/20'
                    : 'bg-slate-100 dark:bg-slate-800'
                )}
              >
                <Layers
                  className={cn(
                    'h-3 w-3',
                    selectedBranchId === null
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-400 dark:text-slate-600'
                  )}
                />
              </div>

              <div className="flex-1 min-w-0 text-left">
                <p className="font-semibold truncate">All Branches</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                  {branches.length} branches total
                </p>
              </div>

              {selectedBranchId === null && (
                <Check className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
              )}
            </button>

            {/* Divider */}
            {branches.length > 0 && (
              <div className="mx-3 my-1 border-t border-slate-100 dark:border-slate-800" />
            )}

            {/* Individual Branches */}
            {branches.map((branch) => {
              const isSelected = branch.id === selectedBranchId
              const isUserBranch = branch.id === userBranchId

              return (
                <button
                  key={branch.id}
                  type="button"
                  onClick={() => handleSelect(branch.id)}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-all duration-100',
                    isSelected
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400'
                      : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/60'
                  )}
                >
                  {/* Branch Avatar */}
                  <div
                    className={cn(
                      'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-[10px] font-bold',
                      isSelected
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                    )}
                  >
                    {branch.code?.slice(0, 2).toUpperCase() ?? 'BR'}
                  </div>

                  {/* Branch Info */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <p className="font-semibold truncate">{branch.name}</p>
                      {branch.isMainBranch && (
                        <span className="flex-shrink-0 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
                          Main
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">{branch.code}</p>
                      {isUserBranch && (
                        <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
                          • Your Branch
                        </span>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                  )}
                </button>
              )
            })}

            {/* Empty state */}
            {branches.length === 0 && !isLoading && (
              <div className="px-3 py-4 text-center">
                <GitBranch className="h-6 w-6 text-slate-300 dark:text-slate-600 mx-auto mb-1.5" />
                <p className="text-xs text-slate-400 dark:text-slate-500">No branches found</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}