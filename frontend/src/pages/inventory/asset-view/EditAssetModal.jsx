import { createPortal } from 'react-dom'
import { useEffect, useMemo, useState } from 'react'
import { Edit, X, RefreshCw, Save, Package, Plus } from 'lucide-react'
import SearchableSelect from '../../../components/SearchableSelect'
import SpecificationFields from '../../../components/specifications/SpecificationFields'
import apiClient from '../../../services/apiClient'
import { generateAssetName, shouldAutoGenerateName } from '../../../utils/assetNameGenerator'

function EditAssetModal({
  isOpen,
  data,
  categories,
  subcategories = [],
  statuses,
  vendors,
  equipmentOptions = [],
  formData,
  onClose,
  onChange,
  onSave,
  isPending,
  components = [],
  onComponentAdd,
  onComponentRemove,
  onComponentChange,
  onGenerateComponentSerial,
}) {
  const [componentSubcategories, setComponentSubcategories] = useState({})
  const safeCategories = useMemo(
    () => (Array.isArray(categories) ? categories : []),
    [categories]
  )
  const safeEquipmentOptions = useMemo(
    () => (Array.isArray(equipmentOptions) ? equipmentOptions : []),
    [equipmentOptions]
  )

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

  // Component management helpers
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
    if (!isOpen || !data) return undefined
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
  }, [componentCategoryIds, componentSubcategories, isOpen, data])

  // Helper to check if selected category is Desktop PC
  const isDesktopPCCategory = () => {
    if (!formData.asset_category_id) return false
    const category = safeCategories.find((cat) => cat.id == formData.asset_category_id)
    if (!category?.name) return false
    const name = category.name.toLowerCase()
    return name.includes('desktop') || (name.includes('pc') && !name.includes('laptop'))
  }

  const componentCategoryOptions = useMemo(
    () =>
      safeCategories.filter((cat) => {
        const name = cat?.name?.toLowerCase() || ''
        return !name.includes('desktop pc')
      }),
    [safeCategories]
  )

  const getCategoryName = (id) =>
    safeCategories.find((cat) => Number(cat.id) === Number(id))?.name || ''

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

  if (!isOpen || !data) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 transition-opacity duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden transition-all duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Edit className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-slate-500">Edit Asset</div>
              <div className="text-lg font-semibold text-slate-800">{data.asset_name}</div>
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

        <div className="p-6 bg-slate-50 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Asset Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.asset_name}
                onChange={(e) => onChange('asset_name', e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter asset name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.asset_category_id}
                onChange={(e) => onChange('asset_category_id', e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select category</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Subcategory - Only show if category has subcategories */}
            {formData.asset_category_id && subcategories?.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Subcategory <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.subcategory_id || ''}
                  onChange={(e) => onChange('subcategory_id', e.target.value)}
                  required
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Subcategory</option>
                  {subcategories?.map((subcat) => (
                    <option key={subcat.id} value={subcat.id}>{subcat.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Desktop PC Components Section */}
            {isDesktopPCCategory() && (
              <div className="md:col-span-2 bg-amber-50 border border-amber-200 rounded-lg p-4">
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
                            <label className="block text-xs font-medium text-slate-700 mb-1">Serial Number</label>
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

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
              <select
                value={formData.status_id}
                onChange={(e) => onChange('status_id', e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select status</option>
                {statuses?.map((status) => (
                  <option key={status.id} value={status.id}>{status.name}</option>
                ))}
              </select>
            </div>

            {!isDesktopPCCategory() && formData.asset_category_id && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Brand</label>
                <SearchableSelect
                  label=""
                  options={brandOptions}
                  value={formData.brand}
                  onChange={(value) => onChange('brand', value)}
                  displayField="name"
                  secondaryField="categoryLabel"
                  placeholder="Select brand..."
                  emptyMessage="No brands found"
                />
              </div>
            )}

            {!isDesktopPCCategory() && formData.asset_category_id && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Model</label>
                <SearchableSelect
                  label=""
                  options={modelOptions}
                  value={formData.model}
                  onChange={(value) => onChange('model', value)}
                  displayField="name"
                  secondaryField="categoryLabel"
                  placeholder="Select model..."
                  emptyMessage="No models found"
                />
              </div>
            )}

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Serial Number
                {isDesktopPCCategory() && (
                  <span className="ml-2 text-xs font-normal text-slate-500">(For Desktop PC Unit)</span>
                )}
              </label>
              <input
                type="text"
                value={formData.serial_number}
                onChange={(e) => onChange('serial_number', e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={isDesktopPCCategory() ? "Enter Desktop PC unit serial number" : "Enter serial number"}
              />
              {isDesktopPCCategory() && (
                <p className="mt-1 text-xs text-slate-500">
                  This is for the Desktop PC unit itself. Component serial numbers are managed separately below.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Purchase Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.purchase_date}
                onChange={(e) => onChange('purchase_date', e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Warranty Expiration</label>
              <input
                type="date"
                value={formData.waranty_expiration_date}
                onChange={(e) => onChange('waranty_expiration_date', e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Acquisition Cost</label>
              <input
                type="number"
                value={formData.acq_cost}
                onChange={(e) => onChange('acq_cost', e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Estimated Life (Years)</label>
              <input
                type="number"
                value={formData.estimate_life}
                onChange={(e) => onChange('estimate_life', e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Years"
                min="0"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Vendor</label>
              <select
                value={formData.vendor_id}
                onChange={(e) => onChange('vendor_id', e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select vendor</option>
                {vendors?.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>{vendor.company_name}</option>
                ))}
              </select>
            </div>

            {!isDesktopPCCategory() && (
              <div className="md:col-span-2">
                <SpecificationFields
                  categoryName={categories?.find(c => c.id == formData.asset_category_id)?.name}
                  subcategoryName={subcategories?.find(s => s.id == formData.subcategory_id)?.name}
                  specifications={formData.specifications || {}}
                  onChange={(specs) => onChange('specifications', specs)}
                />
              </div>
            )}

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Remarks</label>
              <textarea
                value={formData.remarks}
                onChange={(e) => onChange('remarks', e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add any notes or remarks..."
                rows="3"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-sm transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default EditAssetModal
