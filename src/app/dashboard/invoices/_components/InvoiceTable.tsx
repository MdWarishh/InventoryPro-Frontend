'use client'

import { useRouter } from 'next/navigation'
import { Eye, Pencil, Trash2, Loader2, Building2 } from 'lucide-react'

// ── WhatsApp SVG Icon ─────────────────────────────────────────────────────────
function WhatsAppIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

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

// ── WhatsApp Message Handler ──────────────────────────────────────────────────
function openWhatsApp(inv: InvoiceRow) {
  if (!inv.customerPhone) return
  // Clean phone number — remove spaces, dashes, etc.
  const raw = inv.customerPhone.replace(/\D/g, '')
  // Add India country code if not present
  const phone = raw.startsWith('91') ? raw : `91${raw}`

  const amount = '₹' + new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2 }).format(inv.totalAmount)
  const message = `Thank you for visiting Limra Speech & Hearing Care Clinic. Your invoice has been generated and attached as a PDF.

💳 Payment Received: ${amount}
📄 Invoice No: ${inv.invoiceNumber}

If you have any questions or need support, feel free to contact us.

📞 Reception: 88026 66786
👩🏼‍💼 Customer Care: 9990374411
🚑 Emergency Support: 9999-241-243
📧 Email: contact@limrahearingcare.com
🌐 Website: www.limrahearingcare.com

Limra Speech & Hearing Care Clinic
Providing Better Hearing, Better Living 💙`

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
  window.open(url, '_blank')
}
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

                    {/* WhatsApp — only if phone number exists */}
                    {inv.customerPhone && (
                      <button
                        onClick={() => openWhatsApp(inv)}
                        title={`WhatsApp ${inv.customerPhone}`}
                        className="p-1.5 rounded-lg text-gray-400
                          hover:text-green-600 hover:bg-green-50
                          dark:hover:text-green-400 dark:hover:bg-green-900/30
                          transition-colors"
                      >
                        <WhatsAppIcon size={14} />
                      </button>
                    )}

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