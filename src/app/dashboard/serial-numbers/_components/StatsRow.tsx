import type { SerialNumber } from '@/types/serial.types'

interface StatsRowProps {
  serials: SerialNumber[]
}

export default function StatsRow({ serials }: StatsRowProps) {
  const available = serials.filter((s) => s.status === 'AVAILABLE').length
  const sold = serials.filter((s) => s.status === 'SOLD').length
  const damaged = serials.filter((s) => s.status === 'DAMAGED').length

  const stats = [
    { label: 'Total', value: serials.length, color: 'text-gray-900', bg: 'bg-gray-50' },
    { label: 'Available', value: available, color: 'text-emerald-700', bg: 'bg-emerald-50' },
    { label: 'Sold', value: sold, color: 'text-sky-700', bg: 'bg-sky-50' },
    { label: 'Damaged', value: damaged, color: 'text-rose-700', bg: 'bg-rose-50' },
  ]

  return (
    <div className="grid grid-cols-4 gap-3">
      {stats.map((s) => (
        <div key={s.label} className={`${s.bg} rounded-2xl px-5 py-4 border border-white`}>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">{s.label}</p>
          <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
        </div>
      ))}
    </div>
  )
}