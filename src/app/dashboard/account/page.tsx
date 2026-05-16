'use client'

import { useState, useEffect } from 'react'
import { User, Bell, Info, MessageCircle, Check, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth.store'
import api from '@/lib/axios'

// ── Toggle ────────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className={cn('relative w-12 h-6 rounded-full transition-colors duration-300',
        checked ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
      )}>
      <span className={cn('absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300',
        checked ? 'translate-x-6' : 'translate-x-0'
      )} />
    </button>
  )
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onDone }: { msg: string; type: 'success' | 'error'; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div className={cn(
      'fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium shadow-xl',
      'animate-in slide-in-from-bottom-2 duration-200',
      type === 'success'
        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
        : 'bg-red-50 text-red-600 border border-red-200 dark:bg-red-950 dark:border-red-800 dark:text-red-400'
    )}>
      <span className={cn('w-2 h-2 rounded-full flex-shrink-0',
        type === 'success' ? 'bg-emerald-400' : 'bg-red-500'
      )} />
      {msg}
    </div>
  )
}

const NOTIFICATION_PREFS = [
  { key: 'lowStock',    label: 'Low Stock Alerts',       desc: 'Notify when products fall below minimum stock', defaultOn: true },
  { key: 'meetings',   label: 'Meeting Reminders',       desc: 'Remind before scheduled meetings',              defaultOn: true },
  { key: 'bulkUpload', label: 'Bulk Upload Complete',    desc: 'Notify when file processing finishes',          defaultOn: true },
  { key: 'system',     label: 'System Notifications',   desc: 'Important system and security alerts',          defaultOn: true },
]

