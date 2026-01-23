import React from 'react'
import { X, QrCode, Barcode } from 'lucide-react'

const AssetComponentsCodeModal = ({
  showCodeModal,
  onClose,
  onDownload,
}) => {
  if (!showCodeModal) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {showCodeModal.type === 'qr' ? 'QR Code' : 'Barcode'} - {showCodeModal.component.component_name}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Display the code */}
          <div className="flex justify-center items-center bg-gray-50 rounded-lg p-8 mb-6">
            {showCodeModal.type === 'qr' ? (
              showCodeModal.component.qr_code ? (
                <img
                  src={showCodeModal.component.qr_code}
                  alt="QR Code"
                  className="max-w-full h-auto"
                  style={{ maxHeight: '400px' }}
                />
              ) : (
                <div className="text-center py-12">
                  <QrCode className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No QR code available</p>
                </div>
              )
            ) : (
              showCodeModal.component.barcode ? (
                <img
                  src={showCodeModal.component.barcode}
                  alt="Barcode"
                  className="max-w-full h-auto"
                  style={{ maxHeight: '200px' }}
                />
              ) : (
                <div className="text-center py-12">
                  <Barcode className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No barcode available</p>
                </div>
              )
            )}
          </div>

          {/* Component Info */}
          <div className="bg-slate-50 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Component:</span>
                <p className="font-semibold text-gray-900">{showCodeModal.component.component_name}</p>
              </div>
              <div>
                <span className="text-gray-600">Category:</span>
                <p className="font-semibold text-gray-900">{showCodeModal.component.category?.name || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-600">Serial:</span>
                <p className="font-semibold text-gray-900">{showCodeModal.component.serial_number || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-600">Status:</span>
                <p className="font-semibold text-gray-900">{showCodeModal.component.status?.name || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => onDownload(showCodeModal)}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Download {showCodeModal.type === 'qr' ? 'QR Code' : 'Barcode'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(AssetComponentsCodeModal)
