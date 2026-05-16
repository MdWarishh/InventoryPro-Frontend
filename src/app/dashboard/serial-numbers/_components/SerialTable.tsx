'use client'

import { Cpu, ShieldAlert } from 'lucide-react'
import StatusBadge from './StatusBadge'
import type { SerialNumber } from '@/types/serial.types'

interface SerialTableProps {
  serials: SerialNumber[]
  onMarkDamaged: (serial: SerialNumber) => void
  loading?: boolean
}

export default function SerialTable({ serials, onMarkDamaged, loading }: SerialTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-50">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-5 py-4 flex items-center gap-4 animate-pulse">
              <div className="w-8 h-8 bg-gray-100 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-100 rounded w-32" />
                <div className="h-2.5 bg-gray-50 rounded w-20" />
              </div>
              <div className="h-6 w-20 bg-gray-100 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (serials.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 py-20 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
          <Cpu className="w-6 h-6 text-gray-200" />
        </div>
        <p className="text-sm font-medium text-gray-400">No serial numbers found</p>
        <p className="text-xs text-gray-300 mt-1">Try adjusting your filters</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/60">
            {['Serial Number', 'Product', 'Branch', 'Status', 'Stock In', 'Invoice', 'Added On', 'Action'].map((h) => (
              <th
                key={h}
                className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {serials.map((s) => (
            <tr key={s.id} className="hover:bg-gray-50/40 transition-colors group">
              {/* Serial Number */}
              <td className="px-5 py-3.5">
                <span className="font-mono text-sm font-semibold text-gray-800 bg-gray-100 px-2 py-0.5 rounded-md">
                  {s.serialNumber}
                </span>
              </td>

              {/* Product */}
              <td className="px-5 py-3.5">
                {s.product ? (
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{s.product.name}</p>
                    <p className="text-xs text-gray-400 font-mono">{s.product.sku}</p>
                  </div>
                ) : (
                  <span className="text-gray-300">—</span>
                )}
              </td>

              {/* Branch */}
              <td className="px-5 py-3.5 text-gray-500 text-sm">
                {s.branch?.name || '—'}
              </td>

              {/* Status */}
              <td className="px-5 py-3.5">
                <StatusBadge status={s.status} />
              </td>

              {/* Stock In / Dealer */}
              <td className="px-5 py-3.5 text-gray-500 text-xs">
                {s.stockIn ? (
                  <div>
                    <p>{new Date(s.stockIn.date).toLocaleDateString('en-IN')}</p>
                    {s.stockIn.dealer && (
                      <p className="text-gray-400">{s.stockIn.dealer.name}</p>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-300">—</span>
                )}
              </td>

              {/* Invoice */}
              <td className="px-5 py-3.5 text-xs text-gray-500">
                {s.stockOut?.invoice?.invoiceNumber ? (
                  <span className="font-mono font-medium text-sky-600">
                    #{s.stockOut.invoice.invoiceNumber}
                  </span>
                ) : (
                  <span className="text-gray-300">—</span>
                )}
              </td>

              {/* Added On */}
              <td className="px-5 py-3.5 text-xs text-gray-400">
                {new Date(s.createdAt).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </td>

              {/* Action */}
              <td className="px-5 py-3.5">
                {s.status === 'AVAILABLE' && (
                  <button
                    onClick={() => onMarkDamaged(s)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Damage
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}