export default function AccountSettingsPage() {
  const { user, setUser } = useAuthStore()

  const [notifPrefs, setNotifPrefs] = useState<Record<string, boolean>>(
    Object.fromEntries(NOTIFICATION_PREFS.map(p => [p.key, p.defaultOn]))
  )

  // WhatsApp state
  const [waNumber, setWaNumber]       = useState('')
  const [waFocused, setWaFocused]     = useState(false)
  const [waSaving, setWaSaving]       = useState(false)
  const [waRemoving, setWaRemoving]   = useState(false)

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const showToast = (msg: string, type: 'success' | 'error' = 'success') =>
    setToast({ msg, type })

  // Sync whatsapp number from user store
  useEffect(() => {
    if (user?.whatsappNumber) {
      // Strip +91 prefix for display in input
      setWaNumber(user.whatsappNumber.replace(/^\+91/, ''))
    }
  }, [user?.whatsappNumber])

  const roleLabel = user?.role?.replace('_', ' ') ?? '-'
  const initial   = user?.name?.charAt(0)?.toUpperCase() ?? 'U'

  // ── WhatsApp save ──────────────────────────────────────────────────────────
  const handleWaSave = async () => {
    const digits = waNumber.replace(/\D/g, '')
    if (!digits || digits.length < 10) {
      showToast('Enter a valid 10-digit number', 'error')
      return
    }
    const formatted = digits.startsWith('91') && digits.length === 12
      ? `+${digits}`
      : `+91${digits.slice(-10)}`

    try {
      setWaSaving(true)
      const { data } = await api.put('/users/profile', { whatsappNumber: formatted })
      // Update auth store so header/other components reflect change
      if (setUser) setUser({ ...user!, whatsappNumber: formatted })
      setWaNumber(formatted.replace(/^\+91/, ''))
      showToast('WhatsApp number saved! Meeting reminders enabled 🎉')
    } catch (e: any) {
      showToast(e?.response?.data?.message || 'Failed to save number', 'error')
    } finally {
      setWaSaving(false)
    }
  }

  // ── WhatsApp remove ────────────────────────────────────────────────────────
  const handleWaRemove = async () => {
    try {
      setWaRemoving(true)
      await api.put('/users/profile', { whatsappNumber: null })
      if (setUser) setUser({ ...user!, whatsappNumber: null })
      setWaNumber('')
      showToast('WhatsApp number removed.')
    } catch (e: any) {
      showToast(e?.response?.data?.message || 'Failed to remove', 'error')
    } finally {
      setWaRemoving(false)
    }
  }

  const waIsSaved      = !!user?.whatsappNumber
  const waInputDigits  = waNumber.replace(/\D/g, '')
  const waIsValid      = waInputDigits.length === 10 || (waInputDigits.startsWith('91') && waInputDigits.length === 12)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-5 h-5 text-indigo-500" /> Account
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Your profile and notification preferences
        </p>
      </div>

      {/* ── Profile Card (read-only, same as before) ── */}
      <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-6">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Profile</h3>
        <div className="flex items-center gap-4 pb-5 mb-5 border-b border-slate-100 dark:border-slate-700/60">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            {initial}
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">{user?.name}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs rounded-full font-medium">
              {roleLabel}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Full Name</label>
            <input value={user?.name || ''} disabled readOnly
              className="mt-1.5 w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/50 text-slate-500 dark:text-slate-500 cursor-not-allowed" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Email</label>
            <input value={user?.email || ''} disabled readOnly
              className="mt-1.5 w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/50 text-slate-500 dark:text-slate-500 cursor-not-allowed" />
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-3 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5" />
          Contact Super Admin to update your name or email
        </p>
      </div>

      {/* ── WhatsApp Reminders Card ── */}
      <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 flex-shrink-0">
            {/* WhatsApp icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              WhatsApp Meeting Reminders
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Get alerts on WhatsApp before every meeting
            </p>
          </div>
          {/* Active badge */}
          {waIsSaved && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-full flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active
            </span>
          )}
        </div>

        {/* Info pills */}
        <div className="flex flex-wrap gap-2 mb-5">
          {[
            '🔔 Reminder sent X mins before meeting',
            '📋 Title, time & location included',
            '🔒 Only you receive your reminders',
          ].map(txt => (
            <span key={txt}
              className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5">
              {txt}
            </span>
          ))}
        </div>

        {/* Input */}
        <div className="mb-4">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-2">
            Your WhatsApp Number
          </label>
          <div className={cn(
            'flex items-center rounded-xl border transition-all duration-150 overflow-hidden',
            waFocused
              ? 'border-indigo-500 ring-2 ring-indigo-500/15 dark:border-indigo-400'
              : waIsSaved
                ? 'border-emerald-400 dark:border-emerald-600'
                : 'border-slate-200 dark:border-slate-700'
          )}>
            {/* Prefix */}
            <div className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-50 dark:bg-slate-700/50 border-r border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400 select-none flex-shrink-0">
              <Phone className="w-3.5 h-3.5" />
              +91
            </div>
            {/* Input */}
            <input
              type="tel"
              placeholder="98765 43210"
              value={waNumber}
              onChange={e => setWaNumber(e.target.value.replace(/[^\d\s]/g, ''))}
              onFocus={() => setWaFocused(true)}
              onBlur={() => setWaFocused(false)}
              maxLength={13}
              className="flex-1 px-3 py-2.5 text-sm font-semibold tracking-wide text-slate-800 dark:text-slate-200 bg-transparent outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600 placeholder:font-normal placeholder:tracking-normal"
            />
            {/* Clear */}
            {waNumber && (
              <button
                type="button"
                onClick={() => setWaNumber('')}
                className="px-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1.5">
            Enter 10-digit number · +91 country code added automatically
          </p>
        </div>

        {/* WhatsApp message preview */}
        {waNumber && waInputDigits.length >= 10 && (
          <div className="mb-5 p-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-200 dark:border-slate-700">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Preview — message you'll receive
            </p>
            <div className="inline-block bg-[#dcf8c6] dark:bg-emerald-900/40 rounded-tr-2xl rounded-b-2xl px-4 py-3 text-[13px] text-slate-800 dark:text-slate-200 leading-relaxed shadow-sm max-w-xs">
              <p>🔔 <strong>Meeting Reminder</strong></p>
              <p className="mt-1">📌 <strong>Q4 Review Meeting</strong></p>
              <p>⏰ Starting in <strong>30 minutes</strong></p>
              <p>📅 30 Apr 2026 at 3:00 PM</p>
              <p>📍 Conference Room A</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleWaSave}
            disabled={waSaving || !waIsValid}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150',
              'bg-indigo-600 hover:bg-indigo-700 text-white',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-indigo-600',
              'active:scale-[0.98]'
            )}
          >
            {waSaving ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Save & Enable
              </>
            )}
          </button>

          {waIsSaved && (
            <button
              type="button"
              onClick={handleWaRemove}
              disabled={waRemoving}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-150 disabled:opacity-50"
            >
              {waRemoving ? 'Removing...' : 'Remove'}
            </button>
          )}
        </div>
      </div>

      {/* ── Notification Preferences ── */}
      <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-6">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
          <Bell className="w-4 h-4 text-indigo-500" /> Notification Preferences
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Choose what notifications you want to receive
        </p>
        <div className="space-y-1">
          {NOTIFICATION_PREFS.map((pref, i) => (
            <div key={pref.key}
              className={cn('flex items-center justify-between py-3',
                i < NOTIFICATION_PREFS.length - 1 && 'border-b border-slate-100 dark:border-slate-700/40'
              )}>
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{pref.label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{pref.desc}</p>
              </div>
              <Toggle
                checked={notifPrefs[pref.key]}
                onChange={v => setNotifPrefs(p => ({ ...p, [pref.key]: v }))}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Account Details ── */}
      <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-6">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Account Details</h3>
        <div className="space-y-2">
          {[
            { label: 'Role',      value: roleLabel },
            { label: 'Branch ID', value: user?.branchId || 'Main Branch' },
            { label: 'User ID',   value: user?.id || '-' },
          ].map(item => (
            <div key={item.label}
              className="flex justify-between py-2.5 border-b border-slate-100 dark:border-slate-700/40 last:border-0">
              <span className="text-sm text-slate-500 dark:text-slate-400">{item.label}</span>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 font-mono">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />
      )}
    </div>
  )
}