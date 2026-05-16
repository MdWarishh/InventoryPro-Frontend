import api from '@/lib/axios'
import type { Settings, UpdateSettingsPayload } from '@/types/settings.types'

const settingsService = {
  getSettings: async (branchId?: string | null): Promise<Settings> => {
    const params = branchId ? { branchId } : {}
    const { data } = await api.get('/settings', { params })
    return data.data
  },

  getAllSettings: async (): Promise<Settings[]> => {
    const { data } = await api.get('/settings/all')
    return data.data
  },

  updateSettings: async (payload: UpdateSettingsPayload): Promise<Settings> => {
    const { data } = await api.put('/settings', payload)
    return data.data
  },

  uploadLogo: async (formData: FormData): Promise<Settings> => {
    const { data } = await api.post('/settings/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data.data
  },

  uploadQRCode: async (formData: FormData): Promise<Settings> => {
    const { data } = await api.post('/settings/qr-code', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data.data
  },

  uploadAuthorizedSignature: async (formData: FormData): Promise<Settings> => {
    const { data } = await api.post('/settings/signature', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data.data
  },
}

export default settingsService