'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  FileText, Plus, AlertCircle, Loader2, Eye,
  IndianRupee, TrendingUp, Receipt, ArrowUpRight,
} from 'lucide-react'
import { getAllInvoices } from '@/services/invoice.service'
import { dealersService } from '@/services/dealers.service'
import type { Dealer, MainInvoice } from '@/types/dealers.types'

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

// ─── Component ────────────────────────────────────────────────────────────────
export default function InvoicesTab({ dealerId: dealerIdProp, dealer }: InvoicesTabProps) {
  // Resolve the dealer id from whichever prop was passed
  const dealerId = dealerIdProp ?? dealer?.id ?? ''
  const dealerPhone = dealer?.phone

  const router = useRouter()

  const [invoices,    setInvoices]    = useState<MainInvoice[]>([])
  const [listLoading, setListLoading] = useState(true)
  const [listError,   setListError]   = useState<string | null>(null)

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
      // Fallback: search by phone
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
            <InvoiceRow key={inv.id} inv={inv} />
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

function InvoiceRow({ inv }: { inv: MainInvoice }) {
  const itemCount = inv.stockOuts?.length ?? 0

  return (
    <div className="
      group flex items-center justify-between gap-4 p-4 rounded-xl
      border border-border bg-card
      hover:border-primary/30 hover:shadow-sm
      transition-all duration-150
    ">
      {/* Left — invoice number + meta */}
      <div className="flex items-center gap-4 min-w-0">
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

      {/* Right — amount + view */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          <div className="text-sm font-bold text-foreground tabular-nums">{fmt(inv.totalAmount)}</div>
          {(inv.gstAmount ?? 0) > 0 && (
            <div className="text-[10px] text-muted-foreground mt-0.5">
              +{fmt(inv.gstAmount)} GST
            </div>
          )}
        </div>

        <button
          onClick={() => window.open(`/dashboard/invoices/${inv.id}`, '_blank')}
          title="View invoice"
          className="
            p-2 rounded-lg text-muted-foreground
            hover:text-primary hover:bg-primary/8
            active:scale-90
            transition-all duration-100
          "
        >
          <Eye size={15} />
        </button>
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