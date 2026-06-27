'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getInvoiceById, deleteInvoice } from '@/services/invoice.service'
import type { Invoice } from '@/types/invoices.types'
import { Printer, ChevronLeft, Loader2, Pencil, Trash2, AlertTriangle } from 'lucide-react'
import InvoiceDocument from '../_components/InvoiceDocument'

// ── WhatsApp SVG Icon ─────────────────────────────────────────────────────────
function WhatsAppIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

// ── WhatsApp Handler ──────────────────────────────────────────────────────────
function openWhatsApp(invoice: Invoice) {
  if (!invoice.customerPhone) return
  const raw   = invoice.customerPhone.replace(/\D/g, '')
  const phone = raw.startsWith('91') ? raw : `91${raw}`
  const amount = '₹' + new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2 }).format(invoice.totalAmount)

  const message = `Thank you for visiting Limra Speech & Hearing Care Clinic. Your invoice has been generated and attached as a PDF.

💳 Payment Received: ${amount}
📄 Invoice No: ${invoice.invoiceNumber}

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

// ── Delete confirm dialog ─────────────────────────────────────────────────────
function DeleteDialog({
  open, loading, onConfirm, onCancel,
}: {
  open: boolean; loading: boolean; onConfirm: () => void; onCancel: () => void
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200
        dark:border-gray-700 p-6 w-full max-w-sm mx-4">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center
            justify-center shrink-0">
            <AlertTriangle size={18} className="text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Delete Invoice?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              This will permanently delete the invoice and restore stock. This cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300
              bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
              rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white
              bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-60"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? 'Deleting...' : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router  = useRouter()
  const [invoice,  setInvoice]  = useState<Invoice | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    if (!id) return
    getInvoiceById(id).then(setInvoice).catch(console.error).finally(() => setLoading(false))
  }, [id])

  const handleDeleteConfirm = async () => {
    setDeleting(true)
    try {
      await deleteInvoice(id)
      router.push('/dashboard/invoices')
    } catch (e: any) {
      alert(e?.response?.data?.message ?? 'Failed to delete invoice.')
      setDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <Loader2 className="animate-spin text-indigo-600" size={32} />
    </div>
  )
  if (!invoice) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950
      text-gray-500 dark:text-gray-400">
      Invoice not found.
    </div>
  )

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ══ TOOLBAR ══════════════════════════════════════════════════════════ */}
      <div className="print:hidden bg-white dark:bg-gray-900
        border-b border-gray-200 dark:border-gray-800
        px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-50
        shadow-sm dark:shadow-none">

        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300
            hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ChevronLeft size={18} />
          <span className="hidden sm:inline">Back to Invoices</span>
          <span className="sm:hidden">Back</span>
        </button>

        <span className="hidden sm:block text-sm font-semibold text-gray-700 dark:text-gray-200
          bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg">
          {invoice.invoiceNumber}
        </span>

        <div className="flex items-center gap-2">
          {/* Delete */}
          <button
            onClick={() => setShowDeleteDialog(true)}
            disabled={deleting}
            title="Delete invoice"
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg
              border border-red-200 dark:border-red-800
              text-red-600 dark:text-red-400
              hover:bg-red-50 dark:hover:bg-red-900/20
              disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Trash2 size={14} />
            <span className="hidden sm:inline">Delete</span>
          </button>

          {/* Edit — dealer invoice edit nahi hoti */}
          {!invoice.dealerId && (
            <button
              onClick={() => router.push(`/dashboard/invoices/${id}/edit`)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg
                border border-indigo-200 dark:border-indigo-800
                text-indigo-600 dark:text-indigo-400
                hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
            >
              <Pencil size={14} />
              <span className="hidden sm:inline">Edit</span>
            </button>
          )}

          {/* WhatsApp — only if phone exists */}
          {invoice.customerPhone && (
            <button
              onClick={() => openWhatsApp(invoice)}
              title={`WhatsApp ${invoice.customerPhone}`}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg
                border border-green-200 dark:border-green-800
                text-green-600 dark:text-green-400
                hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
            >
              <WhatsAppIcon size={14} />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>
          )}

          {/* Print */}
          <button
           onClick={() => {
  const prev = document.title
  document.title = invoice.invoiceNumber
  window.print()
  document.title = prev
}}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700
              text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Printer size={14} />
            <span className="hidden sm:inline">Print / PDF</span>
            <span className="sm:hidden">Print</span>
          </button>
        </div>
      </div>

      {/* ══ OUTER WRAPPER ════════════════════════════════════════════════════ */}
      <div className="print:block bg-gray-100 dark:bg-gray-950 print:bg-white
        min-h-screen py-8 print:py-0 flex justify-center">
        <InvoiceDocument invoice={invoice} />
      </div>

      {/* ══ DELETE DIALOG ════════════════════════════════════════════════════ */}
      <DeleteDialog
        open={showDeleteDialog}
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteDialog(false)}
      />

      {/* ══ PRINT STYLES ═════════════════════════════════════════════════════ */}
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 0; }
          body { margin: 0; padding: 0; background: white !important; }
          body > *:not(:has(#invoice-root)) { display: none !important; }
          #invoice-root {
            position: fixed; inset: 0;
            width: 210mm; min-height: 297mm;
            margin: 0; padding: 10mm 10mm 0 10mm;
            box-shadow: none !important;
            display: flex; flex-direction: column;
            background: white !important;
          }
          #invoice-footer {
            margin-left: -10mm !important;
            margin-right: -10mm !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </>
  )
}