'use client'

import { useEffect, useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Plus, Search, TrendingUp, Package,
  RefreshCw, Building2, IndianRupee, AlertTriangle, Wallet,
} from 'lucide-react'
import { dealersService } from '@/services/dealers.service'
import type { Dealer, CreateDealerPayload } from '@/types/dealers.types'
import DealerCard from './_components/DealerCard'
import DealerFormModal from './_components/DealerFormModal'
import DeleteConfirmModal from './_components/DeleteConfirmModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { useBranchFilter } from '@/hooks/useBranchFilter'
import { useBranchStore } from '@/store/branch.store'

const fmtFull = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

export default function DealersPage() {
  const [dealers, setDealers] = useState<Dealer[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [editDealer, setEditDealer] = useState<Dealer | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  const [deleteDealer, setDeleteDealer] = useState<Dealer | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const { branchId: globalBranchId } = useBranchFilter()
  const branches = useBranchStore((s) => s.branches)

  // ── Overview Stats (naya) ───────────────────────────────────────────────
  const { data: overviewStats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['dealers-overview-stats', globalBranchId],
    queryFn: () => dealersService.getOverviewStats(globalBranchId || undefined),
    staleTime: 2 * 60 * 1000,
  })
  const stats = overviewStats?.data

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350)
    return () => clearTimeout(t)
  }, [search])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await dealersService.getAll({
        search: debouncedSearch || undefined,
        branchId: globalBranchId || undefined,
      })
      setDealers(res.data ?? [])
      setTotal(res.pagination.total)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, globalBranchId])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    setSearch('')
  }, [globalBranchId])

  const handleCreate = async (data: CreateDealerPayload) => {
    setFormLoading(true)
    try { await dealersService.create(data); setFormOpen(false); load() }
    finally { setFormLoading(false) }
  }

  const handleUpdate = async (data: CreateDealerPayload) => {
    if (!editDealer) return
    setFormLoading(true)
    try { await dealersService.update(editDealer.id, data); setEditDealer(null); load() }
    finally { setFormLoading(false) }
  }

  const handleDelete = async () => {
    if (!deleteDealer) return
    setDeleteLoading(true)
    try { await dealersService.delete(deleteDealer.id); setDeleteDealer(null); load() }
    finally { setDeleteLoading(false) }
  }

  const handleRefresh = () => { load(); refetchStats() }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-7 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">Dealers</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {globalBranchId
                  ? `Branch: ${branches.find(b => b.id === globalBranchId)?.name ?? '...'}`
                  : 'Manage your wholesale dealer network'
                }
              </p>
            </div>
          </div>
          <Button size="sm" className="gap-2" onClick={() => setFormOpen(true)}>
            <Plus className="w-4 h-4" />
            Add Dealer
          </Button>
        </div>

        {/* Active branch indicator */}
        {globalBranchId && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
            Showing dealers for:{' '}
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
              {branches.find((b) => b.id === globalBranchId)?.name ?? 'Selected Branch'}
            </span>
            <span className="text-[10px]">(change from sidebar)</span>
          </div>
        )}

        {/* ── Overview Stats — 5 widgets ── */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          {[
            {
              label: 'Total Wholesale Revenue',
              value: fmtFull(stats?.totalWholesaleRevenue ?? 0),
              icon: IndianRupee,
              iconBg: 'bg-indigo-100 dark:bg-indigo-950/40',
              color: 'text-indigo-600 dark:text-indigo-400',
            },
            {
              label: 'Total Sale',
              value: fmtFull(stats?.totalSale ?? 0),
              icon: TrendingUp,
              iconBg: 'bg-emerald-100 dark:bg-emerald-950/40',
              color: 'text-emerald-600 dark:text-emerald-400',
            },
            {
              label: 'All Profit',
              value: fmtFull(stats?.allProfit ?? 0),
              icon: Wallet,
              iconBg: (stats?.allProfit ?? 0) >= 0 ? 'bg-sky-100 dark:bg-sky-950/40' : 'bg-destructive/10',
              color: (stats?.allProfit ?? 0) >= 0 ? 'text-sky-600 dark:text-sky-400' : 'text-destructive',
            },
            {
              label: 'Products in Hand',
              value: (stats?.productsInHand ?? 0).toLocaleString('en-IN'),
              icon: Package,
              iconBg: 'bg-violet-100 dark:bg-violet-950/40',
              color: 'text-violet-600 dark:text-violet-400',
            },
            {
              label: 'Low Stock Items',
              value: (stats?.lowStockItems ?? 0).toLocaleString('en-IN'),
              icon: AlertTriangle,
              iconBg: 'bg-amber-100 dark:bg-amber-950/40',
              color: 'text-amber-600 dark:text-amber-400',
            },
          ].map(({ label, value, icon: Icon, iconBg, color }) => (
            <Card key={label} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest truncate">{label}</p>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
                    <Icon className={`w-3.5 h-3.5 ${color}`} />
                  </div>
                </div>
                {statsLoading
                  ? <Skeleton className="h-6 w-24 mt-1" />
                  : <p className={`text-lg font-black tabular-nums ${color}`}>{value}</p>
                }
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search + Refresh */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              className="pl-9 h-9 text-sm"
              placeholder="Search by name, phone, email, GST…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={handleRefresh}
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading || statsLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : dealers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-20 gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                <Building2 className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">No dealers found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {search ? `No results for "${search}"` : 'Start by adding your first dealer'}
                </p>
              </div>
              {!search && (
                <Button size="sm" className="gap-2 mt-1" onClick={() => setFormOpen(true)}>
                  <Plus className="w-3.5 h-3.5" />
                  Add First Dealer
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {dealers.map((dealer) => (
              <DealerCard
                key={dealer.id}
                dealer={dealer}
                onEdit={(d) => { setEditDealer(d); setFormOpen(true) }}
                onDelete={setDeleteDealer}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <DealerFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditDealer(null) }}
        onSubmit={editDealer ? handleUpdate : handleCreate}
        dealer={editDealer}
        loading={formLoading}
      />

      <DeleteConfirmModal
        dealer={deleteDealer}
        onConfirm={handleDelete}
        onClose={() => setDeleteDealer(null)}
        loading={deleteLoading}
      />
    </>
  )
}