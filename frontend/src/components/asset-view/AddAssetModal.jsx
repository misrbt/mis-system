/**
 * Add Asset Modal Component
 * Modal form for adding new assets to employee
 */

import React, { useEffect, useMemo, useState } from 'react'
import { X, RefreshCw, Plus, Package, Sparkles } from 'lucide-react'
import SearchableSelect from '../SearchableSelect'
import SpecificationFields from '../specifications/SpecificationFields'
import { generateAssetName, shouldAutoGenerateName } from '../../utils/assetNameGenerator'
import apiClient from '../../services/apiClient'

const AddAssetModal = ({
  isOpen,
  onClose,
  formData,
  onInputChange,
  categories,
  subcategories = [],
  equipmentOptions = [],
  vendors,
  statuses = [],
  onGenerateSerial,
  onGenerateComponentSerial,
  onSubmit,
  isPending,
  components = [],
  onComponentAdd,
  onComponentRemove,
  onComponentChange,
  onAddVendor,
}) => {
  const safeEquipmentOptions = Array.isArray(equipmentOptions) ? equipmentOptions : []
  const [componentSubcategories, setComponentSubcategories] = useState({})
  const categoryId = formData.asset_category_id ? Number(formData.asset_category_id) : null
  const subcategoryId = formData.subcategory_id ? Number(formData.subcategory_id) : null
  const filteredEquipmentOptions = safeEquipmentOptions.filter((eq) => {
    if (categoryId && Number(eq.asset_category_id) !== categoryId) return false
    if (subcategoryId && Number(eq.subcategory_id) !== subcategoryId) return false
    return true
  })
  const effectiveEquipmentOptions = subcategoryId
    ? filteredEquipmentOptions
    : categoryId
      ? (filteredEquipmentOptions.length ? filteredEquipmentOptions : safeEquipmentOptions)
      : filteredEquipmentOptions
  const buildCategoryLabel = (eq) =>
    [eq.category_name, eq.subcategory_name].filter(Boolean).join(' / ')
  const brandOptions = Array.from(
    new Map(
      effectiveEquipmentOptions
        .filter((eq) => eq.brand)
        .map((eq) => [eq.brand, buildCategoryLabel(eq)])
    ).entries()
  ).map(([brand, categoryLabel]) => ({
    id: brand,
    name: brand,
    categoryLabel,
  }))
  const modelOptions = Array.from(
    new Map(
      effectiveEquipmentOptions
        .filter((eq) => eq.model)
        .map((eq) => [eq.model, buildCategoryLabel(eq)])
    ).entries()
  ).map(([model, categoryLabel]) => ({
    id: model,
    name: model,
    categoryLabel,
  }))

  const componentCategoryIds = useMemo(
    () =>
      Array.from(
        new Set(
          components
            .map((component) => Number(component.category_id))
            .filter((value) => Number.isFinite(value))
        )
      ),
    [components]
  )

  useEffect(() => {
    let isMounted = true
    const fetchSubcategories = async (catId) => {
      try {
        const response = await apiClient.get(`/asset-categories/${catId}/subcategories`)
        const data = Array.isArray(response.data?.data)
          ? response.data.data
          : Array.isArray(response.data)
            ? response.data
            : []
        if (!isMounted) return
        setComponentSubcategories((prev) => ({ ...prev, [catId]: data }))
      } catch {
        if (!isMounted) return
        setComponentSubcategories((prev) => ({ ...prev, [catId]: [] }))
      }
    }

    componentCategoryIds.forEach((catId) => {
      if (componentSubcategories[catId]) return
      fetchSubcategories(catId)
    })

    return () => {
      isMounted = false
    }
  }, [componentCategoryIds, componentSubcategories])

  // Helper to check if selected category is Desktop PC
  const isDesktopPCCategory = () => {
    const category = categories?.find(c => c.id === parseInt(formData.asset_category_id))
    return category?.name?.toLowerCase().includes('desktop') ||
           category?.name?.toLowerCase().includes('pc')
  }

  const componentCategoryOptions = useMemo(
    () =>
      categories.filter((cat) => {
        const name = cat?.name?.toLowerCase() || ''
        return !name.includes('desktop pc')
      }),
    [categories]
  )

  const getCategoryName = (id) =>
    categories?.find((cat) => Number(cat.id) === Number(id))?.name || ''

  const getSubcategoryName = (categoryId, subcategoryId) =>
    componentSubcategories[Number(categoryId)]?.find(
      (subcat) => Number(subcat.id) === Number(subcategoryId)
    )?.name || ''

  const updateComponentAutoName = (component, nextPartial = {}) => {
    const nextComponent = { ...component, ...nextPartial }
    const categoryName = getCategoryName(nextComponent.category_id)
    if (!categoryName || !shouldAutoGenerateName(categoryName)) return
    const generatedName = generateAssetName(
      categoryName,
      nextComponent.brand,
      nextComponent.specifications || {}
    )
    if (!generatedName) return
    const shouldOverwrite =
      !nextComponent.component_name ||
      nextComponent.component_name === component.last_generated_name
    if (shouldOverwrite) {
      onComponentChange(component.id, 'component_name', generatedName)
      onComponentChange(component.id, 'last_generated_name', generatedName)
    }
  }

  // Get current category name
  const categoryName = categories?.find(c => c.id === parseInt(formData.asset_category_id))?.name

  // Check if auto-generation is supported for this category
  const canAutoGenerate = categoryName && shouldAutoGenerateName(categoryName) && !isDesktopPCCategory()

  // Auto-generate asset name when brand or specifications change
  useEffect(() => {
    if (!isOpen || !canAutoGenerate) return

    const generatedName = generateAssetName(
      categoryName,
      formData.brand,
      formData.specifications || {}
    )

    // Only update if there's a generated name and it's different from current
    if (generatedName && generatedName !== formData.asset_name) {
      onInputChange('asset_name', generatedName)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, formData.brand, formData.specifications, categoryName, canAutoGenerate])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white sm:rounded-lg shadow-xl w-full sm:max-w-2xl h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex items-center justify-between z-10 shadow-sm">
          <h3 className="text-lg sm:text-xl font-semibold text-slate-900">Add New Asset</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 -mr-2 touch-manipulation rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
          {/* Asset Name */}
          <div>
            <label className="block text-sm sm:text-base font-medium text-slate-700 mb-2">
              Asset Name <span className="text-red-500">*</span>
              {canAutoGenerate && (
                <span className="ml-2 inline-flex items-center gap-1 text-xs font-normal text-blue-600">
                  <Sparkles className="w-3 h-3" />
                  Auto-generated
                </span>
              )}
            </label>
            <input
              type="text"
              value={formData.asset_name}
              onChange={(e) => onInputChange('asset_name', e.target.value)}
              className="w-full px-4 py-3 sm:py-2.5 text-base sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter asset name"
            />
            {canAutoGenerate && (
              <p className="mt-1 text-xs text-slate-500">
                Name is automatically generated from brand and specifications
              </p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm sm:text-base font-medium text-slate-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.asset_category_id}
              onChange={(e) => onInputChange('asset_category_id', e.target.value)}
              className="w-full px-4 py-3 sm:py-2.5 text-base sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Subcategory - Only show if category has subcategories */}
          {formData.asset_category_id && subcategories?.length > 0 && (
            <div>
              <label className="block text-sm sm:text-base font-medium text-slate-700 mb-2">
                Subcategory <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.subcategory_id || ''}
                onChange={(e) => onInputChange('subcategory_id', e.target.value)}
                className="w-full px-4 py-3 sm:py-2.5 text-base sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                required
              >
                <option value="">Select Subcategory</option>
                {subcategories.map((subcat) => (
                  <option key={subcat.id} value={subcat.id}>{subcat.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Desktop PC Components Section - Appears immediately after category selection */}
          {isDesktopPCCategory() && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-amber-600" />
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">Desktop PC Components</h4>
                    <p className="text-xs text-slate-600">Track individual components with QR codes</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onComponentAdd}
                  className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Component
                </button>
              </div>

              {components.length === 0 && (
                <div className="text-center py-6 bg-white rounded-lg border-2 border-dashed border-amber-300">
                  <Package className="w-10 h-10 text-amber-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-600 mb-1">No components added yet</p>
                  <p className="text-xs text-slate-500">Click "Add Component" to track individual parts</p>
                </div>
              )}

              {components.length > 0 && (
                <div className="space-y-3">
                  {components.map((component, index) => (
                    <div key={component.id} className="bg-white rounded-lg p-3 border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-xs">{index + 1}</span>
                          </div>
                          <span className="text-xs font-semibold text-slate-700">Component {index + 1}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onComponentRemove(component.id)}
                          className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50"
                          title="Remove component"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Category Type <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={component.category_id || ''}
                            onChange={(e) => {
                              const nextValue = e.target.value
                              onComponentChange(component.id, 'category_id', nextValue)
                              onComponentChange(component.id, 'subcategory_id', '')
                              onComponentChange(component.id, 'brand', '')
                              onComponentChange(component.id, 'model', '')
                              onComponentChange(component.id, 'specifications', {})
                              updateComponentAutoName(component, {
                                category_id: nextValue,
                                subcategory_id: '',
                                brand: '',
                                model: '',
                                specifications: {},
                              })
                            }}
                            required
                            className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select category</option>
                            {componentCategoryOptions.map((cat) => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Asset Name <span className="text-red-500">*</span>
                          </label>
                            <input
                              type="text"
                              value={component.component_name}
                              onChange={(e) => onComponentChange(component.id, 'component_name', e.target.value)}
                              required
                              placeholder="Enter asset name"
                              className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {component.category_id && (componentSubcategories[Number(component.category_id)]?.length ?? 0) > 0 && (
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">
                              Subcategory <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={component.subcategory_id || ''}
                              onChange={(e) => {
                                const nextValue = e.target.value
                                onComponentChange(component.id, 'subcategory_id', nextValue)
                                onComponentChange(component.id, 'brand', '')
                                onComponentChange(component.id, 'model', '')
                                updateComponentAutoName(component, {
                                  subcategory_id: nextValue,
                                  brand: '',
                                  model: '',
                                })
                              }}
                              required
                              className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Select subcategory</option>
                              {componentSubcategories[Number(component.category_id)]?.map((subcat) => (
                                <option key={subcat.id} value={subcat.id}>{subcat.name}</option>
                              ))}
                            </select>
                          </div>
                        )}

                        {component.category_id && (!(componentSubcategories[Number(component.category_id)]?.length ?? 0) || component.subcategory_id) && (
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Brand</label>
                            <SearchableSelect
                              label=""
                              options={(() => {
                                const compCategoryId = Number(component.category_id)
                                const compSubcategoryId = component.subcategory_id ? Number(component.subcategory_id) : null
                                const filtered = safeEquipmentOptions.filter((eq) => {
                                  if (compCategoryId && Number(eq.asset_category_id) !== compCategoryId) return false
                                  if (compSubcategoryId && Number(eq.subcategory_id) !== compSubcategoryId) return false
                                  return true
                                })
                                const effective = compSubcategoryId
                                  ? filtered
                                  : filtered.length
                                    ? filtered
                                    : safeEquipmentOptions
                                return Array.from(
                                  new Map(
                                    effective
                                      .filter((eq) => eq.brand)
                                      .map((eq) => [eq.brand, [eq.category_name, eq.subcategory_name].filter(Boolean).join(' / ')])
                                  ).entries()
                                ).map(([brand, categoryLabel]) => ({
                                  id: brand,
                                  name: brand,
                                  categoryLabel,
                                }))
                              })()}
                              value={component.brand}
                              onChange={(value) => {
                                onComponentChange(component.id, 'brand', value)
                                updateComponentAutoName(component, { brand: value })
                              }}
                              displayField="name"
                              secondaryField="categoryLabel"
                              placeholder="Select brand..."
                              emptyMessage="No brands found"
                            />
                          </div>
                        )}

                        {component.category_id && (!(componentSubcategories[Number(component.category_id)]?.length ?? 0) || component.subcategory_id) && (
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Model</label>
                            <SearchableSelect
                              label=""
                              options={(() => {
                                const compCategoryId = Number(component.category_id)
                                const compSubcategoryId = component.subcategory_id ? Number(component.subcategory_id) : null
                                const filtered = safeEquipmentOptions.filter((eq) => {
                                  if (compCategoryId && Number(eq.asset_category_id) !== compCategoryId) return false
                                  if (compSubcategoryId && Number(eq.subcategory_id) !== compSubcategoryId) return false
                                  return true
                                })
                                const effective = compSubcategoryId
                                  ? filtered
                                  : filtered.length
                                    ? filtered
                                    : safeEquipmentOptions
                                return Array.from(
                                  new Map(
                                    effective
                                      .filter((eq) => eq.model)
                                      .map((eq) => [eq.model, [eq.category_name, eq.subcategory_name].filter(Boolean).join(' / ')])
                                  ).entries()
                                ).map(([model, categoryLabel]) => ({
                                  id: model,
                                  name: model,
                                  categoryLabel,
                                }))
                              })()}
                              value={component.model}
                              onChange={(value) => {
                                onComponentChange(component.id, 'model', value)
                                updateComponentAutoName(component, { model: value })
                              }}
                              displayField="name"
                              secondaryField="categoryLabel"
                              placeholder="Select model..."
                              emptyMessage="No models found"
                            />
                          </div>
                        )}

                        {component.category_id && (
                          <div className="sm:col-span-2">
                            <SpecificationFields
                              categoryName={getCategoryName(component.category_id)}
                              subcategoryName={getSubcategoryName(
                                component.category_id,
                                component.subcategory_id
                              )}
                              specifications={component.specifications || {}}
                              onChange={(specs) => {
                                onComponentChange(component.id, 'specifications', specs)
                                updateComponentAutoName(component, { specifications: specs })
                              }}
                            />
                          </div>
                        )}

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-slate-700 mb-1">Serial Number </label>
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              value={component.serial_number}
                              onChange={(e) => onComponentChange(component.id, 'serial_number', e.target.value)}
                              placeholder="Enter serial number or generate"
                              className="flex-1 px-2 py-1.5 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => onGenerateComponentSerial && onGenerateComponentSerial(component.id)}
                              className="px-2 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded hover:bg-indigo-700 transition-colors shadow-sm whitespace-nowrap flex items-center gap-1"
                              title="Generate Serial Number"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span className="hidden sm:inline">Generate</span>
                            </button>
                          </div>
                          {formData.asset_category_id && (
                            <p className="mt-1 text-xs text-slate-500">
                              Click "Generate" to auto-create a unique serial number
                            </p>
                          )}
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Status <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={component.status_id || ''}
                            onChange={(e) => onComponentChange(component.id, 'status_id', e.target.value)}
                            required
                            className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select status</option>
                            {statuses.map((status) => (
                              <option key={status.id} value={status.id}>
                                {status.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-slate-700 mb-1">Remarks</label>
                          <textarea
                            value={component.remarks}
                            onChange={(e) => onComponentChange(component.id, 'remarks', e.target.value)}
                            rows="2"
                            placeholder="Additional notes for this component"
                            className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Brand & Model */}
          {!isDesktopPCCategory() && formData.asset_category_id && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm sm:text-base font-medium text-slate-700 mb-2">Brand</label>
                <SearchableSelect
                  label=""
                  options={brandOptions}
                  value={formData.brand}
                  onChange={(value) => onInputChange('brand', value)}
                  displayField="name"
                  secondaryField="categoryLabel"
                  placeholder="Select brand..."
                  emptyMessage="No brands found"
                />
              </div>
              <div>
                <label className="block text-sm sm:text-base font-medium text-slate-700 mb-2">Model</label>
                <SearchableSelect
                  label=""
                  options={modelOptions}
                  value={formData.model}
                  onChange={(value) => onInputChange('model', value)}
                  displayField="name"
                  secondaryField="categoryLabel"
                  placeholder="Select model..."
                  emptyMessage="No models found"
                />
              </div>
            </div>
          )}

          {/* Category-Specific Specifications */}
          {!isDesktopPCCategory() && (
            <SpecificationFields
              categoryName={categories?.find(c => c.id === parseInt(formData.asset_category_id))?.name}
              subcategoryName={subcategories?.find(s => s.id === parseInt(formData.subcategory_id))?.name}
              specifications={formData.specifications || {}}
              onChange={(specs) => onInputChange('specifications', specs)}
            />
          )}

          {/* Serial Number */}
          <div>
            <label className="block text-sm sm:text-base font-medium text-slate-700 mb-2">
              Serial Number <span className="text-red-500">*</span>
              {isDesktopPCCategory() && (
                <span className="ml-2 text-xs font-normal text-slate-500">(For Desktop PC Unit)</span>
              )}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.serial_number}
                onChange={(e) => onInputChange('serial_number', e.target.value)}
                className="flex-1 px-4 py-3 sm:py-2.5 text-base sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder={isDesktopPCCategory() ? "Enter Desktop PC unit serial number or generate" : "Enter serial number or generate"}
                required
              />
              <button
                type="button"
                onClick={onGenerateSerial}
                className="px-4 py-3 sm:py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm whitespace-nowrap touch-manipulation flex items-center gap-2"
                title="Generate Serial Number"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Generate</span>
              </button>
            </div>
            {formData.asset_category_id && !isDesktopPCCategory() && (
              <p className="mt-1.5 text-xs text-slate-500">
                Click "Generate" to auto-create a unique serial number
              </p>
            )}
            {isDesktopPCCategory() && (
              <p className="mt-1.5 text-xs text-slate-500">
                This is for the Desktop PC unit itself. Component serial numbers are managed separately below.
              </p>
            )}
          </div>

          {/* Purchase Date & Acquisition Cost */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm sm:text-base font-medium text-slate-700 mb-2">
                Purchase Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.purchase_date}
                onChange={(e) => onInputChange('purchase_date', e.target.value)}
                className="w-full px-4 py-3 sm:py-2.5 text-base sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm sm:text-base font-medium text-slate-700 mb-2">Acquisition Cost</label>
              <input
                type="number"
                value={formData.acq_cost}
                onChange={(e) => onInputChange('acq_cost', e.target.value)}
                className="w-full px-4 py-3 sm:py-2.5 text-base sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="0.00"
                step="0.01"
              />
            </div>
          </div>

          {/* Estimated Life & Warranty Expiration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm sm:text-base font-medium text-slate-700 mb-2">Estimated Life (years)</label>
              <input
                type="number"
                value={formData.estimate_life}
                onChange={(e) => onInputChange('estimate_life', e.target.value)}
                className="w-full px-4 py-3 sm:py-2.5 text-base sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="5"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm sm:text-base font-medium text-slate-700 mb-2">Warranty Expiration</label>
              <input
                type="date"
                value={formData.waranty_expiration_date}
                onChange={(e) => onInputChange('waranty_expiration_date', e.target.value)}
                className="w-full px-4 py-3 sm:py-2.5 text-base sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Vendor */}
          <div>
            <label className="block text-sm sm:text-base font-medium text-slate-700 mb-2">Vendor</label>
            <select
              value={formData.vendor_id}
              onChange={(e) => {
                if (e.target.value === 'ADD_NEW') {
                  onAddVendor?.()
                } else {
                  onInputChange('vendor_id', e.target.value)
                }
              }}
              className="w-full px-4 py-3 sm:py-2.5 text-base sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
            >
              <option value="">Select Vendor</option>
              {onAddVendor && (
                <option value="ADD_NEW" className="font-semibold text-green-600">
                  + Add New Vendor
                </option>
              )}
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>{vendor.company_name}</option>
              ))}
            </select>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm sm:text-base font-medium text-slate-700 mb-2">Remarks</label>
            <textarea
              value={formData.remarks}
              onChange={(e) => onInputChange('remarks', e.target.value)}
              rows="4"
              className="w-full px-4 py-3 sm:py-2.5 text-base sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              placeholder="Enter any additional notes..."
            />
          </div>
        </div>

        {/* Modal Footer - Mobile Optimized */}
        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-4 sm:px-6 py-4 pb-6 sm:pb-4 shadow-lg sm:shadow-none">
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-3 sm:py-2.5 text-base sm:text-sm text-slate-700 hover:text-slate-900 font-medium rounded-lg hover:bg-slate-200 transition-colors touch-manipulation border border-slate-300"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={isPending || !formData.asset_name || !formData.asset_category_id}
              className="w-full sm:w-auto px-5 py-3 sm:py-2.5 text-base sm:text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-md hover:shadow-lg transition-all touch-manipulation"
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding...
                </span>
              ) : 'Add Asset'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(AddAssetModal)
