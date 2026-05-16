export type MeetingType = 'INTERNAL' | 'EXTERNAL' | 'CLIENT' | 'VENDOR' | 'OTHER'
export type MeetingPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
export type MeetingStatus = 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED'
export type ParticipantStatus = 'INVITED' | 'ACCEPTED' | 'DECLINED' | 'TENTATIVE'

export interface MeetingUser {
  id: string
  name: string
  email: string
  whatsappNumber?: string | null
}

export interface MeetingParticipant {
  id: string
  meetingId: string
  userId?: string | null
  externalName?: string | null
  externalEmail?: string | null
  status: ParticipantStatus
  user?: MeetingUser | null
}

export interface Meeting {
  id: string
  title: string
  description?: string | null
  startTime: string
  endTime: string
  location?: string | null
  meetingLink?: string | null
  type: MeetingType
  priority: MeetingPriority
  status: MeetingStatus
  reminderMinutes: number
  reminderSent: boolean
  notes?: string | null
  branchId?: string | null
  createdBy: string
  createdAt: string
  updatedAt: string
  createdByUser: { id: string; name: string; email: string }
  participants: MeetingParticipant[]
}

export interface MeetingFilters {
  startDate?: string
  endDate?: string
  status?: MeetingStatus
  branchId?: string
}

export interface ParticipantPayload {
  userId?: string
  externalName?: string
  externalEmail?: string
}

export interface CreateMeetingPayload {
  title: string
  description?: string
  startTime: string
  endTime: string
  location?: string
  meetingLink?: string
  type?: MeetingType
  priority?: MeetingPriority
  reminderMinutes?: number
  participants?: ParticipantPayload[]
  branchId?: string
}

export interface UpdateMeetingPayload extends Partial<CreateMeetingPayload> {
  status?: MeetingStatus
  notes?: string
}