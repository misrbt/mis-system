import { createPortal } from 'react-dom'
import { QrCode, Barcode, X } from 'lucide-react'

function CodeModal({ codeModal, onClose, onDownload, onPrint }) {
  if (!codeModal) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 transition-opacity duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-3xl w-full overflow-hidden transition-all duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              {codeModal.type === 'qr' ? (
                <QrCode className="w-5 h-5 text-blue-600" />
              ) : (
                <Barcode className="w-5 h-5 text-blue-600" />
              )}
            </div>
            <div>
              <div className="text-sm text-slate-500">
                {codeModal.type === 'qr' ? 'QR Code' : 'Barcode'}
              </div>
              <div className="text-lg font-semibold text-slate-800">{codeModal.title}</div>
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
          <div className="flex flex-col items-center gap-4">
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <img
                src={codeModal.src}
                alt={codeModal.title || 'Code'}
                className="w-full max-w-lg object-contain"
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 w-full">
              <button
                onClick={onDownload}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download</span>
              </button>

              <button
                onClick={onPrint}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span>Print</span>
              </button>

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
      </div>
    </div>,
    document.body
  )
}

export default CodeModal
