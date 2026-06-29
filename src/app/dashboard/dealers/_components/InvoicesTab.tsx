'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createRoot } from 'react-dom/client'
import { createPortal } from 'react-dom'
import {
  FileText, Plus, AlertCircle, Loader2, Eye,
  IndianRupee, TrendingUp, Receipt, ArrowUpRight,
  MoreVertical, Download, Pencil, Trash2,
} from 'lucide-react'
import { getAllInvoices, getInvoiceById, deleteInvoice } from '@/services/invoice.service'
import { dealersService } from '@/services/dealers.service'
import type { Dealer, MainInvoice } from '@/types/dealers.types'
import InvoiceDocument from '../../invoices/_components/InvoiceDocument'
// ↑ Adjust this relative path if InvoiceDocument lives elsewhere in your tree —
// it must point to the same component InvoiceTable.tsx imports.

// ─── Props ────────────────────────────────────────────────────────────────────
// Accepts either:
//   - dealerId: string  (passed from page.tsx as <InvoicesTab dealerId={id} />)
//   - dealer: Dealer    (legacy – kept for backward compat)

interface InvoicesTabProps {
  dealerId?: string
  dealer?: Pick<Dealer, 'id' | 'name' | 'phone' | 'email' | 'address' | 'gstNumber'>
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  '₹' + new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2 }).format(Number(n) || 0)

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

// ── product/manual-item name fallback (productId null ho sakta hai manual items ke liye) ──
const modelNamesSummary = (stockOuts: MainInvoice['stockOuts']): string => {
  if (!stockOuts?.length) return '—'
  return stockOuts.map(so => so.product?.name ?? so.productName ?? 'Unknown').join(', ')
}

// ─── WhatsApp icon ────────────────────────────────────────────────────────────
function WhatsAppIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

