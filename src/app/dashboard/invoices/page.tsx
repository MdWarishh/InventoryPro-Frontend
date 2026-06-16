'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getAllInvoices, deleteInvoice } from '@/services/invoice.service'
import type { Invoice } from '@/types/invoices.types'
import InvoiceTable from './_components/InvoiceTable'
import { useBranchFilter } from '@/hooks/useBranchFilter'
import { useBranchStore } from '@/store/branch.store'
import {
  Plus, Search, FileText, ChevronLeft, ChevronRight, RefreshCw,
} from 'lucide-react'

function DeleteConfirmDialog({ open, onConfirm, onCancel, loading }: {
  open: boolean; onConfirm: () => void; onCancel: () => void; loading: boolean
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6 w-full max-w-sm mx-4">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Delete Invoice?</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          This will permanently delete the invoice and restore stock. This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-60">
            {loading && (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            )}
            {loading ? 'Deleting...' : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function InvoicesPage() {
  const router = useRouter()

  const [invoices,    setInvoices]    = useState<Invoice[]>([])
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [startDate,   setStartDate]   = useState('')
  const [endDate,     setEndDate]     = useState('')
  const [page,        setPage]        = useState(1)
  const [pagination,  setPagination]  = useState({ total: 0, pages: 1, page: 1, limit: 20 })
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [deletingId,     setDeletingId]     = useState<string | null>(null)

  // ← Branch filter
  const { branchId: globalBranchId } = useBranchFilter()
  const branches = useBranchStore((s) => s.branches)

  const fetchInvoices = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getAllInvoices({
        page, limit: 20, search, startDate, endDate,
        branchId: globalBranchId || undefined,  // ← add
      })
      setInvoices(res.invoices)
      setPagination(res.pagination)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [page, search, startDate, endDate, globalBranchId])  // ← add

  useEffect(() => { fetchInvoices() }, [fetchInvoices])

  // Branch change pe page + filters reset
  useEffect(() => {
    setPage(1)
    setSearch('')
    setSearchInput('')
    setStartDate('')
    setEndDate('')
  }, [globalBranchId])

  const handleSearch = () => { setSearch(searchInput); setPage(1) }
  const handleReset  = () => {
    setSearch(''); setSearchInput('')
    setStartDate(''); setEndDate(''); setPage(1)
  }

  const handleDeleteClick   = (id: string) => setDeleteTargetId(id)
  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return
    setDeletingId(deleteTargetId)
    setDeleteTargetId(null)
    try {
      await deleteInvoice(deleteTargetId)
      setInvoices(prev => prev.filter(inv => inv.id !== deleteTargetId))
      setPagination(prev => ({ ...prev, total: prev.total - 1 }))
    } catch (e: any) {
      alert(e?.response?.data?.message ?? 'Failed to delete invoice.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoices</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {pagination.total} total invoice{pagination.total !== 1 ? 's' : ''}
              {globalBranchId && (
                <span className="ml-2 text-indigo-500 font-medium">
                  · {branches.find(b => b.id === globalBranchId)?.name}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard/invoices/create')}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} /> New Invoice
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by invoice no, customer name, phone..."
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button onClick={handleSearch}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">
                Search
              </button>
            </div>
            <div className="flex gap-2 items-center flex-wrap">
              <input type="date" value={startDate}
                onChange={e => { setStartDate(e.target.value); setPage(1) }}
                className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-gray-400 text-sm">to</span>
              <input type="date" value={endDate}
                onChange={e => { setEndDate(e.target.value); setPage(1) }}
                className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {(search || startDate || endDate) && (
                <button onClick={handleReset} title="Clear filters"
                  className="p-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                  <RefreshCw size={15} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-28">
              <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-28 text-gray-400">
              <FileText size={40} className="mb-3 opacity-30" />
              <p className="text-sm font-medium">No invoices found</p>
              {(search || startDate || endDate) && (
                <button onClick={handleReset} className="mt-2 text-xs text-indigo-500 hover:underline">
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <InvoiceTable
              invoices={invoices}
              onDelete={handleDeleteClick}
              deletingId={deletingId}
              currentPage={page}
              limit={20}
            />
          )}

          {/* Pagination */}
          {!loading && pagination.pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, pagination.total)} of {pagination.total}
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <ChevronLeft size={15} />
                </button>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === pagination.pages || Math.abs(p - page) <= 1)
                  .reduce<(number | '...')[]>((acc, p, i, arr) => {
                    if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('...')
                    acc.push(p)
                    return acc
                  }, [])
                  .map((p, i) =>
                    p === '...' ? (
                      <span key={`dots-${i}`} className="px-1.5 text-gray-400 text-sm">…</span>
                    ) : (
                      <button key={p} onClick={() => setPage(p as number)}
                        className={`min-w-[32px] h-8 rounded-lg text-sm font-medium transition-colors ${page === p ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                        {p}
                      </button>
                    )
                  )}
                <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
                  className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <DeleteConfirmDialog
        open={!!deleteTargetId}
        loading={!!deletingId}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  )
}