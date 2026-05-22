'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, Download, ShoppingCart, TrendingUp, Loader2, X, BarChart3 } from 'lucide-react'
import { salesService } from '@/services/sales.service'
import { getStockHistory } from '@/services/stock.service'
import { useAuth } from '@/hooks/useAuth'
import { SalesTable } from './_components/SalesTable'
import { RecordSaleModal } from './_components/RecordSaleModal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

const LIMIT = 20

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

export default function SalesPage() {
  const { isBranchAdmin, isSuperAdmin } = useAuth()

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['sales', page, startDate, endDate],
    queryFn: () =>
      getStockHistory({
        type: 'out',
        page,
        limit: LIMIT,
      }),
    placeholderData: (prev) => prev,
  })

  const sales = data?.items ?? []
  const pagination = data?.pagination

  const totalRevenue = sales.reduce((sum, s) => sum + (s.sellingPrice ?? 0) * s.quantity, 0)
  const isFiltered = !!(startDate || endDate)

  const handleDownload = async () => {
    setDownloading(true)
    try {
      await salesService.downloadExcel({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      })
    } catch (e) {
      console.error('Download failed', e)
    } finally {
      setDownloading(false)
    }
  }

  const handleDateFilter = (field: 'start' | 'end', val: string) => {
    field === 'start' ? setStartDate(val) : setEndDate(val)
    setPage(1)
  }

  const clearFilters = () => {
    setStartDate('')
    setEndDate('')
    setPage(1)
  }

  return (
    <div className="min-h-screen bg-gray-50/40 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

        {/* ── Page Header ── */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-indigo-600 dark:bg-indigo-500 rounded-xl flex items-center justify-center shadow-sm shadow-indigo-200 dark:shadow-indigo-900/40">
                <ShoppingCart size={17} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">Sales</h1>
            </div>
            <p className="text-sm text-muted-foreground pl-12">
              {pagination
                ? `${pagination.total.toLocaleString('en-IN')} total transactions`
                : 'Loading...'}
              {isFetching && !isLoading && (
                <span className="ml-2 text-indigo-500 dark:text-indigo-400 text-xs font-medium animate-pulse">• syncing</span>
              )}
            </p>
          </div>

          <Button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white shadow-sm shadow-indigo-200 dark:shadow-indigo-900/40 gap-2 h-10 rounded-xl font-semibold"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">Record Sale</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* Revenue Card */}
          <Card className="sm:col-span-2 border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900">
            <CardContent className="p-5 flex items-center gap-5">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800/50 rounded-2xl flex items-center justify-center shrink-0">
                <TrendingUp size={22} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  {isFiltered ? 'Revenue (filtered)' : 'Page Revenue'}
                </p>
                <div className="flex items-end gap-3 mt-1">
                  {isLoading ? (
                    <div className="w-36 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
                  ) : (
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-50 tabular-nums tracking-tight">
                      {fmt(totalRevenue)}
                    </p>
                  )}
                  {!isLoading && sales.length > 0 && (
                    <span className="text-xs text-gray-400 dark:text-gray-500 mb-1 font-medium">{sales.length} sales</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-violet-50 dark:bg-violet-900/30 border border-violet-100 dark:border-violet-800/50 rounded-2xl flex items-center justify-center shrink-0">
                <BarChart3 size={20} className="text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Total Orders</p>
                {isLoading ? (
                  <div className="w-16 h-7 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-50 mt-1 tabular-nums">
                    {pagination?.total?.toLocaleString('en-IN') ?? '—'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Filters + Toolbar ── */}
        <Card className="border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900">
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">

              {/* Date Filters */}
              <div className="flex items-end gap-3 flex-1">
                <div className="flex-1 min-w-0 space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">From</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => handleDateFilter('start', e.target.value)}
                    className="h-9 text-sm border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-400"
                  />
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">To</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => handleDateFilter('end', e.target.value)}
                    className="h-9 text-sm border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-400"
                  />
                </div>
                {isFiltered && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={clearFilters}
                    className="h-9 w-9 border-gray-200 dark:border-gray-700 text-gray-400 hover:text-red-500 hover:border-red-200 dark:hover:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0"
                    title="Clear filters"
                  >
                    <X size={13} />
                  </Button>
                )}
              </div>

              <Separator orientation="vertical" className="h-9 hidden sm:block dark:bg-gray-700" />

              {/* Right side toolbar */}
              <div className="flex items-center gap-2 shrink-0">
                {isFiltered && (
                  <Badge variant="secondary" className="bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/60 font-semibold text-[11px]">
                    Filtered
                  </Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  disabled={downloading || isLoading || sales.length === 0}
                  className="h-9 gap-2 text-sm border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 font-medium"
                >
                  {downloading ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                  Export Excel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Table ── */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 px-1">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {isFiltered ? 'Filtered Results' : 'All Transactions'}
            </p>
            {isFiltered && (
              <Badge variant="outline" className="text-[11px] text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/60 dark:bg-indigo-900/30 font-semibold">
                filtered
              </Badge>
            )}
          </div>
          <SalesTable
            sales={sales}
            isLoading={isLoading}
            page={page}
            totalPages={pagination?.pages ?? 1}
            total={pagination?.total ?? 0}
            limit={LIMIT}
            onPageChange={setPage}
          />
        </div>

      </div>

      {/* ── Modal ── */}
      {showModal && <RecordSaleModal onClose={() => setShowModal(false)} />}
    </div>
  )
}