// ─── WhatsApp send ────────────────────────────────────────────────────────────
function openWhatsApp(inv: MainInvoice) {
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

// ─── PDF download (same logic as InvoiceTable.tsx) ───────────────────────────
async function downloadInvoicePDF(invoiceId: string, invoiceNumber: string) {
  if (typeof window === 'undefined') return

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

// ─── Component ────────────────────────────────────────────────────────────────
export default function InvoicesTab({ dealerId: dealerIdProp, dealer }: InvoicesTabProps) {
  const dealerId = dealerIdProp ?? dealer?.id ?? ''
  const dealerPhone = dealer?.phone

  const router = useRouter()

  const [invoices,    setInvoices]    = useState<MainInvoice[]>([])
  const [listLoading, setListLoading] = useState(true)
  const [listError,   setListError]   = useState<string | null>(null)
  const [deletingId,  setDeletingId]  = useState<string | null>(null)

  // ── Load invoices ───────────────────────────────────────────────────────────
  const loadInvoices = useCallback(async () => {
    if (!dealerId) { setListLoading(false); return }

    setListLoading(true)
    setListError(null)

    try {
      const res = await dealersService.getMainInvoices(dealerId)
      const list = res?.data?.invoices ?? (res as any)?.invoices ?? []
      setInvoices(list)
    } catch {
      try {
        if (dealerPhone) {
          const res = await getAllInvoices({ search: dealerPhone, limit: 50 })
          setInvoices(res.invoices as unknown as MainInvoice[])
        } else {
          setInvoices([])
        }
      } catch (e) {
        setListError(e instanceof Error ? e.message : 'Failed to load invoices')
      }
    } finally {
      setListLoading(false)
    }
  }, [dealerId, dealerPhone])

  useEffect(() => { loadInvoices() }, [loadInvoices])

  const handleGenerateInvoice = () => {
    if (!dealerId) return
    router.push(`/dashboard/invoices/create?dealerId=${dealerId}`)
  }

  // ── Delete handler — same deleteInvoice() used by the main invoices page ───
  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Delete this invoice? This action cannot be undone.')) return
    setDeletingId(id)
    try {
      await deleteInvoice(id)
      setInvoices(prev => prev.filter(inv => inv.id !== id))
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to delete invoice')
    } finally {
      setDeletingId(null)
    }
  }, [])

  const totalInvoiced = invoices.reduce((s, inv) => s + (Number(inv.totalAmount) || 0), 0)
  const avgInvoice    = invoices.length ? totalInvoiced / invoices.length : 0

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* ── Stats bar + Generate button ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">

        {/* Stats pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <StatPill icon={<IndianRupee size={12} />} label="Total invoiced" value={fmt(totalInvoiced)} accent="violet" />
          <StatPill icon={<Receipt size={12} />}     label="Invoices"       value={String(invoices.length)} accent="blue" />
          {invoices.length > 0 && (
            <StatPill icon={<TrendingUp size={12} />} label="Avg. value" value={fmt(avgInvoice)} accent="emerald" />
          )}
        </div>

        {/* Generate Invoice button */}
        <button
          onClick={handleGenerateInvoice}
          disabled={!dealerId}
          className="
            group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
            bg-primary text-primary-foreground shadow-sm
            hover:opacity-90 active:scale-[0.97]
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-all duration-150
          "
        >
          <span className="flex items-center justify-center w-5 h-5 rounded-md bg-white/20 group-hover:bg-white/30 transition-colors">
            <Plus size={13} strokeWidth={2.5} />
          </span>
          Generate Invoice
          <ArrowUpRight size={14} className="opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>

      {/* ── Content area ── */}
      {listLoading ? (
        <div className="flex items-center justify-center gap-2.5 py-16 text-muted-foreground text-sm">
          <Loader2 size={18} className="animate-spin" />
          Loading invoices…
        </div>

      ) : listError ? (
        <div className="flex items-center gap-2.5 text-destructive text-sm py-4 px-4 rounded-xl bg-destructive/5 border border-destructive/10">
          <AlertCircle size={16} className="shrink-0" />
          {listError}
        </div>

      ) : invoices.length === 0 ? (
        <EmptyState onGenerate={handleGenerateInvoice} />

      ) : (
        <div className="space-y-2">
          {invoices.map(inv => (
            <InvoiceRow
              key={inv.id}
              inv={inv}
              router={router}
              onDelete={handleDelete}
              isDeleting={deletingId === inv.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatPill({
  icon, label, value, accent,
}: {
  icon: React.ReactNode
  label: string
  value: string
  accent: 'violet' | 'blue' | 'emerald'
}) {
  const colors = {
    violet:  'bg-violet-50  text-violet-700  border-violet-100  dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-900',
    blue:    'bg-blue-50    text-blue-700    border-blue-100    dark:bg-blue-950/30   dark:text-blue-400   dark:border-blue-900',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900',
  }
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium ${colors[accent]}`}>
      {icon}
      <span className="opacity-70">{label}:</span>
      <span className="font-bold">{value}</span>
    </div>
  )
}

// ── 3-dot action dropdown — portal-based so it never gets clipped by an
// ancestor's overflow:hidden/auto (the dealer tab panel, card borders, etc.) ──
function ActionDropdown({
  inv, onDelete, isDeleting, onView, onEdit,
}: {
  inv: MainInvoice
  onDelete: (id: string) => void
  isDeleting: boolean
  onView: () => void
  onEdit: () => void
}) {
  const [open,        setOpen]        = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const isDealerInv = !!inv.dealerId

  const MENU_WIDTH = 176 // w-44

  const computePosition = useCallback(() => {
    const btn = btnRef.current
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    const viewportW = window.innerWidth
    const viewportH = window.innerHeight

    // Default: open below, right-aligned to the button
    let left = rect.right - MENU_WIDTH
    let top = rect.bottom + 4

    // Clamp horizontally so it never goes off-screen on small screens
    if (left < 8) left = 8
    if (left + MENU_WIDTH > viewportW - 8) left = viewportW - MENU_WIDTH - 8

    // Estimate menu height (rough, enough to decide flip direction) — recalculated
    // precisely after mount via menuRef below if needed.
    const estimatedMenuHeight = 230
    if (top + estimatedMenuHeight > viewportH - 8) {
      // Not enough room below — open upwards instead
      top = rect.top - estimatedMenuHeight - 4
      if (top < 8) top = 8
    }

    setCoords({ top, left })
  }, [])

  const toggleOpen = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (!open) computePosition()
    setOpen(v => !v)
  }, [open, computePosition])

  // Re-clamp once the menu is actually measured (more accurate than the estimate above)
  useEffect(() => {
    if (!open) return
    const menu = menuRef.current
    const btn = btnRef.current
    if (!menu || !btn) return

    const menuRect = menu.getBoundingClientRect()
    const btnRect = btn.getBoundingClientRect()
    const viewportH = window.innerHeight

    let top = btnRect.bottom + 4
    if (top + menuRect.height > viewportH - 8) {
      top = btnRect.top - menuRect.height - 4
      if (top < 8) top = 8
    }
    setCoords(prev => (prev ? { ...prev, top } : prev))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Close on outside click, scroll, or resize (so it never sits in a stale position)
  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    const handleClose = () => setOpen(false)

    document.addEventListener('mousedown', handleClick)
    window.addEventListener('scroll', handleClose, true)
    window.addEventListener('resize', handleClose)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      window.removeEventListener('scroll', handleClose, true)
      window.removeEventListener('resize', handleClose)
    }
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

  const menu = open && coords ? createPortal(
    <div
      ref={menuRef}
      style={{ position: 'fixed', top: coords.top, left: coords.left, width: MENU_WIDTH }}
      className="z-[9999]
        bg-white dark:bg-gray-900
        border border-gray-200 dark:border-gray-700
        rounded-xl shadow-xl overflow-hidden"
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
    </div>,
    document.body
  ) : null

  return (
    <div className="relative flex items-center justify-end">
      {downloading && (
        <Loader2 size={14} className="animate-spin text-indigo-500 mr-1.5 shrink-0" />
      )}

      <button
        ref={btnRef}
        onClick={toggleOpen}
        title="Actions"
        className="p-1.5 rounded-lg text-muted-foreground
          hover:text-foreground hover:bg-muted
          transition-colors"
      >
        <MoreVertical size={15} />
      </button>

      {menu}
    </div>
  )
}

function InvoiceRow({
  inv, router, onDelete, isDeleting,
}: {
  inv: MainInvoice
  router: ReturnType<typeof useRouter>
  onDelete: (id: string) => void
  isDeleting: boolean
}) {
  const itemCount = inv.stockOuts?.length ?? 0

  const goToDetail = () => router.push(`/dashboard/invoices/${inv.id}`)
  const goToEdit   = () => router.push(`/dashboard/invoices/${inv.id}/edit`)

  return (
    <div className="
      group flex items-center justify-between gap-4 p-4 rounded-xl
      border border-border bg-card
      hover:border-primary/30 hover:shadow-sm
      transition-all duration-150
    ">
      {/* Left — invoice number + meta */}
      <div
        className="flex items-center gap-4 min-w-0 flex-1 cursor-pointer"
        onClick={goToDetail}
      >
        {/* Icon */}
        <div className="
          w-9 h-9 rounded-lg shrink-0 flex items-center justify-center
          bg-primary/8 text-primary border border-primary/10
          group-hover:bg-primary/12 transition-colors
        ">
          <FileText size={15} />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-sm font-bold text-primary leading-none">
              {inv.invoiceNumber}
            </span>
            {inv.paymentMode && (
              <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground">
                {inv.paymentMode}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
            <span className="truncate max-w-[140px] font-medium text-foreground/80">{inv.customerName}</span>
            <span className="opacity-40">·</span>
            <span>{fmtDate(inv.date)}</span>
            <span className="opacity-40">·</span>
            <span>{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      {/* Right — amount + actions */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right cursor-pointer" onClick={goToDetail}>
          <div className="text-sm font-bold text-foreground tabular-nums">{fmt(inv.totalAmount)}</div>
          {(inv.gstAmount ?? 0) > 0 && (
            <div className="text-[10px] text-muted-foreground mt-0.5">
              +{fmt(inv.gstAmount)} GST
            </div>
          )}
        </div>

        <ActionDropdown
          inv={inv}
          onDelete={onDelete}
          isDeleting={isDeleting}
          onView={goToDetail}
          onEdit={goToEdit}
        />
      </div>
    </div>
  )
}

function EmptyState({ onGenerate }: { onGenerate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center border border-border">
        <FileText size={22} className="text-muted-foreground opacity-60" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">No invoices yet</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-[220px]">
          Generate your first invoice for this dealer to track billing history.
        </p>
      </div>
      <button
        onClick={onGenerate}
        className="
          inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
          border-2 border-dashed border-border text-muted-foreground
          hover:border-primary/50 hover:text-primary hover:bg-primary/5
          transition-all duration-150
        "
      >
        <Plus size={15} /> Generate Invoice
      </button>
    </div>
  )
}