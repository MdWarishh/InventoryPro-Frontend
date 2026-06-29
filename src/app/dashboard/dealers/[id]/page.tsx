'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Phone, Mail, MapPin, Hash,
  Building2, Package, TrendingUp, FileText,
  Pencil, AlertCircle, StickyNote, ChevronRight, Wallet,
} from 'lucide-react'
import { dealersService } from '@/services/dealers.service'
import type { Dealer, CreateDealerPayload } from '@/types/dealers.types'
import DealerFormModal from '../_components/DealerFormModal'
import StockSummaryTab from '../_components/StockSummaryTab'
import StockOutTab from '../_components/StockOutTab'
import InvoicesTab from '../_components/InvoicesTab'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
} from 'recharts'

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

export default function DealerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [dealer, setDealer] = useState<Dealer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [editLoading, setEditLoading] = useState(false)

  // ✅ Naya: cost vs revenue chart ke liye
  const [financials, setFinancials] = useState({ cost: 0, revenue: 0 })
  const [financialsLoading, setFinancialsLoading] = useState(true)

  const load = async () => {
    try {
      setLoading(true)
      const res = await dealersService.getById(id)
      setDealer(res.data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load dealer')
    } finally {
      setLoading(false)
    }
  }

 const loadFinancials = async () => {
  try {
    setFinancialsLoading(true)
    const [stockInRes, stockOutRes, mainInvoicesRes] = await Promise.all([
      dealersService.getStockInHistory(id as string, { limit: 1000 }),
      dealersService.getStockOutHistory(id as string, { limit: 1000 }),
      dealersService.getMainInvoices(id as string, { limit: 1000 }),
    ])

    // ✅ Direct "Record Sale" revenue (DealerStockOut table)
    const directRevenue = stockOutRes.data.totalAmount ?? 0

    // ✅ Invoice ke through hui revenue (StockOut linked to Invoice — manual + normal items)
    // mainInvoicesRes.data.totalAmount already invoice.totalAmount ka sum hai
    const invoiceRevenue = mainInvoicesRes.data.totalAmount ?? 0

    setFinancials({
      cost: stockInRes.data.totalAmount ?? 0,
      revenue: directRevenue + invoiceRevenue,
    })
  } catch (e) {
    console.error(e)
  } finally {
    setFinancialsLoading(false)
  }
}

  useEffect(() => { load(); loadFinancials() }, [id])

  const handleUpdate = async (data: CreateDealerPayload) => {
    if (!dealer) return
    setEditLoading(true)
    try {
      await dealersService.update(dealer.id, data)
      setEditOpen(false)
      load()
    } finally {
      setEditLoading(false)
    }
  }

  /* ── Loading State ── */
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-7 space-y-6">
        <Skeleton className="h-4 w-40" />
        <div className="flex items-center gap-4">
          <Skeleton className="w-14 h-14 rounded-xl shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-44 rounded-xl" />)}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    )
  }

  /* ── Error State ── */
  if (error || !dealer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center">
          <AlertCircle className="w-7 h-7 text-destructive" />
        </div>
        <p className="font-semibold text-foreground">{error || 'Dealer not found'}</p>
        <Button variant="outline" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="w-3.5 h-3.5" /> Go Back
        </Button>
      </div>
    )
  }

  const initials = dealer.name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
  const stockIns  = dealer._count?.stockIns  ?? 0
  const stockOuts = dealer._count?.stockOuts ?? 0
  const invoices  = dealer._count?.invoices  ?? 0

  /* Profit donut data */
  const profit = financials.revenue - financials.cost
  const pieData = [
    { name: 'Cost (Given)', value: financials.cost,    fill: 'hsl(221 83% 53%)' },
    { name: 'Revenue (Sold)', value: financials.revenue, fill: 'hsl(142 71% 45%)' },
  ]
  const hasFinancialData = financials.cost > 0 || financials.revenue > 0

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-7 space-y-6">

        {/* ── Breadcrumb ── */}
        <button
          onClick={() => router.push('/dashboard/dealers')}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Dealers
          <ChevronRight className="w-3 h-3 opacity-40" />
          <span className="text-foreground font-medium truncate max-w-[200px]">{dealer.name}</span>
        </button>

        {/* ── Profile Header ── */}
        <div className="flex items-start sm:items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg font-bold shrink-0 border border-primary/20">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold tracking-tight text-foreground">{dealer.name}</h1>
                <Badge
                  className={
                    dealer.isActive
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                      : 'bg-muted text-muted-foreground'
                  }
                  variant="outline"
                >
                  {dealer.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="flex items-center gap-4 flex-wrap mt-1.5">
                {dealer.city && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    {[dealer.city, dealer.state].filter(Boolean).join(', ')}
                  </span>
                )}
                {dealer.gstNumber && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                    <Hash className="w-3 h-3" />
                    {dealer.gstNumber}
                  </span>
                )}
              </div>
            </div>
          </div>
          <Button size="sm" onClick={() => setEditOpen(true)} className="gap-2 shrink-0">
            <Pencil className="w-3.5 h-3.5" />
            Edit Dealer
          </Button>
        </div>

        {/* ── Info Cards Grid — Contact + Profit Chart (Bank card removed) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Contact */}
          <Card>
            <CardHeader className="pb-2 pt-4 px-5">
              <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Phone className="w-3 h-3" /> Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-3">
              {dealer.phone && <InfoRow icon={<Phone className="w-3.5 h-3.5 text-primary" />} label="Phone" value={dealer.phone} />}
              {dealer.email && <InfoRow icon={<Mail className="w-3.5 h-3.5 text-primary" />} label="Email" value={dealer.email} />}
              {dealer.address && <InfoRow icon={<MapPin className="w-3.5 h-3.5 text-primary" />} label="Address" value={dealer.address} />}
              {!dealer.phone && !dealer.email && !dealer.address && (
                <p className="text-xs text-muted-foreground italic">No contact info added</p>
              )}

              {/* Notes callout moved here */}
              {dealer.notes && (
                <div className="mt-3 flex items-start gap-2 px-3 py-2.5 rounded-lg bg-amber-50 border border-amber-100 dark:bg-amber-950/20 dark:border-amber-900">
                  <StickyNote className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">{dealer.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ✅ Profit Donut Chart (replaces Bank Details) */}
          <Card>
            <CardHeader className="pb-0 pt-4 px-5">
              <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Wallet className="w-3 h-3" /> Revenue vs Cost
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-4">
              {financialsLoading ? (
                <div className="flex justify-center items-center h-28">
                  <Skeleton className="w-24 h-24 rounded-full" />
                </div>
              ) : !hasFinancialData ? (
                <div className="h-28 flex items-center justify-center text-xs text-muted-foreground">
                  No transactions yet
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%" cy="50%"
                          innerRadius={28} outerRadius={42}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {pieData.map((entry, i) => (
                            <Cell key={i} fill={entry.fill} stroke="hsl(var(--background))" strokeWidth={2} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            borderRadius: 8,
                            border: '1px solid hsl(var(--border))',
                            background: 'hsl(var(--background))',
                            fontSize: 11,
                          }}
                          formatter={(v: number, name: string) => [fmt(v), name]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Legend + Profit */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full shrink-0 bg-blue-500" />
                        <span className="text-xs text-muted-foreground">Cost</span>
                      </div>
                      <span className="text-xs font-bold tabular-nums text-foreground">{fmt(financials.cost)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full shrink-0 bg-emerald-500" />
                        <span className="text-xs text-muted-foreground">Revenue</span>
                      </div>
                      <span className="text-xs font-bold tabular-nums text-foreground">{fmt(financials.revenue)}</span>
                    </div>
                    <div className="pt-1.5 border-t border-border flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-foreground">Profit</span>
                      <span className={`text-xs font-bold tabular-nums ${profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}>
                        {fmt(profit)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Tabs ── */}
        <Card className="overflow-hidden">
          <Tabs defaultValue="stock">
            {/* Tab headers */}
            <div className="border-b bg-muted/30 px-2 overflow-x-auto">
              <TabsList className="h-auto bg-transparent p-0 gap-0 w-max">
                {[
                  { value: 'stock',     label: 'Stock Summary', Icon: Package,    count: stockIns > 0 ? stockIns : null },
                  { value: 'stockout',  label: 'Sales',         Icon: TrendingUp, count: null },
                  { value: 'invoices',  label: 'Invoices',      Icon: FileText,   count: invoices > 0 ? invoices : null },
                ].map(({ value, label, Icon, count }) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className="relative h-12 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-muted-foreground data-[state=active]:text-foreground gap-2 text-sm font-medium whitespace-nowrap transition-colors"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                    {count !== null && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary leading-none">
                        {count}
                      </span>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Tab content */}
            <div className="p-5 sm:p-6">
              <TabsContent value="stock" className="mt-0">
                <StockSummaryTab dealerId={id as string} dealerName={dealer.name} />
              </TabsContent>
              <TabsContent value="stockout" className="mt-0">
                <StockOutTab dealerId={id} />
              </TabsContent>
              <TabsContent value="invoices" className="mt-0">
                <InvoicesTab dealerId={id} />
              </TabsContent>
            </div>
          </Tabs>
        </Card>

      </div>

      <DealerFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSubmit={handleUpdate}
        dealer={dealer}
        loading={editLoading}
      />
    </>
  )
}

/* ── InfoRow helper ── */
function InfoRow({ icon, label, value, mono }: {
  icon: React.ReactNode; label: string; value: string; mono?: boolean
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</p>
        <p className={`text-sm font-medium text-foreground mt-0.5 break-all ${mono ? 'font-mono text-xs' : ''}`}>
          {value}
        </p>
      </div>
    </div>
  )
}