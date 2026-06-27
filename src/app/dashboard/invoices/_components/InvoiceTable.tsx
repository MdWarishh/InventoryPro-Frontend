'use client'

import { useRouter } from 'next/navigation'
import { Pencil, Trash2, Loader2, Building2, MoreVertical, Download, Eye } from 'lucide-react'
import { useState, useRef, useEffect, useCallback } from 'react'
import { createRoot } from 'react-dom/client'
import { getInvoiceById } from '@/services/invoice.service'
import InvoiceDocument from './InvoiceDocument'

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

// Model Name field ke liye — sab products comma se join
function modelNamesSummary(stockOuts: StockOutSummary[]): string {
  if (!stockOuts?.length) return '—'
  return stockOuts.map(so => so.product.name).join(', ')
}

// ── WhatsApp ──────────────────────────────────────────────────────────────────
function openWhatsApp(inv: InvoiceRow) {
  if (!inv.customerPhone) return
  const raw = inv.customerPhone.replace(/\D/g, '')
  const phone = raw.startsWith('91') ? raw : `91${raw}`
  const amount = '₹' + new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2 }).format(inv.totalAmount)
  const modelNames = modelNamesSummary(inv.stockOuts)

  const message = `Thank you for visiting Limra Speech & Hearing Care Clinic. Your invoice has been generated and attached as a PDF.

💳 Payment Received: ${amount}
📄 Invoice No: ${inv.invoiceNumber}
👤 Name - ${inv.customerName}
🎧 Model Name - ${modelNames}

If you have any questions or need support, feel free to contact us.

📞 Reception: 88026 66786
👩🏼‍💼 Customer Care: 9990374411
🚑 Emergency Support: 9999-241-243
📧 Email: contact@limrahearingcare.com
🌐 Website: www.limrahearingcare.com

Limra Speech & Hearing Care Clinic
Providing Better Hearing, Better Living 💙`

  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank')
}

