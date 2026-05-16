'use client'

import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/auth.store'
import settingsService from '@/services/settings.service'

// Hex color (#rrggbb) ko HSL string mein convert karta hai
function hexToHsl(hex: string): string | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return null

  let r = parseInt(result[1], 16) / 255
  let g = parseInt(result[2], 16) / 255
  let b = parseInt(result[3], 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

// fontSize setting ko rem value mein convert karta hai
function fontSizeToRem(size: 'sm' | 'md' | 'lg'): string {
  const map = { sm: '0.875rem', md: '1rem', lg: '1.125rem' }
  return map[size] ?? '1rem'
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const user = useAuthStore(s => s.user)
  const branchId = user?.branchId ?? user?.branch?.id ?? undefined

  const { data: settings } = useQuery({
    queryKey: ['settings', branchId],
    queryFn: () => settingsService.getSettings(branchId),
    enabled: !!branchId,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  })

  useEffect(() => {
    if (!settings) return

    const root = document.documentElement

    // ── Primary Color → --primary CSS variable update karo
    if (settings.primaryColor) {
      const hsl = hexToHsl(settings.primaryColor)
      if (hsl) {
        root.style.setProperty('--primary', hsl)
        root.style.setProperty('--ring', hsl)
      }
    }

    // ── Secondary Color → --secondary update karo
    if (settings.secondaryColor) {
      const hsl = hexToHsl(settings.secondaryColor)
      if (hsl) {
        root.style.setProperty('--secondary', hsl)
        root.style.setProperty('--accent', hsl)
      }
    }

    // ── Font Size → base font size update karo
   if (settings.fontSize) {
  root.style.setProperty('--base-font-size', fontSizeToRem(settings.fontSize as 'sm' | 'md' | 'lg'))
  root.style.fontSize = fontSizeToRem(settings.fontSize as 'sm' | 'md' | 'lg')
}

    // ── Font Family → Google Fonts se load karo dynamically
    if (settings.fontFamily) {
      const font = settings.fontFamily
      // Pehle check karo ki font already load hai ya nahi
      const existingLink = document.getElementById('settings-font')
      if (existingLink) existingLink.remove()

      const link = document.createElement('link')
      link.id = 'settings-font'
      link.rel = 'stylesheet'
      link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/ /g, '+')}:wght@400;500;600;700&display=swap`
      document.head.appendChild(link)

      root.style.setProperty('--font-settings', `'${font}', system-ui, sans-serif`)
      document.body.style.fontFamily = `'${font}', system-ui, sans-serif`
    }

  }, [settings])

  // Cleanup on unmount — default values restore karo
  useEffect(() => {
    return () => {
      const root = document.documentElement
      root.style.removeProperty('--primary')
      root.style.removeProperty('--ring')
      root.style.removeProperty('--secondary')
      root.style.removeProperty('--accent')
      root.style.removeProperty('--base-font-size')
      root.style.removeProperty('--font-settings')
      document.body.style.removeProperty('font-family')
      document.body.style.removeProperty('font-size')
    }
  }, [])

  return <>{children}</>
}