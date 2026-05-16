'use client'

import { useState } from 'react'
import { User, Bell, Info, Check, X, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth.store'

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

const NOTIFICATION_PREFS = [
  { key: 'lowStock', label: 'Low Stock Alerts', desc: 'Notify when products fall below minimum stock', defaultOn: true },
  { key: 'meetings', label: 'Meeting Reminders', desc: 'Remind before scheduled meetings', defaultOn: true },
  { key: 'bulkUpload', label: 'Bulk Upload Complete', desc: 'Notify when file processing finishes', defaultOn: true },
  { key: 'system', label: 'System Notifications', desc: 'Important system and security alerts', defaultOn: true },
]

export default function AccountSettingsPage() {
  const { user } = useAuthStore()
  const [notifPrefs, setNotifPrefs] = useState<Record<string, boolean>>(
    Object.fromEntries(NOTIFICATION_PREFS.map(p => [p.key, p.defaultOn]))
  )

  const roleLabel = user?.role?.replace('_', ' ') ?? '-'
  const initial = user?.name?.charAt(0)?.toUpperCase() ?? 'U'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-5 h-5 text-indigo-500" /> Account
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Your profile and notification preferences</p>
      </div>

      {/* Profile Card */}
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
            <input value={user?.name || ''} disabled
              className="mt-1.5 w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/50 text-slate-500 dark:text-slate-500 cursor-not-allowed" readOnly />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Email</label>
            <input value={user?.email || ''} disabled
              className="mt-1.5 w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/50 text-slate-500 dark:text-slate-500 cursor-not-allowed" readOnly />
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-3 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5" />
          Contact Super Admin to update your name or email
        </p>
      </div>

      {/* Notification Prefs */}
      <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-6">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
          <Bell className="w-4 h-4 text-indigo-500" /> Notification Preferences
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Choose what notifications you want to receive</p>
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

      {/* Branch Info */}
      <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-6">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Account Details</h3>
        <div className="space-y-2">
          {[
            { label: 'Role', value: roleLabel },
            { label: 'Branch ID', value: user?.branchId || 'Main Branch' },
            { label: 'User ID', value: user?.id || '-' },
          ].map(item => (
            <div key={item.label} className="flex justify-between py-2.5 border-b border-slate-100 dark:border-slate-700/40 last:border-0">
              <span className="text-sm text-slate-500 dark:text-slate-400">{item.label}</span>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 font-mono">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}