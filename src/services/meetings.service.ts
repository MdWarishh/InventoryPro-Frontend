import api from '@/lib/axios'
import type {
  Meeting,
  MeetingFilters,
  CreateMeetingPayload,
  UpdateMeetingPayload,
} from '@/types/meetings.types'

export const meetingsService = {
  getAll: async (params?: MeetingFilters): Promise<Meeting[]> => {
    const { data } = await api.get('/meetings', { params })
    return Array.isArray(data.data) ? data.data : []
  },

  getById: async (id: string): Promise<Meeting> => {
    const { data } = await api.get(`/meetings/${id}`)
    return data.data as Meeting
  },

  create: async (payload: CreateMeetingPayload): Promise<Meeting> => {
    const { data } = await api.post('/meetings', payload)
    return data.data as Meeting
  },

  update: async (id: string, payload: UpdateMeetingPayload): Promise<Meeting> => {
    const { data } = await api.put(`/meetings/${id}`, payload)
    return data.data as Meeting
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/meetings/${id}`)
  },
}