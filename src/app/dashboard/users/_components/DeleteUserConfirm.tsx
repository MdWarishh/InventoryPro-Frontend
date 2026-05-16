'use client'

import { Loader2, UserX } from 'lucide-react'

interface DeleteUserConfirmProps {
  userName: string
  isLoading: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteUserConfirm({ userName, isLoading, onConfirm, onCancel }: DeleteUserConfirmProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 slide-in-from-bottom-4 duration-200">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <UserX size={20} className="text-red-600" />
        </div>
        <h3 className="text-base font-bold text-gray-900 text-center mb-2">Deactivate User</h3>
        <p className="text-sm text-gray-500 text-center leading-relaxed">
          Are you sure you want to deactivate{' '}
          <span className="font-semibold text-gray-800">"{userName}"</span>?
          They will not be able to log in.
        </p>
        <div className="flex gap-3 mt-6">
          <button type="button" onClick={onCancel} disabled={isLoading}
            className="flex-1 h-10 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-60">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} disabled={isLoading}
            className="flex-1 h-10 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2">
            {isLoading && <Loader2 size={13} className="animate-spin" />}
            Deactivate
          </button>
        </div>
      </div>
    </div>
  )
}