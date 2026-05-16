'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/axios'

// ── Types ─────────────────────────────────────────────────────────────────────
interface WhatsAppSettingsProps {
  currentNumber?: string | null
  onSaved?: (number: string) => void
}

// ── Component ─────────────────────────────────────────────────────────────────
export function WhatsAppSettings({ currentNumber, onSaved }: WhatsAppSettingsProps) {
  const [number, setNumber] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    if (currentNumber) setNumber(currentNumber)
  }, [currentNumber])

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Format: strip everything except digits, add +91 if India number
  const formatNumber = (raw: string) => {
    const digits = raw.replace(/\D/g, '')
    if (!digits) return ''
    // If starts with 91 and 12 digits total → already has country code
    if (digits.startsWith('91') && digits.length === 12) return `+${digits}`
    // If 10 digits → Indian number, prefix +91
    if (digits.length === 10) return `+91${digits}`
    // Otherwise keep as is with +
    return `+${digits}`
  }

  const handleSave = async () => {
    if (!number.trim()) {
      showToast('Please enter your WhatsApp number', 'error')
      return
    }

    const formatted = formatNumber(number)
    if (formatted.replace(/\D/g, '').length < 10) {
      showToast('Please enter a valid phone number', 'error')
      return
    }

    try {
      setSaving(true)
      await api.put('/users/profile', { whatsappNumber: formatted })
      setNumber(formatted)
      onSaved?.(formatted)
      showToast('WhatsApp number saved! You will now receive meeting reminders.')
    } catch (e: any) {
      showToast(e?.response?.data?.message || 'Failed to save number', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async () => {
    try {
      setSaving(true)
      await api.put('/users/profile', { whatsappNumber: null })
      setNumber('')
      onSaved?.('')
      showToast('WhatsApp number removed.')
    } catch (e: any) {
      showToast(e?.response?.data?.message || 'Failed to remove', 'error')
    } finally {
      setSaving(false)
    }
  }

  const isSaved = currentNumber && currentNumber === number

  return (
    <>
      <style>{styles}</style>

      <div className="wa-card">
        {/* Header */}
        <div className="wa-header">
          <div className="wa-icon-wrap">
            {/* WhatsApp SVG Icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#25D366">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </div>
          <div>
            <h3 className="wa-title">WhatsApp Reminders</h3>
            <p className="wa-sub">Get meeting alerts directly on WhatsApp</p>
          </div>
          {currentNumber && (
            <div className="wa-status-pill">
              <span className="wa-status-dot" />
              Active
            </div>
          )}
        </div>

        {/* How it works */}
        <div className="wa-info">
          <div className="wa-info-row">
            <span className="wa-info-icon">🔔</span>
            <span>Reminder arrives <strong>{'{reminderMinutes}'}</strong> minutes before each meeting</span>
          </div>
          <div className="wa-info-row">
            <span className="wa-info-icon">📋</span>
            <span>Includes meeting title, time, location & join link</span>
          </div>
          <div className="wa-info-row">
            <span className="wa-info-icon">🔒</span>
            <span>Only you receive your reminders — completely private</span>
          </div>
        </div>

        {/* Input */}
        <div className="wa-input-section">
          <label className="wa-label">Your WhatsApp Number</label>
          <div className={`wa-input-wrap ${focused ? 'focused' : ''} ${isSaved ? 'saved' : ''}`}>
            <div className="wa-prefix">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.12 2.18 2 2 0 012.11 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.09a16 16 0 006 6l.46-.46a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
              </svg>
              +91
            </div>
            <input
              className="wa-input"
              type="tel"
              placeholder="98765 43210"
              value={number.replace(/^\+91/, '').replace(/^\+/, '')}
              onChange={e => setNumber(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              maxLength={15}
            />
            {number && (
              <button
                className="wa-clear"
                onClick={() => setNumber('')}
                type="button"
                title="Clear"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>
          <p className="wa-hint">Enter 10-digit Indian number. Country code (+91) added automatically.</p>
        </div>

        {/* Preview */}
        {number && (
          <div className="wa-preview">
            <p className="wa-preview-label">Preview message you'll receive:</p>
            <div className="wa-bubble">
              <p>🔔 <strong>Meeting Reminder</strong></p>
              <p style={{ marginTop: 4 }}>📌 <strong>Q4 Review Meeting</strong></p>
              <p>⏰ Starting in <strong>30 minutes</strong></p>
              <p>📅 30 Apr 2026 at 3:00 PM</p>
              <p>📍 Conference Room A</p>
              <p style={{ marginTop: 4, fontSize: 11, color: '#667' }}>Sent via your Inventory System</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="wa-actions">
          <button
            className="wa-save-btn"
            onClick={handleSave}
            disabled={saving || !number.trim()}
          >
            {saving ? (
              <span className="wa-spin" />
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            )}
            {saving ? 'Saving...' : 'Save & Enable'}
          </button>

          {currentNumber && (
            <button
              className="wa-remove-btn"
              onClick={handleRemove}
              disabled={saving}
            >
              Remove Number
            </button>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`wa-toast ${toast.type}`}>
          <span className="wa-toast-dot" />
          {toast.msg}
        </div>
      )}
    </>
  )
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = `
  .wa-card {
    background: #fff;
    border: 1.5px solid #eaecf3;
    border-radius: 18px;
    padding: 24px;
    max-width: 520px;
  }

  .wa-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 18px;
  }

  .wa-icon-wrap {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: #f0fdf4;
    border: 1.5px solid #bbf7d0;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .wa-title {
    font-size: 15px;
    font-weight: 750;
    color: #1a1d27;
    margin: 0 0 2px;
  }

  .wa-sub {
    font-size: 13px;
    color: #9099b3;
    margin: 0;
  }

  .wa-status-pill {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 5px;
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    color: #16a34a;
    font-size: 12px;
    font-weight: 650;
    padding: 4px 10px;
    border-radius: 20px;
    flex-shrink: 0;
  }

  .wa-status-dot {
    width: 7px;
    height: 7px;
    background: #16a34a;
    border-radius: 50%;
    animation: wa-pulse 2s infinite;
  }

  @keyframes wa-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  .wa-info {
    background: #f8f9fe;
    border: 1px solid #eaecf3;
    border-radius: 12px;
    padding: 14px 16px;
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .wa-info-row {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    font-size: 13px;
    color: #4b5270;
    line-height: 1.5;
  }

  .wa-info-icon {
    flex-shrink: 0;
    font-size: 14px;
  }

  .wa-input-section {
    margin-bottom: 16px;
  }

  .wa-label {
    display: block;
    font-size: 13px;
    font-weight: 650;
    color: #3d4263;
    margin-bottom: 8px;
  }

  .wa-input-wrap {
    display: flex;
    align-items: center;
    border: 1.5px solid #e2e5f0;
    border-radius: 10px;
    background: #fff;
    transition: border-color 0.15s, box-shadow 0.15s;
    overflow: hidden;
  }

  .wa-input-wrap.focused {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
  }

  .wa-input-wrap.saved {
    border-color: #25D366;
    box-shadow: 0 0 0 3px rgba(37,211,102,0.1);
  }

  .wa-prefix {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0 12px;
    font-size: 13px;
    font-weight: 650;
    color: #6b7494;
    background: #f8f9fe;
    border-right: 1.5px solid #e2e5f0;
    height: 42px;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .wa-input {
    flex: 1;
    border: none;
    outline: none;
    padding: 0 12px;
    font-size: 14px;
    color: #1a1d27;
    font-weight: 600;
    letter-spacing: 0.5px;
    background: transparent;
    height: 42px;
  }

  .wa-input::placeholder {
    color: #c5cade;
    font-weight: 400;
    letter-spacing: 0;
  }

  .wa-clear {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0 12px;
    color: #b0b8cc;
    display: flex;
    align-items: center;
    height: 42px;
    transition: color 0.15s;
  }

  .wa-clear:hover { color: #ef4444; }

  .wa-hint {
    font-size: 12px;
    color: #b0b8cc;
    margin: 6px 0 0;
  }

  /* WhatsApp message bubble preview */
  .wa-preview {
    margin-bottom: 20px;
  }

  .wa-preview-label {
    font-size: 12px;
    color: #9099b3;
    font-weight: 600;
    margin: 0 0 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .wa-bubble {
    background: #dcf8c6;
    border-radius: 0 12px 12px 12px;
    padding: 12px 16px;
    font-size: 13px;
    color: #1a1d27;
    line-height: 1.7;
    border: 1px solid #c3e9a8;
    max-width: 300px;
    position: relative;
  }

  .wa-bubble::before {
    content: '';
    position: absolute;
    top: 0;
    left: -8px;
    width: 0;
    height: 0;
    border-right: 8px solid #dcf8c6;
    border-top: 8px solid transparent;
  }

  .wa-actions {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .wa-save-btn {
    display: flex;
    align-items: center;
    gap: 7px;
    background: #6366f1;
    color: #fff;
    border: none;
    border-radius: 10px;
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 650;
    cursor: pointer;
    transition: background 0.15s, transform 0.1s;
  }

  .wa-save-btn:hover:not(:disabled) { background: #4f46e5; transform: translateY(-1px); }
  .wa-save-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  .wa-remove-btn {
    background: none;
    border: 1.5px solid #fca5a5;
    color: #ef4444;
    border-radius: 10px;
    padding: 10px 16px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s;
  }

  .wa-remove-btn:hover:not(:disabled) { background: #fef2f2; }
  .wa-remove-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .wa-spin {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: wa-spin 0.7s linear infinite;
    display: inline-block;
  }

  @keyframes wa-spin {
    to { transform: rotate(360deg); }
  }

  /* Toast */
  .wa-toast {
    position: fixed;
    bottom: 24px;
    right: 24px;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 18px;
    border-radius: 12px;
    font-size: 13.5px;
    font-weight: 600;
    z-index: 9999;
    box-shadow: 0 8px 32px rgba(0,0,0,.12);
    animation: wa-toast-in 0.25s ease;
  }

  .wa-toast.success { background: #1a1d27; color: #fff; }
  .wa-toast.error { background: #fef2f2; color: #ef4444; border: 1px solid #fca5a5; }

  .wa-toast-dot {
    width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
  }
  .wa-toast.success .wa-toast-dot { background: #25D366; }
  .wa-toast.error .wa-toast-dot { background: #ef4444; }

  @keyframes wa-toast-in {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`