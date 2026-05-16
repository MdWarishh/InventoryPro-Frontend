import { cn } from '@/lib/utils'

interface FormFieldProps {
  label: string
  error?: string
  required?: boolean
  hint?: string
  children: React.ReactNode
  className?: string
}

export function FormField({ label, error, required, hint, children, className }: FormFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-slate-400">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  )
}

// ─── Input ────────────────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export function Input({ error, className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 transition-all',
        'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
        'dark:bg-slate-800/60 dark:text-white dark:placeholder-slate-500',
        error
          ? 'border-red-400 dark:border-red-500 focus:ring-red-400'
          : 'border-slate-300 dark:border-slate-600',
        props.disabled && 'opacity-60 cursor-not-allowed',
        className
      )}
      {...props}
    />
  )
}

// ─── Textarea ─────────────────────────────────────────────────────────────────

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

export function Textarea({ error, className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        'w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 transition-all resize-none',
        'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
        'dark:bg-slate-800/60 dark:text-white dark:placeholder-slate-500',
        error
          ? 'border-red-400 dark:border-red-500 focus:ring-red-400'
          : 'border-slate-300 dark:border-slate-600',
        className
      )}
      rows={3}
      {...props}
    />
  )
}

// ─── Select ───────────────────────────────────────────────────────────────────

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
}

export function Select({ error, className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        'w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 transition-all',
        'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
        'dark:bg-slate-800/60 dark:text-white',
        error
          ? 'border-red-400 dark:border-red-500 focus:ring-red-400'
          : 'border-slate-300 dark:border-slate-600',
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
}

// ─── Button ───────────────────────────────────────────────────────────────────

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md'
  loading?: boolean
  icon?: React.ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  icon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
    secondary: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-transparent dark:text-slate-300 dark:hover:bg-slate-800 focus:ring-slate-300',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 focus:ring-slate-300',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
  }

  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon}
      {children}
    </button>
  )
}