  'use client'

  import { useEffect, useState, useCallback } from 'react'
  import { TrendingUp, AlertCircle, IndianRupee, Hash, Package, BarChart3, Tag, FileText } from 'lucide-react'
  import { dealersService } from '@/services/dealers.service'
  import type { StockOutEntry, MainInvoice } from '@/types/dealers.types'
  import { Badge } from '@/components/ui/badge'
  import { Skeleton } from '@/components/ui/skeleton'
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
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
  } from 'recharts'

  interface Props { dealerId: string }

  // ── Unified row type — DealerStockOut + Invoice StockOut dono handle karta hai ──
  interface SaleRow {
    id: string
    date: string
    productName: string
    productSku?: string
    branchName?: string
    quantity: number
    salePrice: number
    total: number
    serialNumbers: { id: string; serialNumber: string }[]
    source: 'dealer_sale' | 'invoice'   // kahan se aaya
    invoiceNumber?: string               // sirf invoice source ke liye
    invoiceId?: string
  }

  export default function StockOutTab({ dealerId }: Props) {
    const [rows, setRows] = useState<SaleRow[]>([])
    const [totalAmount, setTotalAmount] = useState(0)
    const [totalQty, setTotalQty] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const load = useCallback(async () => {
      try {
        setLoading(true)
        setError(null)

        // Dono sources parallel fetch karo
        const [stockOutRes, invoicesRes] = await Promise.all([
          dealersService.getStockOutHistory(dealerId, { limit: 500 }),
          dealersService.getMainInvoices(dealerId, { limit: 500 }),
        ])

        const combined: SaleRow[] = []

        // ── 1. DealerStockOut records ──────────────────────────────────────────
        for (const item of stockOutRes.data.history) {
          combined.push({
            id:            `so_${item.id}`,
            date:          item.date,
            productName:   item.product.name,
            productSku:    item.product.sku,
            branchName:    item.branch?.name,
            quantity:      item.quantity,
            salePrice:     item.salePrice,
            total:         item.salePrice * item.quantity,
            serialNumbers: item.serialNumbers ?? [],
            source:        'dealer_sale',
          })
        }

        // ── 2. Main Invoice StockOut records ──────────────────────────────────
    for (const inv of invoicesRes.data.invoices) {
    for (const so of inv.stockOuts) {
      combined.push({
        id:            `inv_${inv.id}_${so.id}`,
        date:          inv.date,
        // ✅ manual product items ke liye so.product null hoga — productName fallback
        productName:   so.product?.name ?? so.productName ?? 'Unknown product',
        productSku:    undefined,
        branchName:    undefined,
        quantity:      so.quantity,
        salePrice:     so.quantity > 0 ? Math.round(inv.totalAmount / inv.stockOuts.reduce((s, x) => s + x.quantity, 0)) : 0,
        total:         inv.totalAmount,
        serialNumbers: so.serialNumbers ?? [],
        source:        'invoice',
        invoiceNumber: inv.invoiceNumber,
        invoiceId:     inv.id,
      })
    }
  }

        // Date descending sort
        combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

        setRows(combined)

        // Totals
        const dealerSaleAmt  = stockOutRes.data.totalAmount ?? 0
        const invoiceAmt     = invoicesRes.data.totalAmount ?? 0
        const dealerSaleQty  = stockOutRes.data.totalQuantity ?? 0
        const invoiceQty     = invoicesRes.data.invoices.reduce(
          (s, inv) => s + inv.stockOuts.reduce((ss, so) => ss + so.quantity, 0), 0
        )

        setTotalAmount(dealerSaleAmt + invoiceAmt)
        setTotalQty(dealerSaleQty + invoiceQty)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load')
      } finally {
        setLoading(false)
      }
    }, [dealerId])

    useEffect(() => { load() }, [load])

    const fmt = (n: number) =>
      new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
    const fmtDate = (d: string) =>
      new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    const fmtShortDate = (d: string) =>
      new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })

    const chartData = [...rows]
      .slice(0, 10)
      .reverse()
      .map((row) => ({
        date:    fmtShortDate(row.date),
        revenue: row.total,
        qty:     row.quantity,
      }))

    const hasAnySerials = rows.some((r) => r.serialNumbers.length > 0)

    if (loading) {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
          <AlertCircle size={15} />
          {error}
        </div>
      )
    }

    return (
      <div className="space-y-5">

        {/* ── Summary Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-emerald-100 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-900">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{fmt(totalAmount)}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                  <IndianRupee className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-100 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">Transactions</p>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">{rows.length}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
                  <Hash className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-sky-100 bg-sky-50/50 dark:bg-sky-950/20 dark:border-sky-900">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">Units Sold</p>
                  <p className="text-2xl font-bold text-sky-600 dark:text-sky-400 tabular-nums">{totalQty}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {!rows.length ? (
          <Card>
            <CardContent className="flex flex-col items-center py-16 gap-3 text-center">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="font-semibold text-foreground">No sales recorded yet</p>
              <p className="text-sm text-muted-foreground">
                Record a sale or create a dealer invoice
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* ── Area Chart ── */}
            {chartData.length > 1 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-emerald-500" />
                    Sales Trend (Last {chartData.length} entries)
                  </CardTitle>
                  <CardDescription className="text-xs">Revenue across dealer sales + invoices</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(142 71% 45%)" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="hsl(142 71% 45%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                      <Tooltip
                        contentStyle={{ borderRadius: 8, border: '1px solid hsl(var(--border))', background: 'hsl(var(--background))', fontSize: 12 }}
                        formatter={(v: number) => [fmt(v), 'Revenue']}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="hsl(142 71% 45%)" strokeWidth={2} fill="url(#salesGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* ── Table ── */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">All Sales</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40 hover:bg-muted/40">
                        <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground w-28">Date</TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Product</TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Source</TableHead>
                        {hasAnySerials && (
                          <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Tag className="w-3 h-3" /> Serial No.
                            </div>
                          </TableHead>
                        )}
                        <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Qty</TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((row) => (
                        <TableRow key={row.id} className="hover:bg-muted/30">
                          <TableCell className="text-sm tabular-nums text-muted-foreground">{fmtDate(row.date)}</TableCell>

                          {/* Product */}
                          <TableCell>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm text-foreground">{row.productName}</span>
                              {row.productSku && (
                                <Badge variant="outline" className="font-mono text-[10px] px-1.5 py-0 h-4">
                                  {row.productSku}
                                </Badge>
                              )}
                            </div>
                          </TableCell>

                          {/* Source badge */}
                          <TableCell>
                            {row.source === 'invoice' ? (
                              <div className="flex items-center gap-1.5">
                                <Badge
                                  variant="outline"
                                  className="text-[10px] px-1.5 py-0 h-4 border-indigo-300 text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-700 gap-1"
                                >
                                  <FileText className="w-2.5 h-2.5" />
                                  {row.invoiceNumber}
                                </Badge>
                              </div>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-[10px] px-1.5 py-0 h-4 border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-700"
                              >
                                Direct Sale
                              </Badge>
                            )}
                          </TableCell>

                          {/* Serials */}
                          {hasAnySerials && (
                            <TableCell>
                              {row.serialNumbers.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {row.serialNumbers.map((s) => (
                                    <Badge
                                      key={s.id}
                                      variant="outline"
                                      className="font-mono text-[10px] px-1.5 py-0 h-5 text-violet-600 border-violet-200 bg-violet-50 dark:bg-violet-950/20 dark:text-violet-400 dark:border-violet-800"
                                    >
                                      {s.serialNumber}
                                    </Badge>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground/50">—</span>
                              )}
                            </TableCell>
                          )}

                          <TableCell className="text-right tabular-nums text-sm">{row.quantity}</TableCell>
                          <TableCell className="text-right tabular-nums text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                            {fmt(row.total)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    )
  }