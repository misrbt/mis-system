import { createPortal } from 'react-dom'
import { MessageSquare, X } from 'lucide-react'

function RemarksModal({ remarksModal, onClose }) {
  if (!remarksModal) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 transition-opacity duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden transition-all duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <MessageSquare className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="text-sm text-slate-500">Remarks</div>
              <div className="text-lg font-semibold text-slate-800">{remarksModal.asset_name}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors duration-200"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 bg-slate-50">
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm min-h-[120px]">
            {remarksModal.remarks ? (
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                {remarksModal.remarks}
              </p>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                <MessageSquare className="w-12 h-12 mb-2 opacity-50" />
                <p className="text-sm">No remarks available for this asset</p>
              </div>
            )}
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-sm transition-colors duration-200"
            >
              <X className="w-4 h-4" />
              <span>Close</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default RemarksModal
