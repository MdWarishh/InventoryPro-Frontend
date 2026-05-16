'use client'

import { useState, useEffect, useCallback } from 'react'
import { meetingsService } from '@/services/meetings.service'
import type { Meeting, CreateMeetingPayload, UpdateMeetingPayload } from '@/types/meetings.types'

import { meetingsStyles } from './_components/meetings.styles'
import { MeetingFilters } from './_components/MeetingFilters'
import { MeetingCard, fmtDate, fmtTime, STATUS_CLASS, PRIORITY_CLASS, PRIORITY_COLOR } from './_components/MeetingCard'
import { MeetingModal } from './_components/MeetingModal'
import { MeetingDetailDrawer } from './_components/MeetingDetailDrawer'

// ─── Delete confirm dialog ────────────────────────────────────────────────────
function DeleteDialog({
  open, meeting, onClose, onConfirm, loading,
}: {
  open: boolean; meeting: Meeting | null; onClose: () => void; onConfirm: () => Promise<void>; loading: boolean
}) {
  if (!open || !meeting) return null
  return (
    <div className="overlay" onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 18, width: '100%', maxWidth: 380, padding: '28px 24px 24px', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,.15)' }} onClick={e => e.stopPropagation()}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: '#fee2e2', border: '1px solid #fca5a5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/>
          </svg>
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 750, marginBottom: 10 }}>Delete Meeting?</h3>
        <p style={{ fontSize: 14, color: '#7880a0', lineHeight: 1.6, marginBottom: 22 }}>
          <strong style={{ color: '#1a1d27' }}>"{meeting.title}"</strong> will be permanently deleted.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? <span className="spin" /> : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [fetching, setFetching] = useState(true)
  const [view, setView] = useState<'grid' | 'table'>('grid')

  // filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // modals
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Meeting | null>(null)
  const [detailMeeting, setDetailMeeting] = useState<Meeting | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Meeting | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  // loading states
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // toast
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const load = useCallback(async () => {
    setFetching(true)
    try {
      const data = await meetingsService.getAll({
        status: statusFilter as any || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      })
      setMeetings(data)
    } catch {
      showToast('Failed to load meetings', 'error')
    } finally {
      setFetching(false)
    }
  }, [statusFilter, startDate, endDate])

  useEffect(() => { load() }, [load])

  // client-side search filter
  const filtered = meetings.filter(m =>
    m.title.toLowerCase().includes(search.toLowerCase()) ||
    m.description?.toLowerCase().includes(search.toLowerCase()) ||
    m.location?.toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = async (payload: CreateMeetingPayload | UpdateMeetingPayload) => {
    try {
      setSaving(true)
      if (editTarget) {
        await meetingsService.update(editTarget.id, payload as UpdateMeetingPayload)
        showToast('Meeting updated successfully')
      } else {
        await meetingsService.create(payload as CreateMeetingPayload)
        showToast('Meeting scheduled successfully')
      }
      setModalOpen(false)
      setEditTarget(null)
      load()
    } catch (e: any) {
      throw e
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      setDeleting(true)
      await meetingsService.remove(deleteTarget.id)
      showToast('Meeting deleted')
      setDeleteOpen(false)
      setDeleteTarget(null)
      load()
    } catch (e: any) {
      showToast(e?.response?.data?.message || 'Cannot delete', 'error')
    } finally {
      setDeleting(false)
    }
  }

  const openEdit = (m: Meeting) => { setEditTarget(m); setModalOpen(true) }
  const openDelete = (m: Meeting) => { setDeleteTarget(m); setDeleteOpen(true) }
  const openDetail = (m: Meeting) => setDetailMeeting(m)

  // stats
  const scheduled = meetings.filter(m => m.status === 'SCHEDULED').length
  const ongoing   = meetings.filter(m => m.status === 'ONGOING').length
  const today = meetings.filter(m => {
    const d = new Date(m.startTime)
    const n = new Date()
    return d.getDate() === n.getDate() && d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear()
  }).length
  const upcoming = meetings.filter(m => new Date(m.startTime) > new Date() && m.status === 'SCHEDULED').length

  return (
    <>
      <style>{meetingsStyles}</style>
      <div className="mp">

        {/* Header */}
        <div className="mp-header">
          <div>
            <h1 className="mp-title">Meetings</h1>
            <p className="mp-sub">{meetings.length} meetings total</p>
          </div>
          <button className="btn-primary" onClick={() => { setEditTarget(null); setModalOpen(true) }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Schedule Meeting
          </button>
        </div>

        {/* Stats */}
        {!fetching && (
          <div className="stats-row">
            <div className="stat-card" style={{ ['--stat-color' as string]: '#3b82f6' }}>
              <p className="stat-label">Scheduled</p>
              <p className="stat-value" style={{ color: '#3b82f6' }}>{scheduled}</p>
            </div>
            <div className="stat-card" style={{ ['--stat-color' as string]: '#16a34a' }}>
              <p className="stat-label">Ongoing</p>
              <p className="stat-value" style={{ color: '#16a34a' }}>{ongoing}</p>
            </div>
            <div className="stat-card" style={{ ['--stat-color' as string]: '#6366f1' }}>
              <p className="stat-label">Today</p>
              <p className="stat-value" style={{ color: '#6366f1' }}>{today}</p>
            </div>
            <div className="stat-card" style={{ ['--stat-color' as string]: '#d97706' }}>
              <p className="stat-label">Upcoming</p>
              <p className="stat-value" style={{ color: '#d97706' }}>{upcoming}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <MeetingFilters
          search={search} onSearch={setSearch}
          status={statusFilter} onStatus={setStatusFilter}
          startDate={startDate} onStartDate={setStartDate}
          endDate={endDate} onEndDate={setEndDate}
          view={view} onView={setView}
        />

        {/* ── Grid View ── */}
        {view === 'grid' && (
          fetching ? (
            <div className="card-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ background: '#fff', border: '1.5px solid #eaecf3', borderRadius: 16, padding: 20, borderLeft: '4px solid #eaecf3' }}>
                  <div className="sk" style={{ height: 22, width: '40%', marginBottom: 16 }} />
                  <div className="sk" style={{ height: 16, width: '80%', marginBottom: 8 }} />
                  <div className="sk" style={{ height: 14, width: '60%', marginBottom: 20 }} />
                  <div className="sk" style={{ height: 13, width: '70%', marginBottom: 6 }} />
                  <div className="sk" style={{ height: 13, width: '55%' }} />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">📅</div>
              <p>{search ? `No results for "${search}"` : 'No meetings found'}</p>
              <span>Schedule a meeting to get started</span>
            </div>
          ) : (
            <div className="card-grid">
              {filtered.map(m => (
                <MeetingCard key={m.id} meeting={m} onView={openDetail} onEdit={openEdit} onDelete={openDelete} />
              ))}
            </div>
          )
        )}

        {/* ── Table View ── */}
        {view === 'table' && (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Date & Time</th>
                  <th>Type</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Participants</th>
                  <th>Created By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {fetching ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j}><div className="sk" style={{ height: 16, width: j === 0 ? 150 : 80 }} /></td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={8}>
                    <div className="empty">
                      <div className="empty-icon">📅</div>
                      <p>No meetings found</p>
                    </div>
                  </td></tr>
                ) : filtered.map(m => (
                  <tr key={m.id} onClick={() => openDetail(m)}>
                    <td>
                      <p style={{ fontWeight: 650, fontSize: 14 }}>{m.title}</p>
                      {m.location && <p style={{ fontSize: 12, color: '#9099b3', marginTop: 2 }}>📍 {m.location}</p>}
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <p style={{ fontWeight: 600 }}>{fmtDate(m.startTime)}</p>
                      <p style={{ fontSize: 12, color: '#9099b3' }}>{fmtTime(m.startTime)}</p>
                    </td>
                    <td><span className="badge t-badge">{m.type}</span></td>
                    <td>
                      <span className={`badge ${PRIORITY_CLASS[m.priority]}`}
                        style={{ borderLeft: `3px solid ${PRIORITY_COLOR[m.priority]}` }}>
                        {m.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${STATUS_CLASS[m.status]}`}>
                        <span className="badge-dot" style={{ background: 'currentColor' }} />
                        {m.status.charAt(0) + m.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td style={{ color: '#6b7494' }}>{m.participants.length}</td>
                    <td style={{ fontSize: 13, color: '#6b7494' }}>{m.createdByUser?.name}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn-icon" onClick={() => openEdit(m)}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button className="btn-icon danger" onClick={() => openDelete(m)}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      <MeetingModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTarget(null) }}
        onSave={handleSave}
        initial={editTarget}
        loading={saving}
      />

      <MeetingDetailDrawer
        meeting={detailMeeting}
        onClose={() => setDetailMeeting(null)}
        onEdit={openEdit}
        onDelete={openDelete}
      />

      <DeleteDialog
        open={deleteOpen}
        meeting={deleteTarget}
        onClose={() => { setDeleteOpen(false); setDeleteTarget(null) }}
        onConfirm={handleDelete}
        loading={deleting}
      />

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          <span className="toast-dot" />
          {toast.msg}
        </div>
      )}
    </>
  )
}