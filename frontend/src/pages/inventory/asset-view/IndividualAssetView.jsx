import { useState, useCallback, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Clock,
  CornerUpLeft,
  History,
  LayoutGrid,
  MapPin,
  Package,
  RefreshCw,
  User,
  Users,
  Wrench,
  ChevronDown,
  X,
  QrCode,
  Barcode,
  Download,
  Printer,
  Loader2,
} from 'lucide-react'
import Swal from 'sweetalert2'
import CodeDisplayModal from '../../../components/CodeDisplayModal'
import TransferAssetModal from '../../../components/TransferAssetModal'
import ReturnAssetModal from '../../../components/ReturnAssetModal'
import StatusUpdateModal from '../../../components/StatusUpdateModal'
import RepairFormModal from '../../../components/RepairFormModal'
import AssetMovementTimeline from '../../../components/AssetMovementTimeline'
import AssetAssignmentHistory from '../../../components/AssetAssignmentHistory'
import InfoCard from './InfoCard'
import { getAssetQRCode, regenerateQRCode, QR_ERROR_CODES, getErrorMessage } from '../../../services/qrCodeService'

// QR Code Section Component for Individual Asset View
const QRCodeSection = ({ asset }) => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [localQRCode, setLocalQRCode] = useState(asset?.qr_code || null)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('qr')
  const queryClient = useQueryClient()

  // Sync local QR code state when asset data changes
  useEffect(() => {
    if (asset?.qr_code) {
      setLocalQRCode(asset.qr_code)
    }
  }, [asset?.qr_code])

  const handleGenerateQRCode = useCallback(async () => {
    // Check internet connection first
    if (!navigator.onLine) {
      Swal.fire({
        icon: 'error',
        title: 'No Internet Connection',
        text: 'Please check your internet connection and try again.',
        confirmButtonColor: '#3b82f6',
      })
      return
    }

    setIsGenerating(true)
    try {
      const result = await getAssetQRCode(asset, !localQRCode)
      setLocalQRCode(result.src)

      if (result.source === 'backend') {
        queryClient.invalidateQueries(['asset', asset.id])
      }

      Swal.fire({
        icon: 'success',
        title: localQRCode ? 'QR Code Regenerated' : 'QR Code Generated',
        timer: 2000,
        showConfirmButton: false,
      })
    } catch (error) {
      console.error('Failed to generate QR code:', error)

      // Determine error type and show appropriate message
      let title = 'Generation Failed'
      let text = error.message || 'Failed to generate QR code.'

      if (error.code === QR_ERROR_CODES.NO_INTERNET || error.code === QR_ERROR_CODES.NETWORK_ERROR) {
        title = 'Connection Error'
        text = getErrorMessage(error.code, error.message)
      } else if (error.code === QR_ERROR_CODES.API_TIMEOUT) {
        title = 'Request Timeout'
        text = getErrorMessage(error.code, error.message)
      }

      Swal.fire({
        icon: 'error',
        title,
        text,
        confirmButtonColor: '#3b82f6',
      })
    } finally {
      setIsGenerating(false)
    }
  }, [asset, localQRCode, queryClient])

  const handleRegenerateQRCode = useCallback(async () => {
    // Check internet connection first
    if (!navigator.onLine) {
      Swal.fire({
        icon: 'error',
        title: 'No Internet Connection',
        text: 'Unable to connect to QR Code Monkey API. Please check your internet connection and try again.',
        confirmButtonColor: '#3b82f6',
      })
      return
    }

    setIsGenerating(true)
    try {
      const response = await regenerateQRCode(asset.id)
      const newQRCode = response.data?.qr_code

      if (newQRCode) {
        setLocalQRCode(newQRCode)
        queryClient.invalidateQueries(['asset', asset.id])

        // Check if fallback was used
        if (response.warning) {
          Swal.fire({
            icon: 'warning',
            title: 'QR Code Generated (Fallback)',
            text: response.warning,
            confirmButtonColor: '#3b82f6',
          })
        } else {
          Swal.fire({
            icon: 'success',
            title: 'QR Code Regenerated',
            text: 'New QR code has been generated with QR Code Monkey.',
            timer: 2000,
            showConfirmButton: false,
          })
        }
      } else {
        throw new Error('No QR code returned from server')
      }
    } catch (error) {
      console.error('Failed to regenerate QR code:', error)

      // Determine error type and show appropriate message
      let title = 'Regeneration Failed'
      let text = error.message || 'Failed to regenerate QR code.'

      if (error.code === QR_ERROR_CODES.NO_INTERNET || error.code === QR_ERROR_CODES.NETWORK_ERROR) {
        title = 'Connection Error'
        text = 'Unable to connect to QR Code Monkey API. Please check your internet connection and try again.'
      } else if (error.code === QR_ERROR_CODES.API_TIMEOUT) {
        title = 'Request Timeout'
        text = 'The QR Code Monkey API took too long to respond. Please try again.'
      }

      Swal.fire({
        icon: 'error',
        title,
        text,
        confirmButtonColor: '#3b82f6',
      })
    } finally {
      setIsGenerating(false)
    }
  }, [asset.id, queryClient])

  const handleViewCode = useCallback((type) => {
    setModalType(type)
    setShowModal(true)
  }, [])

  const handleDownload = useCallback(() => {
    const src = modalType === 'qr' ? localQRCode : asset.barcode
    if (!src) return

    const link = document.createElement('a')
    link.href = src
    link.download = `${asset.asset_name || 'asset'}_${modalType}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [asset, localQRCode, modalType])

  const handlePrint = useCallback(() => {
    const src = modalType === 'qr' ? localQRCode : asset.barcode
    if (!src) return

    const printWindow = window.open('', '_blank', 'width=600,height=600')
    if (!printWindow) return

    printWindow.document.write(`
      <html>
        <head>
          <title>${asset.asset_name || 'Asset'} - ${modalType === 'qr' ? 'QR Code' : 'Barcode'}</title>
          <style>
            body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: system-ui, sans-serif; }
            img { max-width: 90vw; max-height: 70vh; }
            h2 { margin-bottom: 1rem; }
            p { color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <h2>${asset.asset_name || 'Asset'}</h2>
          <img src="${src}" alt="${modalType === 'qr' ? 'QR Code' : 'Barcode'}" />
          <p>Serial: ${asset.serial_number || 'N/A'}</p>
          <script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); };</script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }, [asset, localQRCode, modalType])

  const currentSrc = modalType === 'qr' ? localQRCode : asset.barcode

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <QrCode className="w-5 h-5 text-indigo-600" />
          QR Code & Barcode
        </h3>

        <div className="space-y-4">
          {/* QR Code Preview */}
          <div className="flex flex-col items-center">
            {localQRCode ? (
              <div
                className="w-40 h-40 bg-white border-2 border-gray-200 rounded-lg p-2 cursor-pointer hover:border-blue-400 transition-colors"
                onClick={() => handleViewCode('qr')}
              >
                <img
                  src={localQRCode}
                  alt="QR Code"
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-40 h-40 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400">
                <QrCode className="w-12 h-12 mb-2" />
                <span className="text-xs">No QR Code</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            {localQRCode ? (
              <>
                <button
                  onClick={() => handleViewCode('qr')}
                  className="w-full px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                >
                  <QrCode className="w-4 h-4" />
                  View QR Code
                </button>

                {/* Prominent Regenerate Button */}
                <button
                  onClick={handleRegenerateQRCode}
                  disabled={isGenerating}
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  {isGenerating ? 'Generating...' : 'Regenerate QR Code'}
                </button>

                {/* Info text */}
                <p className="text-xs text-center text-gray-500 mt-1">
                  Click to update QR code using QR Code Monkey (Square Design)
                </p>
              </>
            ) : (
              <button
                onClick={handleGenerateQRCode}
                disabled={isGenerating}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm font-semibold rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <QrCode className="w-4 h-4" />
                )}
                {isGenerating ? 'Generating...' : 'Generate QR Code'}
              </button>
            )}

            {asset.barcode && (
              <button
                onClick={() => handleViewCode('barcode')}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <Barcode className="w-4 h-4" />
                View Barcode
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Code View Modal */}
      {showModal && currentSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  {modalType === 'qr' ? (
                    <QrCode className="w-5 h-5 text-indigo-600" />
                  ) : (
                    <Barcode className="w-5 h-5 text-indigo-600" />
                  )}
                </div>
                <div>
                  <div className="text-sm text-slate-500">
                    {modalType === 'qr' ? 'QR Code' : 'Barcode'}
                  </div>
                  <div className="text-lg font-semibold text-slate-800">
                    {asset.asset_name}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 bg-slate-50">
              <div className="flex flex-col items-center gap-4">
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                  <img
                    src={currentSrc}
                    alt={modalType === 'qr' ? 'QR Code' : 'Barcode'}
                    className="max-w-full max-h-80 object-contain"
                  />
                </div>

                <p className="text-sm text-slate-600">
                  Serial: <span className="font-mono font-medium">{asset.serial_number || 'N/A'}</span>
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3 w-full">
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button
                    onClick={handlePrint}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    Print
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-sm transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function IndividualAssetView({
  asset,
  statistics,
  movements,
  assignments,
  isLoadingMovements,
  isLoadingAssignments,
  statuses,
  statusColorMap,
  statusPickerFor,
  onStatusPickerToggle,
  onQuickStatusChange,
  onBack,
  onOpenTransfer,
  onOpenReturn,
  onOpenStatusUpdate,
  onOpenRepair,
  onCloseTransfer,
  onCloseReturn,
  onCloseStatusUpdate,
  onCloseRepair,
  isTransferModalOpen,
  isReturnModalOpen,
  isStatusModalOpen,
  isRepairModalOpen,
  repairModalAsset,
  activeTab,
  setActiveTab,
  navigateToEmployeeAssets,
  navigateToAssetComponents,
}) {
  if (!asset) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Package className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-700">Asset Not Found</h2>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Assets
        </button>
      </div>
    )
  }

  const currentEmployee = asset?.assigned_employee
  const currentStatus = asset?.status
  const currentAssignmentDays = statistics?.current_assignment_days || 0
  const equipmentName = asset?.equipment
    ? `${asset.equipment.brand || ''} ${asset.equipment.model || ''}`.trim()
    : ''
  const assetTitle = equipmentName || `${asset.brand || ''} ${asset.model || ''}`.trim() || asset.asset_name

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <CodeDisplayModal />

      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <button
                onClick={onBack}
                className="shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 leading-snug break-words">
                  {assetTitle}
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-start sm:justify-end gap-2 w-full sm:w-auto">
              <div className="relative">
                <button
                  onClick={() => onStatusPickerToggle(asset.id)}
                  className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-lg shadow-sm hover:border-blue-400 hover:text-blue-600 transition-colors"
                >
                  <span
                    className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-semibold border"
                    style={{
                      backgroundColor: statusColorMap[asset?.status_id] || '#E2E8F0',
                      color: statusColorMap[asset?.status_id] ? '#fff' : '#1e293b',
                      borderColor: statusColorMap[asset?.status_id] || '#cbd5e1',
                    }}
                  >
                    {asset?.status?.name || 'Status'}
                  </span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                {statusPickerFor === asset.id && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
                    <div className="max-h-56 overflow-y-auto py-1">
                      {statuses.length ? (
                        statuses.map((status) => {
                          const isActive = status.id === asset?.status_id
                          return (
                            <button
                              key={status.id}
                              type="button"
                              onClick={() => {
                                onQuickStatusChange(asset.id, status.id)
                                onStatusPickerToggle(null)
                              }}
                              className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                                isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <span className="inline-flex items-center gap-2">
                                <span
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: statusColorMap[status.id] || '#94a3b8' }}
                                />
                                <span>{status.name}</span>
                              </span>
                            </button>
                          )
                        })
                      ) : (
                        <div className="px-3 py-2 text-sm text-slate-500">No statuses</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={onOpenTransfer}
                disabled={!currentEmployee}
                className="px-3 sm:px-4 py-2 bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                Transfer
              </button>
              <button
                onClick={onOpenReturn}
                disabled={!currentEmployee}
                className="px-3 sm:px-4 py-2 bg-orange-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <CornerUpLeft className="w-4 h-4" />
                Return
              </button>
              <button
                onClick={onOpenStatusUpdate}
                className="px-3 sm:px-4 py-2 bg-indigo-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Update Status
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-xs font-medium">Assignments</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-blue-900">
                {statistics?.assignment_count || 0}
              </p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-center gap-2 text-purple-600 mb-1">
                <ArrowRight className="w-4 h-4" />
                <span className="text-xs font-medium">Transfers</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-purple-900">
                {statistics?.transfer_count || 0}
              </p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-center gap-2 text-red-600 mb-1">
                <Wrench className="w-4 h-4" />
                <span className="text-xs font-medium">Repairs</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-red-900">
                {statistics?.repair_count || 0}
              </p>
            </div>
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-center gap-2 text-indigo-600 mb-1">
                <Activity className="w-4 h-4" />
                <span className="text-xs font-medium">Status Changes</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-indigo-900">
                {statistics?.status_change_count || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 sm:mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          <div className="lg:col-span-4 space-y-4 sm:space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Current Assignment
              </h3>
              {currentEmployee ? (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600">
                      <User className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{currentEmployee.fullname}</p>
                      {currentEmployee.position && (
                        <p className="text-sm text-gray-600">{currentEmployee.position.position_name}</p>
                      )}
                      {currentEmployee.branch && (
                        <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                          <MapPin className="w-3.5 h-3.5" />
                          {currentEmployee.branch.branch_name}
                        </div>
                      )}
                    </div>
                  </div>
                  {currentAssignmentDays > 0 && (
                    <div className="pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>
                          Assigned for <strong>{currentAssignmentDays} days</strong>
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="pt-3 border-t border-gray-100">
                    <button
                      onClick={() => navigateToEmployeeAssets(currentEmployee.id)}
                      className="w-full px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Package className="w-4 h-4" />
                      View All {currentEmployee.fullname.split(' ')[0]}'s Assets
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500 text-sm">Not assigned</p>
                  <p className="text-gray-400 text-xs mt-1">Asset is in inventory</p>
                </div>
              )}
            </div>

            {asset && (asset.category?.name?.toLowerCase().includes('desktop') || asset.category?.name?.toLowerCase().includes('pc')) && (
              <div className="bg-gradient-to-r from-amber-600 to-orange-700 rounded-lg shadow-sm border border-amber-200 p-4 sm:p-6 text-white flex flex-col">
                <div className="flex items-center gap-3 mb-3">
                  <LayoutGrid className="w-5 h-5" />
                  <h3 className="text-base sm:text-lg font-semibold">Desktop PC Components</h3>
                </div>
                <p className="text-sm text-amber-50 mb-3">
                  Manage individual components of this desktop PC (System Unit, Monitor, Keyboard & Mouse, etc.)
                </p>
                <button
                  onClick={() => navigateToAssetComponents(asset.id)}
                  className="w-full px-4 py-2 bg-white text-amber-700 font-medium rounded-lg hover:bg-amber-50 transition-colors flex items-center justify-center gap-2 mt-auto"
                >
                  <Package className="w-4 h-4" />
                  View Components
                </button>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                Asset Details
              </h3>
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className="font-medium text-gray-900">{currentStatus?.name || 'N/A'}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Category</span>
                  <span className="font-medium text-gray-900">{asset.category?.name || 'N/A'}</span>
                </div>
                {asset.equipment && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Equipment</span>
                    <span className="font-medium text-gray-900">{asset.equipment.brand} {asset.equipment.model}</span>
                  </div>
                )}
                {asset.purchase_date && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Purchase Date</span>
                    <span className="font-medium text-gray-900">
                      {new Date(asset.purchase_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {asset.acq_cost && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Acquisition Cost</span>
                    <span className="font-medium text-gray-900">
                      ₱{parseFloat(asset.acq_cost).toLocaleString()}
                    </span>
                  </div>
                )}
                {asset.book_value !== null && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Book Value</span>
                    <span className="font-medium text-gray-900">
                      ₱{parseFloat(asset.book_value).toLocaleString()}
                    </span>
                  </div>
                )}
                {asset.vendor && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Vendor</span>
                    <span className="font-medium text-gray-900">{asset.vendor.company_name}</span>
                  </div>
                )}
                {asset.waranty_expiration_date && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-2">
                    <span className="text-sm text-gray-600">Warranty Expiration</span>
                    <span className="font-medium text-gray-900">
                      {new Date(asset.waranty_expiration_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* QR Code & Barcode Section */}
            <QRCodeSection asset={asset} />
          </div>

          <div className="lg:col-span-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="border-b border-gray-200">
                <div className="flex flex-col sm:flex-row gap-0">
                  <button
                    onClick={() => setActiveTab('timeline')}
                    className={`flex items-center justify-center sm:justify-start gap-2 px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-medium border-b-2 transition-colors ${
                      activeTab === 'timeline'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <History className="w-4 h-4" />
                    Movement Timeline
                  </button>
                  <button
                    onClick={() => setActiveTab('assignments')}
                    className={`flex items-center justify-center sm:justify-start gap-2 px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-medium border-b-2 transition-colors ${
                      activeTab === 'assignments'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    Assignment History
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                {activeTab === 'timeline' && (
                  <AssetMovementTimeline movements={movements} loading={isLoadingMovements} />
                )}
                {activeTab === 'assignments' && (
                  <AssetAssignmentHistory
                    assignments={assignments}
                    loading={isLoadingAssignments}
                    currentEmployeeId={currentEmployee?.id}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <TransferAssetModal
        isOpen={isTransferModalOpen}
        onClose={onCloseTransfer}
        asset={asset}
      />
      <ReturnAssetModal
        isOpen={isReturnModalOpen}
        onClose={onCloseReturn}
        asset={asset}
      />
      <StatusUpdateModal
        isOpen={isStatusModalOpen}
        onClose={onCloseStatusUpdate}
        asset={asset}
        onAfterUpdate={onOpenRepair}
      />
      <RepairFormModal
        isOpen={isRepairModalOpen}
        onClose={onCloseRepair}
        asset={repairModalAsset || asset}
      />

    </div>
  )
}

export default IndividualAssetView
