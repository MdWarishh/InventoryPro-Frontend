'use client'

import { useRouter } from 'next/navigation'
import { Eye, Pencil, Trash2, Loader2, Building2 } from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────
interface StockOutSummary {
  id: string
  quantity: number
  product: { name: string }
}

export interface InvoiceRow {
  id: string
  invoiceNumber: string
  date: string
  customerName: string
  customerPhone?: string
  totalAmount: number
  discount: number
  paymentMode?: string
  dealerId?: string | null
  dealer?: { id: string; name: string } | null
  stockOuts: StockOutSummary[]
}

interface Props {
  invoices: InvoiceRow[]
  onDelete: (id: string) => void
  deletingId?: string | null
  currentPage: number
  limit: number
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

const fmtAmount = (n: number) =>
  '₹' + new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2 }).format(n)

function itemsSummary(stockOuts: StockOutSummary[]): string {
  if (!stockOuts?.length) return '—'
  const total = stockOuts.reduce((s, so) => s + so.quantity, 0)
  if (stockOuts.length === 1)
    return `${stockOuts[0].product.name} × ${stockOuts[0].quantity}`
  return `${stockOuts[0].product.name} +${stockOuts.length - 1} more (${total} qty)`
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function InvoiceTable({
  invoices, onDelete, deletingId, currentPage, limit,
}: Props) {
  const router = useRouter()

  const goToDetail = (id: string) => router.push(`/dashboard/invoices/${id}`)
  const goToEdit   = (id: string) => router.push(`/dashboard/invoices/${id}/edit`)

  if (!invoices.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-600">
        <p className="text-base font-medium">No invoices found</p>
        <p className="text-sm mt-1">Create your first invoice to get started</p>
      </div>
    )
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm border-collapse">

        {/* ── Head ─────────────────────────────────────────────────────────── */}
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 w-10">
              #
            </th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 w-[110px]">
              Date
            </th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 w-[140px]">
              Invoice #
            </th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
              Customer
            </th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 w-[190px]">
              Items
            </th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 w-[100px]">
              Payment
            </th>
            <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 w-[130px]">
              Amount
            </th>
            <th className="px-4 py-3 w-[100px]" />
          </tr>
        </thead>

        {/* ── Body ─────────────────────────────────────────────────────────── */}
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {invoices.map((inv, idx) => {
            const isDeleting  = deletingId === inv.id
            const isDealerInv = !!inv.dealerId
            const srNo        = (currentPage - 1) * limit + idx + 1

            return (
              <tr
                key={inv.id}
                onClick={() => goToDetail(inv.id)}
                className="group bg-white dark:bg-gray-950
                  hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10
                  cursor-pointer transition-colors"
              >
                {/* Sr # */}
                <td className="px-4 py-3.5 text-gray-400 dark:text-gray-600 text-xs">
                  {srNo}
                </td>

                {/* Date */}
                <td className="px-4 py-3.5 whitespace-nowrap text-gray-600 dark:text-gray-400 text-xs">
                  {fmtDate(inv.date)}
                </td>

                {/* Invoice # + dealer badge */}
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400 font-mono text-[13px]">
                      {inv.invoiceNumber}
                    </span>
                    {isDealerInv && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5
                        rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 whitespace-nowrap">
                        <Building2 size={9} /> Dealer
                      </span>
                    )}
                  </div>
                </td>

                {/* Customer */}
                <td className="px-4 py-3.5">
                  <div className="font-medium text-gray-900 dark:text-white truncate max-w-[170px]">
                    {inv.customerName || '—'}
                  </div>
                  {inv.customerPhone && (
                    <div className="text-xs text-gray-400 mt-0.5">{inv.customerPhone}</div>
                  )}
                </td>

                {/* Items summary */}
                <td className="px-4 py-3.5">
                  <span
                    className="text-gray-500 dark:text-gray-400 text-xs truncate block max-w-[185px]"
                    title={inv.stockOuts?.map(s => `${s.product.name} ×${s.quantity}`).join(', ')}
                  >
                    {itemsSummary(inv.stockOuts)}
                  </span>
                </td>

                {/* Payment mode */}
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium
                    bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                    {inv.paymentMode ?? 'Cash'}
                  </span>
                </td>

                {/* Amount */}
                <td className="px-4 py-3.5 text-right whitespace-nowrap">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {fmtAmount(inv.totalAmount)}
                  </span>
                  {inv.discount > 0 && (
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                      -{fmtAmount(inv.discount)} off
                    </div>
                  )}
                </td>

                {/* Actions — stop propagation so row click doesn't fire */}
                <td
                  className="px-4 py-3.5"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="flex items-center justify-end gap-0.5
                    opacity-100">

                    {/* View */}
                    <button
                      onClick={() => goToDetail(inv.id)}
                      title="View"
                      className="p-1.5 rounded-lg text-gray-400
                        hover:text-indigo-600 hover:bg-indigo-50
                        dark:hover:text-indigo-400 dark:hover:bg-indigo-900/30
                        transition-colors"
                    >
                      <Eye size={14} />
                    </button>

                    {/* Edit — dealer invoice edit nahi hoti */}
                    {!isDealerInv && (
                      <button
                        onClick={() => goToEdit(inv.id)}
                        title="Edit"
                        className="p-1.5 rounded-lg text-gray-400
                          hover:text-amber-600 hover:bg-amber-50
                          dark:hover:text-amber-400 dark:hover:bg-amber-900/30
                          transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                    )}

                    {/* Delete */}
                    <button
                      onClick={() => onDelete(inv.id)}
                      disabled={isDeleting}
                      title={isDealerInv ? 'Delete from dealer section' : 'Delete'}
                      className="p-1.5 rounded-lg text-gray-400
                        hover:text-red-600 hover:bg-red-50
                        dark:hover:text-red-400 dark:hover:bg-red-900/30
                        transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isDeleting
                        ? <Loader2 size={14} className="animate-spin" />
                        : <Trash2 size={14} />
                      }
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}