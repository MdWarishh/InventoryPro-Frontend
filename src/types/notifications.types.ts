export type NotificationType =
  | 'LOW_STOCK'
  | 'STOCK_IN'
  | 'STOCK_OUT'
  | 'TRANSFER'
  | 'GENERAL'
  | 'MEETING'
  | 'BULK_UPLOAD'
  | 'SYSTEM'

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: NotificationType
  relatedId?: string
  isRead: boolean
  createdAt: string
}

export interface NotificationResponse {
  notifications: Notification[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
  unreadCount: number
}

export interface SSEEvent {
  type: 'connected' | 'notification' | 'low_stock' | 'meeting_reminder' | 'bulk_upload_complete'
  data?: Notification
}