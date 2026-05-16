'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading, fetchMe } = useAuth()
  const router = useRouter()

  useEffect(() => {
    fetchMe()
  }, [fetchMe])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth/login')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  return <>{children}</>
}

// ─── Guest Guard — redirect to dashboard if already logged in ─────────────────

export function GuestGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading, fetchMe } = useAuth()
  const router = useRouter()

  useEffect(() => {
    fetchMe()
  }, [fetchMe])

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (isAuthenticated) return null

  return <>{children}</>
}