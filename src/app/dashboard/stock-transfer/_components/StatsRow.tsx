import type { CurrentStock } from '@/types/stock-transfer.types'
import { Package, Layers, AlertTriangle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  currentStock: CurrentStock[]
}

export default function StatsRow({ currentStock }: Props) {
  const totalUnits = currentStock.reduce((a, s) => a + s.currentStock, 0)
  const lowCount = currentStock.filter(s => s.currentStock > 0 && s.currentStock <= s.product?.minStockAlert).length
  const zeroCount = currentStock.filter(s => s.currentStock === 0).length

  const stats = [
    {
      label: 'Total Products',
      value: currentStock.length,
      icon: Package,
      iconClass: 'text-primary',
      bgClass: 'bg-primary/10',
      valueClass: 'text-foreground',
    },
    {
      label: 'Total Units',
      value: totalUnits.toLocaleString('en-IN'),
      icon: Layers,
      iconClass: 'text-blue-500',
      bgClass: 'bg-blue-500/10',
      valueClass: 'text-foreground',
    },
    {
      label: 'Low Stock',
      value: lowCount,
      icon: AlertTriangle,
      iconClass: lowCount > 0 ? 'text-amber-500' : 'text-emerald-500',
      bgClass: lowCount > 0 ? 'bg-amber-500/10' : 'bg-emerald-500/10',
      valueClass: lowCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Out of Stock',
      value: zeroCount,
      icon: XCircle,
      iconClass: zeroCount > 0 ? 'text-rose-500' : 'text-emerald-500',
      bgClass: zeroCount > 0 ? 'bg-rose-500/10' : 'bg-emerald-500/10',
      valueClass: zeroCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(({ label, value, icon: Icon, iconClass, bgClass, valueClass }) => (
        <div key={label} className="rounded-xl border border-border bg-card p-4 flex items-center gap-4">
          <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center shrink-0', bgClass)}>
            <Icon className={cn('w-5 h-5', iconClass)} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">{label}</p>
            <p className={cn('text-2xl font-bold mt-0.5', valueClass)}>{value}</p>
          </div>
        </div>
      ))}
    </div>
  )
}