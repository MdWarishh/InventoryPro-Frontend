'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Package, AlertTriangle, TrendingUp, Users,
  ArrowUpRight, ArrowDownRight, BarChart2,
  RefreshCw, Activity, Boxes, CheckCircle2,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
  BarChart, Bar,
} from 'recharts'
import { reportsService } from '@/services/reports.service'
import { productsService } from '@/services/products.service'
import { categoriesService } from '@/services/categories.service'
import { dealersService } from '@/services/dealers.service'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useBranchFilter } from '@/hooks/useBranchFilter'

// ── Formatters ────────────────────────────────────────────────────────────────
const fmtINR = (n: number) => {
  if (n >= 10_00_000) return `₹${(n / 10_00_000).toFixed(1)}L`
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(1)}K`
  return `₹${Math.round(n)}`
}
const fmtFull = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

// ── Stat Card ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  title: string
  value: string | number
  sub?: string
  icon: React.ReactNode
  iconBg: string
  trend?: { value: number; label: string }
  loading?: boolean
  accent?: string
}

function StatCard({ title, value, sub, icon, iconBg, trend, loading, accent }: StatCardProps) {
  return (
    <Card className={cn('relative overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5', accent && `border-l-2 ${accent}`)}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2 truncate">
              {title}
            </p>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-7 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            ) : (
              <>
                <p className="text-2xl font-black text-foreground tracking-tight tabular-nums">{value}</p>
                {trend ? (
                  <div className={cn(
                    'flex items-center gap-1 mt-1.5 text-xs font-semibold',
                    trend.value >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'
                  )}>
                    {trend.value >= 0
                      ? <ArrowUpRight className="w-3 h-3" />
                      : <ArrowDownRight className="w-3 h-3" />}
                    <span>{Math.abs(trend.value).toFixed(1)}% {trend.label}</span>
                  </div>
                ) : sub ? (
                  <p className="text-xs text-muted-foreground mt-1">{sub}</p>
                ) : null}
              </>
            )}
          </div>
          <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center shrink-0', iconBg)}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Custom Chart Tooltip ───────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-background border border-border rounded-xl shadow-lg px-3 py-2.5 text-sm">
      <p className="text-muted-foreground text-[11px] font-semibold mb-0.5">{label}</p>
      <p className="font-bold text-foreground tabular-nums">{fmtFull(payload[0]?.value ?? 0)}</p>
    </div>
  )
}

// ── Pie Colors ────────────────────────────────────────────────────────────────
const PIE_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#84cc16']

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth()
  const { branchId: globalBranchId } = useBranchFilter()

  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats,
    isFetching: statsFetching,
  } = useQuery({
    queryKey: ['dashboard-stats', globalBranchId],
  queryFn: () => reportsService.getDashboard({ branchId: globalBranchId || undefined }),
    staleTime: 2 * 60 * 1000,
  })

  const { data: salesReport, isLoading: salesLoading } = useQuery({
    queryKey: ['dashboard-sales-chart', globalBranchId],
    queryFn: () => {
      const endDate   = new Date().toISOString().split('T')[0]
      const startDate = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]
      return reportsService.getSales({ startDate, endDate, groupBy: 'day', branchId: globalBranchId || undefined })
    },
    staleTime: 5 * 60 * 1000,
  })

  const { data: categories, isLoading: catsLoading } = useQuery({
    queryKey: ['categories-dashboard'],
    queryFn: () => categoriesService.getAll(),
    staleTime: 10 * 60 * 1000,
  })

  const { data: dealersData } = useQuery({
    queryKey: ['dealers-count'],
    queryFn: () => dealersService.getAll({ limit: 1 }),
    staleTime: 10 * 60 * 1000,
  })

  const { data: allProducts, isLoading: brandsLoading } = useQuery({
    queryKey: ['products-brand-chart'],
    queryFn: () => productsService.getAll({ limit: 500 }),
    staleTime: 5 * 60 * 1000,
  })

  const { data: lowStockData, isLoading: lowStockLoading } = useQuery({
    queryKey: ['low-stock-dashboard', globalBranchId],
   queryFn: () => reportsService.getLowStock({ branchId: globalBranchId || undefined }),
    staleTime: 5 * 60 * 1000,
  })

  // ── Derived ───────────────────────────────────────────────────────────────
  const chartData = useMemo(() =>
    (salesReport?.chart ?? []).map((pt) => ({ ...pt, label: fmtDate(pt.date) })),
    [salesReport]
  )

  const pieData = useMemo(() =>
    (categories ?? []).map((cat, i) => ({
      name: cat.name,
      value: 1,
      color: (cat as any).color || PIE_COLORS[i % PIE_COLORS.length],
    })),
    [categories]
  )

  const recentActivity = useMemo(() => {
    const ins  = (stats?.recentStockIns  ?? []).map((s) => ({ ...s, type: 'IN'  as const }))
    const outs = (stats?.recentStockOuts ?? []).map((s) => ({ ...s, type: 'OUT' as const }))
    return [...ins, ...outs]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8)
  }, [stats])

  const monthTrend = useMemo(() => {
    const chart = salesReport?.chart ?? []
    if (chart.length < 4) return null
    const half   = Math.floor(chart.length / 2)
    const first  = chart.slice(0, half).reduce((s, d) => s + d.revenue, 0)
    const second = chart.slice(half).reduce((s, d) => s + d.revenue, 0)
    if (first === 0) return null
    return ((second - first) / first) * 100
  }, [salesReport])

  const lowStockList = Array.isArray(lowStockData) ? lowStockData : []

  const brandChartData = useMemo(() => {
    const products = allProducts?.products ?? []
    const map: Record<string, number> = {}
    products.forEach((p: any) => {
      const brand = p.brand || 'Unknown'
      map[brand] = (map[brand] || 0) + 1
    })
    return Object.entries(map)
      .map(([brand, count]) => ({ brand, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }, [allProducts])

  const totalStockValue = useMemo(() => {
    const products = allProducts?.products ?? []
    return products.reduce((sum: number, p: any) => {
      const stock = (p.productStocks ?? []).reduce((s: number, ps: any) => s + (ps.currentStock ?? 0), 0)
      return sum + stock * (p.purchasePrice ?? 0)
    }, 0)
  }, [allProducts])

  // ── Greeting ──────────────────────────────────────────────────────────────
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1400px] mx-auto">

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            {greeting},{' '}
            <span className="text-primary">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
         <div className="text-sm text-muted-foreground mt-0.5 flex items-center gap-2">
  Here's what's happening with your inventory today
  {user?.role && (
    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-bold uppercase tracking-wide">
      {user.role.replace(/_/g, ' ')}
    </Badge>
  )}
</div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetchStats()}
          disabled={statsFetching}
          className="gap-2 h-9 shrink-0"
        >
          <RefreshCw className={cn('w-3.5 h-3.5', statsFetching && 'animate-spin')} />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

      {/* ── 4 Primary Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Products"
          value={stats?.totalProducts ?? 0}
          sub={`${(stats?.totalStock ?? 0).toLocaleString('en-IN')} units in stock`}
          icon={<Package className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
          iconBg="bg-indigo-100 dark:bg-indigo-950/40"
          accent="border-l-indigo-400"
          loading={statsLoading}
        />
        <StatCard
          title="Low Stock Alerts"
          value={stats?.lowStockCount ?? 0}
          sub="items need restocking"
          icon={<AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
          iconBg="bg-amber-100 dark:bg-amber-950/40"
          accent="border-l-amber-400"
          loading={statsLoading}
        />
        <StatCard
          title="Sales This Month"
          value={fmtFull(stats?.monthSales?.amount ?? 0)}
          sub={`${stats?.monthSales?.count ?? 0} transactions`}
          icon={<TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
          iconBg="bg-emerald-100 dark:bg-emerald-950/40"
          accent="border-l-emerald-400"
          trend={monthTrend !== null && monthTrend !== undefined
            ? { value: monthTrend, label: 'vs last period' }
            : undefined}
          loading={statsLoading}
        />
        <StatCard
          title="Active Dealers"
          value={dealersData?.pagination?.total ?? '—'}
          sub="registered dealers"
          icon={<Users className="w-5 h-5 text-violet-600 dark:text-violet-400" />}
          iconBg="bg-violet-100 dark:bg-violet-950/40"
          accent="border-l-violet-400"
          loading={false}
        />
      </div>

      {/* ── Mini Stats Strip ── */}
     {/* ── Mini Stats Strip ── */}
<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
  {[
    {
      label: "Today's Revenue",
      value: fmtFull(stats?.todaySales?.amount ?? 0),
      sub: `${stats?.todaySales?.count ?? 0} orders today`,
      iconBg: 'bg-indigo-100 dark:bg-indigo-950/40',
      icon: <TrendingUp className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />,
      valueColor: 'text-indigo-600 dark:text-indigo-400',
    },
    {
      label: 'All Time Profit',
      value: fmtFull(stats?.totalProfit ?? 0),
      sub: `This month: ${fmtFull(stats?.monthProfit ?? 0)}`,
      iconBg: (stats?.totalProfit ?? 0) >= 0 ? 'bg-sky-100 dark:bg-sky-950/40' : 'bg-destructive/10',
      icon: (stats?.totalProfit ?? 0) >= 0
        ? <TrendingUp className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
        : <ArrowDownRight className="w-3.5 h-3.5 text-destructive" />,
      valueColor: (stats?.totalProfit ?? 0) >= 0 ? 'text-sky-600 dark:text-sky-400' : 'text-destructive',
    },
    {
      label: 'Month Revenue',
      value: fmtFull(stats?.monthSales?.amount ?? 0),
      sub: `${stats?.monthSales?.count ?? 0} transactions`,
      iconBg: 'bg-emerald-100 dark:bg-emerald-950/40',
      icon: <BarChart2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />,
      valueColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Total Stock Value',
      value: fmtFull(totalStockValue),
      sub: 'purchase price × stock',
      iconBg: 'bg-violet-100 dark:bg-violet-950/40',
      icon: <Boxes className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />,
      valueColor: 'text-violet-600 dark:text-violet-400',
      loading: brandsLoading,
    },
  ].map((item) => (
    <Card key={item.label} className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest truncate">{item.label}</p>
          <div className={cn('w-6 h-6 rounded-lg flex items-center justify-center shrink-0', item.iconBg)}>
            {item.icon}
          </div>
        </div>
        {(item.loading ?? statsLoading)
          ? <Skeleton className="h-6 w-20 mt-1" />
          : <p className={cn('text-lg font-black tabular-nums', item.valueColor)}>{item.value}</p>
        }
        <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{item.sub}</p>
      </CardContent>
    </Card>
  ))}
</div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Area Chart — Sales Overview */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-indigo-400" />
                  Sales Overview
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">Last 30 days revenue trend</CardDescription>
              </div>
              <div className="text-right shrink-0">
                <p className="text-lg font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
                  {fmtFull(salesReport?.summary?.totalRevenue ?? 0)}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {salesReport?.summary?.totalTransactions ?? 0} sales
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {salesLoading ? (
              <Skeleton className="h-48 w-full rounded-xl" />
            ) : chartData.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-muted-foreground gap-2">
                <BarChart2 className="w-8 h-8 opacity-20" />
                <p className="text-sm">No sales data yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={190}>
                <AreaChart data={chartData} margin={{ top: 4, right: 0, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="hsl(239 84% 67%)" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="hsl(239 84% 67%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false} tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false} tickLine={false}
                    tickFormatter={(v) => fmtFull(v)}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(239 84% 67%)"
                    strokeWidth={2.5}
                    fill="url(#salesGrad)"
                    dot={false}
                    activeDot={{ r: 4, fill: 'hsl(239 84% 67%)', strokeWidth: 2, stroke: 'hsl(var(--background))' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Pie Chart — Category Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold">Category Breakdown</CardTitle>
            <CardDescription className="text-xs">Products by category</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {catsLoading ? (
              <div className="flex justify-center items-center h-36">
                <Skeleton className="w-32 h-32 rounded-full" />
              </div>
            ) : pieData.length === 0 ? (
              <div className="h-36 flex items-center justify-center text-muted-foreground text-sm">
                No categories
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%" cy="50%"
                    innerRadius={38} outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="hsl(var(--background))" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8, border: '1px solid hsl(var(--border))',
                      background: 'hsl(var(--background))', fontSize: 12,
                    }}
                    formatter={(_v, name) => [name, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
            {/* Legend */}
            <div className="mt-2 space-y-1.5 max-h-28 overflow-y-auto pr-1">
              {pieData.map((cat, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="text-muted-foreground truncate flex-1">{cat.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Bottom Row: Low Stock + Recent Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Low Stock Alerts */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  Low Stock Alerts
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  {lowStockLoading ? '…' : `${lowStockList.length} items need restocking`}
                </CardDescription>
              </div>
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
                <Boxes className="w-4 h-4 text-amber-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {lowStockLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="px-5 py-3.5 flex items-center justify-between">
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-3.5 w-36" />
                      <Skeleton className="h-2.5 w-24" />
                    </div>
                    <Skeleton className="h-6 w-14 rounded-full ml-3" />
                  </div>
                ))
              ) : lowStockList.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center mx-auto mb-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  </div>
                  <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">All stock levels healthy</p>
                  <p className="text-xs text-muted-foreground mt-1">No restocking needed right now</p>
                </div>
              ) : (
                lowStockList.slice(0, 6).map((item: any) => {
                  const isZero     = item.currentStock === 0
                  const isCritical = item.currentStock <= 2
                  return (
                    <div
                      key={item.productId}
                      className="px-5 py-3.5 flex items-center justify-between hover:bg-muted/40 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground truncate">{item.productName}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                          <span className="font-mono">{item.sku}</span>
                          {item.category && item.category !== 'Uncategorized' && (
                            <>
                              <span className="opacity-30">·</span>
                              <span>{item.category}</span>
                            </>
                          )}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          'ml-3 tabular-nums shrink-0 text-xs font-bold',
                          isZero
                            ? 'border-destructive/30 bg-destructive/10 text-destructive'
                            : isCritical
                              ? 'border-orange-300 bg-orange-50 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-800'
                              : 'border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800'
                        )}
                      >
                        {item.currentStock} left
                      </Badge>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-primary" />
                  Recent Activity
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">Latest inventory movements</CardDescription>
              </div>
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <Activity className="w-4 h-4 text-primary" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {statsLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="px-5 py-3.5 flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-40" />
                      <Skeleton className="h-2.5 w-24" />
                    </div>
                    <Skeleton className="h-3 w-10 shrink-0" />
                  </div>
                ))
              ) : recentActivity.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                </div>
              ) : (
                recentActivity.map((item, i) => {
                  const isIn = item.type === 'IN'
                  const price = isIn
                    ? (item as any).purchasePrice ?? 0
                    : (item as any).sellingPrice   ?? 0
                  return (
                    <div
                      key={`${item.type}-${item.id}-${i}`}
                      className="px-5 py-3 flex items-center gap-3 hover:bg-muted/40 transition-colors"
                    >
                      {/* Icon */}
                      <div className={cn(
                        'w-8 h-8 rounded-xl flex items-center justify-center shrink-0',
                        isIn
                          ? 'bg-emerald-100 dark:bg-emerald-950/40'
                          : 'bg-red-100 dark:bg-red-950/40'
                      )}>
                        {isIn
                          ? <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          : <ArrowDownRight className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
                        }
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <span className={cn(
                            'font-semibold',
                            isIn ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
                          )}>
                            {isIn ? '+' : '-'}{item.quantity} units
                          </span>
                          {price > 0 && (
                            <>
                              <span className="opacity-30">·</span>
                              <span className="tabular-nums">{fmtFull(price * item.quantity)}</span>
                            </>
                          )}
                        </p>
                      </div>

                      {/* Date */}
                      <span className="text-[11px] text-muted-foreground shrink-0 tabular-nums">
                        {fmtDate(item.date)}
                      </span>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Brand / Manufacturer Chart */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <BarChart2 className="w-3.5 h-3.5 text-violet-500" />
                Products by Brand / Manufacturer
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">Kis company ke kitne products hain</CardDescription>
            </div>
            <Badge variant="secondary" className="text-xs">
              {brandChartData.length} brands
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {brandsLoading ? (
            <Skeleton className="h-56 w-full rounded-xl" />
          ) : brandChartData.length === 0 ? (
            <div className="h-56 flex flex-col items-center justify-center text-muted-foreground gap-2">
              <Package className="w-8 h-8 opacity-20" />
              <p className="text-sm">No brand data yet &mdash; add brand while creating products</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(220, brandChartData.length * 36)}>
              <BarChart data={brandChartData} layout="vertical" margin={{ top: 4, right: 24, left: -10, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="brand" width={100} tick={{ fontSize: 11, fill: 'hsl(var(--foreground))', fontWeight: 500 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid hsl(var(--border))', background: 'hsl(var(--background))', fontSize: 12 }}
                  formatter={(v: any) => [`${v} products`, 'Count']}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={28}>
                  {brandChartData.map((_: any, i: number) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

    </div>
  )
}