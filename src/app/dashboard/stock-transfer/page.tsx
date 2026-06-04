'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Minus } from 'lucide-react'
import { stockService } from '@/services/stock-transfer.service'
import type {
  CurrentStock, StockInRecord, StockOutRecord,
  StockHistoryType, Pagination,
} from '@/types/stock-transfer.types'

import StatsRow from './_components/StatsRow'
import CurrentStockTable from './_components/CurrentStockTable'
import StockInHistoryTable from './_components/StockInHistoryTable'
import StockOutHistoryTable from './_components/StockOutHistoryTable'
import TablePagination from './_components/TablePagination'
import StockInModal from './_components/StockInModal'
import StockOutModal from './_components/StockOutModal'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Search, AlertTriangle } from 'lucide-react'

type Tab = 'current' | 'in' | 'out'

export default function StockPage() {
  const [tab, setTab] = useState<Tab>('current')
  const [currentStock, setCurrentStock] = useState<CurrentStock[]>([])
  const [historyItems, setHistoryItems] = useState<(StockInRecord | StockOutRecord)[]>([])
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 20, pages: 0 })
  const [fetching, setFetching] = useState(true)

  const [search, setSearch] = useState('')
  const [lowStock, setLowStock] = useState(false)
  const [histPage, setHistPage] = useState(1)

  // ── Stock In modal state ──────────────────────────────────────────────────
  const [inModal, setInModal] = useState(false)
  const [editStockIn, setEditStockIn] = useState<StockInRecord | null>(null)

  // ── Stock Out modal state ─────────────────────────────────────────────────
  const [outModal, setOutModal] = useState(false)
  const [editStockOut, setEditStockOut] = useState<StockOutRecord | null>(null)

  // ── Data fetchers ─────────────────────────────────────────────────────────
  const loadCurrent = useCallback(async () => {
    setFetching(true)
    try {
      const data = await stockService.getCurrentStock({ lowStock: lowStock ? 'true' : undefined })
      setCurrentStock(data)
    } finally {
      setFetching(false)
    }
  }, [lowStock])

  const loadHistory = useCallback(async (type: StockHistoryType, page: number) => {
    setFetching(true)
    try {
      const res = await stockService.getHistory(type, { page, limit: 20 })
      setHistoryItems(res.items as any)
      setPagination(res.pagination)
    } finally {
      setFetching(false)
    }
  }, [])

  useEffect(() => {
    if (tab === 'current') loadCurrent()
    else loadHistory(tab as StockHistoryType, histPage)
  }, [tab, lowStock, histPage])

  // Refresh both current + active history tab after any mutation
  const refreshAll = useCallback(() => {
    loadCurrent()
    if (tab === 'in') loadHistory('in', histPage)
    if (tab === 'out') loadHistory('out', histPage)
  }, [tab, histPage, loadCurrent, loadHistory])

  const filtered = currentStock.filter(s =>
    s.product?.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.product?.sku?.toLowerCase().includes(search.toLowerCase())
  )

  const subtitle =
    tab === 'current' ? `${currentStock.length} products tracked` :
    tab === 'in' ? `${pagination.total} stock in records` :
    `${pagination.total} stock out records`

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-screen-xl mx-auto px-6 py-8 space-y-6">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Stock Management</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950"
              onClick={() => { setEditStockIn(null); setInModal(true) }}
            >
              <Plus className="w-4 h-4" />
              Stock In
            </Button>
            <Button
              variant="outline"
              className="gap-2 border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950"
              onClick={() => { setEditStockOut(null); setOutModal(true) }}
            >
              <Minus className="w-4 h-4" />
              Stock Out
            </Button>
          </div>
        </div>

        {/* ── Stats ── */}
        {tab === 'current' && !fetching && (
          <StatsRow currentStock={currentStock} />
        )}

        {/* ── Tabs + Toolbar ── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Tabs value={tab} onValueChange={(v) => { setTab(v as Tab); setHistPage(1) }}>
            <TabsList>
              <TabsTrigger value="current">Current Stock</TabsTrigger>
              <TabsTrigger value="in">Stock In History</TabsTrigger>
              <TabsTrigger value="out">Stock Out History</TabsTrigger>
            </TabsList>
          </Tabs>

          {tab === 'current' && (
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search by name or SKU..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 w-[260px] bg-background"
                />
              </div>
              <Button
                variant={lowStock ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setLowStock(l => !l)}
                className={cn(
                  'gap-2',
                  lowStock && 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800'
                )}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Low Stock
                {lowStock && <Badge className="ml-1 h-4 px-1 text-[10px] bg-amber-500 text-white">ON</Badge>}
              </Button>
            </div>
          )}
        </div>

        {/* ── Table ── */}
        <div className={cn(
          'rounded-xl border border-border bg-card overflow-hidden transition-opacity duration-200',
          fetching && 'opacity-50 pointer-events-none'
        )}>
          {tab === 'current' && (
            <CurrentStockTable items={filtered} fetching={fetching} search={search} />
          )}
          {tab === 'in' && (
            <StockInHistoryTable
              items={historyItems as StockInRecord[]}
              fetching={fetching}
              onEdit={(record) => {
                setEditStockIn(record)
                setInModal(true)
              }}
              onDeleteSuccess={refreshAll}
            />
          )}
          {tab === 'out' && (
            <StockOutHistoryTable
              items={historyItems as StockOutRecord[]}
              fetching={fetching}
              onEdit={(record) => {
                setEditStockOut(record)
                setOutModal(true)
              }}
              onDeleteSuccess={refreshAll}
            />
          )}

          {(tab === 'in' || tab === 'out') && (
            <TablePagination pagination={pagination} page={histPage} onPageChange={setHistPage} />
          )}
        </div>

      </div>

      {/* ── Modals ── */}
      <StockInModal
        open={inModal}
        editRecord={editStockIn}
        onClose={() => { setInModal(false); setEditStockIn(null) }}
        onSuccess={() => {
          toast.success(editStockIn ? 'Stock-in record updated.' : 'Stock in recorded successfully.')
          setInModal(false)
          setEditStockIn(null)
          refreshAll()
        }}
      />
      <StockOutModal
        open={outModal}
        editRecord={editStockOut}
        onClose={() => { setOutModal(false); setEditStockOut(null) }}
        onSuccess={() => {
          toast.success(editStockOut ? 'Stock-out record updated.' : 'Stock out recorded successfully.')
          setOutModal(false)
          setEditStockOut(null)
          refreshAll()
        }}
      />
    </div>
  )
}