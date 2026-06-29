'use client'

import { Printer } from 'lucide-react'
import type { Invoice } from '@/types/invoices.types'

interface Props {
  invoice: Invoice
}

// ── Due date calculator ────────────────────────────────────────────────────────
function calcDueDate(invoiceDate: string, dueDateTerms?: string): string {
  const base = new Date(invoiceDate)
  if (!dueDateTerms || dueDateTerms === 'Due on Receipt') {
    return base.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }
  const days = parseInt(dueDateTerms)
  if (!isNaN(days)) {
    base.setDate(base.getDate() + days)
  }
  return base.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// ── Number to words ────────────────────────────────────────────────────────────
function numberToWords(amount: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen',
    'Eighteen', 'Nineteen']
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

  function inWords(n: number): string {
    if (n === 0) return ''
    if (n < 20) return ones[n] + ' '
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '') + ' '
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred ' + inWords(n % 100)
    if (n < 100000) return inWords(Math.floor(n / 1000)) + 'Thousand ' + inWords(n % 1000)
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + 'Lakh ' + inWords(n % 100000)
    return inWords(Math.floor(n / 10000000)) + 'Crore ' + inWords(n % 10000000)
  }

  const rupees = Math.floor(amount)
  const paise = Math.round((amount - rupees) * 100)
  let result = 'Indian Rupee ' + inWords(rupees).trim()
  if (paise > 0) result += ' and ' + inWords(paise).trim() + ' Paise'
  result += ' Only'
  return result
}

