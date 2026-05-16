'use client'

import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Palette, Sun, Moon, Monitor, Check, Save, RotateCcw, Loader2, AlertCircle, X } from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth.store'
import settingsService from '@/services/settings.service'

const schema = z.object({
  primaryColor: z.string(),
  secondaryColor: z.string(),
 fontFamily: z.enum(['Inter', 'Poppins', 'Roboto', 'Open Sans', 'Montserrat', 'Nunito']),
fontSize: z.enum(['sm', 'md', 'lg']),
})
type FormData = z.infer<typeof schema>

const PRESET_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#06b6d4', '#64748b', '#1e293b',
]

const FONTS = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Nunito', label: 'Nunito' },
] as const

const SIZES = [
  { value: 'sm', label: 'Small', px: '12px' },
  { value: 'md', label: 'Medium', px: '14px' },
  { value: 'lg', label: 'Large', px: '16px' },
] as const


const FONT_SIZE_MAP: Record<string, string> = { sm: '13px', md: '14px', lg: '16px' }

// ── Apply CSS variables globally (live preview while user picks) ──────────────
function applyBrandVars(primary: string, secondary: string, fontFamily: string, fontSize: string) {
  const root = document.documentElement
  root.style.setProperty('--brand-primary', primary)
  root.style.setProperty('--brand-primary-soft', primary + '1a')
  root.style.setProperty('--brand-secondary', secondary)
  root.style.setProperty('--brand-secondary-soft', secondary + '1a')
  root.style.setProperty('--brand-font', fontFamily + ', sans-serif')
  root.style.setProperty('--brand-font-size', FONT_SIZE_MAP[fontSize] ?? '14px')
  document.body.style.fontFamily = fontFamily + ', sans-serif'
  document.body.style.fontSize = FONT_SIZE_MAP[fontSize] ?? '14px'
}

