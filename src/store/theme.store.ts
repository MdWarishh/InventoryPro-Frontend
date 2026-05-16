import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

type Theme = 'light' | 'dark' | 'system'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',

      setTheme: (theme) => {
        set({ theme })
        applyTheme(theme)
      },

      toggleTheme: () => {
        const current = get().theme
        const next = current === 'dark' ? 'light' : 'dark'
        set({ theme: next })
        applyTheme(next)
      },
    }),
    {
      name: 'inv-theme',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// ─── Apply theme to document ──────────────────────────────────────────────────

export const applyTheme = (theme: Theme) => {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    root.classList.toggle('dark', prefersDark)
  } else {
    root.classList.toggle('dark', theme === 'dark')
  }
}