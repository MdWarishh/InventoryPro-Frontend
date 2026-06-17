'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Sun, Moon, ArrowRight, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useThemeStore } from '@/store/theme.store'
import { cn } from '@/lib/utils'

const loginSchema = z.object({
  email: z.string().email('Valid email address required'),
  password: z.string().min(1, 'Password is required'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading, error, clearError } = useAuth()
  const { theme, toggleTheme } = useThemeStore()
  const [showPassword, setShowPassword] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [logoError, setLogoError] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    clearError()
    try {
      await login(data)
      router.push('/dashboard')
    } catch {}
  }

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-slate-50 dark:bg-[#0a0f0e]">

      {/* ── Left Panel ── */}
      <div
        className="relative hidden lg:flex lg:w-[48%] flex-col items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #0d6b5e 0%, #1a8a7a 40%, #0f7a6a 70%, #0a5a4e 100%)' }}
      >
        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)`,
            backgroundSize: '28px 28px',
          }}
        />
        <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full opacity-20 blur-3xl"
          style={{ background: '#4dd9c8' }} />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full opacity-15 blur-3xl"
          style={{ background: '#0a4a40' }} />

        {/* Content */}
        <div className={cn(
          'relative z-10 flex flex-col items-center text-center px-14 transition-all duration-700',
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        )}>

          {/* Logo card */}
          <div
            className="mb-8 flex h-36 w-36 items-center justify-center rounded-2xl bg-white overflow-hidden p-2"
            style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.15)' }}
          >
            {!logoError ? (
              <img
                src="/logo.jpeg"
                alt="Limra Speech and Hearing Clinic"
                onError={() => setLogoError(true)}
                className="h-full w-full object-contain"
              />
            ) : (
              <span className="text-4xl font-black" style={{ color: '#1a7a6e' }}>L</span>
            )}
          </div>

          <h1 className="text-[26px] font-bold tracking-tight text-white leading-snug mb-2">
            Limra Speech and<br />Hearing Clinic
          </h1>
          <p className="text-sm leading-relaxed mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Helping You Speak Clearly and Hear the World Better
          </p>

          <div className="mt-10 w-12 h-px" style={{ background: 'rgba(255,255,255,0.2)' }} />

          <div className="mt-8 grid grid-cols-3 gap-3 w-full">
            {[
              { label: 'Branches', value: '∞' },
              { label: 'Real-time', value: 'Live' },
              { label: 'Roles', value: '3' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center py-4 rounded-xl border"
                style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.12)' }}
              >
                <span className="text-xl font-bold text-white">{stat.value}</span>
                <span className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.55)' }}>{stat.label}</span>
              </div>
            ))}
          </div>

          <p className="mt-10 text-[11px] tracking-wider" style={{ color: 'rgba(255,255,255,0.28)' }}>
            INVENTORY MANAGEMENT PORTAL
          </p>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-16">

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="absolute top-6 right-6 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:scale-105 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Mobile logo */}
        <div className="mb-10 flex flex-col items-center gap-3 lg:hidden">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white border border-slate-200 shadow-md overflow-hidden p-1.5 dark:bg-slate-800 dark:border-slate-700">
            {!logoError ? (
              <img
                src="/logo.jpeg"
                alt="Limra"
                onError={() => setLogoError(true)}
                className="h-full w-full object-contain"
              />
            ) : (
              <span className="text-2xl font-black" style={{ color: '#1a7a6e' }}>L</span>
            )}
          </div>
          <div className="text-center">
            <p className="text-base font-bold text-slate-900 dark:text-white leading-tight">
              Limra Speech and Hearing Clinic
            </p>
            <p className="text-xs text-slate-400 mt-0.5">Inventory Management Portal</p>
          </div>
        </div>

        {/* Form */}
        <div className={cn(
          'w-full max-w-md transition-all duration-500',
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        )}>
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Welcome back
            </h2>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {error && (
              <div className="flex items-center gap-3 rounded-lg border px-4 py-3 text-sm animate-in slide-in-from-top-2 duration-200"
                style={{ background: '#fef2f2', borderColor: '#fecaca', color: '#b91c1c' }}>
                <span className="h-2 w-2 flex-shrink-0 rounded-full bg-red-500" />
                {error}
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="admin@limrahearing.com"
                {...register('email')}
                className={cn(
                  'w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-all outline-none',
                  'dark:bg-slate-800/60 dark:text-white dark:placeholder-slate-500',
                  errors.email ? 'border-red-400' : 'border-slate-300 dark:border-slate-600'
                )}
                onFocus={(e) => {
                  if (!errors.email) {
                    e.target.style.borderColor = '#1a7a6e'
                    e.target.style.boxShadow = '0 0 0 3px rgba(26,122,110,0.12)'
                  }
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = ''
                  e.target.style.boxShadow = ''
                }}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  {...register('password')}
                  className={cn(
                    'w-full rounded-lg border bg-white px-4 py-2.5 pr-10 text-sm text-slate-900 placeholder-slate-400 transition-all outline-none',
                    'dark:bg-slate-800/60 dark:text-white dark:placeholder-slate-500',
                    errors.password ? 'border-red-400' : 'border-slate-300 dark:border-slate-600'
                  )}
                  onFocus={(e) => {
                    if (!errors.password) {
                      e.target.style.borderColor = '#1a7a6e'
                      e.target.style.boxShadow = '0 0 0 3px rgba(26,122,110,0.12)'
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = ''
                    e.target.style.boxShadow = ''
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="group w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 active:scale-[0.98] focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: '#1a7a6e' }}
              onMouseEnter={(e) => { if (!isLoading) (e.currentTarget as HTMLButtonElement).style.background = '#0f6358' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#1a7a6e' }}
            >
              {isLoading ? (
                <><Loader2 className="h-4 w-4 animate-spin" />Signing in...</>
              ) : (
                <>Sign in<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-400 dark:text-slate-600">
            © {new Date().getFullYear()} Limra Speech and Hearing Clinic · All rights reserved
          </p>
        </div>
      </div>
    </div>
  )
}