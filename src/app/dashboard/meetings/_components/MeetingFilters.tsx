'use client'

import type { MeetingStatus } from '@/types/meetings.types'

interface Props {
  search: string
  onSearch: (v: string) => void
  status: string
  onStatus: (v: string) => void
  startDate: string
  onStartDate: (v: string) => void
  endDate: string
  onEndDate: (v: string) => void
  view: 'grid' | 'table'
  onView: (v: 'grid' | 'table') => void
}

export function MeetingFilters({
  search, onSearch, status, onStatus,
  startDate, onStartDate, endDate, onEndDate,
  view, onView,
}: Props) {
  return (
    <div className="filters-bar">
      {/* Search */}
      <div className="search-wrap">
        <span className="search-icon">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </span>
        <input
          className="search-input"
          placeholder="Search meetings..."
          value={search}
          onChange={e => onSearch(e.target.value)}
        />
      </div>

      {/* Status */}
      <select className="filter-select" value={status} onChange={e => onStatus(e.target.value)}>
        <option value="">All Status</option>
        <option value="SCHEDULED">Scheduled</option>
        <option value="ONGOING">Ongoing</option>
        <option value="COMPLETED">Completed</option>
        <option value="CANCELLED">Cancelled</option>
        <option value="POSTPONED">Postponed</option>
      </select>

      {/* Date range */}
      <input
        type="date"
        className="date-input"
        value={startDate}
        onChange={e => onStartDate(e.target.value)}
        title="From date"
      />
      <input
        type="date"
        className="date-input"
        value={endDate}
        onChange={e => onEndDate(e.target.value)}
        title="To date"
      />

      {/* View toggle */}
      <div className="view-toggle" style={{ marginLeft: 'auto' }}>
        <button className={`vt-btn${view === 'grid' ? ' active' : ''}`} onClick={() => onView('grid')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
          </svg>
          Grid
        </button>
        <button className={`vt-btn${view === 'table' ? ' active' : ''}`} onClick={() => onView('table')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
          List
        </button>
      </div>
    </div>
  )
}