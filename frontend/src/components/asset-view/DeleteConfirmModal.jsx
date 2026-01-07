/**
 * Delete Confirmation Modal Component
 * Confirms asset deletion with user
 */

import React from 'react'
import { Trash2 } from 'lucide-react'

const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  assetName,
  isPending,
}) => {
  if (!isOpen || !assetName) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-4 pb-6 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4 mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Trash2 className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-slate-900">Delete Asset</h3>
              <p className="text-xs sm:text-sm text-slate-600">This action cannot be undone</p>
            </div>
          </div>
          <p className="text-sm sm:text-base text-slate-700 mb-6">
            Are you sure you want to delete <span className="font-semibold">"{assetName}"</span>? This will permanently remove the asset from the system.
          </p>
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 sm:py-2 text-slate-700 hover:text-slate-900 font-medium rounded-lg hover:bg-slate-100 transition-colors touch-manipulation"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isPending}
              className="px-4 py-2.5 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm touch-manipulation"
            >
              {isPending ? 'Deleting...' : 'Delete Asset'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(DeleteConfirmModal)
