import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
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
  Boxes,
  RefreshCw,
  Loader2,
} from 'lucide-react'
import SearchableSelect from '../SearchableSelect'
import { formatDate, formatCurrency } from '../../utils/assetFormatters'
import apiClient from '../../services/apiClient'
import SpecificationFields from '../specifications/SpecificationFields'
import Swal from 'sweetalert2'
import { getAssetQRCode, regenerateQRCode, QR_ERROR_CODES, getErrorMessage } from '../../services/qrCodeService'

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

// QR Code Section Component - Handles QR code generation on demand
const QRCodeSection = ({ asset, onCodeView }) => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [localQRCode, setLocalQRCode] = useState(asset?.qr_code || null)
  const queryClient = useQueryClient()

  // Update local state when asset changes
  useEffect(() => {
    setLocalQRCode(asset?.qr_code || null)
  }, [asset?.qr_code])

  const handleViewQRCode = useCallback(async (e) => {
    e.stopPropagation()

    // If QR code already exists, show it
    if (localQRCode) {
      onCodeView({
        src: localQRCode,
        asset_name: asset.asset_name,
        serial_number: asset.serial_number,
        type: 'qr',
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

    // Generate QR code on demand
    setIsGenerating(true)
    try {
      const result = await getAssetQRCode(asset, false)
      setLocalQRCode(result.src)

      // Update cache if it was generated via backend
      if (result.source === 'backend') {
        queryClient.invalidateQueries(['asset', asset.id])
        queryClient.invalidateQueries(['employeeAssets'])
      }

      onCodeView({
        src: result.src,
        asset_name: asset.asset_name,
        serial_number: asset.serial_number,
        type: 'qr',
      })
    } catch (error) {
      console.error('Failed to generate QR code:', error)

      let title = 'QR Code Generation Failed'
      let text = error.message || 'Failed to generate QR code. Please try again.'

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

        // Update cache
        queryClient.invalidateQueries(['asset', asset.id])
        queryClient.invalidateQueries(['employeeAssets'])

        onCodeView({
          src: newQRCode,
          asset_name: asset.asset_name,
          serial_number: asset.serial_number,
          type: 'qr',
        })

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
            text: 'New QR code has been generated successfully.',
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
      let text = error.message || 'Failed to regenerate QR code. Please try again.'

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
  }, [asset, onCodeView, queryClient])

  const handleViewBarcode = useCallback((e) => {
    e.stopPropagation()
    if (asset.barcode) {
      onCodeView({
        src: asset.barcode,
        asset_name: asset.asset_name,
        serial_number: asset.serial_number,
        type: 'barcode',
      })
    }
  }, [asset, onCodeView])

  return (
    <div className="pt-2 border-t border-slate-200 flex gap-2">
      {/* QR Code Button - Always visible */}
      <button
        onClick={handleViewQRCode}
        disabled={isGenerating}
        className="flex-1 py-1.5 flex items-center justify-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded hover:bg-blue-100 border border-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <QrCode className="w-3.5 h-3.5" />
        )}
        {localQRCode ? 'QR Code' : 'Generate QR'}
      </button>

      {/* Regenerate Button - Only show if QR code exists */}
      {localQRCode && (
        <button
          onClick={handleRegenerateQRCode}
          disabled={isGenerating}
          className="py-1.5 px-2 flex items-center justify-center bg-amber-50 text-amber-700 text-xs font-medium rounded hover:bg-amber-100 border border-amber-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Regenerate QR Code"
        >
          {isGenerating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5" />
          )}
        </button>
      )}

      {/* Barcode Button */}
      {asset.barcode && (
        <button
          onClick={handleViewBarcode}
          className="flex-1 py-1.5 flex items-center justify-center gap-1.5 bg-slate-100 text-slate-700 text-xs font-medium rounded hover:bg-slate-200 border border-slate-200 transition-colors"
        >
          <Barcode className="w-3.5 h-3.5" />
          Barcode
        </button>
      )}
    </div>
  )
}

