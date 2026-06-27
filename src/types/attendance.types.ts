// ─── Enums ────────────────────────────────────────────────────────────────────

export type AttendanceStatus = 'PRESENT' | 'HALF_DAY' | 'ABSENT' | 'LEAVE'

// ─── Core Models ──────────────────────────────────────────────────────────────

export interface Attendance {
  id: string
  userId: string
  branchId: string
  date: string
  checkInTime: string | null
  checkOutTime: string | null
  totalHours: number | null
  status: AttendanceStatus
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface AttendanceWithUser extends Attendance {
  user: {
    id: string
    name: string
    email: string
    role: string
    branchId: string | null
  }
}

export interface AttendanceSettings {
  id: string
  branchId: string
  minimumWorkingHours: number | null
  workStartTime: string | null
  workEndTime: string | null
  createdAt: string
  updatedAt: string
}

// ─── Response Shapes ─────────────────────────────────────────────────────────

export interface TodayStatusResponse {
  attendance: Attendance | null
  minimumWorkingHours: number | null
  allowedCheckoutAt: string | null
}

export interface AllAttendanceResponse {
  records: AttendanceWithUser[]
  total: number
  page: number
  limit: number
}

export interface UserMonthlyAttendanceResponse {
  user: {
    id: string
    name: string
    email: string
    role: string
  }
  records: Attendance[]
  summary: {
    present: number
    halfDay: number
    absent: number
    totalHours: number
  }
  month: number
  year: number
}

// ─── Payloads ─────────────────────────────────────────────────────────────────

export interface UpdateAttendanceSettingsPayload {
  minimumWorkingHours?: number | null
  workStartTime?: string | null
  workEndTime?: string | null
  branchId?: string
}

export interface GetAllAttendanceParams {
  month?: number
  year?: number
  startDate?: string
  endDate?: string
  userId?: string
  branchId?: string
  page?: number
  limit?: number
}

export interface GetUserAttendanceParams {
  month?: number
  year?: number
}

// ─── NEW: Super Admin edit payload ───────────────────────────────────────────

export interface EditAttendancePayload {
  checkInTime?: string | null   // ISO string ya null (clear karne ke liye)
  checkOutTime?: string | null  // ISO string ya null
  status?: AttendanceStatus     // Manually override karo
  notes?: string | null
}

// ─── NEW: User leave payload ──────────────────────────────────────────────────

export interface MarkLeavePayload {
  date: string   // YYYY-MM-DD format
  notes?: string | null
}