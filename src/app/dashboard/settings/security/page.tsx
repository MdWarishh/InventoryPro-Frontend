'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Lock, Eye, EyeOff, Shield, Check, AlertCircle, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth.store'
import {authService} from '@/services/auth.service'

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useState(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t) })
  return (
    <div className={cn(
      'fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium',
      type === 'success'
        ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-300'
        : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300'
    )}>
      {type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {message}
      <button onClick={onClose}><X className="w-3.5 h-3.5 opacity-60 hover:opacity-100" /></button>
    </div>
  )
}

function PasswordInput({ label, value, onChange, show, onToggle, placeholder }: {
  label: string; value: string; onChange: (v: string) => void
  show: boolean; onToggle: () => void; placeholder?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder || '••••••••'}
          className={cn(
            'w-full px-3 py-2 pr-10 text-sm rounded-lg border border-slate-200 dark:border-slate-700',
            'bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder:text-slate-400',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-colors'
          )}
        />
        <button type="button" onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )
}

const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One number', test: (p: string) => /[0-9]/.test(p) },
]

export default function SecuritySettingsPage() {
  const { user } = useAuthStore()
  const [form, setForm] = useState({ current: '', newPass: '', confirm: '' })
  const [show, setShow] = useState({ current: false, newPass: false, confirm: false })
  const [error, setError] = useState('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const mutation = useMutation({
    mutationFn: () => authService.changePassword({ currentPassword: form.current, newPassword: form.newPass }),
    onSuccess: () => {
      setToast({ message: 'Password changed successfully!', type: 'success' })
      setForm({ current: '', newPass: '', confirm: '' })
      setError('')
    },
    onError: (e: any) => setToast({ message: e?.response?.data?.message || 'Failed to change password.', type: 'error' }),
  })

  const handleSubmit = () => {
    if (!form.current) return setError('Current password is required')
    if (form.newPass.length < 8) return setError('Password must be at least 8 characters')
    if (form.newPass !== form.confirm) return setError('Passwords do not match')
    setError('')
    mutation.mutate()
  }

  const toggle = (field: keyof typeof show) => setShow(s => ({ ...s, [field]: !s[field] }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Lock className="w-5 h-5 text-indigo-500" /> Security
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage your password and account security</p>
      </div>

      {/* Change Password */}
      <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-6">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Change Password</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">Enter your current password and choose a new one</p>

        <div className="space-y-4 max-w-sm">
          <PasswordInput
            label="Current Password"
            value={form.current}
            onChange={v => setForm(f => ({ ...f, current: v }))}
            show={show.current}
            onToggle={() => toggle('current')}
          />
          <PasswordInput
            label="New Password"
            value={form.newPass}
            onChange={v => setForm(f => ({ ...f, newPass: v }))}
            show={show.newPass}
            onToggle={() => toggle('newPass')}
          />

          {/* Password strength */}
          {form.newPass && (
            <div className="space-y-1.5 pl-1">
              {PASSWORD_RULES.map(rule => (
                <div key={rule.label} className="flex items-center gap-2">
                  <div className={cn('w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors',
                    rule.test(form.newPass) ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
                  )}>
                    {rule.test(form.newPass) && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                  <span className={cn('text-xs', rule.test(form.newPass) ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400')}>
                    {rule.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          <PasswordInput
            label="Confirm New Password"
            value={form.confirm}
            onChange={v => setForm(f => ({ ...f, confirm: v }))}
            show={show.confirm}
            onToggle={() => toggle('confirm')}
          />

          {error && (
            <p className="text-xs text-red-500 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" /> {error}
            </p>
          )}

          <button type="button" onClick={handleSubmit}
            disabled={mutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors">
            {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            Update Password
          </button>
        </div>
      </div>

      {/* Session Info */}
      <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-6">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-500" /> Session Info
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Your current login session details</p>
        <div className="space-y-0">
          {[
            { label: 'Logged in as', value: user?.email || '-' },
            { label: 'Role', value: user?.role?.replace('_', ' ') || '-' },
            { label: 'Session started', value: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) },
          ].map((item, i, arr) => (
            <div key={item.label}
              className={cn('flex justify-between py-2.5', i < arr.length - 1 && 'border-b border-slate-100 dark:border-slate-700/40')}>
              <span className="text-sm text-slate-500 dark:text-slate-400">{item.label}</span>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}