const AssetCard = ({
  asset,
  isEditing,
  editFormData,
  categories,
  editSubcategories,
  statuses,
  vendors,
  equipmentOptions,
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
  onComponentsClick,
  isPending,
}) => {
  // State to track if details section is expanded (default: collapsed/hidden)
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false)
  const safeEquipmentOptions = Array.isArray(equipmentOptions) ? equipmentOptions : []
  const safeEditSubcategories = useMemo(
    () => (Array.isArray(editSubcategories) ? editSubcategories : []),
    [editSubcategories]
  )
  const resolvedEditSubcategories = useMemo(() => {
    if (!editFormData.subcategory_id) return safeEditSubcategories
    const hasCurrent = safeEditSubcategories.some(
      (sub) => String(sub.id) === String(editFormData.subcategory_id)
    )
    if (hasCurrent) return safeEditSubcategories
    const fallbackName = asset.subcategory?.name || 'Current subcategory'
    return [
      ...safeEditSubcategories,
      { id: editFormData.subcategory_id, name: fallbackName },
    ]
  }, [asset.subcategory?.name, editFormData.subcategory_id, safeEditSubcategories])
  const categoryId = editFormData.asset_category_id ? Number(editFormData.asset_category_id) : null
  const subcategoryId = editFormData.subcategory_id ? Number(editFormData.subcategory_id) : null
  const filteredEquipmentOptions = safeEquipmentOptions.filter((eq) => {
    if (categoryId && Number(eq.asset_category_id) !== categoryId) return false
    if (subcategoryId && Number(eq.subcategory_id) !== subcategoryId) return false
    return true
  })
  const buildCategoryLabel = (eq) =>
    [eq.category_name, eq.subcategory_name].filter(Boolean).join(' / ')
  const brandOptions = Array.from(
    new Map(
      [editFormData.brand, ...filteredEquipmentOptions.map((eq) => eq.brand)]
        .filter(Boolean)
        .map((brand) => {
          const match = filteredEquipmentOptions.find((eq) => eq.brand === brand)
          return [brand, match ? buildCategoryLabel(match) : '']
        })
    ).entries()
  ).map(([brand, categoryLabel]) => ({
    id: brand,
    name: brand,
    categoryLabel,
  }))
  const modelOptions = Array.from(
    new Map(
      [editFormData.model, ...filteredEquipmentOptions.map((eq) => eq.model)]
        .filter(Boolean)
        .map((model) => {
          const match = filteredEquipmentOptions.find((eq) => eq.model === model)
          return [model, match ? buildCategoryLabel(match) : '']
        })
    ).entries()
  ).map(([model, categoryLabel]) => ({
    id: model,
    name: model,
    categoryLabel,
  }))

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
    enabled: isDesktopPC,
  })

  const components = useMemo(
    () => componentsData?.data || [],
    [componentsData]
  )
  const [componentEdits, setComponentEdits] = useState([])
  const [isComponentSaving, setIsComponentSaving] = useState(false)
  const componentsById = useMemo(
    () => new Map(components.map((comp) => [comp.id, comp])),
    [components]
  )

  useEffect(() => {
    if (!isEditing || !isDesktopPC) return
    setComponentEdits(
      components.map((comp) => ({
        id: comp.id,
        component_name: comp.component_name || '',
        brand: comp.brand || '',
        model: comp.model || '',
        specifications: comp.specifications || {},
      }))
    )
  }, [components, isDesktopPC, isEditing])

  const updateComponentEdit = (componentId, field, value) => {
    setComponentEdits((prev) =>
      prev.map((comp) => (comp.id === componentId ? { ...comp, [field]: value } : comp))
    )
  }

  const saveDesktopComponents = async () => {
    if (!isDesktopPC || componentEdits.length === 0) return true

    const updates = componentEdits
      .map((edit) => {
        const original = componentsById.get(edit.id)
        if (!original) return null

        const hasSpecChange =
          JSON.stringify(edit.specifications || {}) !==
          JSON.stringify(original.specifications || {})
        const hasBrandChange = (edit.brand || '') !== (original.brand || '')
        const hasModelChange = (edit.model || '') !== (original.model || '')

        if (!hasSpecChange && !hasBrandChange && !hasModelChange) {
          return null
        }

        const statusId = original.status_id || original.status?.id
        if (!statusId) {
          return { id: edit.id, error: 'missing-status' }
        }

        return {
          id: edit.id,
          payload: {
            category_id: Number(original.category_id),
            subcategory_id: original.subcategory_id ? Number(original.subcategory_id) : null,
            component_name: original.component_name || edit.component_name || '',
            brand: edit.brand?.trim() || null,
            model: edit.model?.trim() || null,
            serial_number: original.serial_number || null,
            remarks: original.remarks || null,
            status_id: Number(statusId),
            specifications: edit.specifications || {},
          },
        }
      })
      .filter(Boolean)

    if (updates.find((item) => item.error === 'missing-status')) {
      Swal.fire(
        'Error',
        'Some components are missing status. Please edit in Components page.',
        'error'
      )
      return false
    }

    if (updates.length === 0) return true

    setIsComponentSaving(true)
    try {
      await Promise.all(
        updates.map((item) => apiClient.put(`/asset-components/${item.id}`, item.payload))
      )
      return true
    } catch (error) {
      Swal.fire(
        'Error',
        error.response?.data?.message || 'Failed to update components',
        'error'
      )
      return false
    } finally {
      setIsComponentSaving(false)
    }
  }

  const bookValueNumber = Number.parseFloat(asset?.book_value)
  const isBookValueOne =
    Number.isFinite(bookValueNumber) && Math.round(bookValueNumber * 100) / 100 === 1
  const isPrinter = asset.category?.name?.toLowerCase().includes('printer')
  const equipmentName = asset.equipment
    ? `${asset.equipment.brand || ''} ${asset.equipment.model || ''}`.trim()
    : ''
  const cardTitle = isPrinter && equipmentName ? equipmentName : asset.asset_name
  const displayBrand = asset.brand || asset.equipment?.brand || ''
  const displayModel = asset.model || asset.equipment?.model || ''

  return (
    <div
      className={`group relative bg-white rounded-xl shadow-sm border overflow-hidden transition-all duration-300 flex flex-col box-border ${
        isSelected ? 'border-blue-500 border-2 shadow-lg' : 'border-slate-200 border'
      } ${
        !isEditing ? 'hover:shadow-xl hover:border-blue-300 hover:-translate-y-1' : ''
      } ${isEditing ? 'h-auto' : isDetailsExpanded ? 'min-h-[260px] h-auto' : 'h-[260px]'}`}
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
                onClick={async () => {
                  const ok = await saveDesktopComponents()
                  if (!ok) return
                  onSave()
                }}
                disabled={isPending || isComponentSaving}
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
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Asset Name</label>
              <input
                type="text"
                value={editFormData.asset_name}
                onChange={(e) => onChange('asset_name', e.target.value)}
                placeholder="Asset Name"
                className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Category</label>
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
            </div>
            {(editFormData.subcategory_id || asset.subcategory?.id) && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Subcategory</label>
                <select
                  value={editFormData.subcategory_id || ''}
                  onChange={(e) => onChange('subcategory_id', e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                  disabled={!editFormData.asset_category_id}
                >
                  <option value="">
                    {!editFormData.asset_category_id
                      ? 'Select category first'
                      : resolvedEditSubcategories.length === 0
                        ? 'No subcategories available'
                        : 'Select Subcategory'}
                  </option>
                  {resolvedEditSubcategories.map((subcategory) => (
                    <option key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {!isDesktopPC && (
              <div className="space-y-1">
                <SearchableSelect
                  label="Brand"
                  options={brandOptions}
                  value={editFormData.brand}
                  onChange={(value) => onChange('brand', value)}
                  displayField="name"
                  secondaryField="categoryLabel"
                  placeholder="Select brand..."
                  emptyMessage="No brands found"
                />
              </div>
            )}
            {!isDesktopPC && (
              <div className="space-y-1">
                <SearchableSelect
                  label="Model"
                  options={modelOptions}
                  value={editFormData.model}
                  onChange={(value) => onChange('model', value)}
                  displayField="name"
                  secondaryField="categoryLabel"
                  placeholder="Select model..."
                  emptyMessage="No models found"
                />
              </div>
            )}
            {!isDesktopPC &&
              editFormData.asset_category_id &&
              (!resolvedEditSubcategories.length || editFormData.subcategory_id) && (
                <SpecificationFields
                  categoryName={
                    categories.find((cat) => String(cat.id) === String(editFormData.asset_category_id))
                      ?.name || ''
                  }
                  subcategoryName={
                    resolvedEditSubcategories.find(
                      (sub) => String(sub.id) === String(editFormData.subcategory_id)
                    )?.name || ''
                  }
                  specifications={editFormData.specifications || {}}
                  onChange={(specs) => onChange('specifications', specs)}
                />
              )}
            {isDesktopPC && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Desktop PC Components</label>
                {componentEdits.length ? (
                  <div className="space-y-3">
                    {componentEdits.map((comp) => {
                      const original = componentsById.get(comp.id)
                      return (
                        <div key={comp.id} className="border border-slate-200 rounded-lg p-3 bg-slate-50 space-y-2">
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-slate-600">Component</div>
                              <div className="font-semibold text-slate-900 truncate">
                                {original?.component_name || comp.component_name || 'Component'}
                              </div>
                            </div>
                            <span className="text-xs font-medium text-slate-600">
                              {original?.category?.name || 'Component'}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-slate-600">Brand</label>
                              <input
                                type="text"
                                value={comp.brand}
                                onChange={(e) => updateComponentEdit(comp.id, 'brand', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-slate-600">Model</label>
                              <input
                                type="text"
                                value={comp.model}
                                onChange={(e) => updateComponentEdit(comp.id, 'model', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </div>
                          <SpecificationFields
                            categoryName={original?.category?.name || ''}
                            subcategoryName={original?.subcategory?.name || ''}
                            specifications={comp.specifications || {}}
                            onChange={(specs) => updateComponentEdit(comp.id, 'specifications', specs)}
                          />
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                    No components yet. Use the Components page to add brand/model.
                  </div>
                )}
              </div>
            )}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Serial Number</label>
              <input
                type="text"
                value={editFormData.serial_number}
                onChange={(e) => onChange('serial_number', e.target.value)}
                placeholder="Serial Number"
                className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Purchase Date</label>
              <input
                type="date"
                value={editFormData.purchase_date}
                onChange={(e) => onChange('purchase_date', e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Acquisition Cost</label>
              <input
                type="number"
                value={editFormData.acq_cost}
                onChange={(e) => onChange('acq_cost', e.target.value)}
                placeholder="Acquisition Cost"
                className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Estimated Life (years)</label>
              <input
                type="number"
                value={editFormData.estimate_life}
                onChange={(e) => onChange('estimate_life', e.target.value)}
                placeholder="Estimated Life (years)"
                className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Warranty Expiration</label>
              <input
                type="date"
                value={editFormData.waranty_expiration_date}
                onChange={(e) => onChange('waranty_expiration_date', e.target.value)}
                placeholder="Warranty Expiration"
                className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Vendor</label>
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
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Status</label>
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
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Remarks</label>
              <textarea
                value={editFormData.remarks}
                onChange={(e) => onChange('remarks', e.target.value)}
                placeholder="Remarks"
                rows="2"
                className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      ) : (
        /* VIEW MODE */
        <div className="flex flex-col h-full bg-white">
          {/* Card Header with Gradient - More Compact */}
          <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-4 border-b border-slate-200">
            <div className="flex items-start justify-between mb-2">
              <div className={`flex-1 min-w-0 pr-2 ${onSelect ? 'pl-8' : ''}`}>
                <h3 className="text-lg font-bold text-slate-900 mb-2 truncate" title={cardTitle}>
                  {cardTitle}
                </h3>
                {(displayBrand || displayModel) && (
                  <div className="text-xs font-medium text-slate-600 mb-2 truncate">
                    {[displayBrand, displayModel].filter(Boolean).join(' ')}
                  </div>
                )}
                <div className="flex items-center gap-2 flex-wrap">
                  {asset.category && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-white border border-slate-200 text-slate-700">
                      <Tag className="w-3 h-3" />
                      {asset.category.name}
                    </span>
                  )}
                  {asset.subcategory && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-50 border border-slate-200 text-slate-600">
                      {asset.subcategory.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Compact Status Picker */}
              <div className="relative flex-shrink-0 flex items-center gap-2">
                {isDesktopPC && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onComponentsClick?.()
                    }}
                    className="inline-flex items-center justify-center w-9 h-9 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-blue-400 hover:text-blue-600 transition-colors"
                    title="View components"
                  >
                    <Boxes className="w-4 h-4" />
                  </button>
                )}
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
              <div className="p-4 space-y-4 animate-in slide-in-from-top-2 duration-200 flex-1">
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
                {(displayBrand || displayModel) && (
                  <div className="grid grid-cols-2 gap-3">
                    {displayBrand && (
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                         <div className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">Brand</div>
                         <div className="text-sm font-semibold text-slate-900 truncate">{displayBrand}</div>
                      </div>
                    )}
                    {displayModel && (
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                         <div className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">Model</div>
                         <div className="text-sm font-semibold text-slate-900 truncate">{displayModel}</div>
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

                 {/* QR/Barcode - Always show QR button, generate on demand if needed */}
                <QRCodeSection
                  asset={asset}
                  onCodeView={onCodeView}
                />
              </div>
            )}
          </div>

          {/* Footer Actions - View, Edit & Delete Buttons */}
          <div className="mt-auto bg-slate-50 border-t border-slate-200">
            <div className="p-3 flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onCardClick?.()
                }}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all shadow-sm"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View</span>
              </button>
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
  editSubcategories,
  statuses,
  vendors,
  equipmentOptions,
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
  onComponentsClick,
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
          editSubcategories={editSubcategories}
          statuses={statuses}
          vendors={vendors}
          equipmentOptions={equipmentOptions}
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
          onComponentsClick={() => onComponentsClick?.(asset.id)}
          isPending={isPending}
        />
      ))}
    </div>
  )
}

export default React.memo(AssetCardsView)
