'use client'

import { AlertTriangle, X } from 'lucide-react'

interface MarkDamagedModalProps {
  open: boolean
  serialNumber: string
  onConfirm: () => Promise<void>
  onClose: () => void
  loading?: boolean
}

export default function MarkDamagedModal({
  open,
  serialNumber,
  onConfirm,
  onClose,
  loading,
}: MarkDamagedModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <h3 className="text-base font-semibold text-gray-900 mb-1">Mark as Damaged</h3>
        <p className="text-sm text-gray-500 mb-6">
          Serial{' '}
          <span className="font-mono font-semibold text-gray-800 bg-gray-100 px-1.5 py-0.5 rounded">
            {serialNumber}
          </span>{' '}
          will be marked as damaged and stock will be decremented by 1. This cannot be undone.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors disabled:opacity-60"
          >
            {loading ? 'Processing...' : 'Mark Damaged'}
          </button>
        </div>
      </div>
    </div>
  )
}