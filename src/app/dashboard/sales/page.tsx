'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Plus, Download, ShoppingCart, TrendingUp, Loader2, X,
  BarChart3, Package, Layers, ArrowUpRight,
} from 'lucide-react'
import { salesService } from '@/services/sales.service'
import { SalesTable } from './_components/SalesTable'
import { RecordSaleModal, type EditableSale } from './_components/RecordSaleModal'
import { DeleteSaleDialog } from './_components/DeleteSaleDialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Treemap, Cell,
} from 'recharts'
import { useBranchFilter } from '@/hooks/useBranchFilter'

const LIMIT = 20

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)


// ── Treemap colors ────────────────────────────────────────────────────────────
const TREEMAP_COLORS = [
  '#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd',
  '#818cf8', '#4f46e5', '#7c3aed', '#9333ea',
  '#a855f7', '#d946ef',
]

// ── Custom Tooltip for bar chart ──────────────────────────────────────────────
const BarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-xl text-sm">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      <p className="text-emerald-600 dark:text-emerald-400 font-bold">{fmt(payload[0]?.value ?? 0)}</p>
      {payload[0]?.payload?.transactions != null && (
        <p className="text-muted-foreground text-xs mt-0.5">{payload[0].payload.transactions} transactions</p>
      )}
    </div>
  )
}

