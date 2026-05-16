'use client'

import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/auth.store'
import settingsService from '@/services/settings.service'

/**
 * useAppearance — call this ONCE at the top-level layout (e.g. app/layout.tsx or a ClientProviders wrapper).
 *
 * What it does:
 *  1. Fetches settings for the current branch
 *  2. Applies primaryColor / secondaryColor as CSS variables on <html>
 *  3. Applies fontFamily + fontSize as CSS variables on <html>
 *
 * Then in your globals.css / tailwind base you just use var(--brand-primary) etc.
 */
export function useAppearance() {
  const { user } = useAuthStore()
  const branchId = user?.branchId

  const { data: settings } = useQuery({
    queryKey: ['settings', branchId],
    queryFn: () => settingsService.getSettings(branchId),
    enabled: !!branchId,
    staleTime: 1000 * 60 * 5, // 5 min cache
  })

  useEffect(() => {
    if (!settings) return

    const root = document.documentElement

    // ── Colors ────────────────────────────────────────────────────────────────
    if (settings.primaryColor) {
      root.style.setProperty('--brand-primary', settings.primaryColor)
      // Also derive a soft bg tint (10% opacity) for hover/active states
      root.style.setProperty('--brand-primary-soft', settings.primaryColor + '1a')
    }
    if (settings.secondaryColor) {
      root.style.setProperty('--brand-secondary', settings.secondaryColor)
      root.style.setProperty('--brand-secondary-soft', settings.secondaryColor + '1a')
    }
    if (settings.footerColor) {
      root.style.setProperty('--brand-footer', settings.footerColor)
    }

    // ── Typography ────────────────────────────────────────────────────────────
    if (settings.fontFamily) {
      root.style.setProperty('--brand-font', settings.fontFamily + ', sans-serif')
      // Apply directly to body so all text picks it up
      document.body.style.fontFamily = settings.fontFamily + ', sans-serif'
    }

    const fontSizeMap: Record<string, string> = {
      sm: '13px',
      md: '14px',
      lg: '16px',
    }
    if (settings.fontSize) {
      const size = fontSizeMap[settings.fontSize] ?? '14px'
      root.style.setProperty('--brand-font-size', size)
      document.body.style.fontSize = size
    }
  }, [settings])
}