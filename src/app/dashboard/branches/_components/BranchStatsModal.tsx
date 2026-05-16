'use client'

import { useEffect, useState } from 'react'
import { branchesService } from '@/services/branches.service'
import type { BranchWithStats, BranchStats } from '@/types/branches.types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Package, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'

interface Props {
  branch: BranchWithStats | null
  open: boolean
  onClose: () => void
}

export default function BranchStatsModal({ branch, open, onClose }: Props) {
  const [stats, setStats] = useState<BranchStats | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && branch) {
      setLoading(true)
      branchesService
        .getStats(branch.id)
        .then(setStats)
        .catch(() => setStats(null))
        .finally(() => setLoading(false))
    } else {
      setStats(null)
    }
  }, [open, branch])

  const statItems = stats
    ? [
        {
          label: 'Total Stock',
          value: stats.totalStock,
          icon: Package,
          color: 'text-blue-500',
          bg: 'bg-blue-500/10',
        },
        {
          label: 'Stock Ins',
          value: stats.totalStockIn,
          icon: ArrowDownCircle,
          color: 'text-green-500',
          bg: 'bg-green-500/10',
        },
        {
          label: 'Stock Outs',
          value: stats.totalStockOut,
          icon: ArrowUpCircle,
          color: 'text-orange-500',
          bg: 'bg-orange-500/10',
        },
      ]
    : []

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {branch?.name} — Stats
          </DialogTitle>
        </DialogHeader>

        <div className="py-2 space-y-3">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-md" />
            ))
          ) : stats ? (
            statItems.map(({ label, value, icon: Icon, color, bg }) => (
              <div
                key={label}
                className="flex items-center gap-4 p-4 rounded-lg border bg-card"
              >
                <div className={`p-2 rounded-md ${bg}`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-2xl font-semibold">{value.toLocaleString()}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Failed to load stats.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}