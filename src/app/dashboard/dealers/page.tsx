'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Plus, Search, Users, TrendingUp, Package,
  FileText, RefreshCw, Building2,
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
  }, [debouncedSearch, globalBranchId])  // ← add globalBranchId

  useEffect(() => { load() }, [load])

  // Branch change pe search reset
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

  const totalStockIn  = dealers.reduce((s, d) => s + (d._count?.stockIns  || 0), 0)
  const totalStockOut = dealers.reduce((s, d) => s + (d._count?.stockOuts || 0), 0)
  const totalInvoices = dealers.reduce((s, d) => s + (d._count?.invoices  || 0), 0)

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

        {/* Stats Bar */}
        <Card>
          <CardContent className="p-0">
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-border">
              {[
                { icon: Users,      label: 'Active Dealers', value: total,         color: 'text-primary' },
                { icon: Package,    label: 'Total Stock In', value: totalStockIn,  color: 'text-blue-600 dark:text-blue-400' },
                { icon: TrendingUp, label: 'Total Sales',    value: totalStockOut, color: 'text-emerald-600 dark:text-emerald-400' },
                { icon: FileText,   label: 'Invoices',       value: totalInvoices, color: 'text-violet-600 dark:text-violet-400' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="flex items-center gap-3 px-5 py-4">
                  <Icon className={`w-4 h-4 shrink-0 ${color}`} />
                  <div>
                    <p className={`text-xl font-bold tabular-nums leading-none ${color}`}>{value}</p>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider mt-0.5">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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
            onClick={load}
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
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