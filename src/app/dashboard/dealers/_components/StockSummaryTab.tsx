'use client'

import { useEffect, useState, useCallback } from 'react'
import { Package, TrendingUp, AlertCircle, Loader2, Plus, RefreshCw, BarChart3, Boxes } from 'lucide-react'
import { dealersService } from '@/services/dealers.service'
import type {
  StockSummaryItem,
  CreateDealerStockInPayload,
  CreateDealerStockOutPayload,
} from '@/types/dealers.types'
import GiveStockModal from './GiveStockModal'
import RecordSaleModal from './RecordSaleModal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface Props {
  dealerId: string
  dealerName: string
}

export default function StockSummaryTab({ dealerId, dealerName }: Props) {
  const [summary, setSummary] = useState<StockSummaryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [giveOpen, setGiveOpen] = useState(false)
  const [saleOpen, setSaleOpen] = useState(false)
  const [invoiceCount, setInvoiceCount] = useState(0)

const load = useCallback(async () => {
  try {
    setLoading(true)
    setError(null)
    const [stockRes, invoiceRes] = await Promise.all([
      dealersService.getStockSummary(dealerId),
      dealersService.getMainInvoices(dealerId),
    ])
    setSummary(stockRes.data.summary)
    setInvoiceCount(invoiceRes?.data?.invoices?.length ?? 0)
  } catch (e) {
    setError(e instanceof Error ? e.message : 'Failed to load')
  } finally {
    setLoading(false)
  }
}, [dealerId])

  useEffect(() => { load() }, [load])

  const handleGiveStock = async (data: CreateDealerStockInPayload) => {
    await dealersService.createStockIn(dealerId, data)
    setGiveOpen(false)
    load()
  }
  const handleRecordSale = async (data: CreateDealerStockOutPayload) => {
    await dealersService.createStockOut(dealerId, data)
    setSaleOpen(false)
    load()
  }

  const totalGiven = summary.reduce((s, i) => s + i.given, 0)
  const totalSold = summary.reduce((s, i) => s + i.sold, 0)
  const totalBalance = summary.reduce((s, i) => s + i.balance, 0)

  // Pie chart data
  const pieData = [
    { name: 'Sold', value: totalSold, color: 'hsl(142 71% 45%)' },
    { name: 'With Dealer', value: totalBalance, color: 'hsl(221 83% 53%)' },
  ].filter((d) => d.value > 0)

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <Skeleton className="h-56 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
        <AlertCircle size={15} className="shrink-0" />
        <span className="flex-1">{error}</span>
        <Button variant="ghost" size="sm" onClick={load} className="text-destructive hover:text-destructive shrink-0">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-5">

        {/* ── Action Bar ── */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => setGiveOpen(true)} className="gap-1.5">
              <Package className="w-3.5 h-3.5" />
              Give Stock
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSaleOpen(true)}
              disabled={totalBalance === 0 || loading}
              className="gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/40 disabled:opacity-40"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Record Sale
            </Button>
          </div>
          <Button variant="ghost" size="icon" onClick={load} className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>

        {summary.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-16 gap-3 text-center">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                <Package className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="font-semibold text-foreground">No stock assigned yet</p>
              <p className="text-sm text-muted-foreground max-w-xs">
                Click "Give Stock" to assign products to this dealer from your branch inventory
              </p>
              <Button size="sm" className="mt-2 gap-1.5" onClick={() => setGiveOpen(true)}>
                <Plus className="w-3.5 h-3.5" />
                Give First Stock
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* ── Stats Cards ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total Given', value: totalGiven, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50/50 border-blue-100 dark:bg-blue-950/20 dark:border-blue-900' },
                { label: 'Total Sold', value: totalSold, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50/50 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900' },
               {
  label: 'Sold in Month',
  value: summary.reduce((s, i) => s + i.soldInMonth, 0),
  color: 'text-violet-600 dark:text-violet-400',
  bg: 'bg-violet-50/50 border-violet-100 dark:bg-violet-950/20 dark:border-violet-900',
},
{
  label: 'Total Invoices',
  value: invoiceCount,
  color: 'text-rose-600 dark:text-rose-400',
  bg: 'bg-rose-50/50 border-rose-100 dark:bg-rose-950/20 dark:border-rose-900',
},
              ].map((s) => (
                <Card key={s.label} className={s.bg}>
                  <CardContent className="pt-4 pb-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">{s.label}</p>
                    <p className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* ── Chart + Table row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

              {/* Pie Chart */}
              {pieData.length > 0 && (
                <Card className="lg:col-span-1">
                  <CardHeader className="pb-0">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-violet-500" />
                      Stock Breakdown
                    </CardTitle>
                    <CardDescription className="text-xs">Sold vs remaining with dealer</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ borderRadius: 8, border: '1px solid hsl(var(--border))', background: 'hsl(var(--background))', fontSize: 12 }}
                        />
                        <Legend
                          iconType="circle"
                          iconSize={8}
                          wrapperStyle={{ fontSize: 12 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-1 text-center">
                      <p className="text-xs text-muted-foreground">
                        {totalGiven > 0 ? Math.round((totalSold / totalGiven) * 100) : 0}% sold overall
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Product Table */}
              <Card className={pieData.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Boxes className="w-4 h-4 text-blue-500" />
                    Product-wise Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/40 hover:bg-muted/40">
                          <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Product</TableHead>
                          <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Given</TableHead>
                          <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Sold</TableHead>
                          <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Balance</TableHead>
                          <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground min-w-[120px]">Sold %</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {summary.map(({ product, given, sold, balance }) => {
                          const pct = given > 0 ? Math.round((sold / given) * 100) : 0
                          return (
                            <TableRow key={product.id} className="hover:bg-muted/30">
                              <TableCell>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-semibold text-sm text-foreground">{product.name}</span>
                                  {product.sku && (
                                    <Badge variant="outline" className="font-mono text-[10px] px-1.5 py-0 h-4">
                                      {product.sku}
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-right tabular-nums text-sm text-blue-600 dark:text-blue-400 font-medium">
                                {given}
                              </TableCell>
                              <TableCell className="text-right tabular-nums text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                                {sold}
                              </TableCell>
                              <TableCell className="text-right">
                                <Badge
                                  variant={balance === 0 ? 'destructive' : balance < 5 ? 'outline' : 'secondary'}
                                  className={
                                    balance === 0
                                      ? ''
                                      : balance < 5
                                      ? 'border-amber-300 text-amber-700 bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:bg-amber-950/30'
                                      : 'text-foreground'
                                  }
                                >
                                  {balance}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Progress value={pct} className="h-1.5 flex-1" />
                                  <span className="text-xs text-muted-foreground tabular-nums w-8 text-right">{pct}%</span>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>

      <GiveStockModal
        open={giveOpen}
        onClose={() => setGiveOpen(false)}
        onSubmit={handleGiveStock}
        dealerName={dealerName}
      />
      <RecordSaleModal
        open={saleOpen}
        onClose={() => setSaleOpen(false)}
        onSubmit={handleRecordSale}
        dealerName={dealerName}
        dealerId={dealerId}
        stockSummary={summary}
      />
    </>
  )
}