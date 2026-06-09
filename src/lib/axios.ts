import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { API_BASE_URL, API_ENDPOINTS } from '@/config/api.config'

// ─── Axios Instance ───────────────────────────────────────────────────────────

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// ─── Token Helpers ────────────────────────────────────────────────────────────

const TOKEN_KEY = 'inv_access_token'
const REFRESH_KEY = 'inv_refresh_token'

export const tokenStorage = {
  getAccess: (): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(TOKEN_KEY)
  },
  getRefresh: (): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(REFRESH_KEY)
  },
  setTokens: (access: string, refresh: string) => {
    localStorage.setItem(TOKEN_KEY, access)
    localStorage.setItem(REFRESH_KEY, refresh)
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_KEY)
  },
}

// ─── Request Interceptor — Attach Access Token ────────────────────────────────

// axios.ts — request interceptor mein ye add karo
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccess()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // ── Branch filter inject karo ──
    const branchState = localStorage.getItem('active-branch-v1')
    if (branchState) {
      try {
        const parsed = JSON.parse(branchState)
        const branchId = parsed?.state?.selectedBranchId
        if (branchId) {
          config.headers['x-branch-id'] = branchId  // header se bhejo
          // Ya query param chahiye to:
          // config.params = { ...config.params, branchId }
        }
      } catch {}
    }

    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response Interceptor — Auto Refresh on 401 ───────────────────────────────

let isRefreshing = false
let failedQueue: Array<{
  resolve: (value: string) => void
  reject: (error: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error)
    else prom.resolve(token!)
  })
  failedQueue = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    // Only retry on 401 and not already retried
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    // Don't retry login/refresh endpoints
    const url = originalRequest.url || ''
    if (url.includes('/auth/login') || url.includes('/auth/refresh')) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      // Queue this request until refresh completes
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`
        return apiClient(originalRequest)
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    const refreshToken = tokenStorage.getRefresh()
    if (!refreshToken) {
      tokenStorage.clear()
      window.location.href = '/auth/login'
      return Promise.reject(error)
    }

    try {
      const { data } = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.auth.refresh}`, {
        refreshToken,
      })

      const { accessToken, refreshToken: newRefreshToken } = data.data
      tokenStorage.setTokens(accessToken, newRefreshToken)
      processQueue(null, accessToken)

      originalRequest.headers.Authorization = `Bearer ${accessToken}`
      return apiClient(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)
      tokenStorage.clear()
      window.location.href = '/auth/login'
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

export default apiClient