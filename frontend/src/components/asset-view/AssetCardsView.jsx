/**
 * Asset Cards View Component
 * Displays assets in a card grid layout with inline editing
 */

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Package,
  Calendar,
  Tag,
  Edit,
  Trash2,
  Save,
  X,
  Shield,
  Clock,
  FileText,
  ChevronDown,
  ChevronUp,
  QrCode,
  Barcode,
  Eye,
  Cpu,
  Monitor,
  Keyboard,
} from 'lucide-react'
import { formatDate, formatCurrency } from '../../utils/assetFormatters'
import apiClient from '../../services/apiClient'

// Small helper component for info cards
const InfoCard = ({ label, value, icon }) => (
  <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
    <div className="text-xs text-slate-500 mb-2 flex items-center gap-1">
      {icon && <span>{icon}</span>}
      {label}
    </div>
    <div className="text-base font-semibold text-slate-900 truncate">{value}</div>
  </div>
)

const AssetCard = ({
  asset,
  isEditing,
  editFormData,
  categories,
  statuses,
  vendors,
  statusColorMap,
  showStatusPicker,
  showCodes,
  onEdit,
  onSave,
  onCancel,
  onChange,
  onDelete,
  onStatusChange,
  onStatusPickerToggle,
  onCodeToggle,
  onCodeView,
  onCardClick,
  isPending,
}) => {
  // State to track if codes section is expanded (default: collapsed/hidden)
  const [isCodesExpanded, setIsCodesExpanded] = useState(false)
  const [isComponentsExpanded, setIsComponentsExpanded] = useState(false)

  // Check if asset is Desktop PC
  const isDesktopPC = asset.category?.name?.toLowerCase().includes('desktop') ||
                      asset.category?.name?.toLowerCase().includes('pc')

  // Fetch components for Desktop PC assets
  const { data: componentsData } = useQuery({
    queryKey: ['asset-components', asset.id],
    queryFn: async () => {
      const response = await apiClient.get(`/assets/${asset.id}/components`)
      return response.data
    },
    enabled: isDesktopPC && !isEditing,
  })

  const components = componentsData?.data || []

  // Component type icons
  const getComponentIcon = (type) => {
    switch (type) {
      case 'system_unit':
        return <Cpu className="w-4 h-4" />
      case 'monitor':
        return <Monitor className="w-4 h-4" />
      case 'keyboard_mouse':
        return <Keyboard className="w-4 h-4" />
      default:
        return <Package className="w-4 h-4" />
    }
  }

  const handleCardClick = (e) => {
    // Don't navigate if in edit mode
    if (isEditing) {
      return
    }

    // Don't navigate if clicking on interactive elements
    if (
      e.target.closest('button') ||
      e.target.closest('select') ||
      e.target.closest('input') ||
      e.target.closest('textarea') ||
      e.target.closest('img')
    ) {
      return
    }
    onCardClick?.()
  }

  return (
    <div
      className={`group relative bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-300 h-full flex flex-col ${
        !isEditing ? 'hover:shadow-xl hover:border-blue-300 hover:-translate-y-1 cursor-pointer' : ''
      }`}
      onClick={handleCardClick}
    >
      {/* View Movement Overlay - Only shown on hover in view mode */}
      {!isEditing && (
        <div className="absolute inset-0 bg-blue-600 bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 pointer-events-none z-10 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 pointer-events-none">
            <Eye className="w-5 h-5" />
            <span className="font-semibold text-sm">View Asset Movement</span>
          </div>
        </div>
      )}

      {isEditing ? (
        /* EDIT MODE */
        <div className="p-6 sm:p-8 space-y-4 flex-1 flex flex-col">
          <div className="flex items-center justify-between pb-3 sm:pb-4 border-b-2 border-blue-500">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">Edit Asset</h3>
            </div>
            <div className="flex gap-1.5 sm:gap-2">
              <button
                onClick={onSave}
                disabled={isPending}
                className="p-2 sm:p-2.5 text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors shadow-sm touch-manipulation disabled:opacity-50"
                title="Save"
              >
                <Save className="w-4 h-4" />
              </button>
              <button
                onClick={onCancel}
                className="p-2 sm:p-2.5 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors touch-manipulation"
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Edit Form Fields */}
          <div className="space-y-3 flex-1">
            <input
              type="text"
              value={editFormData.asset_name}
              onChange={(e) => onChange('asset_name', e.target.value)}
              placeholder="Asset Name"
              className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <select
              value={editFormData.asset_category_id}
              onChange={(e) => onChange('asset_category_id', e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <input
              type="text"
              value={editFormData.brand}
              onChange={(e) => onChange('brand', e.target.value)}
              placeholder="Brand"
              className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="text"
              value={editFormData.model}
              onChange={(e) => onChange('model', e.target.value)}
              placeholder="Model"
              className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="text"
              value={editFormData.serial_number}
              onChange={(e) => onChange('serial_number', e.target.value)}
              placeholder="Serial Number"
              className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="date"
              value={editFormData.purchase_date}
              onChange={(e) => onChange('purchase_date', e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <input
              type="number"
              value={editFormData.acq_cost}
              onChange={(e) => onChange('acq_cost', e.target.value)}
              placeholder="Acquisition Cost"
              className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="number"
              value={editFormData.estimate_life}
              onChange={(e) => onChange('estimate_life', e.target.value)}
              placeholder="Estimated Life (years)"
              className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="date"
              value={editFormData.waranty_expiration_date}
              onChange={(e) => onChange('waranty_expiration_date', e.target.value)}
              placeholder="Warranty Expiration"
              className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <select
              value={editFormData.vendor_id}
              onChange={(e) => onChange('vendor_id', e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Vendor</option>
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>{vendor.company_name}</option>
              ))}
            </select>
            <select
              value={editFormData.status_id}
              onChange={(e) => onChange('status_id', e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Status</option>
              {statuses.map((status) => (
                <option key={status.id} value={status.id}>{status.name}</option>
              ))}
            </select>
            <textarea
              value={editFormData.remarks}
              onChange={(e) => onChange('remarks', e.target.value)}
              placeholder="Remarks"
              rows="2"
              className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      ) : (
        /* VIEW MODE */
        <div className="flex flex-col h-full">
          {/* Card Header with Gradient */}
          <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-5 sm:p-7 border-b border-slate-200">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-slate-900 mb-3 truncate">
                  {asset.asset_name}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  {asset.category && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-white border border-slate-200 text-slate-700">
                      <Tag className="w-3 h-3" />
                      {asset.category.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Status Picker */}
              <div className="relative flex-shrink-0">
                <button
                  onClick={onStatusPickerToggle}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg shadow-sm hover:border-blue-400 hover:text-blue-600 transition-colors"
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: statusColorMap[asset.status_id] || '#94a3b8' }}
                  />
                  <span>{asset.status?.name || 'Status'}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                {showStatusPicker && (
                  <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
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
            </div>

            {/* Acquisition Cost Highlight */}
            {asset.acq_cost && (
              <div className="mt-5 p-4 bg-white rounded-lg border border-blue-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">Acquisition Cost</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatCurrency(asset.acq_cost)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Card Body - Asset Details */}
          <div className="flex-1 p-5 sm:p-7 space-y-4 sm:space-y-5 bg-white">
            {/* Primary Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              {asset.brand && (
                <InfoCard label="Brand" value={asset.brand} icon="🏢" />
              )}
              {asset.model && (
                <InfoCard label="Model" value={asset.model} icon="📱" />
              )}
            </div>

            {/* Serial & Purchase Info */}
            <div className="space-y-2.5">
              {asset.serial_number && (
                <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <Package className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-slate-500">Serial Number</div>
                    <div className="text-sm font-mono font-semibold text-slate-900 truncate">{asset.serial_number}</div>
                  </div>
                </div>
              )}

              {asset.purchase_date && (
                <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <Calendar className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-xs text-slate-500">Purchase Date</div>
                    <div className="text-sm font-medium text-slate-900">
                      {formatDate(asset.purchase_date)}
                    </div>
                  </div>
                </div>
              )}

              {asset.book_value && (
                <div className="flex items-center gap-2 p-2.5 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex-1">
                    <div className="text-xs text-green-600 font-medium">Book Value</div>
                    <div className="text-sm font-bold text-green-700">
                      {formatCurrency(asset.book_value)}
                    </div>
                  </div>
                </div>
              )}

              {/* Desktop PC Components Section - Collapsible */}
              {isDesktopPC && components.length > 0 && (
                <div className="pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsComponentsExpanded(!isComponentsExpanded)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors mb-3"
                  >
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-amber-600" />
                      <span>Desktop PC Components ({components.length})</span>
                    </div>
                    {isComponentsExpanded ? (
                      <ChevronUp className="w-4 h-4 text-amber-600" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-amber-600" />
                    )}
                  </button>

                  {isComponentsExpanded && (
                    <div className="space-y-2">
                      {components.map((component) => (
                        <div
                          key={component.id}
                          className="bg-white border border-slate-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start gap-2 mb-2">
                            <div className="text-blue-600 mt-0.5">
                              {getComponentIcon(component.component_type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-slate-900 text-sm truncate">
                                {component.component_name}
                              </div>
                              <span className="inline-block text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full mt-1">
                                {component.component_type.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-1 text-xs">
                            {component.brand && (
                              <div className="flex justify-between">
                                <span className="text-slate-600">Brand:</span>
                                <span className="font-medium text-slate-900">{component.brand}</span>
                              </div>
                            )}
                            {component.model && (
                              <div className="flex justify-between">
                                <span className="text-slate-600">Model:</span>
                                <span className="font-medium text-slate-900">{component.model}</span>
                              </div>
                            )}
                            {component.serial_number && (
                              <div className="flex justify-between">
                                <span className="text-slate-600">Serial:</span>
                                <span className="font-mono text-slate-900">{component.serial_number}</span>
                              </div>
                            )}
                            {component.status && (
                              <div className="flex justify-between">
                                <span className="text-slate-600">Status:</span>
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                  {component.status.name}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Additional Details */}
            <div className="pt-3 border-t border-slate-200 space-y-2">
              {asset.estimate_life && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Estimated Life
                  </span>
                  <span className="font-semibold text-slate-900">{asset.estimate_life} years</span>
                </div>
              )}
              {asset.waranty_expiration_date && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    Warranty Expires
                  </span>
                  <span className="font-semibold text-slate-900">
                    {formatDate(asset.waranty_expiration_date)}
                  </span>
                </div>
              )}
              {asset.vendor && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Vendor</span>
                  <span className="font-semibold text-slate-900 truncate ml-2">{asset.vendor.company_name}</span>
                </div>
              )}
            </div>

            {/* QR Code / Barcode Section - Collapsible */}
            {(asset.qr_code || asset.barcode) && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                {/* Toggle Button to Show/Hide Codes */}
                <button
                  type="button"
                  onClick={() => setIsCodesExpanded(!isCodesExpanded)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors mb-3"
                >
                  <div className="flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-slate-600" />
                    <span>QR Code & Barcode</span>
                  </div>
                  {isCodesExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  )}
                </button>

                {/* Codes Content - Only shown when expanded */}
                {isCodesExpanded && (
                  <>
                    {asset.qr_code && asset.barcode ? (
                      <div className="space-y-3">
                        {/* Toggle Tabs */}
                        <div className="flex items-center justify-center border-b border-slate-200">
                      <div className="inline-flex">
                        <button
                          type="button"
                          onClick={() => onCodeToggle('qr')}
                          className={`relative inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors duration-200 ${
                            (showCodes || 'qr') === 'qr'
                              ? 'text-blue-600'
                              : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          <QrCode className="w-4 h-4" />
                          <span>QR Code</span>
                          {(showCodes || 'qr') === 'qr' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => onCodeToggle('barcode')}
                          className={`relative inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors duration-200 ${
                            (showCodes || 'qr') === 'barcode'
                              ? 'text-blue-600'
                              : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          <Barcode className="w-4 h-4" />
                          <span>Barcode</span>
                          {(showCodes || 'qr') === 'barcode' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* QR Code Display */}
                    {(showCodes || 'qr') === 'qr' && (
                      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl border-2 border-blue-200 p-4 shadow-md hover:shadow-xl transition-shadow duration-300">
                        <div className="flex flex-col items-center gap-3">
                          <div className="flex items-center gap-2">
                            <QrCode className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-bold text-blue-900 uppercase tracking-wide">QR Code</span>
                          </div>
                          <div className="bg-white rounded-lg p-3 shadow-inner">
                            <img
                              src={asset.qr_code}
                              alt={`${asset.asset_name} QR code`}
                              className="w-48 h-48 object-contain cursor-pointer hover:scale-105 transition-transform duration-200"
                              onClick={() => onCodeView({ src: asset.qr_code, asset_name: asset.asset_name, serial_number: asset.serial_number, type: 'qr' })}
                            />
                          </div>
                          <p className="text-xs text-slate-600 text-center italic">Click to view full size</p>
                        </div>
                      </div>
                    )}

                    {/* Barcode Display */}
                    {(showCodes || 'qr') === 'barcode' && (
                      <div className="bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 rounded-xl border-2 border-slate-300 p-4 shadow-md hover:shadow-xl transition-shadow duration-300">
                        <div className="flex flex-col items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Barcode className="w-4 h-4 text-slate-700" />
                            <span className="text-sm font-bold text-slate-900 uppercase tracking-wide">Barcode</span>
                          </div>
                          <div className="bg-white rounded-lg p-4 shadow-inner w-full">
                            <img
                              src={asset.barcode}
                              alt={`${asset.asset_name} barcode`}
                              className="w-full h-24 object-contain cursor-pointer hover:scale-105 transition-transform duration-200"
                              onClick={() => onCodeView({ src: asset.barcode, asset_name: asset.asset_name, serial_number: asset.serial_number, type: 'barcode' })}
                            />
                          </div>
                          <p className="text-xs text-slate-600 text-center italic">Click to view full size</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // Single code display
                  <div className="space-y-3">
                    {asset.qr_code && (
                      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl border-2 border-blue-200 p-4 shadow-md hover:shadow-xl transition-shadow duration-300">
                        <div className="flex flex-col items-center gap-3">
                          <div className="flex items-center gap-2">
                            <QrCode className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-bold text-blue-900 uppercase tracking-wide">QR Code</span>
                          </div>
                          <div className="bg-white rounded-lg p-3 shadow-inner">
                            <img
                              src={asset.qr_code}
                              alt={`${asset.asset_name} QR code`}
                              className="w-48 h-48 object-contain cursor-pointer hover:scale-105 transition-transform duration-200"
                              onClick={() => onCodeView({ src: asset.qr_code, asset_name: asset.asset_name, serial_number: asset.serial_number, type: 'qr' })}
                            />
                          </div>
                          <p className="text-xs text-slate-600 text-center italic">Click to view full size</p>
                        </div>
                      </div>
                    )}
                    {asset.barcode && (
                      <div className="bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 rounded-xl border-2 border-slate-300 p-4 shadow-md hover:shadow-xl transition-shadow duration-300">
                        <div className="flex flex-col items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Barcode className="w-4 h-4 text-slate-700" />
                            <span className="text-sm font-bold text-slate-900 uppercase tracking-wide">Barcode</span>
                          </div>
                          <div className="bg-white rounded-lg p-4 shadow-inner w-full">
                            <img
                              src={asset.barcode}
                              alt={`${asset.asset_name} barcode`}
                              className="w-full h-24 object-contain cursor-pointer hover:scale-105 transition-transform duration-200"
                              onClick={() => onCodeView({ src: asset.barcode, asset_name: asset.asset_name, serial_number: asset.serial_number, type: 'barcode' })}
                            />
                          </div>
                          <p className="text-xs text-slate-600 text-center italic">Click to view full size</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                </>
              )}
              </div>
            )}

            {/* Remarks */}
            {asset.remarks && (
              <div className="pt-3 border-t border-slate-200">
                <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <FileText className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-amber-700 mb-1">Notes</div>
                    <div className="text-sm text-slate-700 line-clamp-3">{asset.remarks}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-2 sm:gap-3">
            <button
              onClick={onEdit}
              className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md touch-manipulation"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
            <button
              onClick={onDelete}
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const AssetCardsView = ({
  assets,
  editingAssetId,
  editFormData,
  categories,
  statuses,
  vendors,
  statusColorMap,
  statusPickerFor,
  showCodesFor,
  onEditClick,
  onSaveEdit,
  onCancelEdit,
  onInputChange,
  onDeleteClick,
  onQuickStatusChange,
  onStatusPickerToggle,
  onCodeToggle,
  onCodeView,
  onCardClick,
  isPending,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
      {assets.map((asset) => (
        <AssetCard
          key={asset.id}
          asset={asset}
          isEditing={editingAssetId === asset.id}
          editFormData={editFormData}
          categories={categories}
          statuses={statuses}
          vendors={vendors}
          statusColorMap={statusColorMap}
          showStatusPicker={statusPickerFor === asset.id}
          showCodes={showCodesFor[asset.id]}
          onEdit={() => onEditClick(asset)}
          onSave={onSaveEdit}
          onCancel={onCancelEdit}
          onChange={onInputChange}
          onDelete={() => onDeleteClick(asset.id, asset.asset_name)}
          onStatusChange={(statusId) => {
            onQuickStatusChange(asset.id, statusId)
            onStatusPickerToggle(null)
          }}
          onStatusPickerToggle={() => onStatusPickerToggle(statusPickerFor === asset.id ? null : asset.id)}
          onCodeToggle={(type) => onCodeToggle(asset.id, type)}
          onCodeView={onCodeView}
          onCardClick={() => onCardClick?.(asset.id)}
          isPending={isPending}
        />
      ))}
    </div>
  )
}

export default React.memo(AssetCardsView)
