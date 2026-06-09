'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getInvoiceById, deleteInvoice } from '@/services/invoice.service'
import type { Invoice } from '@/types/invoices.types'
import { Printer, ChevronLeft, Loader2, Pencil, Trash2, AlertTriangle } from 'lucide-react'

// ── WhatsApp SVG Icon ─────────────────────────────────────────────────────────
function WhatsAppIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

// ── Number to words (Indian system) ──────────────────────────────────────────
const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine',
  'Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen']
const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety']

function n2w(n: number): string {
  if (n === 0) return 'Zero'
  if (n < 20)  return ones[n]
  if (n < 100) return tens[Math.floor(n/10)] + (n%10 ? ' ' + ones[n%10] : '')
  if (n < 1000) return ones[Math.floor(n/100)] + ' Hundred' + (n%100 ? ' ' + n2w(n%100) : '')
  if (n < 100000) return n2w(Math.floor(n/1000)) + ' Thousand' + (n%1000 ? ' ' + n2w(n%1000) : '')
  if (n < 10000000) return n2w(Math.floor(n/100000)) + ' Lakh' + (n%100000 ? ' ' + n2w(n%100000) : '')
  return n2w(Math.floor(n/10000000)) + ' Crore' + (n%10000000 ? ' ' + n2w(n%10000000) : '')
}
function amountWords(amount: number): string {
  const r = Math.floor(amount)
  const p = Math.round((amount - r) * 100)
  return 'Indian Rupee ' + n2w(r) + (p > 0 ? ' and ' + n2w(p) + ' Paise' : '') + ' Only'
}

const inr = (n: number) =>
  new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2 }).format(n)
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })

