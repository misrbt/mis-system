
import React, { useState, useCallback, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Edit, Trash2, ChevronDown, QrCode, Barcode, MessageSquare, RefreshCw, Loader2, Info } from 'lucide-react'
import { formatDate, formatCurrency } from '../../utils/assetFormatters'
import { getAssetQRCode, regenerateQRCode, QR_ERROR_CODES, getErrorMessage } from '../../services/qrCodeService'
import Swal from 'sweetalert2'

// QR Code Cell Component - Handles QR code generation on demand for table view
const QRCodeCell = ({ asset, onCodeView }) => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [localQRCode, setLocalQRCode] = useState(asset?.qr_code || null)
  const queryClient = useQueryClient()

  useEffect(() => {
    setLocalQRCode(asset?.qr_code || null)
  }, [asset?.qr_code])

  const handleViewQRCode = useCallback(async (e) => {
    e.stopPropagation()

    if (localQRCode) {
      onCodeView?.({
        src: localQRCode,
        title: asset.asset_name,
        asset_name: asset.asset_name,
        serial_number: asset.serial_number,
        type: 'qr'
      })
      return
    }

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
      const result = await getAssetQRCode(asset, false)
      setLocalQRCode(result.src)

      if (result.source === 'backend') {
        queryClient.invalidateQueries(['asset', asset.id])
        queryClient.invalidateQueries(['employeeAssets'])
      }

      onCodeView?.({
        src: result.src,
        title: asset.asset_name,
        asset_name: asset.asset_name,
        serial_number: asset.serial_number,
        type: 'qr'
      })
    } catch (error) {
      console.error('Failed to generate QR code:', error)

      let title = 'QR Code Generation Failed'
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
  }, [asset, localQRCode, onCodeView, queryClient])

  const handleRegenerateQRCode = useCallback(async (e) => {
    e.stopPropagation()

    // Check internet connection first
    if (!navigator.onLine) {
      Swal.fire({
        icon: 'error',
        title: 'No Internet Connection',
        text: 'Unable to connect to QR Code Monkey API. Please check your internet connection.',
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
        queryClient.invalidateQueries(['employeeAssets'])

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
            timer: 2000,
            showConfirmButton: false,
          })
        }
      } else {
        throw new Error('No QR code returned from server')
      }
    } catch (error) {
      console.error('Failed to regenerate QR code:', error)

      let title = 'Regeneration Failed'
      let text = error.message || 'Failed to regenerate QR code.'

      if (error.code === QR_ERROR_CODES.NO_INTERNET || error.code === QR_ERROR_CODES.NETWORK_ERROR) {
        title = 'Connection Error'
        text = 'Unable to connect to QR Code Monkey API. Please check your internet connection.'
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

  const handleViewBarcode = useCallback((e) => {
    e.stopPropagation()
    if (asset.barcode) {
      onCodeView?.({
        src: asset.barcode,
        title: asset.asset_name,
        asset_name: asset.asset_name,
        serial_number: asset.serial_number,
        type: 'barcode'
      })
    }
  }, [asset, onCodeView])

  return (
    <div className="flex items-center justify-center gap-1">
      {/* QR Code Button - Always visible */}
      <button
        onClick={handleViewQRCode}
        disabled={isGenerating}
        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title={localQRCode ? 'View QR Code' : 'Generate QR Code'}
      >
        {isGenerating ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <QrCode className="w-5 h-5" />
        )}
      </button>

      {/* Regenerate Button */}
      {localQRCode && (
        <button
          onClick={handleRegenerateQRCode}
          disabled={isGenerating}
          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Regenerate QR Code"
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
        </button>
      )}

      {/* Barcode Button */}
      {asset.barcode && (
        <button
          onClick={handleViewBarcode}
          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
          title="View Barcode"
        >
          <Barcode className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}

const AssetTableRow = ({
  asset,
  statusColorMap,
  showStatusPicker,
  totalEmployeeAcqCost,
  statuses,
  onEdit,
  onDelete,
  onStatusChange,
  onStatusPickerToggle,
  onCodeView,
  onRemarksView,
  onRowClick,
  onViewDetails,
  isPending,
}) => {
  const handleRowClick = (e) => {
    // Don't navigate if clicking on interactive elements
    if (
      e.target.closest('button') ||
      e.target.closest('select')
    ) {
      return
    }
    onRowClick?.()
  }

  return (
    <tr
      className="hover:bg-slate-50 cursor-pointer transition-all duration-200"
      onClick={handleRowClick}
    >
      {/* Asset Name */}
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="text-sm font-medium text-slate-900">{asset.asset_name}</div>
      </td>

      {/* Brand & Model */}
      <td className="px-4 py-3">
        <div className="text-sm text-slate-700">
          {asset.brand && <div>{asset.brand}</div>}
          {asset.model && <div className="text-xs text-slate-500">{asset.model}</div>}
          {!asset.brand && !asset.model && <span className="text-slate-400">—</span>}
        </div>
      </td>

      {/* Serial # */}
      <td className="px-4 py-3">
        <div className="text-sm font-mono text-slate-700">{asset.serial_number || '—'}</div>
      </td>

      {/* Category */}
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
          {asset.category?.name || '—'}
        </span>
      </td>

      {/* Status */}
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="relative">
          <button
            onClick={onStatusPickerToggle}
            className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-lg shadow-sm hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            <span
              className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-semibold border"
              style={{
                backgroundColor: statusColorMap[asset.status_id] || '#E2E8F0',
                color: statusColorMap[asset.status_id] ? '#fff' : '#1e293b',
                borderColor: statusColorMap[asset.status_id] || '#cbd5e1',
              }}
            >
              {asset.status?.name || 'Status'}
            </span>
            <ChevronDown className="w-3 h-3" />
          </button>
          {showStatusPicker && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
              <select
                value={asset.status_id || ''}
                onChange={(e) => onStatusChange(e.target.value)}
                className="w-full px-3 py-2 text-sm border-0 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select status</option>
                {statuses.map((status) => (
                  <option key={status.id} value={status.id}>{status.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </td>

      {/* Vendor */}
      <td className="px-4 py-3">
        <div className="text-sm text-slate-700">{asset.vendor?.company_name || '—'}</div>
      </td>

      {/* Purchase Date */}
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="text-sm text-slate-700">
          {formatDate(asset.purchase_date)}
        </div>
      </td>

      {/* Warranty Expiration */}
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="text-sm text-slate-700">
          {formatDate(asset.waranty_expiration_date)}
        </div>
      </td>

      {/* Estimated Life */}
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="text-sm text-slate-700 text-center">{asset.estimate_life || '—'}</div>
      </td>

      {/* Acquisition Cost */}
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="text-sm font-semibold text-blue-600" title={`Total: ${formatCurrency(totalEmployeeAcqCost)}`}>
          {formatCurrency(asset.acq_cost)}
        </div>
      </td>

      {/* Book Value */}
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="text-sm font-bold text-green-600">
          {formatCurrency(asset.book_value || 0)}
        </div>
      </td>

      {/* QR Code / Barcode */}
      <td className="px-4 py-3 whitespace-nowrap">
        <QRCodeCell
          asset={asset}
          onCodeView={onCodeView}
        />
      </td>

      {/* Actions */}
      <td className="px-2 sm:px-4 py-3 whitespace-nowrap text-right sticky right-0 bg-white">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onViewDetails?.()
            }}
            className="inline-flex items-center justify-center p-2 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors touch-manipulation"
            title="View asset details"
          >
            <Info className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRemarksView?.()
            }}
            className="inline-flex items-center justify-center p-2 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors touch-manipulation"
            title="View remarks"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
            className="inline-flex items-center justify-center p-2 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors touch-manipulation"
            title="Edit asset"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            disabled={isPending}
            className="inline-flex items-center justify-center p-2 text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 touch-manipulation"
            title="Delete asset"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  )
}

export default React.memo(AssetTableRow)
