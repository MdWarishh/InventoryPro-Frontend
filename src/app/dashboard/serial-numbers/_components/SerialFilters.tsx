'use client'

import { Search } from 'lucide-react'
import type { SerialStatus } from '@/types/serial.types'

const STATUS_OPTIONS: { value: SerialStatus | ''; label: string }[] = [
  { value: '', label: 'All Status' },
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'SOLD', label: 'Sold' },
  { value: 'DAMAGED', label: 'Damaged' },
]

interface SerialFiltersProps {
  searchQuery: string
  onSearchChange: (v: string) => void
  status: SerialStatus | ''
  onStatusChange: (v: SerialStatus | '') => void
  mode: 'search' | 'product'
  onModeChange: (v: 'search' | 'product') => void
  productSearch: string
  onProductSearchChange: (v: string) => void
}

export default function SerialFilters({
  searchQuery,
  onSearchChange,
  status,
  onStatusChange,
  mode,
  onModeChange,
  productSearch,
  onProductSearchChange,
}: SerialFiltersProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4 space-y-3">
      {/* Mode Toggle */}
      <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        {(['search', 'product'] as const).map((m) => (
          <button
            key={m}
            onClick={() => onModeChange(m)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              mode === m
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {m === 'search' ? '🔍 Search Serial' : '📦 By Product'}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {mode === 'search' ? (
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
            <input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by serial number..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
        ) : (
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
            <input
              value={productSearch}
              onChange={(e) => onProductSearchChange(e.target.value)}
              placeholder="Enter product ID or search product..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
        )}

        {/* Status filter — only in product mode */}
        {mode === 'product' && (
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value as SerialStatus | '')}
            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  )
}