'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, X, Package, Tag } from 'lucide-react'
import { searchSerials } from '@/services/stock.service'

export default function SerialSearchBar() {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(false)

  const { data: results = [], isLoading } = useQuery({
    queryKey: ['serial-search', query],
    queryFn: () => searchSerials(query),
    enabled: query.trim().length >= 2,
    staleTime: 30_000,
  })

  const statusColor = (status: string) => {
    if (status === 'AVAILABLE') return 'text-emerald-400 bg-emerald-500/10'
    if (status === 'SOLD') return 'text-blue-400 bg-blue-500/10'
    return 'text-red-400 bg-red-500/10'
  }

  return (
    <div className="relative w-full max-w-sm">
      {/* Input */}
      <div className={`flex items-center gap-2.5 bg-white/5 border rounded-xl px-3.5 py-2.5 transition-all
        ${active ? 'border-primary/50' : 'border-white/10'}`}>
        <Search size={14} className="text-white/35 shrink-0" />
        <input
          type="text"
          placeholder="Serial number ya product search karo..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setActive(true)}
          onBlur={() => setTimeout(() => setActive(false), 200)}
          className="flex-1 bg-transparent text-sm text-white placeholder-white/25 outline-none"
        />
        {query && (
          <button onClick={() => setQuery('')} className="text-white/30 hover:text-white/60 transition-colors">
            <X size={13} />
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {active && query.trim().length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#1a1d27] border border-white/10 rounded-xl z-30 shadow-2xl overflow-hidden max-h-72 overflow-y-auto">
          {isLoading ? (
            <div className="px-4 py-4 text-sm text-white/40 text-center">Searching...</div>
          ) : results.length === 0 ? (
            <div className="px-4 py-4 text-sm text-white/40 text-center">Koi result nahi mila.</div>
          ) : (
            results.map((r: any) => (
              <div key={r.id} className="px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Tag size={13} className="text-white/30 shrink-0" />
                    <span className="text-sm font-mono text-white font-medium truncate">{r.serialNumber}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${statusColor(r.status)}`}>
                    {r.status}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-1.5 pl-[22px]">
                  <Package size={11} className="text-white/20" />
                  <span className="text-xs text-white/40">{r.product?.name} · {r.product?.sku}</span>
                  <span className="text-white/20">·</span>
                  <span className="text-xs text-white/30">{r.branch?.name}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}