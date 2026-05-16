'use client'

import type { Meeting } from '@/types/meetings.types'

// ── helpers ──────────────────────────────────────────────────────────────────
export const PRIORITY_COLOR: Record<string, string> = {
  LOW: '#16a34a', MEDIUM: '#3b82f6', HIGH: '#d97706', URGENT: '#ef4444',
}
export const STATUS_CLASS: Record<string, string> = {
  SCHEDULED: 's-scheduled', ONGOING: 's-ongoing',
  COMPLETED: 's-completed', CANCELLED: 's-cancelled', POSTPONED: 's-postponed',
}
export const PRIORITY_CLASS: Record<string, string> = {
  LOW: 'p-low', MEDIUM: 'p-medium', HIGH: 'p-high', URGENT: 'p-urgent',
}

export function fmtTime(d: string) {
  return new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}
export function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}
export function fmtDuration(start: string, end: string) {
  const mins = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000)
  if (mins < 60) return `${mins}m`
  const h = Math.floor(mins / 60), m = mins % 60
  return m ? `${h}h ${m}m` : `${h}h`
}

// ── Component ─────────────────────────────────────────────────────────────────
interface Props {
  meeting: Meeting
  onView: (m: Meeting) => void
  onEdit: (m: Meeting) => void
  onDelete: (m: Meeting) => void
}

export function MeetingCard({ meeting, onView, onEdit, onDelete }: Props) {
  const pColor = PRIORITY_COLOR[meeting.priority] || '#6366f1'
  const visibleParticipants = meeting.participants.slice(0, 3)
  const extra = meeting.participants.length - 3

  return (
    <div
      className="m-card"
      style={{ ['--priority-color' as string]: pColor }}
      onClick={() => onView(meeting)}
    >
      <div className="card-top">
        <div className="card-badges">
          <span className={`badge ${STATUS_CLASS[meeting.status]}`}>
            <span className="badge-dot" style={{ background: 'currentColor' }} />
            {meeting.status.charAt(0) + meeting.status.slice(1).toLowerCase()}
          </span>
          <span className={`badge ${PRIORITY_CLASS[meeting.priority]}`}>
            {meeting.priority.charAt(0) + meeting.priority.slice(1).toLowerCase()}
          </span>
          <span className="badge t-badge">{meeting.type}</span>
        </div>
        <div className="card-actions-row" onClick={e => e.stopPropagation()}>
          <button className="btn-icon" onClick={() => onEdit(meeting)} title="Edit">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button className="btn-icon danger" onClick={() => onDelete(meeting)} title="Delete">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/>
            </svg>
          </button>
        </div>
      </div>

      <h3 className="card-title">{meeting.title}</h3>
      {meeting.description && (
        <p className="card-desc" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {meeting.description}
        </p>
      )}

      <div className="card-meta">
        <div className="card-meta-row">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <span>{fmtDate(meeting.startTime)} · {fmtTime(meeting.startTime)} – {fmtTime(meeting.endTime)}</span>
          <span style={{ marginLeft: 4, background: '#f0f2f8', borderRadius: 5, padding: '1px 6px', fontSize: 11, fontWeight: 600, color: '#7880a0' }}>
            {fmtDuration(meeting.startTime, meeting.endTime)}
          </span>
        </div>
        {meeting.location && (
          <div className="card-meta-row">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            <span>{meeting.location}</span>
          </div>
        )}
        {meeting.meetingLink && (
          <div className="card-meta-row">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
            <a href={meeting.meetingLink} target="_blank" rel="noreferrer" style={{ color: '#6366f1', fontWeight: 600, textDecoration: 'none' }} onClick={e => e.stopPropagation()}>
              Join Link
            </a>
          </div>
        )}
      </div>

      <div className="card-footer">
        <div className="avatars">
          {visibleParticipants.map((p, i) => {
            const name = p.user?.name || p.externalName || '?'
            return (
              <div key={i} className="avatar" title={name}>
                {name.charAt(0).toUpperCase()}
              </div>
            )
          })}
          {extra > 0 && <div className="avatar avatar-more">+{extra}</div>}
          {meeting.participants.length === 0 && (
            <span style={{ fontSize: 12, color: '#b0b8cc' }}>No participants</span>
          )}
        </div>
        <span style={{ fontSize: 12, color: '#9099b3' }}>by {meeting.createdByUser?.name}</span>
      </div>
    </div>
  )
}