/**
 * Code Display Modal Component
 * Displays QR codes and barcodes in a modal with download and print functionality
 * Eliminates 170+ duplicate lines from AssetViewPage.jsx
 */

import React from 'react'
import { createPortal } from 'react-dom'
import { X, Download, Printer } from 'lucide-react'

const CodeDisplayModal = ({ isOpen, onClose, code, title, type }) => {
  const isModalOpen = Boolean(isOpen && code)
  const codeTypeName = type === 'qr' ? 'QR Code' : 'Barcode'

  /**
   * Download code image
   */
  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = code.src
    link.download = `${code.asset_name || 'asset'}_${type}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  /**
   * Print code image
   */
  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert('Please allow popups to print')
      return
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print ${codeTypeName}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              font-family: Arial, sans-serif;
              background: white;
            }
            .print-container {
              text-align: center;
              padding: 20px;
            }
            img {
              max-width: 400px;
              margin: 20px 0;
              display: block;
              margin-left: auto;
              margin-right: auto;
            }
            h2 {
              margin: 10px 0;
              font-size: 24px;
              font-weight: bold;
              color: #1e293b;
            }
            p {
              margin: 10px 0;
              font-size: 14px;
              color: #64748b;
            }
            @media print {
              body {
                display: block;
              }
              .print-container {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            <h2>${code.asset_name || 'Asset'}</h2>
            <img src="${code.src}" alt="${codeTypeName}" />
            <p>${codeTypeName}: ${code.serial_number || 'N/A'}</p>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  /**
   * Handle click outside to close
   */
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  /**
   * Handle escape key to close
   */
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isModalOpen, onClose])

  if (!isModalOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="code-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white z-10 rounded-t-2xl">
          <h2
            id="code-modal-title"
            className="text-xl font-bold text-slate-900"
          >
            {title || codeTypeName}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors group"
            aria-label="Close modal"
            title="Close (Esc)"
          >
            <X className="w-5 h-5 text-slate-600 group-hover:text-slate-900" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Code Image Container */}
          <div className="bg-white border-2 border-slate-200 rounded-xl p-8 mb-6 flex flex-col items-center hover:border-slate-300 transition-colors">
            <img
              src={code.src}
              alt={`${codeTypeName} for ${code.asset_name || 'asset'}`}
              className="max-w-full h-auto"
              style={{ maxHeight: '400px' }}
              loading="lazy"
            />
            <div className="mt-6 text-center">
              <p className="text-base font-semibold text-slate-900">
                {code.asset_name || 'Unnamed Asset'}
              </p>
              {code.serial_number && (
                <p className="text-sm text-slate-600 mt-2">
                  {codeTypeName}: <span className="font-mono">{code.serial_number}</span>
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors font-medium shadow-sm hover:shadow-md"
              title="Download as PNG image"
            >
              <Download className="w-4 h-4" />
              Download Image
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 active:bg-slate-800 transition-colors font-medium shadow-sm hover:shadow-md"
              title="Print code"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default React.memo(CodeDisplayModal)