// ── Custom Treemap cell ───────────────────────────────────────────────────────
const TreemapContent = ({ x, y, width, height, name, revenue, index }: any) => {
  if (width < 30 || height < 20) return null
  const color = TREEMAP_COLORS[index % TREEMAP_COLORS.length]
  const showLabel = width > 60 && height > 35
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={color} rx={4} stroke="white" strokeWidth={2} />
      {showLabel && (
        <>
          <text x={x + 10} y={y + 20} fill="white" fontSize={11} fontWeight={600} className="font-sans">
            {name?.length > 14 ? name.slice(0, 13) + '…' : name}
          </text>
          {height > 50 && (
            <text x={x + 10} y={y + 35} fill="rgba(255,255,255,0.8)" fontSize={10}>
              {fmt(revenue)}
            </text>
          )}
        </>
      )}
    </g>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({
  label, value, sub, icon: Icon, color, loading,
}: {
  label: string; value: string; sub?: string
  icon: any; color: string; loading: boolean
}) {
  return (
    <Card className="border-border shadow-sm bg-card">
      <CardContent className="p-5 flex items-center gap-4">
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest truncate">{label}</p>
          {loading
            ? <Skeleton className="h-7 w-28 mt-1" />
            : <p className="text-2xl font-bold text-foreground tabular-nums mt-0.5">{value}</p>
          }
          {sub && !loading && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SalesPage() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [treemapView, setTreemapView] = useState<'products' | 'branches'>('products')

  // ── Edit / Delete state ─────────────────────────────────────────────────────
  const [editingSale, setEditingSale] = useState<EditableSale | null>(null)
  const [deletingSale, setDeletingSale] = useState<{ id: string; productName: string; quantity: number } | null>(null)

  // ── Branch Filter ──────────────────────────────────────────────────────────
  const { branchId, queryKey: branchQueryKey } = useBranchFilter()

  const isFiltered = !!(startDate || endDate)

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ['sales-summary', ...branchQueryKey, startDate, endDate],
    queryFn: () => salesService.getSummary({
      branchId: branchId ?? undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    }),
  })

  const { data: monthlyData, isLoading: monthlyLoading } = useQuery({
    queryKey: ['sales-monthly', ...branchQueryKey],
    queryFn: () => salesService.getMonthlyRevenue({
      months: 6,
      branchId: branchId ?? undefined,
    }),
    staleTime: 5 * 60 * 1000,
  })

  const { data: yearlyData, isLoading: yearlyLoading } = useQuery({
    queryKey: ['sales-yearly', ...branchQueryKey],
    queryFn: () => salesService.getYearlyRevenue({
      years: 3,
      branchId: branchId ?? undefined,
    }),
    staleTime: 5 * 60 * 1000,
  })

  const { data: breakdownData, isLoading: breakdownLoading } = useQuery({
    queryKey: ['sales-breakdown', ...branchQueryKey, startDate, endDate],
    queryFn: () => salesService.getBreakdown({
      branchId: branchId ?? undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    }),
  })

  const { data: listData, isLoading: listLoading, isFetching: listFetching } = useQuery({
    queryKey: ['sales-list', ...branchQueryKey, page, startDate, endDate],
    queryFn: () => salesService.getAll({
      page,
      limit: LIMIT,
      branchId: branchId ?? undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    }),
    placeholderData: (prev) => prev,
  })

  const sales = listData?.stockOuts ?? []
  const pagination = listData?.pagination

  const summary = summaryData ?? { totalRevenue: 0, totalTransactions: 0, totalUnits: 0, avgOrderValue: 0 }
  const monthly = monthlyData ?? []
  const yearly = yearlyData ?? []
  const treemapItems = treemapView === 'products'
    ? (breakdownData?.topProducts ?? [])
    : (breakdownData?.topBranches ?? [])

  const handleDateFilter = (field: 'start' | 'end', val: string) => {
    field === 'start' ? setStartDate(val) : setEndDate(val)
    setPage(1)
  }

  const clearFilters = () => { setStartDate(''); setEndDate(''); setPage(1) }

  const handleDownload = async () => {
    setDownloading(true)
    try {
      await salesService.downloadExcel({
        branchId: branchId ?? undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      })
    } catch (e) { console.error(e) }
    finally { setDownloading(false) }
  }

  // ── Edit / Delete handlers ─────────────────────────────────────────────────
  const handleEdit = (sale: any) => {
    setEditingSale({
      id: sale.id,
      productId: sale.productId,
      branchId: sale.branchId,
      quantity: sale.quantity,
      sellingPrice: sale.sellingPrice,
      dealerId: sale.dealerId,
      customerName: sale.customerName,
      customerPhone: sale.customerPhone,
      notes: sale.notes,
      serialNumbers: sale.serialNumbers,
    })
  }

  const handleDeleteClick = (sale: any) => {
  setDeletingSale({
    id: sale.id,
    productName: sale.product?.name ?? sale.productName ?? 'this item',   // ✅ fallback
    quantity: sale.quantity,
  })
}
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm shadow-indigo-200 dark:shadow-indigo-900/40">
                <ShoppingCart size={17} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Sales</h1>
            </div>
            <p className="text-sm text-muted-foreground pl-12">
              {pagination
                ? `${pagination.total.toLocaleString('en-IN')} total transactions`
                : 'Loading…'}
              {listFetching && !listLoading && (
                <span className="ml-2 text-indigo-500 text-xs font-medium animate-pulse">• syncing</span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={downloading || listLoading || sales.length === 0}
              className="h-9 gap-2 text-sm font-medium"
            >
              {downloading ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button
              onClick={() => setShowModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 h-9 rounded-xl font-semibold shadow-sm shadow-indigo-200 dark:shadow-indigo-900/40"
            >
              <Plus size={15} />
              <span className="hidden sm:inline">Record Sale</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>
        </div>

        {/* ── 4 Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Revenue"
            value={fmt(summary.totalRevenue)}
            sub={isFiltered ? 'filtered period' : 'all time'}
            icon={TrendingUp}
            color="bg-emerald-500"
            loading={summaryLoading}
          />
          <StatCard
            label="Transactions"
            value={summary.totalTransactions.toLocaleString('en-IN')}
            icon={ShoppingCart}
            color="bg-indigo-500"
            loading={summaryLoading}
          />
          <StatCard
            label="Units Sold"
            value={summary.totalUnits.toLocaleString('en-IN')}
            icon={Package}
            color="bg-violet-500"
            loading={summaryLoading}
          />
          <StatCard
            label="Avg Order Value"
            value={fmt(summary.avgOrderValue)}
            icon={BarChart3}
            color="bg-rose-500"
            loading={summaryLoading}
          />
        </div>

        {/* ── Charts Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Monthly Revenue */}
          <Card className="lg:col-span-2 border-border shadow-sm bg-card">
            <CardHeader className="pb-2 px-5 pt-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-foreground">Month Wise Revenue</CardTitle>
                <Badge variant="secondary" className="text-[10px]">Last 6 months</Badge>
              </div>
            </CardHeader>
            <CardContent className="px-2 pb-4">
              {monthlyLoading ? (
                <Skeleton className="h-[220px] w-full rounded-xl" />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={monthly} barSize={32} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                      axisLine={false} tickLine={false}
                    />
                    <YAxis
                      tickFormatter={fmt}
                      tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                      axisLine={false} tickLine={false} width={55}
                    />
                    <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.08)', radius: 4 }} />
                    <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                      {monthly.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={entry.revenue < 0 ? '#f43f5e' : '#22c55e'}
                          opacity={i === monthly.length - 1 ? 1 : 0.75}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Yearly Revenue */}
          <Card className="border-border shadow-sm bg-card">
            <CardHeader className="pb-2 px-5 pt-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-foreground">Net Revenue Year Wise</CardTitle>
                <Badge variant="secondary" className="text-[10px]">FY</Badge>
              </div>
            </CardHeader>
            <CardContent className="px-2 pb-4">
              {yearlyLoading ? (
                <Skeleton className="h-[220px] w-full rounded-xl" />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={yearly} barSize={40} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                      axisLine={false} tickLine={false}
                    />
                    <YAxis
                      tickFormatter={fmt}
                      tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                      axisLine={false} tickLine={false} width={55}
                    />
                 <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.08)', radius: 4 }} />
                    <Bar dataKey="revenue" fill="#22c55e" radius={[6, 6, 0, 0]} opacity={0.85} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Treemap ── */}
       {/* ── Top Products / Branches Breakdown ── */}
<Card className="border-border shadow-sm bg-card">
  <CardHeader className="pb-2 px-5 pt-5">
    <div className="flex items-center justify-between flex-wrap gap-2">
      <CardTitle className="text-sm font-semibold text-foreground">
        Revenue Breakdown — {treemapView === 'products' ? 'Top Products' : 'By Branch'}
      </CardTitle>
      <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
        <button
          onClick={() => setTreemapView('products')}
          className={`text-xs px-3 py-1 rounded-md font-medium transition-all ${
            treemapView === 'products'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Products
        </button>
        <button
          onClick={() => setTreemapView('branches')}
          className={`text-xs px-3 py-1 rounded-md font-medium transition-all ${
            treemapView === 'branches'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Branches
        </button>
      </div>
    </div>
  </CardHeader>
  <CardContent className="px-4 pb-5">
    {breakdownLoading ? (
      <Skeleton className="h-[220px] w-full rounded-xl" />
    ) : treemapItems.length === 0 ? (
      <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
        No data available
      </div>
    ) : (
      <ResponsiveContainer width="100%" height={Math.max(200, treemapItems.length * 38)}>
        <BarChart
          data={treemapItems}
          layout="vertical"
          margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
        >
          <XAxis type="number" tickFormatter={fmt} tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="name"
            width={110}
            tick={{ fontSize: 11, fill: 'var(--foreground)', fontWeight: 500 }}
            axisLine={false} tickLine={false}
          />
          <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.08)' }} />
          <Bar dataKey="revenue" radius={[0, 6, 6, 0]} maxBarSize={28}>
            {treemapItems.map((_, i) => (
              <Cell key={i} fill={TREEMAP_COLORS[i % TREEMAP_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    )}
    {/* Legend */}
    {!breakdownLoading && treemapItems.length > 0 && (
      <div className="flex flex-wrap gap-2 mt-3">
        {treemapItems.slice(0, 6).map((item, i) => (
          <div key={item.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: TREEMAP_COLORS[i % TREEMAP_COLORS.length] }} />
            <span className="truncate max-w-[100px]">{item.name}</span>
          </div>
        ))}
      </div>
    )}
  </CardContent>
</Card>

        {/* ── Filters ── */}
        <Card className="border-border shadow-sm bg-card">
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="flex items-end gap-3 flex-1">
                <div className="flex-1 min-w-0 space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">From</Label>
                  <Input type="date" value={startDate}
                    onChange={(e) => handleDateFilter('start', e.target.value)}
                    className="h-9 text-sm" />
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">To</Label>
                  <Input type="date" value={endDate}
                    onChange={(e) => handleDateFilter('end', e.target.value)}
                    className="h-9 text-sm" />
                </div>
                {isFiltered && (
                  <Button variant="outline" size="icon" onClick={clearFilters}
                    className="h-9 w-9 text-muted-foreground hover:text-destructive hover:border-destructive/50 hover:bg-destructive/5 shrink-0">
                    <X size={13} />
                  </Button>
                )}
              </div>
              <Separator orientation="vertical" className="h-9 hidden sm:block" />
              <div className="flex items-center gap-2 shrink-0">
                {isFiltered && (
                  <Badge variant="secondary" className="bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/60 text-[11px] font-semibold">
                    Filtered
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Table ── */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-1">
            <p className="text-sm font-semibold text-foreground">
              {isFiltered ? 'Filtered Results' : 'All Transactions'}
            </p>
            {isFiltered && (
              <Badge variant="outline" className="text-[11px] text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/60 font-semibold">
                filtered
              </Badge>
            )}
          </div>
          <SalesTable
            sales={sales}
            isLoading={listLoading}
            page={page}
            totalPages={pagination?.pages ?? 1}
            total={pagination?.total ?? 0}
            limit={LIMIT}
            onPageChange={setPage}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
          />
        </div>

      </div>

      {showModal && <RecordSaleModal onClose={() => setShowModal(false)} />}

      {editingSale && (
        <RecordSaleModal
          editingSale={editingSale}
          onClose={() => setEditingSale(null)}
        />
      )}

      {deletingSale && (
        <DeleteSaleDialog
          sale={deletingSale}
          onClose={() => setDeletingSale(null)}
        />
      )}
    </div>
  )
}