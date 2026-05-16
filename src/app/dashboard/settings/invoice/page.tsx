'use client'

import { useState, useEffect, useRef } from 'react'
import settingsService from '@/services/settings.service'
import type { Settings, UpdateSettingsPayload } from '@/types/settings.types'
import { useAuthStore } from '@/store/auth.store'
import {
  Building2, FileText, Landmark, Palette, Image as ImageIcon,
  Save, Upload, Check, Loader2, AlertCircle, Eye, EyeOff,
  ChevronDown, RotateCcw
} from 'lucide-react'

const TABS = [
  { id: 'company',    label: 'Company',    icon: Building2 },
  { id: 'invoice',    label: 'Invoice',    icon: FileText  },
  { id: 'bank',       label: 'Bank',       icon: Landmark  },
  { id: 'media',      label: 'Media',      icon: ImageIcon },
  { id: 'appearance', label: 'Appearance', icon: Palette   },
] as const

type TabId = (typeof TABS)[number]['id']

const Field = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
      {label}
    </label>
    {children}
    {hint && <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{hint}</p>}
  </div>
)

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700
      bg-white dark:bg-slate-800/60 text-slate-900 dark:text-slate-100
      placeholder-slate-400 dark:placeholder-slate-500
      focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400
      transition-all ${props.className ?? ''}`}
  />
)

const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    className={`w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700
      bg-white dark:bg-slate-800/60 text-slate-900 dark:text-slate-100
      placeholder-slate-400 dark:placeholder-slate-500
      focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400
      transition-all resize-none ${props.className ?? ''}`}
  />
)

const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) => (
  <div className="relative">
    <select
      {...props}
      className={`w-full appearance-none px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700
        bg-white dark:bg-slate-800/60 text-slate-900 dark:text-slate-100
        focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400
        transition-all cursor-pointer pr-8 ${props.className ?? ''}`}
    >
      {props.children}
    </select>
    <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
  </div>
)

const ImageUploadCard = ({
  label, hint, current, fieldName, onUpload, uploading,
}: {
  label: string; hint: string; current?: string
  fieldName: 'logo' | 'qrCode' | 'signature'
  onUpload: (field: 'logo' | 'qrCode' | 'signature', file: File) => void
  uploading: string | null
}) => {
  const ref = useRef<HTMLInputElement>(null)
  const isUploading = uploading === fieldName
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-slate-50 dark:bg-slate-800/30">
      <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">{label}</div>
      <div className="flex items-start gap-4">
        <div className="w-24 h-24 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center overflow-hidden bg-white dark:bg-slate-800 flex-shrink-0">
          {current ? <img src={current} alt={label} className="w-full h-full object-contain p-1" /> : <ImageIcon size={24} className="text-slate-300 dark:text-slate-600" />}
        </div>
        <div className="flex-1">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{hint}</p>
          <button onClick={() => ref.current?.click()} disabled={isUploading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-60 transition-all">
            {isUploading ? <><Loader2 size={14} className="animate-spin" /> Uploading...</> : <><Upload size={14} /> {current ? 'Replace' : 'Upload'}</>}
          </button>
          <input ref={ref} type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
            onChange={e => { const file = e.target.files?.[0]; if (file) onUpload(fieldName, file); e.target.value = '' }} />
        </div>
      </div>
    </div>
  )
}

type ToastType = 'success' | 'error'
const Toast = ({ msg, type }: { msg: string; type: ToastType }) => (
  <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-sm font-medium
    ${type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
    {type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
    {msg}
  </div>
)

export default function InvoiceSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('company')
  const [settings, setSettings] = useState<Partial<Settings>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: ToastType } | null>(null)
  const [dirty, setDirty] = useState(false)

  const { user } = useAuthStore()
  const branchId = user?.branchId ?? null

  useEffect(() => {
    settingsService.getSettings(branchId)
      .then(s => setSettings(s))
      .catch(() => showToast('Failed to load settings.', 'error'))
      .finally(() => setLoading(false))
  }, [branchId])

  const showToast = (msg: string, type: ToastType = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const set = (key: keyof Settings, value: unknown) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setDirty(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload: UpdateSettingsPayload = {
        branchId: branchId ?? undefined,
        companyName: settings.companyName, legalName: settings.legalName,
        address: settings.address, phone: settings.phone, email: settings.email,
        website: settings.website, gstin: settings.gstin, state: settings.state, stateCode: settings.stateCode,
        invoicePrefix: settings.invoicePrefix, defaultGSTRate: settings.defaultGSTRate,
        placeOfSupply: settings.placeOfSupply, placeOfSupplyCode: settings.placeOfSupplyCode,
        dueDateTerms: settings.dueDateTerms, invoiceTerms: settings.invoiceTerms,
        invoiceFooter: settings.invoiceFooter, footerServices: settings.footerServices,
        resetInvoiceMonthly: settings.resetInvoiceMonthly,
        currency: settings.currency, currencySymbol: settings.currencySymbol, timezone: settings.timezone,
        bankAccountHolder: settings.bankAccountHolder, bankAccountNumber: settings.bankAccountNumber,
        bankIFSC: settings.bankIFSC, bankBranch: settings.bankBranch,
        primaryColor: settings.primaryColor, secondaryColor: settings.secondaryColor,
        footerColor: settings.footerColor, fontFamily: settings.fontFamily as any, fontSize: settings.fontSize as any,
      }
      const updated = await settingsService.updateSettings(payload)
      setSettings(updated)
      setDirty(false)
      showToast('Settings saved successfully!', 'success')
    } catch {
      showToast('Failed to save settings.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleUpload = async (field: 'logo' | 'qrCode' | 'signature', file: File) => {
    setUploading(field)
    try {
      const fd = new FormData()
      fd.append(field === 'logo' ? 'logo' : field === 'qrCode' ? 'qrCode' : 'signature', file)
      if (branchId) fd.append('branchId', branchId)
      let updated: Settings
      if (field === 'logo') updated = await settingsService.uploadLogo(fd)
      else if (field === 'qrCode') updated = await settingsService.uploadQRCode(fd)
      else updated = await settingsService.uploadAuthorizedSignature(fd)
      setSettings(updated)
      showToast(`${field === 'logo' ? 'Logo' : field === 'qrCode' ? 'QR Code' : 'Signature'} uploaded!`, 'success')
    } catch {
      showToast('Upload failed.', 'error')
    } finally {
      setUploading(null)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <Loader2 className="animate-spin text-indigo-500" size={32} />
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6">

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Invoice Settings</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure company details, invoice layout, bank info and appearance</p>
          </div>
          <button onClick={handleSave} disabled={saving || !dirty}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shadow-indigo-200 dark:shadow-indigo-900">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <div className="flex gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 mb-6 overflow-x-auto">
          {TABS.map(tab => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex-1 justify-center
                  ${active ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                <Icon size={15} />
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">

          {/* ════ COMPANY TAB ════ */}
          {activeTab === 'company' && (
            <div className="p-6 space-y-6">
              <SectionTitle>Business Information</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Company Name" hint="Appears at top of every invoice">
                  <Input value={settings.companyName ?? ''} onChange={e => set('companyName', e.target.value)} placeholder="e.g. Limra Speech & Hearing Clinic" />
                </Field>
                <Field label="Legal Name" hint="Full registered legal name (optional)">
                  <Input value={settings.legalName ?? ''} onChange={e => set('legalName', e.target.value)} placeholder="Legal business name" />
                </Field>
                <Field label="GSTIN">
                  <Input value={settings.gstin ?? ''} onChange={e => set('gstin', e.target.value.toUpperCase())} placeholder="e.g. 07ABAPIO892BIZ5" maxLength={15} />
                </Field>
                <Field label="Phone">
                  <Input value={settings.phone ?? ''} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" />
                </Field>
                <Field label="Email">
                  <Input type="email" value={settings.email ?? ''} onChange={e => set('email', e.target.value)} placeholder="info@company.com" />
                </Field>
                <Field label="Website">
                  <Input value={settings.website ?? ''} onChange={e => set('website', e.target.value)} placeholder="www.company.com" />
                </Field>
                <Field label="State">
                  <Input value={settings.state ?? ''} onChange={e => set('state', e.target.value)} placeholder="e.g. Delhi" />
                </Field>
                <Field label="State Code">
                  <Input value={settings.stateCode ?? ''} onChange={e => set('stateCode', e.target.value)} placeholder="e.g. 07" maxLength={2} />
                </Field>
                <Field label="Address" hint="Full business address">
                  <Textarea value={settings.address ?? ''} onChange={e => set('address', e.target.value)}
                    placeholder={"332 Basement, Zakir Nagar Main Road\nNew Friends Colony, New Delhi 110025"} rows={3} />
                </Field>
              </div>
            </div>
          )}

          {/* ════ INVOICE TAB ════ */}
          {activeTab === 'invoice' && (
            <div className="p-6 space-y-8">
              <div>
                <SectionTitle>Invoice Numbering</SectionTitle>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-4">
                  <Field label="Invoice Prefix" hint="e.g. INV → INV-001">
                    <Input value={settings.invoicePrefix ?? 'INV'} onChange={e => set('invoicePrefix', e.target.value.toUpperCase())} placeholder="INV" maxLength={10} />
                  </Field>
                  <Field label="Reset Counter Monthly">
                    <Select value={settings.resetInvoiceMonthly ? 'true' : 'false'} onChange={e => set('resetInvoiceMonthly', e.target.value === 'true')}>
                      <option value="true">Yes — reset every month</option>
                      <option value="false">No — continuous numbering</option>
                    </Select>
                  </Field>
                </div>
              </div>

              <Divider />

              <div>
                <SectionTitle>Tax & Supply</SectionTitle>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-4">
                  <Field label="Default GST Rate (%)">
                    <Select value={settings.defaultGSTRate ?? 18} onChange={e => set('defaultGSTRate', Number(e.target.value))}>
                      {[0, 5, 12, 18, 28].map(r => <option key={r} value={r}>{r}%</option>)}
                    </Select>
                  </Field>
                  <Field label="Place of Supply">
                    <Input value={settings.placeOfSupply ?? ''} onChange={e => set('placeOfSupply', e.target.value)} placeholder="e.g. Delhi" />
                  </Field>
                  <Field label="Place of Supply Code">
                    <Input value={settings.placeOfSupplyCode ?? ''} onChange={e => set('placeOfSupplyCode', e.target.value)} placeholder="e.g. 07" maxLength={2} />
                  </Field>
                  <Field label="Due Date Terms">
                    <Input value={settings.dueDateTerms ?? ''} onChange={e => set('dueDateTerms', e.target.value)} placeholder="Due on Receipt" />
                  </Field>
                </div>
              </div>

              <Divider />

              <div>
                <SectionTitle>Currency & Locale</SectionTitle>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-4">
                  <Field label="Currency">
                    <Input value={settings.currency ?? 'INR'} onChange={e => set('currency', e.target.value.toUpperCase())} placeholder="INR" maxLength={3} />
                  </Field>
                  <Field label="Currency Symbol">
                    <Input value={settings.currencySymbol ?? '₹'} onChange={e => set('currencySymbol', e.target.value)} placeholder="₹" maxLength={3} />
                  </Field>
                  <Field label="Timezone">
                    <Select value={settings.timezone ?? 'Asia/Kolkata'} onChange={e => set('timezone', e.target.value)}>
                      <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                      <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                      <option value="America/New_York">America/New_York (EST)</option>
                      <option value="Europe/London">Europe/London (GMT)</option>
                      <option value="UTC">UTC</option>
                    </Select>
                  </Field>
                </div>
              </div>

              <Divider />

              <div>
                <SectionTitle>Invoice Content</SectionTitle>
                <div className="grid grid-cols-1 gap-5 mt-4">
                  <Field label="Terms & Conditions" hint="Printed at bottom of each invoice. Enter dabao next line ke liye.">
                    <Textarea value={settings.invoiceTerms ?? ''} onChange={e => set('invoiceTerms', e.target.value)}
                      placeholder={"1. Goods once sold will not be taken back or replaced.\n2. Interest @24% p.a. will be charged if payment is not received within 15 days.\n3. All disputes are Subject to Delhi Jurisdiction."}
                      rows={5} />
                  </Field>

                  {/* ── Footer Left — invoiceFooter ── */}
                  <Field
                    label="Footer Left Services"
                    hint="Invoice footer ke LEFT side me dikhega — har service Enter dabake next line me likho"
                  >
                    <Textarea
                      value={settings.invoiceFooter ?? ''}
                      onChange={e => set('invoiceFooter', e.target.value)}
                      placeholder={"Digital Hearing Aid\nSpeech Therapy\nOccupational Therapy"}
                      rows={4}
                    />
                  </Field>

                  {/* ── Footer Right — footerServices ── */}
                  <Field
                    label="Footer Right Services"
                    hint="Invoice footer ke RIGHT side me dikhega — har service Enter dabake next line me likho"
                  >
                    <Textarea
                      value={settings.footerServices ?? ''}
                      onChange={e => set('footerServices', e.target.value)}
                      placeholder={"Physio Therapy\nSpecial Education\nPsychological Assessment"}
                      rows={4}
                    />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {/* ════ BANK TAB ════ */}
          {activeTab === 'bank' && (
            <div className="p-6 space-y-6">
              <SectionTitle>Bank Account Details</SectionTitle>
              <p className="text-sm text-slate-500 dark:text-slate-400 -mt-4">These details appear on every invoice so customers can transfer payments directly.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Account Holder Name">
                  <Input value={settings.bankAccountHolder ?? ''} onChange={e => set('bankAccountHolder', e.target.value)} placeholder="e.g. Limra Speech & Hearing Clinic" />
                </Field>
                <Field label="Bank Name" hint="Optional — e.g. ICICI BANK">
                  <Input value={(settings as any).bankName ?? ''} onChange={e => set('bankAccountHolder', e.target.value)} placeholder="ICICI Bank" />
                </Field>
                <Field label="Account Number">
                  <Input value={settings.bankAccountNumber ?? ''} onChange={e => set('bankAccountNumber', e.target.value)} placeholder="004605016979" />
                </Field>
                <Field label="IFSC Code">
                  <Input value={settings.bankIFSC ?? ''} onChange={e => set('bankIFSC', e.target.value.toUpperCase())} placeholder="ICIC0000046" maxLength={11} />
                </Field>
                <Field label="Branch Name">
                  <Input value={settings.bankBranch ?? ''} onChange={e => set('bankBranch', e.target.value)} placeholder="New Friends Colony, N.D." />
                </Field>
              </div>
              {settings.bankAccountNumber && (
                <div className="mt-2 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Invoice Preview</div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Company's Bank Details A/c:- {settings.companyName ?? 'Your Company'}</div>
                  {settings.bankAccountHolder && <div className="text-slate-600 dark:text-slate-300">Account Holder: <strong>{settings.bankAccountHolder}</strong></div>}
                  {settings.bankAccountNumber && <div className="text-slate-600 dark:text-slate-300">Account Number: <strong>{settings.bankAccountNumber}</strong></div>}
                  {settings.bankIFSC && <div className="text-slate-600 dark:text-slate-300">IFSC: <strong>{settings.bankIFSC}</strong></div>}
                  {settings.bankBranch && <div className="text-slate-600 dark:text-slate-300">Branch: {settings.bankBranch}</div>}
                </div>
              )}
            </div>
          )}

          {/* ════ MEDIA TAB ════ */}
          {activeTab === 'media' && (
            <div className="p-6 space-y-5">
              <SectionTitle>Logos & Media</SectionTitle>
              <p className="text-sm text-slate-500 dark:text-slate-400 -mt-4">Upload images that appear on your invoices. PNG with transparent background recommended.</p>
              <ImageUploadCard label="Company Logo" hint="Shown top-left on every invoice. Recommended: square PNG, min 200×200px." current={settings.logo} fieldName="logo" onUpload={handleUpload} uploading={uploading} />
              <ImageUploadCard label="QR Code for Payments" hint="Shown at bottom of invoice for online payment scanning. Square PNG." current={settings.qrCodeImage} fieldName="qrCode" onUpload={handleUpload} uploading={uploading} />
              <ImageUploadCard label="Authorized Signature" hint="Shown bottom-right of invoice. Transparent background PNG preferred." current={settings.authorizedSignature} fieldName="signature" onUpload={handleUpload} uploading={uploading} />
            </div>
          )}

          {/* ════ APPEARANCE TAB ════ */}
          {activeTab === 'appearance' && (
            <div className="p-6 space-y-8">
              <div>
                <SectionTitle>Colors</SectionTitle>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4">Colors used in the invoice footer bar and accents.</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <Field label="Primary Color">
                    <div className="flex gap-2">
                      <div className="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-700 flex-shrink-0 cursor-pointer overflow-hidden" style={{ background: settings.primaryColor ?? '#6366f1' }}>
                        <input type="color" value={settings.primaryColor ?? '#6366f1'} onChange={e => set('primaryColor', e.target.value)} className="opacity-0 w-full h-full cursor-pointer" />
                      </div>
                      <Input value={settings.primaryColor ?? '#6366f1'} onChange={e => set('primaryColor', e.target.value)} placeholder="#6366f1" maxLength={7} />
                    </div>
                  </Field>
                  <Field label="Secondary Color">
                    <div className="flex gap-2">
                      <div className="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-700 flex-shrink-0 cursor-pointer overflow-hidden" style={{ background: settings.secondaryColor ?? '#8b5cf6' }}>
                        <input type="color" value={settings.secondaryColor ?? '#8b5cf6'} onChange={e => set('secondaryColor', e.target.value)} className="opacity-0 w-full h-full cursor-pointer" />
                      </div>
                      <Input value={settings.secondaryColor ?? '#8b5cf6'} onChange={e => set('secondaryColor', e.target.value)} placeholder="#8b5cf6" maxLength={7} />
                    </div>
                  </Field>
                  <Field label="Footer Bar Color" hint="Bottom color bar on invoice">
                    <div className="flex gap-2">
                      <div className="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-700 flex-shrink-0 cursor-pointer overflow-hidden" style={{ background: settings.footerColor ?? settings.primaryColor ?? '#6366f1' }}>
                        <input type="color" value={settings.footerColor ?? settings.primaryColor ?? '#6366f1'} onChange={e => set('footerColor', e.target.value)} className="opacity-0 w-full h-full cursor-pointer" />
                      </div>
                      <Input value={settings.footerColor ?? settings.primaryColor ?? '#6366f1'} onChange={e => set('footerColor', e.target.value)} placeholder="#6366f1" maxLength={7} />
                    </div>
                  </Field>
                </div>
                {/* Footer live preview */}
                <div className="mt-4 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 text-white text-xs font-bold grid grid-cols-3 items-center gap-3"
                    style={{ background: settings.footerColor ?? settings.primaryColor ?? '#6366f1' }}>
                    <div className="flex flex-col gap-1">
                      {(settings.invoiceFooter ?? 'Digital Hearing Aid\nSpeech Therapy\nOccupational Therapy')
                        .split('\n').filter(Boolean).map((line, i) => (
                          <span key={i} className="flex items-center gap-1">
                            <span className="opacity-50">|</span> {line}
                          </span>
                        ))}
                    </div>
                    <div className="flex justify-center">
                      {settings.logo
                        ? <img src={settings.logo} className="w-10 h-10 rounded-full object-contain border-2 border-white/50" />
                        : <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/50" />
                      }
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      {(settings.footerServices ?? 'Physio Therapy\nSpecial Education\nPsychological Assessment')
                        .split('\n').filter(Boolean).map((line, i) => (
                          <span key={i} className="flex items-center gap-1">
                            {line} <span className="opacity-50">|</span>
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              <Divider />

              <div>
                <SectionTitle>Typography</SectionTitle>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-4">
                  <Field label="Font Family">
                    <Select value={settings.fontFamily ?? 'Inter'} onChange={e => set('fontFamily', e.target.value)}>
                      {['Inter', 'Poppins', 'Roboto', 'Open Sans', 'Montserrat', 'Nunito'].map(f => <option key={f} value={f}>{f}</option>)}
                    </Select>
                  </Field>
                  <Field label="Font Size">
                    <Select value={settings.fontSize ?? 'md'} onChange={e => set('fontSize', e.target.value)}>
                      <option value="sm">Small</option>
                      <option value="md">Medium (default)</option>
                      <option value="lg">Large</option>
                    </Select>
                  </Field>
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
            <span className="text-xs text-slate-400 dark:text-slate-500">{dirty ? '● Unsaved changes' : 'All changes saved'}</span>
            <button onClick={handleSave} disabled={saving || !dirty}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  )
}

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">{children}</h3>
)

const Divider = () => <hr className="border-slate-100 dark:border-slate-800" />