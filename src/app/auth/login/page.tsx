'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Package, Sun, Moon, ArrowRight, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useThemeStore } from '@/store/theme.store'
import { cn } from '@/lib/utils'

// ─── Validation Schema ────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email('Valid email address required'),
  password: z.string().min(1, 'Password is required'),
})

type LoginForm = z.infer<typeof loginSchema>

// ─── Login Page ───────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading, error, clearError } = useAuth()
  const { theme, toggleTheme } = useThemeStore()
  const [showPassword, setShowPassword] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    clearError()
    try {
      await login(data)
      router.push('/dashboard')
    } catch {
      // Error handled in store
    }
  }

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-slate-50 dark:bg-[#0a0a0f]">

      {/* ── Left Panel — Branding ── */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700">

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Glow circles */}
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-purple-400/20 blur-3xl" />

        {/* Content */}
        <div
          className={cn(
            'relative z-10 flex flex-col items-center text-center px-12 transition-all duration-700',
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          )}
        >
          {/* Logo */}
          <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 shadow-2xl">
            <Package className="h-10 w-10 text-white" strokeWidth={1.5} />
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-white mb-3">
            InvenTrack Pro
          </h1>
          <p className="text-lg text-white/70 max-w-xs leading-relaxed">
            Multi-branch inventory management — built for scale and simplicity
          </p>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-6 w-full">
            {[
              { label: 'Branches', value: '∞' },
              { label: 'Real-time', value: 'SSE' },
              { label: 'Roles', value: '3' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10"
              >
                <span className="text-2xl font-bold text-white">{stat.value}</span>
                <span className="text-xs text-white/60 mt-1">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel — Login Form ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-16">

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="absolute top-6 right-6 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:scale-105 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Mobile logo */}
        <div className="mb-10 flex items-center gap-3 lg:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600">
            <Package className="h-5 w-5 text-white" strokeWidth={1.5} />
          </div>
          <span className="text-xl font-bold text-slate-900 dark:text-white">InvenTrack Pro</span>
        </div>

        {/* Form card */}
        <div
          className={cn(
            'w-full max-w-md transition-all duration-500',
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          )}
        >
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Welcome back
            </h2>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* Global error */}
            {error && (
              <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/50 dark:bg-red-900/20 dark:text-red-400 animate-in slide-in-from-top-2 duration-200">
                <span className="h-2 w-2 flex-shrink-0 rounded-full bg-red-500" />
                {error}
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="admin@company.com"
                {...register('email')}
                className={cn(
                  'w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-all',
                  'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
                  'dark:bg-slate-800/60 dark:border-slate-700 dark:text-white dark:placeholder-slate-500',
                  errors.email
                    ? 'border-red-400 focus:ring-red-400'
                    : 'border-slate-300 dark:border-slate-600'
                )}
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
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
                    'w-full rounded-lg border bg-white px-4 py-2.5 pr-10 text-sm text-slate-900 placeholder-slate-400 transition-all',
                    'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
                    'dark:bg-slate-800/60 dark:border-slate-700 dark:text-white dark:placeholder-slate-500',
                    errors.password
                      ? 'border-red-400 focus:ring-red-400'
                      : 'border-slate-300 dark:border-slate-600'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                'group relative w-full flex items-center justify-center gap-2',
                'rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white',
                'transition-all duration-200 hover:bg-indigo-700 active:scale-[0.98]',
                'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
                'disabled:opacity-60 disabled:cursor-not-allowed',
                'dark:focus:ring-offset-slate-900'
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-slate-400 dark:text-slate-600">
            © {new Date().getFullYear()} InvenTrack Pro · Inventory Management System
          </p>
        </div>
      </div>
    </div>
  )
}