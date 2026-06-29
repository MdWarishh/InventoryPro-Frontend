'use client'

import type { Invoice } from '@/types/invoices.types'

// ── Helpers (same as detail page) ────────────────────────────────────────────
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

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  invoice: Invoice
}

// ── Component — exact same HTML as detail page's invoice-root ─────────────────
export default function InvoiceDocument({ invoice }: Props) {
  const s            = invoice.branch?.settings
  const primaryColor = s?.primaryColor ?? '#1a5c4a'
  const footerColor  = s?.footerColor  ?? primaryColor
  const invoiceDate  = fmtDate(invoice.date)

  const subtotal    = invoice.subtotal ?? invoice.stockOuts.reduce((sum, so) => sum + so.sellingPrice * so.quantity, 0)
  const totalAmount = invoice.totalAmount
  const discount    = invoice.discount ?? 0
  const gstAmount   = totalAmount - subtotal + discount

  const leftLines  = splitFooterLines(s?.invoiceFooter)
  const rightLines = splitFooterLines(s?.footerServices)

  return (
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
                   <div style={{ fontWeight: 500 }}>{so.product?.name ?? so.productName ?? ''}</div>
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

    </div>
  )
}