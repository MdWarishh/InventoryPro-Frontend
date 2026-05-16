'use client'
import { useState, useEffect } from 'react'
import type { GSTSummary, GSTR1Item, GSTR2Item, GSTFilter } from '@/types/reports.types'
import { reportsService } from '@/services/reports.service'
import FilterBar from './FilterBar'

interface Props {
  isSuperAdmin?: boolean
  branches?: { id: string; name: string }[]
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n)
const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-IN')

export default function GSTReport({ isSuperAdmin, branches }: Props) {
  const [data, setData] = useState<GSTSummary | GSTR1Item[] | GSTR2Item[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState<GSTFilter>({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    type: 'summary',
  })
  const [page, setPage] = useState(1)
  const PER_PAGE = 20

  useEffect(() => {
    if (!filters.month || !filters.year) return
    setLoading(true)
    reportsService.getGST(filters).then(setData).finally(() => setLoading(false))
  }, [filters])

  const isSummary = filters.type === 'summary'
  const isGSTR1 = filters.type === 'gstr1'
  const summary = isSummary ? (data as GSTSummary) : null
  const tableItems = isGSTR1 ? (data as GSTR1Item[]) || [] : (data as GSTR2Item[]) || []
  const totalPages = Math.ceil(tableItems.length / PER_PAGE)
  const paginated = !isSummary ? tableItems.slice((page - 1) * PER_PAGE, page * PER_PAGE) : []

  return (
    <div className="space-y-5">
      <FilterBar
        mode="gst"
        isSuperAdmin={isSuperAdmin}
        branches={branches}
        onFilterChange={f => { setFilters(f as GSTFilter); setPage(1) }}
      />

      {loading ? (
        <div className="flex items-center justify-center py-16 bg-white rounded-xl border border-gray-200">
          <div className="text-center">
            <svg className="animate-spin w-8 h-8 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm text-gray-500">Loading GST data...</p>
          </div>
        </div>
      ) : !data ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-200 text-gray-400">
          <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="mb-3 opacity-40">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          <p className="text-sm">Select month, year and type, then click Apply</p>
        </div>
      ) : (
        <>
          {/* Summary View */}
          {isSummary && summary && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Output Tax (Sales)</p>
                  <p className="text-2xl font-semibold text-blue-700 mt-1">{fmt(summary.outputTax)}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Input Tax (Purchase)</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">{fmt(summary.inputTax)}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Net GST Payable</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className={`text-2xl font-semibold ${summary.netPayable >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {fmt(Math.abs(summary.netPayable))}
                    </p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      summary.netPayable >= 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                    }`}>
                      {summary.netPayable >= 0 ? 'Payable' : 'Credit'}
                    </span>
                  </div>
                </div>
              </div>

              {summary.byRate.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-900">GST Breakdown by Rate</h3>
                  </div>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        {['GST Rate', 'Taxable Value', 'CGST', 'SGST', 'Total Tax'].map((h, i) => (
                          <th key={h} className={`px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide ${i === 0 ? 'text-left' : 'text-right'}`}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {summary.byRate.map(r => (
                        <tr key={r.rate} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-3.5">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-50 text-violet-700">
                              {r.rate}%
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-sm text-gray-600 text-right">{fmt(r.taxableValue)}</td>
                          <td className="px-5 py-3.5 text-sm text-gray-600 text-right">{fmt(r.cgst)}</td>
                          <td className="px-5 py-3.5 text-sm text-gray-600 text-right">{fmt(r.sgst)}</td>
                          <td className="px-5 py-3.5 text-sm font-semibold text-gray-900 text-right">{fmt(r.totalTax)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* GSTR-1 / GSTR-2 Table */}
          {!isSummary && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">
                  {isGSTR1 ? 'GSTR-1: Outward Supplies' : 'GSTR-2: Inward Supplies'}
                </h3>
                <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full font-medium">
                  {tableItems.length} records
                </span>
              </div>

              <div className="overflow-x-auto">
                {isGSTR1 ? (
                  <table className="w-full min-w-[1000px]">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        {['Invoice No', 'Date', 'Customer', 'GSTIN', 'HSN', 'Product', 'Qty', 'Taxable', 'Rate', 'CGST', 'SGST', 'Total Tax', 'Invoice Value'].map((h, i) => (
                          <th key={h} className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide ${i >= 6 ? 'text-right' : 'text-left'}`}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {(paginated as GSTR1Item[]).map((item, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-xs font-mono text-blue-600">{item.invoiceNumber}</td>
                          <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{fmtDate(item.invoiceDate)}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.customerName}</td>
                          <td className="px-4 py-3 text-xs font-mono text-gray-500">{item.customerGST}</td>
                          <td className="px-4 py-3 text-xs font-mono text-gray-600">{item.hsnCode}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.productName}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 text-right">{fmt(item.taxableValue)}</td>
                          <td className="px-4 py-3 text-right">
                            <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold bg-violet-50 text-violet-700 rounded-full">{item.gstRate}%</span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 text-right">{fmt(item.cgst)}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 text-right">{fmt(item.sgst)}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">{fmt(item.totalTax)}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">{fmt(item.invoiceValue)}</td>
                        </tr>
                      ))}
                      {paginated.length === 0 && (
                        <tr><td colSpan={13} className="px-5 py-12 text-center text-sm text-gray-400">No records found</td></tr>
                      )}
                    </tbody>
                  </table>
                ) : (
                  <table className="w-full min-w-[800px]">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        {['Date', 'Dealer', 'GSTIN', 'HSN', 'Product', 'Qty', 'Taxable', 'Rate', 'CGST', 'SGST', 'Total Tax'].map((h, i) => (
                          <th key={h} className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide ${i >= 5 ? 'text-right' : 'text-left'}`}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {(paginated as GSTR2Item[]).map((item, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{fmtDate(item.date)}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.dealerName}</td>
                          <td className="px-4 py-3 text-xs font-mono text-gray-500">{item.dealerGST}</td>
                          <td className="px-4 py-3 text-xs font-mono text-gray-600">{item.hsnCode}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.productName}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 text-right">{fmt(item.taxableValue)}</td>
                          <td className="px-4 py-3 text-right">
                            <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold bg-violet-50 text-violet-700 rounded-full">{item.gstRate}%</span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 text-right">{fmt(item.cgst)}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 text-right">{fmt(item.sgst)}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">{fmt(item.totalTax)}</td>
                        </tr>
                      ))}
                      {paginated.length === 0 && (
                        <tr><td colSpan={11} className="px-5 py-12 text-center text-sm text-gray-400">No records found</td></tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>

              {totalPages > 1 && (
                <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, tableItems.length)} of {tableItems.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >‹</button>
                    <span className="text-sm text-gray-600">{page} / {totalPages}</span>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >›</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}