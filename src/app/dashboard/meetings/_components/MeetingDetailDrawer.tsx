'use client'

import type { Meeting } from '@/types/meetings.types'
import {
  STATUS_CLASS, PRIORITY_CLASS, PRIORITY_COLOR,
  fmtDate, fmtTime, fmtDuration,
} from './MeetingCard'

interface Props {
  meeting: Meeting | null
  onClose: () => void
  onEdit: (m: Meeting) => void
  onDelete: (m: Meeting) => void
}

export function MeetingDetailDrawer({ meeting, onClose, onEdit, onDelete }: Props) {
  if (!meeting) return null

  const pColor = PRIORITY_COLOR[meeting.priority] || '#6366f1'

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={e => e.stopPropagation()}>
        {/* Head */}
        <div className="drawer-head">
          <h2>{meeting.title}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="drawer-body">
          {/* Badges */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span className={`badge ${STATUS_CLASS[meeting.status]}`}>
              <span className="badge-dot" style={{ background: 'currentColor' }} />
              {meeting.status.charAt(0) + meeting.status.slice(1).toLowerCase()}
            </span>
            <span className={`badge ${PRIORITY_CLASS[meeting.priority]}`} style={{ borderLeft: `3px solid ${pColor}` }}>
              {meeting.priority.charAt(0) + meeting.priority.slice(1).toLowerCase()} Priority
            </span>
            <span className="badge t-badge">{meeting.type}</span>
          </div>

          {/* Description */}
          {meeting.description && (
            <div>
              <p className="detail-section-title">Description</p>
              <p style={{ fontSize: 14, color: '#4b5270', lineHeight: 1.7 }}>{meeting.description}</p>
            </div>
          )}

          {/* Time & Location */}
          <div>
            <p className="detail-section-title">When & Where</p>
            <div className="detail-row">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <div>
                <p className="detail-label">Date</p>
                <p className="detail-value">{fmtDate(meeting.startTime)}</p>
              </div>
            </div>
            <div className="detail-row">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <div>
                <p className="detail-label">Time</p>
                <p className="detail-value">
                  {fmtTime(meeting.startTime)} – {fmtTime(meeting.endTime)}
                  <span style={{ marginLeft: 8, background: '#f0f2f8', borderRadius: 5, padding: '2px 7px', fontSize: 11, fontWeight: 600, color: '#7880a0' }}>
                    {fmtDuration(meeting.startTime, meeting.endTime)}
                  </span>
                </p>
              </div>
            </div>
            {meeting.location && (
              <div className="detail-row">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <div>
                  <p className="detail-label">Location</p>
                  <p className="detail-value">{meeting.location}</p>
                </div>
              </div>
            )}
            {meeting.meetingLink && (
              <div className="detail-row">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
                <div>
                  <p className="detail-label">Meeting Link</p>
                  <a href={meeting.meetingLink} target="_blank" rel="noreferrer"
                    style={{ fontSize: 14, color: '#6366f1', fontWeight: 600, textDecoration: 'none', wordBreak: 'break-all' }}>
                    {meeting.meetingLink}
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Reminder */}
          <div>
            <p className="detail-section-title">Reminder</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span style={{ fontSize: 14, color: '#4b5270' }}>
                {meeting.reminderMinutes} minutes before
                {meeting.reminderSent && (
                  <span style={{ marginLeft: 8, background: '#f0fdf4', color: '#16a34a', borderRadius: 5, padding: '2px 7px', fontSize: 11, fontWeight: 700 }}>
                    Sent ✓
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Participants */}
          <div>
            <p className="detail-section-title">
              Participants ({meeting.participants.length})
            </p>
            {meeting.participants.length === 0 ? (
              <p style={{ fontSize: 13, color: '#b0b8cc' }}>No participants added</p>
            ) : (
              <div className="participants-grid">
                {meeting.participants.map((p, i) => {
                  const name = p.user?.name || p.externalName || 'Unknown'
                  const email = p.user?.email || p.externalEmail || ''
                  const initials = name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
                  return (
                    <div key={i} className="participant-chip">
                      <div className="participant-avatar">{initials}</div>
                      <div>
                        <p className="participant-name">{name}</p>
                        {email && <p className="participant-email">{email}</p>}
                      </div>
                      <span className="badge" style={{ marginLeft: 'auto', fontSize: 10 }}
                        // status color
                      >
                        {p.status}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Notes */}
          {meeting.notes && (
            <div>
              <p className="detail-section-title">Notes</p>
              <div className="notes-box">{meeting.notes}</div>
            </div>
          )}

          {/* Meta */}
          <div style={{ borderTop: '1.5px solid #f1f3f9', paddingTop: 16 }}>
            <p style={{ fontSize: 12, color: '#b0b8cc' }}>
              Created by <strong style={{ color: '#7880a0' }}>{meeting.createdByUser?.name}</strong>
              {' · '}
              {new Date(meeting.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="drawer-actions">
          <button className="btn-ghost" style={{ flex: 1 }} onClick={() => { onEdit(meeting); onClose() }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" style={{ marginRight: 6 }}>
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Edit
          </button>
          <button className="btn-danger" style={{ flex: 1 }} onClick={() => { onDelete(meeting); onClose() }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" style={{ marginRight: 6 }}>
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            </svg>
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}