export default function InvoicePrintView({ invoice }: Props) {
  const settings = invoice.branch?.settings
  const currencySymbol = settings?.currencySymbol || '₹'
  const primaryColor = settings?.primaryColor || '#1a5276'
  const footerColor  = settings?.footerColor  || primaryColor

  const invoiceDate = new Date(invoice.date).toLocaleDateString('en-IN', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  })
  const dueDate = calcDueDate(invoice.date, settings?.dueDateTerms)

  // Footer services list
  const footerServices = settings?.footerServices
    ? settings.footerServices.split(',').map(s => s.trim()).filter(Boolean)
    : []

  const handlePrint = () => window.print()

  return (
    <>
      {/* Print button — screen only */}
      <div className="flex justify-end mb-4 print:hidden">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-xl transition-all"
        >
          <Printer size={15} /> Print / Download PDF
        </button>
      </div>

      {/* ── Invoice Document ─────────────────────────────────────────────────── */}
      <div
        id="invoice-print"
        className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden print:shadow-none print:border-none print:rounded-none"
        style={{ fontFamily: settings?.fontFamily || 'sans-serif' }}
      >
        {/* ── HEADER ───────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between px-8 pt-6 pb-4 border-b border-gray-200">
          {/* Left — Logo + Company Info */}
          <div className="flex items-start gap-4">
            {settings?.logo && (
              <img
                src={settings.logo}
                alt="logo"
                className="h-20 w-20 object-contain rounded-full border border-gray-200 p-1 shrink-0"
              />
            )}
            <div>
              <p className="text-base font-extrabold text-gray-900 leading-tight">
                {settings?.companyName || invoice.branch?.name || 'Company Name'}
              </p>
              {settings?.legalName && settings.legalName !== settings.companyName && (
                <p className="text-xs text-gray-500 mt-0.5">{settings.legalName}</p>
              )}
              {settings?.address && (
                <p className="text-xs text-gray-600 mt-1 max-w-xs leading-relaxed whitespace-pre-line">
                  {settings.address}
                </p>
              )}
              {settings?.gstin && (
                <p className="text-xs text-gray-600 mt-0.5">
                  <span className="font-semibold">GSTIN</span> {settings.gstin}
                </p>
              )}
              {settings?.phone && (
                <p className="text-xs text-gray-600">{settings.phone}</p>
              )}
              {settings?.email && (
                <p className="text-xs text-gray-600">{settings.email}</p>
              )}
              {settings?.website && (
                <p className="text-xs text-gray-600">{settings.website}</p>
              )}
            </div>
          </div>

          {/* Right — TAX INVOICE title */}
          <div className="text-right shrink-0">
            <p
              className="text-2xl font-black tracking-widest uppercase"
              style={{ color: primaryColor }}
            >
              TAX INVOICE
            </p>
          </div>
        </div>

        {/* ── META TABLE — Invoice No, Date, Terms, Due Date | Place of Supply ── */}
        <div className="grid grid-cols-2 border-b border-gray-200">
          {/* Left side — invoice meta */}
          <div className="border-r border-gray-200">
            <table className="w-full text-xs">
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-2 text-gray-500 font-medium w-32">#</td>
                  <td className="px-4 py-2 text-gray-900 font-bold">{invoice.invoiceNumber}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-2 text-gray-500 font-medium">Invoice Date</td>
                  <td className="px-4 py-2 text-gray-900">{invoiceDate}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-2 text-gray-500 font-medium">Terms</td>
                  <td className="px-4 py-2 text-gray-900">{settings?.dueDateTerms || 'Due on Receipt'}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-gray-500 font-medium">Due Date</td>
                  <td className="px-4 py-2 text-gray-900">{dueDate}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Right side — Place of Supply */}
          <div>
            <table className="w-full text-xs">
              <tbody>
                <tr>
                  <td className="px-4 py-2 text-gray-500 font-medium w-36">Place Of Supply</td>
                  <td className="px-4 py-2 text-gray-900 font-semibold">
                    {settings?.placeOfSupply
                      ? `${settings.placeOfSupply}${settings.placeOfSupplyCode ? ` (${settings.placeOfSupplyCode})` : ''}`
                      : '—'
                    }
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── BILL TO ────────────────────────────────────────────────────────── */}
        <div className="px-8 py-4 border-b border-gray-200 bg-gray-50">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Bill To</p>
          <p className="text-sm font-extrabold text-gray-900 uppercase">{invoice.customerName}</p>
          {invoice.customerAddress && (
            <p className="text-xs text-gray-600 mt-0.5 whitespace-pre-line leading-relaxed">
              {invoice.customerAddress}
            </p>
          )}
          {invoice.customerPhone && (
            <p className="text-xs text-gray-600 mt-0.5">{invoice.customerPhone}</p>
          )}
          {invoice.customerEmail && (
            <p className="text-xs text-gray-600">{invoice.customerEmail}</p>
          )}
          {invoice.customerGST && (
            <p className="text-xs text-gray-600 mt-0.5">
              <span className="font-semibold">GSTIN:</span> {invoice.customerGST}
            </p>
          )}
        </div>

        {/* ── ITEMS TABLE ───────────────────────────────────────────────────── */}
        <div className="px-0">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ backgroundColor: primaryColor }}>
                <th className="text-left px-4 py-2.5 text-white font-semibold w-8">SNO.</th>
                <th className="text-left px-4 py-2.5 text-white font-semibold">Item Name &amp; Discription</th>
                <th className="text-center px-4 py-2.5 text-white font-semibold w-16">Qty</th>
                <th className="text-right px-4 py-2.5 text-white font-semibold w-28">Rate</th>
                <th className="text-right px-4 py-2.5 text-white font-semibold w-28">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.stockOuts.map((so, i) => {
                const lineBase = so.sellingPrice * so.quantity
              const gst = lineBase * ((so.product?.gstRate ?? 0) / 100)
                const lineTotal = lineBase + gst
                return (
                  <tr key={so.id} className="border-b border-gray-100 align-top">
                    <td className="px-4 py-3 text-gray-500 text-center">{i + 1}</td>
                    <td className="px-4 py-3">
                   <p className="font-semibold text-gray-900">{so.product?.name ?? so.productName ?? ''}</p>
                      {so.product?.category && (
  <p className="text-gray-400 mt-0.5">{so.product.category.name}</p>
)}
                      {so.serialNumbers?.length > 0 && (
                        <p className="text-gray-500 mt-0.5 font-mono">
                          {so.serialNumbers.map(sn => sn.serialNumber).join(' / ')}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-700">
                      {so.quantity}.00{'\n'}
                      <span className="text-gray-400">pcs</span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">
                      {so.sellingPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      {lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* ── TOTALS + AMOUNT IN WORDS ──────────────────────────────────────── */}
        <div className="grid grid-cols-2 border-t border-gray-200">
          {/* Left — amount in words */}
          <div className="px-6 py-4 border-r border-gray-200 flex flex-col justify-center">
            <p className="text-xs text-gray-500 mb-1">Total In Words</p>
            <p className="text-sm font-bold text-gray-800 italic leading-relaxed">
              {numberToWords(invoice.totalAmount)}
            </p>
          </div>

          {/* Right — numeric totals */}
          <div>
            <table className="w-full text-xs">
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-2 text-gray-500">Sub Total</td>
                  <td className="px-4 py-2 text-right text-gray-900">
                    {invoice.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
                {invoice.gstAmount > 0 && (
                  <tr className="border-b border-gray-100">
                    <td className="px-4 py-2 text-gray-500">GST</td>
                    <td className="px-4 py-2 text-right text-gray-900">
                      {invoice.gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                )}
                {invoice.discount > 0 && (
                  <tr className="border-b border-gray-100">
                    <td className="px-4 py-2 text-gray-500">Discount</td>
                    <td className="px-4 py-2 text-right text-red-600">
                      -{invoice.discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                )}
                <tr
                  className="border-b border-gray-200"
                  style={{ backgroundColor: primaryColor + '15' }}
                >
                  <td className="px-4 py-2.5 font-bold text-gray-900">Total</td>
                  <td className="px-4 py-2.5 text-right font-black text-gray-900 text-sm">
                    {currencySymbol}{invoice.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-2 text-gray-500">Payment Made</td>
                  <td className="px-4 py-2 text-right text-red-500">
                    (-{currencySymbol}{invoice.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })})
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-bold text-gray-900">Balance Due</td>
                  <td className="px-4 py-2 text-right font-bold text-gray-900">
                    {currencySymbol}0.00
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── NOTES ─────────────────────────────────────────────────────────── */}
        {(invoice.notes || settings?.invoiceFooter) && (
          <div className="px-6 py-3 border-t border-gray-200">
            <p className="text-xs text-gray-700">
              {invoice.notes || settings?.invoiceFooter}
            </p>
          </div>
        )}

        {/* ── BANK DETAILS + QR + SIGNATURE ─────────────────────────────────── */}
        <div className="grid grid-cols-[1fr_auto_auto] gap-6 px-6 py-5 border-t border-gray-200 items-start">
          {/* Bank Details */}
          {(settings?.bankAccountHolder || settings?.bankAccountNumber) && (
            <div>
              <p className="text-xs font-bold text-gray-700 mb-2">
                Company's Bank Details A/c:- {settings?.companyName || invoice.branch?.name}
              </p>
              <table className="text-xs">
                <tbody className="space-y-1">
                  {settings?.bankAccountHolder && (
                    <tr>
                      <td className="text-gray-500 pr-3 py-0.5">Account Holder:</td>
                      <td className="font-semibold text-gray-900">{settings.bankAccountHolder}</td>
                    </tr>
                  )}
                  {settings?.bankAccountNumber && (
                    <tr>
                      <td className="text-gray-500 pr-3 py-0.5">Account Number:</td>
                      <td className="font-bold text-gray-900 tracking-wider">{settings.bankAccountNumber}</td>
                    </tr>
                  )}
                  {settings?.bankIFSC && (
                    <tr>
                      <td className="text-gray-500 pr-3 py-0.5">IFSC:</td>
                      <td className="font-bold text-gray-900 uppercase">{settings.bankIFSC}</td>
                    </tr>
                  )}
                  {settings?.bankBranch && (
                    <tr>
                      <td className="text-gray-500 pr-3 py-0.5">Branch:</td>
                      <td className="font-semibold text-gray-900">{settings.bankBranch}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* QR Code */}
          {settings?.qrCodeImage && (
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <img
                src={settings.qrCodeImage}
                alt="QR Code"
                className="w-20 h-20 object-contain"
              />
              <p className="text-xs text-gray-500 text-center">
                Scan the QR code for Online{'\n'}Payments
              </p>
            </div>
          )}

          {/* Authorized Signature */}
          <div className="flex flex-col items-center gap-1.5 shrink-0 min-w-[120px]">
            {settings?.authorizedSignature && (
              <img
                src={settings.authorizedSignature}
                alt="Authorized Signature"
                className="h-14 object-contain"
              />
            )}
            <div className="border-t border-gray-400 w-28 pt-1 text-center">
              <p className="text-xs text-gray-500">Authorized Signature</p>
            </div>
          </div>
        </div>

        {/* ── TERMS & CONDITIONS ─────────────────────────────────────────────── */}
        {(invoice.terms || settings?.invoiceTerms) && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <p className="text-xs font-bold text-gray-600 mb-2">Terms &amp; Conditions</p>
            <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
              {invoice.terms || settings?.invoiceTerms}
            </p>
          </div>
        )}

        {/* ── FOOTER SERVICES STRIP ─────────────────────────────────────────── */}
        {(footerServices.length > 0 || settings?.logo) && (
          <div
            className="grid items-center px-6 py-3 text-white text-xs font-semibold"
            style={{
              backgroundColor: footerColor,
              gridTemplateColumns: '1fr auto 1fr',
              minHeight: '64px',
            }}
          >
            {/* Left services */}
            <div className="flex flex-col gap-0.5 text-left">
              {footerServices.slice(0, Math.ceil(footerServices.length / 2)).map((service, i) => (
                <span key={i} className="leading-tight">{service}</span>
              ))}
            </div>

            {/* Center — logo */}
            <div className="flex flex-col items-center justify-center px-4">
              {settings?.logo ? (
                <img
                  src={settings.logo}
                  alt="Company Logo"
                  className="w-12 h-12 object-contain rounded-full"
                  style={{ outline: '2px solid rgba(255,255,255,0.3)', outlineOffset: '1px' }}
                />
              ) : (
                <div className="w-12 h-12" />
              )}
            </div>

            {/* Right services */}
            <div className="flex flex-col gap-0.5 text-right">
              {footerServices.slice(Math.ceil(footerServices.length / 2)).map((service, i) => (
                <span key={i} className="leading-tight">{service}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #invoice-print, #invoice-print * { visibility: visible; }
          #invoice-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
            box-shadow: none !important;
          }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </>
  )
}