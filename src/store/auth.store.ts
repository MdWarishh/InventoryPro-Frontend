import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { authService } from '@/services/auth.service'
import { tokenStorage } from '@/lib/axios'
import type { User, LoginPayload } from '@/types/auth.types'

// ─── Auth Store ───────────────────────────────────────────────────────────────

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  login: (payload: LoginPayload) => Promise<void>
  logout: () => Promise<void>
  fetchMe: () => Promise<void>
  clearError: () => void
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (payload) => {
        set({ isLoading: true, error: null })
        try {
          const { user, accessToken, refreshToken } = await authService.login(payload)
          tokenStorage.setTokens(accessToken, refreshToken)
          set({ user, isAuthenticated: true, isLoading: false })
        } catch (err: unknown) {
          const message =
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
            'Login failed. Please try again.'
          set({ error: message, isLoading: false })
          throw err
        }
      },

      logout: async () => {
        set({ isLoading: true })
        try {
          await authService.logout()
        } catch {
          // Even if server call fails, clear local state
        } finally {
          tokenStorage.clear()
          set({ user: null, isAuthenticated: false, isLoading: false, error: null })
        }
      },

      fetchMe: async () => {
        const token = tokenStorage.getAccess()
        if (!token) {
          set({ isAuthenticated: false, user: null })
          return
        }
        set({ isLoading: true })
        try {
          const user = await authService.getMe()
          set({ user, isAuthenticated: true, isLoading: false })
        } catch {
          tokenStorage.clear()
          set({ user: null, isAuthenticated: false, isLoading: false })
        }
      },

      clearError: () => set({ error: null }),

      setUser: (user) => set({ user }),
    }),
    {
      name: 'inv-auth-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist user info, NOT tokens (tokens in tokenStorage)
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectUser = (state: AuthState) => state.user
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated
export const selectUserRole = (state: AuthState) => state.user?.role
export const selectUserBranch = (state: AuthState) => state.user?.branch