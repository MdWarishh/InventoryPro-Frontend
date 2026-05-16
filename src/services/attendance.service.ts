import apiClient from '@/lib/axios'
import type { ApiSuccess } from '@/types/auth.types'
import type {
  Attendance,
  AttendanceSettings,
  TodayStatusResponse,
  AllAttendanceResponse,
  UserMonthlyAttendanceResponse,
  UpdateAttendanceSettingsPayload,
  GetAllAttendanceParams,
  GetUserAttendanceParams,
} from '@/types/attendance.types'

export const attendanceService = {
  // ── User actions ────────────────────────────────────────────────────────────

  getTodayStatus: async (): Promise<TodayStatusResponse> => {
    const { data } = await apiClient.get<ApiSuccess<TodayStatusResponse>>('/attendance/today')
    return data.data
  },

  checkIn: async (): Promise<Attendance> => {
    const { data } = await apiClient.post<ApiSuccess<Attendance>>('/attendance/check-in')
    return data.data
  },

  checkOut: async (): Promise<Attendance> => {
    const { data } = await apiClient.post<ApiSuccess<Attendance>>('/attendance/check-out')
    return data.data
  },

  // ── Admin actions ────────────────────────────────────────────────────────────

  getAll: async (params?: GetAllAttendanceParams): Promise<AllAttendanceResponse> => {
    const { data } = await apiClient.get<ApiSuccess<AllAttendanceResponse>>('/attendance', { params })
    return data.data
  },

  getUserAttendance: async (
    userId: string,
    params?: GetUserAttendanceParams,
  ): Promise<UserMonthlyAttendanceResponse> => {
    const { data } = await apiClient.get<ApiSuccess<UserMonthlyAttendanceResponse>>(
      `/attendance/user/${userId}`,
      { params },
    )
    return data.data
  },

  getSettings: async (): Promise<AttendanceSettings | null> => {
    const { data } = await apiClient.get<ApiSuccess<AttendanceSettings | null>>('/attendance/settings')
    return data.data
  },

  updateSettings: async (payload: UpdateAttendanceSettingsPayload): Promise<AttendanceSettings> => {
    const { data } = await apiClient.put<ApiSuccess<AttendanceSettings>>('/attendance/settings', payload)
    return data.data
  },

  triggerAutoAbsent: async (): Promise<{ marked: number }> => {
    const { data } = await apiClient.post<ApiSuccess<{ marked: number }>>('/attendance/auto-absent')
    return data.data
  },
}