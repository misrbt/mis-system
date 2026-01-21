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

  isSelected,
  onSelect,
  onEdit,
  onSave,
  onCancel,
  onChange,
  onDelete,
  onStatusChange,
  onStatusPickerToggle,
  onCodeView,
  onCardClick,
  isPending,
}) => {
  // State to track if details section is expanded (default: collapsed/hidden)
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false)

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

  const bookValueNumber = Number.parseFloat(asset?.book_value)
  const isBookValueOne =
    Number.isFinite(bookValueNumber) && Math.round(bookValueNumber * 100) / 100 === 1

  return (
    <div
      className={`group relative bg-white rounded-xl shadow-sm border overflow-hidden transition-all duration-300 flex flex-col ${
        isSelected ? 'border-blue-500 border-2 shadow-lg' : 'border-slate-200'
      } ${
        !isEditing ? 'hover:shadow-xl hover:border-blue-300 hover:-translate-y-1 cursor-pointer' : ''
      }`}
      onClick={handleCardClick}
    >
      {/* Selection Checkbox */}
      {onSelect && !isEditing && (
        <div className="absolute top-3 left-3 z-20">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation()
              onSelect()
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-5 h-5 rounded border-2 border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
          />
        </div>
      )}
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
        <div className="flex flex-col h-full bg-white">
          {/* Card Header with Gradient - More Compact */}
          <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-4 border-b border-slate-200">
            <div className="flex items-start justify-between mb-2">
              <div className={`flex-1 min-w-0 pr-2 ${onSelect ? 'pl-8' : ''}`}>
                <h3 className="text-lg font-bold text-slate-900 mb-2 truncate" title={asset.asset_name}>
                  {asset.asset_name}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  {asset.category && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-white border border-slate-200 text-slate-700">
                      <Tag className="w-3 h-3" />
                      {asset.category.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Compact Status Picker */}
              <div className="relative flex-shrink-0">
                <button
                  onClick={onStatusPickerToggle}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-white border border-slate-200 rounded-lg shadow-sm hover:border-blue-400 hover:text-blue-600 transition-colors"
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: statusColorMap[asset.status_id] || '#94a3b8' }}
                  />
                  <span>{asset.status?.name || 'Status'}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                {/* Status Dropdown - Same as before */}
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
            </div>

            {/* Purchase Date Row */}
            {asset.purchase_date && (
              <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-600 bg-slate-50 rounded px-2 py-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-medium">Purchased:</span>
                <span className="font-semibold text-slate-900">{formatDate(asset.purchase_date)}</span>
              </div>
            )}

            {/* Key Info Row: Show Details Toggle & Acq Cost */}
            <div className="flex items-center justify-between mt-3 text-sm">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsDetailsExpanded(!isDetailsExpanded)
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
              >
                {isDetailsExpanded ? (
                  <>
                    <span>Hide Details</span>
                    <ChevronUp className="w-3 h-3" />
                  </>
                ) : (
                  <>
                    <span>Show Details</span>
                    <ChevronDown className="w-3 h-3" />
                  </>
                )}
              </button>
              {asset.acq_cost && (
                <div className="font-bold text-blue-700">
                  {formatCurrency(asset.acq_cost)}
                </div>
              )}
            </div>
          </div>

          {/* Card Body - Collapsible Details */}
          <div className="flex-1 flex flex-col">
            {/* Expanded Details Section */}
            {isDetailsExpanded && (
              <div className="p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
                {/* Serial Number - Prominent Display */}
                {asset.serial_number && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Package className="w-4 h-4 text-blue-600" />
                      <div className="text-xs font-bold text-blue-600 uppercase tracking-wide">Serial Number</div>
                    </div>
                    <div className="text-sm font-mono font-semibold text-slate-900">{asset.serial_number}</div>
                  </div>
                )}

                {/* Brand & Model */}
                {(asset.brand || asset.model) && (
                  <div className="grid grid-cols-2 gap-3">
                    {asset.brand && (
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                         <div className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">Brand</div>
                         <div className="text-sm font-semibold text-slate-900 truncate">{asset.brand}</div>
                      </div>
                    )}
                    {asset.model && (
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                         <div className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">Model</div>
                         <div className="text-sm font-semibold text-slate-900 truncate">{asset.model}</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Dates & Values */}
                <div className="space-y-2 text-sm">
                   {asset.book_value && (
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-600">Book Value</span>
                      <span className={`font-medium ${isBookValueOne ? 'text-slate-900' : 'text-green-700'}`}>
                        {formatCurrency(asset.book_value)}
                      </span>
                    </div>
                   )}
                   {asset.estimate_life && (
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-600">Est. Life</span>
                      <span className="font-medium text-slate-900">{asset.estimate_life} yrs</span>
                    </div>
                   )}
                   {asset.waranty_expiration_date && (
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-600">Warranty Exp.</span>
                      <span className="font-medium text-slate-900">{formatDate(asset.waranty_expiration_date)}</span>
                    </div>
                   )}
                   {asset.vendor && (
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-600">Vendor</span>
                      <span className="font-medium text-slate-900 truncate max-w-[150px]">{asset.vendor.company_name}</span>
                    </div>
                   )}
                </div>

                {/* Specifications */}
                {asset.specifications && Object.keys(asset.specifications).length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <div className="text-xs font-bold text-blue-600 uppercase flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Specifications
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {asset.specifications.capacity && (
                        <div className="bg-blue-50 p-2 rounded border border-blue-100">
                          <div className="text-[10px] text-blue-600 uppercase tracking-wide mb-0.5">Capacity</div>
                          <div className="text-sm font-semibold text-slate-900">
                            {asset.specifications.capacity} {asset.specifications.capacity_unit || 'GB'}
                          </div>
                        </div>
                      )}
                      {asset.specifications.interface && (
                        <div className="bg-slate-50 p-2 rounded border border-slate-100">
                          <div className="text-[10px] text-slate-500 uppercase tracking-wide mb-0.5">Interface</div>
                          <div className="text-sm font-semibold text-slate-900">{asset.specifications.interface}</div>
                        </div>
                      )}
                      {asset.specifications.form_factor && (
                        <div className="bg-slate-50 p-2 rounded border border-slate-100">
                          <div className="text-[10px] text-slate-500 uppercase tracking-wide mb-0.5">Form Factor</div>
                          <div className="text-sm font-semibold text-slate-900">{asset.specifications.form_factor}</div>
                        </div>
                      )}
                      {asset.specifications.speed && (
                        <div className="bg-slate-50 p-2 rounded border border-slate-100">
                          <div className="text-[10px] text-slate-500 uppercase tracking-wide mb-0.5">Speed</div>
                          <div className="text-sm font-semibold text-slate-900">{asset.specifications.speed}</div>
                        </div>
                      )}
                      {asset.specifications.memory_type && (
                        <div className="bg-purple-50 p-2 rounded border border-purple-100">
                          <div className="text-[10px] text-purple-600 uppercase tracking-wide mb-0.5">Type</div>
                          <div className="text-sm font-semibold text-slate-900">{asset.specifications.memory_type}</div>
                        </div>
                      )}
                      {asset.specifications.screen_size && (
                        <div className="bg-indigo-50 p-2 rounded border border-indigo-100">
                          <div className="text-[10px] text-indigo-600 uppercase tracking-wide mb-0.5">Screen Size</div>
                          <div className="text-sm font-semibold text-slate-900">{asset.specifications.screen_size}"</div>
                        </div>
                      )}
                      {asset.specifications.resolution && (
                        <div className="bg-slate-50 p-2 rounded border border-slate-100">
                          <div className="text-[10px] text-slate-500 uppercase tracking-wide mb-0.5">Resolution</div>
                          <div className="text-sm font-semibold text-slate-900">{asset.specifications.resolution}</div>
                        </div>
                      )}
                      {asset.specifications.panel_type && (
                        <div className="bg-slate-50 p-2 rounded border border-slate-100">
                          <div className="text-[10px] text-slate-500 uppercase tracking-wide mb-0.5">Panel Type</div>
                          <div className="text-sm font-semibold text-slate-900">{asset.specifications.panel_type}</div>
                        </div>
                      )}
                      {asset.specifications.refresh_rate && (
                        <div className="bg-slate-50 p-2 rounded border border-slate-100">
                          <div className="text-[10px] text-slate-500 uppercase tracking-wide mb-0.5">Refresh Rate</div>
                          <div className="text-sm font-semibold text-slate-900">{asset.specifications.refresh_rate} Hz</div>
                        </div>
                      )}
                      {asset.specifications.printer_type && (
                        <div className="bg-green-50 p-2 rounded border border-green-100">
                          <div className="text-[10px] text-green-600 uppercase tracking-wide mb-0.5">Printer Type</div>
                          <div className="text-sm font-semibold text-slate-900">{asset.specifications.printer_type}</div>
                        </div>
                      )}
                      {asset.specifications.color_support && (
                        <div className="bg-slate-50 p-2 rounded border border-slate-100">
                          <div className="text-[10px] text-slate-500 uppercase tracking-wide mb-0.5">Color</div>
                          <div className="text-sm font-semibold text-slate-900">{asset.specifications.color_support}</div>
                        </div>
                      )}
                      {asset.specifications.print_speed && (
                        <div className="bg-slate-50 p-2 rounded border border-slate-100">
                          <div className="text-[10px] text-slate-500 uppercase tracking-wide mb-0.5">Print Speed</div>
                          <div className="text-sm font-semibold text-slate-900">{asset.specifications.print_speed} ppm</div>
                        </div>
                      )}
                      {asset.specifications.device_type && (
                        <div className="bg-cyan-50 p-2 rounded border border-cyan-100">
                          <div className="text-[10px] text-cyan-600 uppercase tracking-wide mb-0.5">Device Type</div>
                          <div className="text-sm font-semibold text-slate-900">{asset.specifications.device_type}</div>
                        </div>
                      )}
                      {asset.specifications.ports && (
                        <div className="bg-slate-50 p-2 rounded border border-slate-100">
                          <div className="text-[10px] text-slate-500 uppercase tracking-wide mb-0.5">Ports</div>
                          <div className="text-sm font-semibold text-slate-900">{asset.specifications.ports}</div>
                        </div>
                      )}
                      {asset.specifications.poe_support && (
                        <div className="bg-slate-50 p-2 rounded border border-slate-100">
                          <div className="text-[10px] text-slate-500 uppercase tracking-wide mb-0.5">PoE Support</div>
                          <div className="text-sm font-semibold text-slate-900">{asset.specifications.poe_support}</div>
                        </div>
                      )}
                      {asset.specifications.camera_type && (
                        <div className="bg-red-50 p-2 rounded border border-red-100">
                          <div className="text-[10px] text-red-600 uppercase tracking-wide mb-0.5">Camera Type</div>
                          <div className="text-sm font-semibold text-slate-900">{asset.specifications.camera_type}</div>
                        </div>
                      )}
                      {asset.specifications.night_vision_range && (
                        <div className="bg-slate-50 p-2 rounded border border-slate-100">
                          <div className="text-[10px] text-slate-500 uppercase tracking-wide mb-0.5">Night Vision</div>
                          <div className="text-sm font-semibold text-slate-900">{asset.specifications.night_vision_range}m</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Remarks */}
                {asset.remarks && (
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <div className="flex items-center gap-1.5 mb-1 text-amber-800">
                      <FileText className="w-3.5 h-3.5" />
                      <span className="text-xs font-bold uppercase">Notes</span>
                    </div>
                    <p className="text-sm text-slate-700 leading-snug">{asset.remarks}</p>
                  </div>
                )}

                {/* Sub-Components (Desktop PC) */}
                {isDesktopPC && components.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <div className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      Components ({components.length})
                    </div>
                    {components.map((comp) => (
                      <div key={comp.id} className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded border border-slate-100">
                        <div className="truncate pr-2">
                          <span className="font-semibold text-slate-700">{comp.component_name}</span>
                          <span className="text-slate-400 mx-1">•</span>
                          <span className="text-slate-500">{comp.serial_number || '-'}</span>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                           comp.status?.name?.toLowerCase() === 'working' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {comp.status?.name || 'N/A'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                 {/* QR/Barcode */}
                {(asset.qr_code || asset.barcode) && (
                  <div className="pt-2 border-t border-slate-200 flex gap-2">
                     {asset.qr_code && (
                       <button
                        onClick={() => onCodeView({ src: asset.qr_code, asset_name: asset.asset_name, serial_number: asset.serial_number, type: 'qr' })}
                        className="flex-1 py-1.5 flex items-center justify-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded hover:bg-blue-100 border border-blue-100 transition-colors"
                       >
                         <QrCode className="w-3.5 h-3.5" />
                         QR Code
                       </button>
                     )}
                     {asset.barcode && (
                       <button
                        onClick={() => onCodeView({ src: asset.barcode, asset_name: asset.asset_name, serial_number: asset.serial_number, type: 'barcode' })}
                        className="flex-1 py-1.5 flex items-center justify-center gap-1.5 bg-slate-100 text-slate-700 text-xs font-medium rounded hover:bg-slate-200 border border-slate-200 transition-colors"
                       >
                         <Barcode className="w-3.5 h-3.5" />
                         Barcode
                       </button>
                     )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions - Edit & Delete Buttons */}
          <div className="mt-auto bg-slate-50 border-t border-slate-200">
            <div className="p-3 flex items-center gap-2">
              <button
                onClick={onEdit}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-all shadow-sm"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                onClick={onDelete}
                disabled={isPending}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all shadow-sm disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
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
  selectedAssets,
  onSelectAsset,
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
  const isSelected = (assetId) => selectedAssets?.includes(assetId)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 items-start">
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
          isSelected={isSelected(asset.id)}
          onSelect={onSelectAsset ? () => onSelectAsset(asset.id) : undefined}
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
