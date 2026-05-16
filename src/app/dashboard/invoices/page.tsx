'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getAllInvoices } from '@/services/invoice.service'
import type { Invoice } from '@/types/invoices.types'
import {
  Plus, Search, FileText, Calendar, User, IndianRupee,
  ChevronLeft, ChevronRight, Eye, RefreshCw
} from 'lucide-react'

export default function InvoicesPage() {
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1, limit: 20 })

  const fetchInvoices = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getAllInvoices({ page, limit: 20, search, startDate, endDate })
      setInvoices(res.invoices)
      setPagination(res.pagination)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [page, search, startDate, endDate])

  useEffect(() => { fetchInvoices() }, [fetchInvoices])

  const handleSearch = () => {
    setSearch(searchInput)
    setPage(1)
  }

  const handleReset = () => {
    setSearch('')
    setSearchInput('')
    setStartDate('')
    setEndDate('')
    setPage(1)
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

  const formatAmount = (n: number) =>
    new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2 }).format(n)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoices</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {pagination.total} total invoice{pagination.total !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard/invoices/create')}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            New Invoice
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search invoice no, customer..."
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm transition-colors"
              >
                Search
              </button>
            </div>

            {/* Date filters */}
            <div className="flex gap-2 items-center">
              <input
                type="date"
                value={startDate}
                onChange={e => { setStartDate(e.target.value); setPage(1) }}
                className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-gray-400 text-sm">to</span>
              <input
                type="date"
                value={endDate}
                onChange={e => { setEndDate(e.target.value); setPage(1) }}
                className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {(search || startDate || endDate) && (
                <button
                  onClick={handleReset}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  title="Reset filters"
                >
                  <RefreshCw size={15} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <FileText size={40} className="mb-3 opacity-40" />
              <p className="text-sm">No invoices found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">#</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Invoice No</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1"><User size={13} />Customer</span>
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1"><Calendar size={13} />Date</span>
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Items</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                      <span className="flex items-center justify-end gap-1"><IndianRupee size={13} />Amount</span>
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {invoices.map((inv, idx) => (
                    <tr
                      key={inv.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors cursor-pointer"
                      onClick={() => router.push(`/dashboard/invoices/${inv.id}`)}
                    >
                      <td className="px-4 py-3 text-gray-400 dark:text-gray-500">
                        {(page - 1) * 20 + idx + 1}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                          {inv.invoiceNumber}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 dark:text-white">{inv.customerName || '—'}</div>
                        {inv.customerPhone && (
                          <div className="text-xs text-gray-400">{inv.customerPhone}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                        {formatDate(inv.date)}
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                        {inv.stockOuts?.length ?? 0} item{(inv.stockOuts?.length ?? 0) !== 1 ? 's' : ''}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          ₹{formatAmount(inv.totalAmount)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={e => { e.stopPropagation(); router.push(`/dashboard/invoices/${inv.id}`) }}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded"
                          title="View invoice"
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
              <span className="text-sm text-gray-500">
                Page {pagination.page} of {pagination.pages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <ChevronLeft size={15} />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                  className="p-1.5 rounded border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}