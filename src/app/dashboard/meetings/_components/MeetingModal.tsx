'use client'

import { useState, useEffect } from 'react'
import type { Meeting, CreateMeetingPayload, UpdateMeetingPayload, ParticipantPayload, MeetingStatus } from '@/types/meetings.types'

interface Props {
  open: boolean
  onClose: () => void
  onSave: (data: CreateMeetingPayload | UpdateMeetingPayload) => Promise<void>
  initial?: Meeting | null
  loading: boolean
}

const toDatetimeLocal = (iso: string) => {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function MeetingModal({ open, onClose, onSave, initial, loading }: Props) {
  const [form, setForm] = useState({
    title: '', description: '', startTime: '', endTime: '',
    location: '', meetingLink: '', type: 'INTERNAL', priority: 'MEDIUM',
    reminderMinutes: '30', status: 'SCHEDULED', notes: '',
  })
  const [participants, setParticipants] = useState<ParticipantPayload[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title,
        description: initial.description || '',
        startTime: toDatetimeLocal(initial.startTime),
        endTime: toDatetimeLocal(initial.endTime),
        location: initial.location || '',
        meetingLink: initial.meetingLink || '',
        type: initial.type,
        priority: initial.priority,
        reminderMinutes: String(initial.reminderMinutes),
        status: initial.status,
        notes: initial.notes || '',
      })
      setParticipants(
        initial.participants.map(p => ({
          userId: p.userId || undefined,
          externalName: p.externalName || undefined,
          externalEmail: p.externalEmail || undefined,
        }))
      )
    } else {
      setForm({ title: '', description: '', startTime: '', endTime: '', location: '', meetingLink: '', type: 'INTERNAL', priority: 'MEDIUM', reminderMinutes: '30', status: 'SCHEDULED', notes: '' })
      setParticipants([])
    }
    setError('')
  }, [initial, open])

  if (!open) return null

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const addParticipant = () => setParticipants(p => [...p, { externalName: '', externalEmail: '' }])
  const removeParticipant = (i: number) => setParticipants(p => p.filter((_, idx) => idx !== i))
  const setParticipant = (i: number, k: keyof ParticipantPayload, v: string) =>
    setParticipants(p => p.map((x, idx) => idx === i ? { ...x, [k]: v } : x))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const payload: any = {
        ...form,
        reminderMinutes: Number(form.reminderMinutes),
        participants: participants.filter(p => p.externalName || p.externalEmail || p.userId),
      }
      if (!initial) delete payload.status
      await onSave(payload)
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Something went wrong')
    }
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-head-left">
            <div className="modal-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.2" strokeLinecap="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <h2>{initial ? 'Edit Meeting' : 'Schedule Meeting'}</h2>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {error && <div className="err-banner">{error}</div>}

          {/* Basic Info */}
          <div className="form-section">
            <p className="form-section-title">Basic Info</p>
            <div className="form-grid1">
              <div className="fg">
                <label>Title *</label>
                <input placeholder="e.g. Q4 Review Meeting" value={form.title} onChange={set('title')} required />
              </div>
              <div className="fg">
                <label>Description</label>
                <textarea placeholder="Meeting agenda or notes..." value={form.description} onChange={set('description')} rows={2} />
              </div>
            </div>
          </div>

          {/* Time */}
          <div className="form-section">
            <p className="form-section-title">Date & Time</p>
            <div className="form-grid2">
              <div className="fg">
                <label>Start Time *</label>
                <input type="datetime-local" value={form.startTime} onChange={set('startTime')} required />
              </div>
              <div className="fg">
                <label>End Time *</label>
                <input type="datetime-local" value={form.endTime} onChange={set('endTime')} required />
              </div>
              <div className="fg">
                <label>Reminder (minutes before)</label>
                <input type="number" min="5" value={form.reminderMinutes} onChange={set('reminderMinutes')} />
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="form-section">
            <p className="form-section-title">Details</p>
            <div className="form-grid2">
              <div className="fg">
                <label>Type</label>
                <select value={form.type} onChange={set('type')}>
                  <option value="INTERNAL">Internal</option>
                  <option value="EXTERNAL">External</option>
                  <option value="CLIENT">Client</option>
                  <option value="VENDOR">Vendor</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div className="fg">
                <label>Priority</label>
                <select value={form.priority} onChange={set('priority')}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              {initial && (
                <div className="fg">
                  <label>Status</label>
                  <select value={form.status} onChange={set('status')}>
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="ONGOING">Ongoing</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="POSTPONED">Postponed</option>
                  </select>
                </div>
              )}
              <div className="fg">
                <label>Location</label>
                <input placeholder="Room / Address" value={form.location} onChange={set('location')} />
              </div>
              <div className="fg" style={{ gridColumn: '1 / -1' }}>
                <label>Meeting Link</label>
                <input placeholder="https://meet.google.com/..." value={form.meetingLink} onChange={set('meetingLink')} />
              </div>
              {initial && (
                <div className="fg" style={{ gridColumn: '1 / -1' }}>
                  <label>Notes</label>
                  <textarea placeholder="Post-meeting notes, action items..." value={form.notes} onChange={set('notes')} rows={3} />
                </div>
              )}
            </div>
          </div>

          {/* Participants */}
          <div className="form-section">
            <p className="form-section-title">Participants</p>
            <div className="participant-list">
              {participants.map((p, i) => (
                <div key={i} className="participant-row">
                  <input
                    placeholder="Name"
                    value={p.externalName || ''}
                    onChange={e => setParticipant(i, 'externalName', e.target.value)}
                  />
                  <input
                    placeholder="Email"
                    type="email"
                    value={p.externalEmail || ''}
                    onChange={e => setParticipant(i, 'externalEmail', e.target.value)}
                  />
                  <button type="button" className="btn-icon danger" onClick={() => removeParticipant(i)}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <button type="button" className="add-participant-btn" onClick={addParticipant}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Participant
            </button>
          </div>

          <div className="modal-foot">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <span className="spin" /> : initial ? 'Save Changes' : 'Schedule Meeting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}