// ── Color Picker ──────────────────────────────────────────────────────────────
function ColorPicker({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <div className="flex items-center gap-3 flex-wrap">
        <label className="relative cursor-pointer">
          <div
            className="w-10 h-10 rounded-lg shadow-md ring-2 ring-white dark:ring-slate-700 transition-transform hover:scale-110"
            style={{ background: value }}
          />
          <input type="color" value={value} onChange={e => onChange(e.target.value)} className="sr-only" />
        </label>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_COLORS.map(c => (
            <button
              key={c} type="button" onClick={() => onChange(c)}
              className={cn(
                'w-6 h-6 rounded-md transition-all hover:scale-110 border-2',
                value === c ? 'border-slate-900 dark:border-white scale-110' : 'border-transparent'
              )}
              style={{ background: c }}
            />
          ))}
        </div>
        <span className="text-xs font-mono text-slate-400 ml-1">{value}</span>
      </div>
    </div>
  )
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [onClose])
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

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AppearanceSettingsPage() {
  const { user } = useAuthStore()

  // FIX: useTheme() can return undefined on first render (hydration).
  // Always destructure with a fallback — never conditionally call the hook.
  const { theme, setTheme, resolvedTheme } = useTheme()
  const activeTheme = theme ?? 'system'

  const qc = useQueryClient()
  const branchId = user?.branchId ?? undefined
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // FIX: Track mounted state to avoid next-themes SSR hydration mismatch
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings', branchId],
    queryFn: () => settingsService.getSettings(branchId),
    enabled: !!branchId,
  })

  const { handleSubmit, setValue, watch, reset, formState: { isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      primaryColor: '#6366f1',
      secondaryColor: '#8b5cf6',
      fontFamily: 'Inter',
      fontSize: 'md',
    },
  })

  // Populate form once settings load
 useEffect(() => {
  if (settings) {
    const values: FormData = {
      primaryColor: settings.primaryColor || '#6366f1',
      secondaryColor: settings.secondaryColor || '#8b5cf6',
      fontFamily: (settings.fontFamily as FormData['fontFamily']) || 'Inter',
      fontSize: (settings.fontSize as FormData['fontSize']) || 'md',
    }
    reset(values)
    applyBrandVars(values.primaryColor, values.secondaryColor, values.fontFamily, values.fontSize)
  }
}, [settings, reset])

  const updateMutation = useMutation({
    mutationFn: (data: FormData) => settingsService.updateSettings({ branchId: branchId as string, ...data }),
    onSuccess: (saved) => {
      qc.invalidateQueries({ queryKey: ['settings'] })
      // FIX: Apply to DOM after successful save so the whole app updates
      applyBrandVars(saved.primaryColor, saved.secondaryColor, saved.fontFamily, saved.fontSize)
      setToast({ message: 'Appearance saved!', type: 'success' })
    },
    onError: () => setToast({ message: 'Failed to save.', type: 'error' }),
  })

  const primaryColor = watch('primaryColor')
  const secondaryColor = watch('secondaryColor')
  const fontFamily = watch('fontFamily')
  const fontSize = watch('fontSize')

  // FIX: Live preview — apply CSS vars as user picks colors/fonts (before saving)
  useEffect(() => {
    applyBrandVars(primaryColor, secondaryColor, fontFamily, fontSize)
  }, [primaryColor, secondaryColor, fontFamily, fontSize])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-indigo-500" /> Appearance
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Theme, colors and typography settings</p>
        </div>
        <div className="flex gap-2">
          {isDirty && (
            <button
              type="button"
              onClick={() => {
                reset()
                // Revert live preview to last saved values
                if (settings) {
                  applyBrandVars(
                    settings.primaryColor || '#6366f1',
                    settings.secondaryColor || '#8b5cf6',
                    settings.fontFamily || 'Inter',
                    settings.fontSize || 'md',
                  )
                }
              }}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Discard
            </button>
          )}
          <button
            onClick={handleSubmit(d => updateMutation.mutate(d))}
            disabled={updateMutation.isPending || !isDirty}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>

      {/* Theme — FIX: render only after mounted to avoid next-themes hydration mismatch */}
      <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-6">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Interface Theme</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Choose between light, dark or system default</p>
        {!mounted ? (
          // Skeleton placeholder while next-themes hydrates — prevents flash
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map(i => (
              <div key={i} className="h-24 rounded-xl border-2 border-slate-200 dark:border-slate-700 animate-pulse bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'light', label: 'Light', icon: Sun, desc: 'Always light' },
              { value: 'dark', label: 'Dark', icon: Moon, desc: 'Always dark' },
              { value: 'system', label: 'System', icon: Monitor, desc: 'Follows OS' },
            ].map(({ value, label, icon: Icon, desc }) => (
              <button
                key={value}
                type="button"
                // FIX: setTheme directly — next-themes handles everything else
                onClick={() => setTheme(value)}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center',
                  activeTheme === value
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                )}
              >
                <Icon className={cn('w-5 h-5', activeTheme === value ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400')} />
                <span className={cn('text-xs font-semibold', activeTheme === value ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300')}>
                  {label}
                </span>
                <span className="text-[10px] text-slate-400">{desc}</span>
                {activeTheme === value && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Brand Colors */}
      <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-6">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Brand Colors</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">Used on invoices, reports, and accents</p>
        <div className="space-y-5">
          <ColorPicker label="Primary Color" value={primaryColor} onChange={v => setValue('primaryColor', v, { shouldDirty: true })} />
          <ColorPicker label="Secondary Color" value={secondaryColor} onChange={v => setValue('secondaryColor', v, { shouldDirty: true })} />
          {/* Preview bar */}
          <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="h-8 flex">
              <div className="flex-1 transition-colors" style={{ background: primaryColor }} />
              <div className="flex-1 transition-colors" style={{ background: secondaryColor }} />
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 flex items-center gap-2 text-xs text-slate-400">
              <div className="w-4 h-4 rounded" style={{ background: primaryColor }} /> Primary
              <div className="w-4 h-4 rounded ml-4" style={{ background: secondaryColor }} /> Secondary
            </div>
          </div>
        </div>
      </div>

      {/* Typography */}
      <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-6">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Typography</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">Font family and size for the interface</p>
        <div className="grid grid-cols-2 gap-6">
          {/* Font Family */}
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Font Family</p>
            <div className="space-y-1.5">
              {FONTS.map(opt => (
                <button
                  key={opt.value} type="button"
                  onClick={() => setValue('fontFamily', opt.value, { shouldDirty: true })}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm transition-all',
                    fontFamily === opt.value
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 font-semibold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                  )}
                  style={{ fontFamily: opt.value }}
                >
                  {opt.label}
                  {fontFamily === opt.value && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Font Size</p>
            <div className="space-y-1.5">
              {SIZES.map(opt => (
                <button
                  key={opt.value} type="button"
                  onClick={() => setValue('fontSize', opt.value, { shouldDirty: true })}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-3 rounded-lg border transition-all',
                    fontSize === opt.value
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 font-semibold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                  )}
                >
                  <span style={{ fontSize: opt.px }}>{opt.label}</span>
                  {fontSize === opt.value && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
            {/* Live preview */}
            <div className="mt-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
              <p className="text-[10px] text-slate-400 mb-1.5 uppercase tracking-wider">Preview</p>
              <p
                className="text-slate-700 dark:text-slate-300"
                style={{ fontFamily, fontSize: SIZES.find(s => s.value === fontSize)?.px || '14px' }}
              >
                The quick brown fox jumps over the lazy dog
              </p>
            </div>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}