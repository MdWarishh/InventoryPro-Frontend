'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Cpu } from 'lucide-react'
import { serialService } from '@/services/serial.service'
import SerialTable from './_components/SerialTable'
import SerialFilters from './_components/SerialFilters'
import StatsRow from './_components/StatsRow'
import MarkDamagedModal from './_components/MarkDamagedModal'
import type { SerialNumber, SerialStatus } from '@/types/serial.types'

export default function SerialNumbersPage() {
  // Data
  const [serials, setSerials] = useState<SerialNumber[]>([])
  const [loading, setLoading] = useState(false)

  // Filters
  const [mode, setMode] = useState<'search' | 'product'>('search')
  const [searchQuery, setSearchQuery] = useState('')
  const [productSearch, setProductSearch] = useState('')
  const [status, setStatus] = useState<SerialStatus | ''>('')

  // Modal
  const [damagedTarget, setDamagedTarget] = useState<SerialNumber | null>(null)
  const [marking, setMarking] = useState(false)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ─── Search mode ───────────────────────────────────────────
  const runSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setSerials([]); return }
    setLoading(true)
    try {
      const result = await serialService.search(q)
      setSerials(result)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (mode !== 'search') return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => runSearch(searchQuery), 400)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [searchQuery, mode, runSearch])

  // ─── Product mode ──────────────────────────────────────────
  const runProductFetch = useCallback(async (productId: string, st: SerialStatus | '') => {
    if (!productId.trim()) { setSerials([]); return }
    setLoading(true)
    try {
      const result = await serialService.getByProduct(productId, undefined, st || undefined)
      setSerials(result)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (mode !== 'product') return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => runProductFetch(productSearch, status), 400)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [productSearch, status, mode, runProductFetch])

  // Reset on mode switch
  useEffect(() => {
    setSerials([])
    setSearchQuery('')
    setProductSearch('')
    setStatus('')
  }, [mode])

  // ─── Mark Damaged ──────────────────────────────────────────
  const handleMarkDamaged = async () => {
    if (!damagedTarget) return
    setMarking(true)
    try {
      await serialService.markDamaged(damagedTarget.id)
      setDamagedTarget(null)
      // Refresh
      if (mode === 'search') runSearch(searchQuery)
      else runProductFetch(productSearch, status)
    } catch (err) {
      console.error(err)
    } finally {
      setMarking(false)
    }
  }

  const hasResults = serials.length > 0

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-screen-xl mx-auto px-6 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-sm shadow-indigo-200">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Serial Numbers</h1>
            <p className="text-sm text-gray-500 mt-0.5">Track and manage product serial numbers</p>
          </div>
        </div>

        {/* Stats — only show when results are loaded */}
        {hasResults && <StatsRow serials={serials} />}

        {/* Filters */}
        <SerialFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          status={status}
          onStatusChange={setStatus}
          mode={mode}
          onModeChange={setMode}
          productSearch={productSearch}
          onProductSearchChange={setProductSearch}
        />

        {/* Empty hint when nothing entered */}
        {!hasResults && !loading && (
          <div className="bg-white rounded-2xl border border-gray-100 py-16 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
              <Cpu className="w-7 h-7 text-indigo-300" />
            </div>
            <p className="text-sm font-semibold text-gray-500">
              {mode === 'search'
                ? 'Type a serial number to search'
                : 'Enter a product ID to view its serials'}
            </p>
            <p className="text-xs text-gray-300 mt-1">Results will appear here</p>
          </div>
        )}

        {/* Table */}
        {(hasResults || loading) && (
          <SerialTable
            serials={serials}
            onMarkDamaged={setDamagedTarget}
            loading={loading}
          />
        )}

        {/* Result count */}
        {hasResults && !loading && (
          <p className="text-xs text-gray-400 text-right">
            Showing {serials.length} serial{serials.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Mark Damaged Modal */}
      <MarkDamagedModal
        open={!!damagedTarget}
        serialNumber={damagedTarget?.serialNumber || ''}
        onConfirm={handleMarkDamaged}
        onClose={() => setDamagedTarget(null)}
        loading={marking}
      />
    </div>
  )
}