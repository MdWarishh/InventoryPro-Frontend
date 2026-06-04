'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getInvoiceById, deleteInvoice } from '@/services/invoice.service'
import type { Invoice } from '@/types/invoices.types'
import { Printer, ChevronLeft, Loader2, Pencil, Trash2 } from 'lucide-react'

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

const inr = (n: number) => new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2 }).format(n)
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })

const BD = '1px solid #bbb'
const ID = '1px solid #ccc'


export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router  = useRouter()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)


  useEffect(() => {
    if (!id) return
    getInvoiceById(id).then(setInvoice).catch(console.error).finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <Loader2 className="animate-spin text-indigo-600" size={32} />
    </div>
  )
  if (!invoice) return (
    <div className="min-h-screen flex items-center justify-center text-gray-500">Invoice not found.</div>
  )

  const s            = invoice.branch?.settings
  const primaryColor = s?.primaryColor ?? '#1a5c4a'
  const footerColor  = s?.footerColor  ?? primaryColor
  const invoiceDate  = fmtDate(invoice.date)

  const subtotal    = invoice.subtotal ?? invoice.stockOuts.reduce((sum, so) => sum + so.sellingPrice * so.quantity, 0)
  const totalAmount = invoice.totalAmount
  const discount    = invoice.discount ?? 0
  const gstAmount   = totalAmount - subtotal + discount

  // ── Footer: left = invoiceFooter lines, right = footerServices lines ──────
  // Smart split: handles \n, pipe |, or numbered "1. 2. 3." patterns
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
 

  const handleDelete = async () => {
  if (!confirm('Are you sure? This will restore stock and cannot be undone.')) return
  setDeleting(true)
  try {
    await deleteInvoice(id)
    router.push('/dashboard/invoices')
  } catch (e: any) {
    alert(e?.response?.data?.message ?? 'Failed to delete invoice.')
    setDeleting(false)
  }
}

  return (
    <>
      {/* ── Screen toolbar ── */}
      <div className="print:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800
        px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <button onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 transition-colors">
          <ChevronLeft size={18} /> Back to Invoices
        </button>
          <div className="flex items-center gap-2">
    {/* Delete button */}
    <button
      onClick={handleDelete}
      disabled={deleting || !!invoice.dealerId}  // dealer invoice delete allowed hai
      title={invoice.dealerId ? 'Delete from dealer section' : 'Delete invoice'}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border
        border-red-200 dark:border-red-800 text-red-600 dark:text-red-400
        hover:bg-red-50 dark:hover:bg-red-900/20
        disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
    >
      {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
      Delete
    </button>

    {/* Edit button — dealer invoice edit nahi hoti abhi */}
    {!invoice.dealerId && (
      <button
        onClick={() => router.push(`/dashboard/invoices/${id}/edit`)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border
          border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400
          hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
      >
        <Pencil size={15} /> Edit
      </button>
    )}

        <button onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
          <Printer size={16} /> Print / Save PDF
        </button>
      </div>
      </div>

      <div className="print:block bg-gray-200 print:bg-white min-h-screen py-8 print:py-0 flex justify-center">
        <div
          id="invoice-root"
          style={{
            width: '210mm', minHeight: '297mm', background: '#fff',
            fontFamily: s?.fontFamily ? `${s.fontFamily}, Arial, sans-serif` : 'Arial, sans-serif',
            fontSize: '11px', color: '#111',
            display: 'flex', flexDirection: 'column',
            boxSizing: 'border-box', padding: '10mm 10mm 0 10mm',
          }}
          className="shadow-2xl print:shadow-none"
        >
          <div id="invoice-box" style={{ flex: 1, display: 'flex', flexDirection: 'column', border: BD }}>

            {/* ══ 1. HEADER ══ */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '12px 16px 10px', borderBottom: ID }}>
              <div style={{ width: '90px', height: '90px', flexShrink: 0 }}>
                {s?.logo
                  ? <img src={s.logo} alt="logo" style={{ width: '90px', height: '90px', objectFit: 'contain' }} />
                  : <div style={{ width: '90px', height: '90px', background: '#f0f0f0', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#999' }}>LOGO</div>
                }
              </div>
              <div style={{ flex: 1, lineHeight: 1.55 }}>
                <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '2px' }}>
                  {s?.companyName ?? invoice.branch?.name ?? 'Company Name'}
                </div>
                {s?.address && s.address.split('\n').map((line, i) => (
                  <div key={i} style={{ color: '#333' }}>{line}</div>
                ))}
                {s?.state    && <div style={{ color: '#333' }}>{s.state}</div>}
                {s?.gstin    && <div style={{ color: '#333' }}>GSTIN {s.gstin}</div>}
                {s?.phone    && <div style={{ color: '#333' }}>{s.phone}</div>}
                {s?.email    && <div style={{ color: '#333' }}>{s.email}</div>}
                {s?.website  && <div style={{ color: '#333' }}>{s.website}</div>}
              </div>
              <div style={{ flexShrink: 0, alignSelf: 'flex-end', paddingBottom: '6px' }}>
                <span style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '0.5px', color: '#111' }}>TAX INVOICE</span>
              </div>
            </div>

            {/* ══ 2. META ROW ══ */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: ID, fontSize: '11px' }}>
              <div style={{ padding: '8px 16px', borderRight: ID, display: 'grid',
                gridTemplateColumns: 'auto 1fr', columnGap: '8px', rowGap: '2px', alignContent: 'start' }}>
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
                gridTemplateColumns: 'auto 1fr', columnGap: '8px', rowGap: '2px', alignContent: 'start' }}>
                <span style={{ color: '#555' }}>Place Of Supply</span>
                <span style={{ fontWeight: 700 }}>
                  : {s?.placeOfSupply ?? ''}{s?.placeOfSupplyCode ? ` (${s.placeOfSupplyCode})` : ''}
                </span>
              </div>
            </div>

            {/* ══ 3. CUSTOMER ══ */}
            <div style={{ padding: '8px 16px', borderBottom: ID, fontSize: '11px', lineHeight: 1.55 }}>
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
                    <th style={{ padding: '6px 10px', textAlign: 'left',   fontWeight: 700,               borderRight: ID }}>Item Name &amp; Discription</th>
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
                        <td style={{ padding: '7px 10px', verticalAlign: 'top', color: '#555', borderRight: ID }}>{idx + 1}</td>
                        <td style={{ padding: '7px 10px', verticalAlign: 'top', borderRight: ID }}>
                          <div style={{ fontWeight: 500 }}>{so.product.name}</div>
                          {serials && <div style={{ color: '#666', fontSize: '10px', marginTop: '2px' }}>{serials}</div>}
                        </td>
                        <td style={{ padding: '7px 10px', textAlign: 'center', verticalAlign: 'top', borderRight: ID }}>
                          {so.quantity}.00<br />
                          <span style={{ color: '#888', fontSize: '9px' }}>pcs</span>
                        </td>
                        <td style={{ padding: '7px 10px', textAlign: 'right', verticalAlign: 'top', borderRight: ID }}>{inr(so.sellingPrice)}</td>
                        <td style={{ padding: '7px 10px', textAlign: 'right', verticalAlign: 'top', fontWeight: 500 }}>{inr(amount)}</td>
                      </tr>
                    )
                  })}
                  {invoice.stockOuts.length < 3 && Array.from({ length: 3 - invoice.stockOuts.length }).map((_, i) => (
                    <tr key={`pad-${i}`} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px 10px', borderRight: ID }}>&nbsp;</td>
                      <td style={{ borderRight: ID }} /><td style={{ borderRight: ID }} />
                      <td style={{ borderRight: ID }} /><td />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ══ 5. WORDS + TOTALS ══ */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', borderTop: ID, fontSize: '11px' }}>
              <div style={{ padding: '8px 16px', borderRight: ID }}>
                <div style={{ color: '#555', marginBottom: '3px' }}>Total In Words</div>
                <div style={{ fontStyle: 'italic', fontWeight: 700, fontSize: '12px' }}>
                  {amountWords(invoice.totalAmount)}
                </div>
              </div>
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', borderBottom: '1px solid #e8e8e8' }}>
                  <div style={{ padding: '4px 10px', color: '#555' }}>Sub Total</div>
                  <div style={{ padding: '4px 12px', textAlign: 'right', color: '#333' }}>{inr(subtotal)}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', borderBottom: '1px solid #e8e8e8', fontWeight: 700 }}>
                  <div style={{ padding: '4px 10px', color: '#111' }}>Total</div>
                  <div style={{ padding: '4px 12px', textAlign: 'right', color: '#111' }}>{inr(totalAmount)}</div>
                </div>
                {gstAmount > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', borderBottom: '1px solid #e8e8e8' }}>
                    <div style={{ padding: '4px 10px', color: '#555' }}>GST</div>
                    <div style={{ padding: '4px 12px', textAlign: 'right', color: '#333' }}>{inr(gstAmount)}</div>
                  </div>
                )}
                {discount > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', borderBottom: '1px solid #e8e8e8' }}>
                    <div style={{ padding: '4px 10px', color: '#555' }}>Discount</div>
                    <div style={{ padding: '4px 12px', textAlign: 'right', color: '#dc2626' }}>(-) {inr(discount)}</div>
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', borderBottom: '1px solid #e8e8e8', fontWeight: 700 }}>
                  <div style={{ padding: '4px 10px', color: '#111' }}>Paid Via</div>
                  <div style={{ padding: '4px 12px', textAlign: 'right', color: '#111' }}>
                   {invoice.paymentMode ?? 'Cash'}
                  </div>
                </div>
              </div>
            </div>

            {/* ══ 6. THANKS + BANK + SIGNATURE ══ */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', borderTop: ID, fontSize: '11px' }}>
              <div style={{ padding: '10px 16px', borderRight: ID }}>
                <div style={{ color: '#555', marginBottom: '8px' }}>Thanks for Choosing Us.</div>
                {s?.bankAccountNumber && (
                  <>
                    <div style={{ fontWeight: 700, fontSize: '12px', marginBottom: '4px' }}>
                      Company's Bank Details A/c:- <span>{s.companyName ?? invoice.branch?.name}</span>
                    </div>
                    {s.bankAccountHolder && <div>Account Holder: <strong>{s.bankAccountHolder}</strong></div>}
                    {s.bankAccountNumber && <div>Account Number: <strong>{s.bankAccountNumber}</strong></div>}
                    {s.bankIFSC          && <div>IFSC: <strong>{s.bankIFSC}</strong></div>}
                    {s.bankBranch        && <div>Branch : {s.bankBranch}</div>}
                  </>
                )}
              </div>
              <div style={{ width: '160px', padding: '10px 16px', display: 'flex',
                flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end' }}>
                {s?.authorizedSignature
                  ? <img src={s.authorizedSignature} alt="sig" style={{ height: '52px', objectFit: 'contain', marginBottom: '4px' }} />
                  : <div style={{ height: '52px', marginBottom: '4px' }} />
                }
                <div style={{ color: '#555', fontSize: '10px' }}>Authorized Signature</div>
              </div>
            </div>

            {/* ══ 7. TERMS + QR ══ */}
            {(s?.invoiceTerms || invoice.notes || s?.qrCodeImage) && (
              <div style={{ padding: '8px 16px 12px', borderTop: ID, fontSize: '10px', color: '#444' }}>
                {(s?.invoiceTerms || invoice.notes) && (
                  <div style={{ marginBottom: s?.qrCodeImage ? '10px' : 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '11px', marginBottom: '3px' }}>Terms &amp; Conditions</div>
                    {s?.invoiceTerms && <div style={{ whiteSpace: 'pre-line', lineHeight: 1.65 }}>{s.invoiceTerms}</div>}
                    {invoice.notes   && <div style={{ marginTop: '4px' }}>{invoice.notes}</div>}
                  </div>
                )}
                {s?.qrCodeImage && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={s.qrCodeImage} alt="QR" style={{ width: '72px', height: '72px', objectFit: 'contain' }} />
                    <span style={{ color: '#666' }}>Scan the QR code for Online Payments</span>
                  </div>
                )}
              </div>
            )}

          </div>{/* end invoice-box */}

          {/* ══ 8. FOOTER — left=invoiceFooter lines, center=logo, right=footerServices lines ══ */}
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
            {/* LEFT — one solid left border, all lines together, bold */}
            <div style={{
              borderLeft: '3px solid rgba(255,255,255,0.7)',
              paddingLeft: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '3px',
            }}>
              {leftLines.map((line, i) => (
                <span key={i} style={{ fontWeight: 700, fontSize: '11px', lineHeight: 1.4 }}>{line}</span>
              ))}
            </div>

            {/* CENTER — logo circle */}
            <div style={{
              width: '68px', height: '68px', borderRadius: '50%', overflow: 'hidden',
              border: '2px solid rgba(255,255,255,0.7)',
              background: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              {s?.logo && (
                <img src={s.logo} alt="logo"
                  style={{ width: '64px', height: '64px', objectFit: 'contain', borderRadius: '50%' }} />
              )}
            </div>

            {/* RIGHT — one solid right border, all lines together, bold, right-aligned */}
            <div style={{
              borderRight: '3px solid rgba(255,255,255,0.7)',
              paddingRight: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '3px',
              alignItems: 'flex-end',
            }}>
              {rightLines.map((line, i) => (
                <span key={i} style={{ fontWeight: 700, fontSize: '11px', lineHeight: 1.4 }}>{line}</span>
              ))}
            </div>
          </div>

        </div>{/* end invoice-root */}
      </div>

      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 0; }
          body { margin: 0; padding: 0; }
          body > *:not(:has(#invoice-root)) { display: none !important; }
          #invoice-root {
            position: fixed; inset: 0;
            width: 210mm; min-height: 297mm;
            margin: 0; padding: 10mm 10mm 0 10mm;
            box-shadow: none; display: flex; flex-direction: column;
          }
          #invoice-footer { margin-left: -10mm !important; margin-right: -10mm !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
    </>
  )
}