// ── PDF Download ──────────────────────────────────────────────────────────────
async function downloadInvoicePDF(invoiceId: string, invoiceNumber: string) {
  const invoice = await getInvoiceById(invoiceId)

  const container = document.createElement('div')
  container.style.cssText =
    'position:fixed;left:-9999px;top:0;width:794px;background:white;z-index:-9999;visibility:hidden;'
  document.body.appendChild(container)

  const root = createRoot(container)

  await new Promise<void>(resolve => {
    root.render(<InvoiceDocument invoice={invoice} />)
    setTimeout(resolve, 700)
  })

  const el = container.querySelector('#invoice-root') as HTMLElement | null
  if (!el) {
    root.unmount()
    document.body.removeChild(container)
    alert('PDF generation failed. Please try again.')
    return
  }

  // footer negative margin fix for PDF capture
  const footer = el.querySelector('#invoice-footer') as HTMLElement | null
  if (footer) {
    footer.style.marginLeft = '0'
    footer.style.marginRight = '0'
  }

  const html2pdf = (await import('html2pdf.js')).default
  await html2pdf()
    .set({
      margin: 0,
      filename: `${invoiceNumber}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 794,
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    })
    .from(el)
    .save()

  root.unmount()
  document.body.removeChild(container)
}

// ── 3-dot Dropdown ────────────────────────────────────────────────────────────
interface DropdownProps {
  inv: InvoiceRow
  onDelete: (id: string) => void
  isDeleting: boolean
  onView: () => void
  onEdit: () => void
}

function ActionDropdown({ inv, onDelete, isDeleting, onView, onEdit }: DropdownProps) {
  const [open,        setOpen]        = useState(false)
  const [downloading, setDownloading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const isDealerInv = !!inv.dealerId

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleDownload = useCallback(async () => {
    setOpen(false)
    setDownloading(true)
    try {
      await downloadInvoicePDF(inv.id, inv.invoiceNumber)
    } catch (e) {
      console.error(e)
      alert('Download failed. Please try again.')
    } finally {
      setDownloading(false)
    }
  }, [inv.id, inv.invoiceNumber])

  return (
    <div ref={ref} className="relative flex items-center justify-end">
      {downloading && (
        <Loader2 size={14} className="animate-spin text-indigo-500 mr-1.5 shrink-0" />
      )}

      <button
        onClick={e => { e.stopPropagation(); setOpen(v => !v) }}
        title="Actions"
        className="p-1.5 rounded-lg text-gray-400
          hover:text-gray-700 hover:bg-gray-100
          dark:hover:text-gray-200 dark:hover:bg-gray-800
          transition-colors"
      >
        <MoreVertical size={15} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 z-50 w-44
            bg-white dark:bg-gray-900
            border border-gray-200 dark:border-gray-700
            rounded-xl shadow-lg overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={() => { setOpen(false); onView() }}
            className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm
              text-gray-700 dark:text-gray-300
              hover:bg-indigo-50 dark:hover:bg-indigo-900/20
              hover:text-indigo-600 dark:hover:text-indigo-400
              transition-colors"
          >
            <Eye size={13} className="shrink-0" />
            View Invoice
          </button>

          {inv.customerPhone && (
            <button
              onClick={() => { setOpen(false); openWhatsApp(inv) }}
              className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm
                text-gray-700 dark:text-gray-300
                hover:bg-green-50 dark:hover:bg-green-900/20
                hover:text-green-600 dark:hover:text-green-400
                transition-colors"
            >
              <WhatsAppIcon size={13} />
              Send WhatsApp
            </button>
          )}

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm
              text-gray-700 dark:text-gray-300
              hover:bg-blue-50 dark:hover:bg-blue-900/20
              hover:text-blue-600 dark:hover:text-blue-400
              transition-colors disabled:opacity-50"
          >
            <Download size={13} className="shrink-0" />
            {downloading ? 'Downloading...' : 'Download PDF'}
          </button>

          {!isDealerInv && (
            <button
              onClick={() => { setOpen(false); onEdit() }}
              className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm
                text-gray-700 dark:text-gray-300
                hover:bg-amber-50 dark:hover:bg-amber-900/20
                hover:text-amber-600 dark:hover:text-amber-400
                transition-colors"
            >
              <Pencil size={13} className="shrink-0" />
              Edit Invoice
            </button>
          )}

          <div className="border-t border-gray-100 dark:border-gray-800 my-0.5" />

          <button
            onClick={() => { setOpen(false); onDelete(inv.id) }}
            disabled={isDeleting}
            className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm
              text-red-500 dark:text-red-400
              hover:bg-red-50 dark:hover:bg-red-900/20
              hover:text-red-600 dark:hover:text-red-500
              transition-colors disabled:opacity-40"
          >
            {isDeleting
              ? <Loader2 size={13} className="animate-spin shrink-0" />
              : <Trash2 size={13} className="shrink-0" />
            }
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Main Table ────────────────────────────────────────────────────────────────
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
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 w-10">#</th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 w-[110px]">Date</th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 w-[140px]">Invoice #</th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">Customer</th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 w-[190px]">Items</th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 w-[100px]">Payment</th>
            <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 w-[130px]">Amount</th>
            <th className="px-4 py-3 w-[52px]" />
          </tr>
        </thead>
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
                <td className="px-4 py-3.5 text-gray-400 dark:text-gray-600 text-xs">{srNo}</td>
                <td className="px-4 py-3.5 whitespace-nowrap text-gray-600 dark:text-gray-400 text-xs">
                  {fmtDate(inv.date)}
                </td>
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
                <td className="px-4 py-3.5">
                  <div className="font-medium text-gray-900 dark:text-white truncate max-w-[170px]">
                    {inv.customerName || '—'}
                  </div>
                  {inv.customerPhone && (
                    <div className="text-xs text-gray-400 mt-0.5">{inv.customerPhone}</div>
                  )}
                </td>
                <td className="px-4 py-3.5">
                  <span
                    className="text-gray-500 dark:text-gray-400 text-xs truncate block max-w-[185px]"
                    title={inv.stockOuts?.map(s => `${s.product.name} ×${s.quantity}`).join(', ')}
                  >
                    {itemsSummary(inv.stockOuts)}
                  </span>
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium
                    bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                    {inv.paymentMode ?? 'Cash'}
                  </span>
                </td>
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
                <td
                  className="px-2 py-3.5"
                  onClick={e => e.stopPropagation()}
                >
                  <ActionDropdown
                    inv={inv}
                    onDelete={onDelete}
                    isDeleting={isDeleting}
                    onView={() => goToDetail(inv.id)}
                    onEdit={() => goToEdit(inv.id)}
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}