const BD = '1px solid #bbb'
const ID = '1px solid #ccc'

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

  const s            = invoice.branch?.settings
  const primaryColor = s?.primaryColor ?? '#1a5c4a'
  const footerColor  = s?.footerColor  ?? primaryColor
  const invoiceDate  = fmtDate(invoice.date)

  const subtotal    = invoice.subtotal ?? invoice.stockOuts.reduce((sum, so) => sum + so.sellingPrice * so.quantity, 0)
  const totalAmount = invoice.totalAmount
  const discount    = invoice.discount ?? 0
  const gstAmount   = totalAmount - subtotal + discount

  function splitFooterLines(text: string | undefined): string[] {
    if (!text) return []
    const byNewline = text.split('\n').map(x => x.trim()).filter(Boolean)
    if (byNewline.length > 1) return byNewline
    const byPipe = text.split('|').map(x => x.trim()).filter(Boolean)
    if (byPipe.length > 1) return byPipe
    const byNumber = text.split(/(?=\d+\.\s)/).map(x => x.trim()).filter(Boolean)
    if (byNumber.length > 1) return byNumber
    return text.trim() ? [text.trim()] : []
  }
  const leftLines  = splitFooterLines(s?.invoiceFooter)
  const rightLines = splitFooterLines(s?.footerServices)

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

        {/* Invoice number badge */}
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
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700
              text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Printer size={14} />
            <span className="hidden sm:inline">Print / PDF</span>
            <span className="sm:hidden">Print</span>
          </button>
        </div>
      </div>

      {/* ══ OUTER WRAPPER — screen only ══════════════════════════════════════ */}
      <div className="print:block bg-gray-100 dark:bg-gray-950 print:bg-white
        min-h-screen py-8 print:py-0 flex justify-center">

        {/* ══ INVOICE PAPER — always white (for print) ══════════════════════ */}
        <div
          id="invoice-root"
          style={{
            width: '210mm',
            minHeight: '297mm',
            background: '#fff',
            fontFamily: s?.fontFamily ? `${s.fontFamily}, Arial, sans-serif` : 'Arial, sans-serif',
            fontSize: '11px',
            color: '#111',
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
            padding: '10mm 10mm 0 10mm',
          }}
          className="shadow-xl print:shadow-none"
        >
          <div
            id="invoice-box"
            style={{ flex: 1, display: 'flex', flexDirection: 'column', border: BD }}
          >

            {/* ══ 1. HEADER ══ */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px',
              padding: '12px 16px 10px', borderBottom: ID }}>
              <div style={{ width: '90px', height: '90px', flexShrink: 0 }}>
                {s?.logo
                  ? <img src={s.logo} alt="logo"
                      style={{ width: '90px', height: '90px', objectFit: 'contain' }} />
                  : <div style={{ width: '90px', height: '90px', background: '#f0f0f0',
                      borderRadius: '50%', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '9px', color: '#999' }}>LOGO</div>
                }
              </div>
              <div style={{ flex: 1, lineHeight: 1.55 }}>
                <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '2px' }}>
                  {s?.companyName ?? invoice.branch?.name ?? 'Company Name'}
                </div>
                {s?.address && s.address.split('\n').map((line, i) => (
                  <div key={i} style={{ color: '#333' }}>{line}</div>
                ))}
                {s?.state   && <div style={{ color: '#333' }}>{s.state}</div>}
                {s?.gstin   && <div style={{ color: '#333' }}>GSTIN {s.gstin}</div>}
                {s?.phone   && <div style={{ color: '#333' }}>{s.phone}</div>}
                {s?.email   && <div style={{ color: '#333' }}>{s.email}</div>}
                {s?.website && <div style={{ color: '#333' }}>{s.website}</div>}
              </div>
              <div style={{ flexShrink: 0, alignSelf: 'flex-end', paddingBottom: '6px' }}>
                <span style={{ fontSize: '26px', fontWeight: 800,
                  letterSpacing: '0.5px', color: '#111' }}>TAX INVOICE</span>
              </div>
            </div>

            {/* ══ 2. META ROW ══ */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr',
              borderBottom: ID, fontSize: '11px' }}>
              <div style={{ padding: '8px 16px', borderRight: ID, display: 'grid',
                gridTemplateColumns: 'auto 1fr', columnGap: '8px',
                rowGap: '2px', alignContent: 'start' }}>
                <span style={{ color: '#555' }}>#</span>
                <span style={{ fontWeight: 700 }}>: {invoice.invoiceNumber}</span>
                <span style={{ color: '#555' }}>Invoice Date</span>
                <span style={{ fontWeight: 700 }}>: {invoiceDate}</span>
                <span style={{ color: '#555' }}>Terms</span>
                <span style={{ fontWeight: 700 }}>: {s?.dueDateTerms ?? 'Due on Receipt'}</span>
                <span style={{ color: '#555' }}>Due Date</span>
                <span style={{ fontWeight: 700 }}>: {invoiceDate}</span>
              </div>
              <div style={{ padding: '8px 16px', display: 'grid',
                gridTemplateColumns: 'auto 1fr', columnGap: '8px',
                rowGap: '2px', alignContent: 'start' }}>
                <span style={{ color: '#555' }}>Place Of Supply</span>
                <span style={{ fontWeight: 700 }}>
                  : {s?.placeOfSupply ?? ''}{s?.placeOfSupplyCode ? ` (${s.placeOfSupplyCode})` : ''}
                </span>
              </div>
            </div>

            {/* ══ 3. CUSTOMER ══ */}
            <div style={{ padding: '8px 16px', borderBottom: ID,
              fontSize: '11px', lineHeight: 1.55 }}>
              {invoice.customerName    && <div style={{ fontWeight: 700 }}>{invoice.customerName}</div>}
              {invoice.customerAddress && <div style={{ color: '#333' }}>{invoice.customerAddress}</div>}
              {invoice.customerGST     && <div style={{ color: '#333' }}>GSTIN: {invoice.customerGST}</div>}
              {invoice.customerPhone   && <div style={{ color: '#333' }}>Ph: {invoice.customerPhone}</div>}
            </div>

            {/* ══ 4. ITEMS TABLE ══ */}
            <div style={{ flex: 1 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                  <tr style={{ background: '#f5f5f5', borderBottom: ID }}>
                    <th style={{ padding: '6px 10px', textAlign: 'left',   fontWeight: 700, width: '6%',  borderRight: ID }}>SNO.</th>
                    <th style={{ padding: '6px 10px', textAlign: 'left',   fontWeight: 700,               borderRight: ID }}>Item Name &amp; Description</th>
                    <th style={{ padding: '6px 10px', textAlign: 'center', fontWeight: 700, width: '10%', borderRight: ID }}>Qty</th>
                    <th style={{ padding: '6px 10px', textAlign: 'right',  fontWeight: 700, width: '14%', borderRight: ID }}>Rate</th>
                    <th style={{ padding: '6px 10px', textAlign: 'right',  fontWeight: 700, width: '14%' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.stockOuts.map((so, idx) => {
                    const amount  = so.sellingPrice * so.quantity
                    const serials = so.serialNumbers?.map(sn => sn.serialNumber).join(' / ')
                    return (
                      <tr key={so.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '7px 10px', verticalAlign: 'top',
                          color: '#555', borderRight: ID }}>{idx + 1}</td>
                        <td style={{ padding: '7px 10px', verticalAlign: 'top', borderRight: ID }}>
                          <div style={{ fontWeight: 500 }}>{so.product.name}</div>
                          {serials && (
                            <div style={{ color: '#666', fontSize: '10px', marginTop: '2px' }}>{serials}</div>
                          )}
                        </td>
                        <td style={{ padding: '7px 10px', textAlign: 'center',
                          verticalAlign: 'top', borderRight: ID }}>
                          {so.quantity}.00<br />
                          <span style={{ color: '#888', fontSize: '9px' }}>pcs</span>
                        </td>
                        <td style={{ padding: '7px 10px', textAlign: 'right',
                          verticalAlign: 'top', borderRight: ID }}>{inr(so.sellingPrice)}</td>
                        <td style={{ padding: '7px 10px', textAlign: 'right',
                          verticalAlign: 'top', fontWeight: 500 }}>{inr(amount)}</td>
                      </tr>
                    )
                  })}
                  {invoice.stockOuts.length < 3 &&
                    Array.from({ length: 3 - invoice.stockOuts.length }).map((_, i) => (
                      <tr key={`pad-${i}`} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px 10px', borderRight: ID }}>&nbsp;</td>
                        <td style={{ borderRight: ID }} />
                        <td style={{ borderRight: ID }} />
                        <td style={{ borderRight: ID }} />
                        <td />
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>

            {/* ══ 5. WORDS + TOTALS ══ */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px',
              borderTop: ID, fontSize: '11px' }}>
              <div style={{ padding: '8px 16px', borderRight: ID }}>
                <div style={{ color: '#555', marginBottom: '3px' }}>Total In Words</div>
                <div style={{ fontStyle: 'italic', fontWeight: 700, fontSize: '12px' }}>
                  {amountWords(invoice.totalAmount)}
                </div>
              </div>
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto',
                  borderBottom: '1px solid #e8e8e8' }}>
                  <div style={{ padding: '4px 10px', color: '#555' }}>Sub Total</div>
                  <div style={{ padding: '4px 12px', textAlign: 'right', color: '#333' }}>{inr(subtotal)}</div>
                </div>
                {gstAmount > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto',
                    borderBottom: '1px solid #e8e8e8' }}>
                    <div style={{ padding: '4px 10px', color: '#555' }}>GST</div>
                    <div style={{ padding: '4px 12px', textAlign: 'right', color: '#333' }}>{inr(gstAmount)}</div>
                  </div>
                )}
                {discount > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto',
                    borderBottom: '1px solid #e8e8e8' }}>
                    <div style={{ padding: '4px 10px', color: '#555' }}>Discount</div>
                    <div style={{ padding: '4px 12px', textAlign: 'right',
                      color: '#dc2626' }}>(-) {inr(discount)}</div>
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto',
                  borderBottom: '1px solid #e8e8e8', fontWeight: 700 }}>
                  <div style={{ padding: '4px 10px', color: '#111' }}>Total</div>
                  <div style={{ padding: '4px 12px', textAlign: 'right',
                    color: '#111' }}>{inr(totalAmount)}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto',
                  borderBottom: '1px solid #e8e8e8' }}>
                  <div style={{ padding: '4px 10px', color: '#555' }}>Paid Via</div>
                  <div style={{ padding: '4px 12px', textAlign: 'right',
                    color: '#111', fontWeight: 600 }}>{invoice.paymentMode ?? 'Cash'}</div>
                </div>
              </div>
            </div>

            {/* ══ 6. THANKS + BANK + SIGNATURE ══ */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto',
              borderTop: ID, fontSize: '11px' }}>
              <div style={{ padding: '10px 16px', borderRight: ID }}>
                <div style={{ color: '#555', marginBottom: '8px' }}>Thanks for Choosing Us.</div>
                {s?.bankAccountNumber && (
                  <>
                    <div style={{ fontWeight: 700, fontSize: '12px', marginBottom: '4px' }}>
                      Company's Bank Details A/c:- {s.companyName ?? invoice.branch?.name}
                    </div>
                    {s.bankAccountHolder && <div>Account Holder: <strong>{s.bankAccountHolder}</strong></div>}
                    {s.bankAccountNumber && <div>Account Number: <strong>{s.bankAccountNumber}</strong></div>}
                    {s.bankIFSC          && <div>IFSC: <strong>{s.bankIFSC}</strong></div>}
                    {s.bankBranch        && <div>Branch: {s.bankBranch}</div>}
                  </>
                )}
              </div>
              <div style={{ width: '160px', padding: '10px 16px', display: 'flex',
                flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end' }}>
                {s?.authorizedSignature
                  ? <img src={s.authorizedSignature} alt="sig"
                      style={{ height: '52px', objectFit: 'contain', marginBottom: '4px' }} />
                  : <div style={{ height: '52px', marginBottom: '4px' }} />
                }
                <div style={{ color: '#555', fontSize: '10px' }}>Authorized Signature</div>
              </div>
            </div>

            {/* ══ 7. TERMS + QR ══ */}
            {(s?.invoiceTerms || invoice.notes || s?.qrCodeImage) && (
              <div style={{ padding: '8px 16px 12px', borderTop: ID,
                fontSize: '10px', color: '#444' }}>
                {(s?.invoiceTerms || invoice.notes) && (
                  <div style={{ marginBottom: s?.qrCodeImage ? '10px' : 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '11px', marginBottom: '3px' }}>
                      Terms &amp; Conditions
                    </div>
                    {s?.invoiceTerms && (
                      <div style={{ whiteSpace: 'pre-line', lineHeight: 1.65 }}>{s.invoiceTerms}</div>
                    )}
                    {invoice.notes && <div style={{ marginTop: '4px' }}>{invoice.notes}</div>}
                  </div>
                )}
                {s?.qrCodeImage && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={s.qrCodeImage} alt="QR"
                      style={{ width: '72px', height: '72px', objectFit: 'contain' }} />
                    <span style={{ color: '#666' }}>Scan the QR code for Online Payments</span>
                  </div>
                )}
              </div>
            )}

          </div>{/* end invoice-box */}

          {/* ══ 8. FOOTER ══ */}
          <div
            id="invoice-footer"
            style={{
              background: footerColor,
              color: '#fff',
              padding: '10px 20px',
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr',
              alignItems: 'center',
              gap: '12px',
              fontSize: '11px',
              fontWeight: 700,
              marginLeft: '-10mm',
              marginRight: '-10mm',
            }}
          >
            <div style={{ borderLeft: '3px solid rgba(255,255,255,0.7)',
              paddingLeft: '10px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {leftLines.map((line, i) => (
                <span key={i} style={{ fontWeight: 700, fontSize: '11px', lineHeight: 1.4 }}>{line}</span>
              ))}
            </div>
            <div style={{ width: '68px', height: '68px', borderRadius: '50%', overflow: 'hidden',
              border: '2px solid rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {s?.logo && (
                <img src={s.logo} alt="logo"
                  style={{ width: '64px', height: '64px', objectFit: 'contain', borderRadius: '50%' }} />
              )}
            </div>
            <div style={{ borderRight: '3px solid rgba(255,255,255,0.7)',
              paddingRight: '10px', display: 'flex', flexDirection: 'column',
              gap: '3px', alignItems: 'flex-end' }}>
              {rightLines.map((line, i) => (
                <span key={i} style={{ fontWeight: 700, fontSize: '11px', lineHeight: 1.4 }}>{line}</span>
              ))}
            </div>
          </div>

        </div>{/* end invoice-root */}
      </div>

      {/* ══ DELETE DIALOG ══ */}
      <DeleteDialog
        open={showDeleteDialog}
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteDialog(false)}
      />

      {/* ══ PRINT STYLES ══ */}
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