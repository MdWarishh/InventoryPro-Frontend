import type { SerialStatus } from '@/types/serial.types'

const config: Record<SerialStatus, { label: string; classes: string; dot: string }> = {
  AVAILABLE: {
    label: 'Available',
    classes: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    dot: 'bg-emerald-500',
  },
  SOLD: {
    label: 'Sold',
    classes: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
    dot: 'bg-sky-500',
  },
  DAMAGED: {
    label: 'Damaged',
    classes: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
    dot: 'bg-rose-500',
  },
}

export default function StatusBadge({ status }: { status: SerialStatus }) {
  const { label, classes, dot } = config[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  )
}