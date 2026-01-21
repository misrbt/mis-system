/**
 * Asset Table Row Component
 * Individual table row - Edit and Delete use modal dialogs
 * Extracted from AssetTableView.jsx for better code splitting
 */

import React from 'react'
import { Edit, Trash2, ChevronDown, QrCode, Barcode, MessageSquare } from 'lucide-react'
import { formatDate, formatCurrency } from '../../utils/assetFormatters'

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

      {/* Equipment */}
      <td className="px-4 py-3">
        <div className="text-sm text-slate-700">
          {asset.equipment
            ? `${asset.equipment.brand || ''} ${asset.equipment.model || ''}`.trim() || 'ƒ?"'
            : 'ƒ?"'}
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
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
              <div className="max-h-56 overflow-y-auto py-1">
                {statuses.length ? (
                  statuses.map((status) => {
                    const isActive = status.id === asset.status_id
                    return (
                      <button
                        key={status.id}
                        type="button"
                        onClick={() => onStatusChange(status.id)}
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
        <div className="flex items-center justify-center gap-2">
          {asset.qr_code && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onCodeView?.({
                  src: asset.qr_code,
                  title: asset.asset_name,
                  type: 'qr'
                })
              }}
              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title="View QR Code"
            >
              <QrCode className="w-5 h-5" />
            </button>
          )}
          {asset.barcode && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onCodeView?.({
                  src: asset.barcode,
                  title: asset.asset_name,
                  type: 'barcode'
                })
              }}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="View Barcode"
            >
              <Barcode className="w-5 h-5" />
            </button>
          )}
          {!asset.qr_code && !asset.barcode && (
            <span className="text-slate-400 text-xs">—</span>
          )}
        </div>
      </td>

      {/* Actions */}
      <td className="px-2 sm:px-4 py-3 whitespace-nowrap text-right sticky right-0 bg-white">
        <div className="flex items-center justify-end gap-1 sm:gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRemarksView?.()
            }}
            className="inline-flex items-center gap-1 px-2 sm:px-3 py-2 sm:py-1.5 text-xs sm:text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors touch-manipulation"
            title="View Remarks"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Remarks</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
            className="inline-flex items-center gap-1 px-2 sm:px-3 py-2 sm:py-1.5 text-xs sm:text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors touch-manipulation"
            title="Edit Asset"
          >
            <Edit className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Edit</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            disabled={isPending}
            className="inline-flex items-center gap-1 px-2 sm:px-3 py-2 sm:py-1.5 text-xs sm:text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 touch-manipulation"
            title="Delete Asset"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>
      </td>
    </tr>
  )
}

export default React.memo(AssetTableRow)
