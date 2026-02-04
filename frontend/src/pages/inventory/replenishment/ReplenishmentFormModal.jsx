import { useEffect, useMemo, useState } from 'react'
import Modal from '../../../components/Modal'
import SearchableSelect from '../../../components/SearchableSelect'
import SpecificationFields from '../../../components/specifications/SpecificationFields'
import { RefreshCw, Sparkles, Package, Plus, X } from 'lucide-react'
import { generateAssetName, shouldAutoGenerateName } from '../../../utils/assetNameGenerator'
import apiClient from '../../../services/apiClient'

const ReplenishmentFormModal = ({
  isOpen,
  onClose,
  title,
  onSubmit,
  submitLabel,
  isSubmitting,
  formData,
  onInputChange,
  onVendorChange,
  onGenerateSerial,
  onGenerateComponentSerial,
  onAddVendor,
  categories,
  subcategories = [],
  vendorOptions,
  statusOptions,
  equipmentOptions = [],
  components = [],
  onComponentAdd,
  onComponentRemove,
  onComponentChange,
  showBookValue = false,
  isEditMode = false,
}) => {
  const safeCategories = useMemo(
    () => (Array.isArray(categories) ? categories : []),
    [categories]
  )

  const safeEquipmentOptions = useMemo(
    () => (Array.isArray(equipmentOptions) ? equipmentOptions : []),
    [equipmentOptions]
  )

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

  const hasSubcategories = (subcategories?.length ?? 0) > 0
  const shouldShowSubcategory = isEditMode
    ? !!formData.subcategory_id
    : !!formData.asset_category_id && hasSubcategories

  // Helper to check if selected category is Desktop PC
  const isDesktopPCCategory = () => {
    const category = safeCategories.find(c => c.id === parseInt(formData.asset_category_id))
    return category?.name?.toLowerCase().includes('desktop') ||
           category?.name?.toLowerCase().includes('pc')
  }

  // Get current category name
  const categoryName = safeCategories.find(c => c.id === parseInt(formData.asset_category_id))?.name

  // Check if auto-generation is supported for this category
  const canAutoGenerate = categoryName && shouldAutoGenerateName(categoryName) && !isDesktopPCCategory()

  // Component category options (exclude Desktop PC)
  const componentCategoryOptions = useMemo(
    () =>
      safeCategories.filter((cat) => {
        const name = cat?.name?.toLowerCase() || ''
        return !name.includes('desktop pc')
      }),
    [safeCategories]
  )

  // Fetch subcategories for components
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

  const getCategoryName = (id) =>
    safeCategories.find((cat) => Number(cat.id) === Number(id))?.name || ''

  const getSubcategoryName = (catId, subId) =>
    componentSubcategories[Number(catId)]?.find(
      (subcat) => Number(subcat.id) === Number(subId)
    )?.name || ''

  const updateComponentAutoName = (component, nextPartial = {}) => {
    const nextComponent = { ...component, ...nextPartial }
    const catName = getCategoryName(nextComponent.category_id)
    if (!catName || !shouldAutoGenerateName(catName)) return
    const generatedName = generateAssetName(
      catName,
      nextComponent.brand,
      nextComponent.specifications || {}
    )
    if (!generatedName) return
    const shouldOverwrite =
      !nextComponent.component_name ||
      nextComponent.component_name === component.last_generated_name
    if (shouldOverwrite && onComponentChange) {
      onComponentChange(component.id, 'component_name', generatedName)
      onComponentChange(component.id, 'last_generated_name', generatedName)
    }
  }

  // Auto-generate asset name when brand or specifications change
  useEffect(() => {
    if (!canAutoGenerate) return

    const generatedName = generateAssetName(
      categoryName,
      formData.brand,
      formData.specifications || {}
    )

    // Only update if there's a generated name and it's different from current
    if (generatedName && generatedName !== formData.asset_name) {
      onInputChange({ target: { name: 'asset_name', value: generatedName } })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.brand, formData.specifications, categoryName, canAutoGenerate])

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="xl">
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="border-b border-slate-200 pb-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 font-bold text-sm">1</span>
            </div>
            <div>
              <h4 className="text-base font-semibold text-slate-900">Basic Information</h4>
              <p className="text-xs text-slate-500">Reserve asset identification and details</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
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
                name="asset_name"
                value={formData.asset_name}
                onChange={onInputChange}
                required
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter asset name"
              />
              {canAutoGenerate && (
                <p className="mt-1 text-xs text-slate-500">
                  Name is automatically generated from brand and specifications
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="asset_category_id"
                value={formData.asset_category_id}
                onChange={onInputChange}
                required
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select category</option>
                {safeCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {shouldShowSubcategory && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Subcategory <span className="text-red-500">*</span>
                </label>
                <select
                  name="subcategory_id"
                  value={formData.subcategory_id || ''}
                  onChange={onInputChange}
                  required={!isEditMode}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select subcategory</option>
                  {subcategories?.map((subcategory) => (
                    <option key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Category-Specific Specifications - only show if NOT Desktop PC */}
            {!isDesktopPCCategory() &&
              formData.asset_category_id &&
              (!hasSubcategories || formData.subcategory_id) && (
              <div className="md:col-span-2">
                <SpecificationFields
                  categoryName={safeCategories.find(c => c.id === parseInt(formData.asset_category_id))?.name}
                  subcategoryName={subcategories?.find(s => s.id === parseInt(formData.subcategory_id))?.name}
                  specifications={formData.specifications || {}}
                  onChange={(specs) => onInputChange({ target: { name: 'specifications', value: specs } })}
                />
              </div>
            )}

            {/* Desktop PC Components Section */}
            {isDesktopPCCategory() && (
              <div className="md:col-span-2">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Package className="w-5 h-5 text-amber-600" />
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900">Desktop PC Components</h4>
                        <p className="text-xs text-slate-600">Track individual components with QR codes</p>
                      </div>
                    </div>
                    {onComponentAdd && (
                      <button
                        type="button"
                        onClick={onComponentAdd}
                        className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Component
                      </button>
                    )}
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
                            {onComponentRemove && (
                              <button
                                type="button"
                                onClick={() => onComponentRemove(component.id)}
                                className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50"
                                title="Remove component"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Category Type <span className="text-red-500">*</span>
                              </label>
                              <select
                                value={component.category_id || ''}
                                onChange={(e) => {
                                  const nextValue = e.target.value
                                  onComponentChange?.(component.id, 'category_id', nextValue)
                                  onComponentChange?.(component.id, 'subcategory_id', '')
                                  onComponentChange?.(component.id, 'brand', '')
                                  onComponentChange?.(component.id, 'model', '')
                                  onComponentChange?.(component.id, 'specifications', {})
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
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Asset Name <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={component.component_name || ''}
                                onChange={(e) => onComponentChange?.(component.id, 'component_name', e.target.value)}
                                required
                                placeholder="Enter asset name"
                                className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>

                            {component.category_id &&
                              (componentSubcategories[Number(component.category_id)]?.length ?? 0) > 0 && (
                              <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                  Subcategory <span className="text-red-500">*</span>
                                </label>
                                <select
                                  value={component.subcategory_id || ''}
                                  onChange={(e) => {
                                    const nextValue = e.target.value
                                    onComponentChange?.(component.id, 'subcategory_id', nextValue)
                                    onComponentChange?.(component.id, 'brand', '')
                                    onComponentChange?.(component.id, 'model', '')
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
                                  {componentSubcategories[Number(component.category_id)]?.map((sub) => (
                                    <option key={sub.id} value={sub.id}>
                                      {sub.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}

                            {component.category_id &&
                              (!(componentSubcategories[Number(component.category_id)]?.length ?? 0) ||
                                component.subcategory_id) && (
                              <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Brand</label>
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
                                  value={component.brand || ''}
                                  onChange={(value) => {
                                    onComponentChange?.(component.id, 'brand', value)
                                    updateComponentAutoName(component, { brand: value })
                                  }}
                                  displayField="name"
                                  secondaryField="categoryLabel"
                                  placeholder="Select brand..."
                                  emptyMessage="No brands found"
                                />
                              </div>
                            )}

                            {component.category_id &&
                              (!(componentSubcategories[Number(component.category_id)]?.length ?? 0) ||
                                component.subcategory_id) && (
                              <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Model</label>
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
                                  value={component.model || ''}
                                  onChange={(value) => {
                                    onComponentChange?.(component.id, 'model', value)
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
                              <div className="md:col-span-2">
                                <SpecificationFields
                                  categoryName={getCategoryName(component.category_id)}
                                  subcategoryName={getSubcategoryName(
                                    component.category_id,
                                    component.subcategory_id
                                  )}
                                  specifications={component.specifications || {}}
                                  onChange={(specs) => {
                                    onComponentChange?.(component.id, 'specifications', specs)
                                    updateComponentAutoName(component, { specifications: specs })
                                  }}
                                />
                              </div>
                            )}

                            <div className="md:col-span-2">
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Serial Number</label>
                              <div className="flex gap-1.5">
                                <input
                                  type="text"
                                  value={component.serial_number || ''}
                                  onChange={(e) => onComponentChange?.(component.id, 'serial_number', e.target.value)}
                                  placeholder="Enter serial number or generate"
                                  className="flex-1 px-2 py-1.5 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                {onGenerateComponentSerial && (
                                  <button
                                    type="button"
                                    onClick={() => onGenerateComponentSerial(component.id)}
                                    className="px-2 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded hover:bg-indigo-700 transition-colors shadow-sm whitespace-nowrap flex items-center gap-1"
                                    title="Generate Serial Number"
                                  >
                                    <RefreshCw className="w-3 h-3" />
                                    <span className="hidden sm:inline">Generate</span>
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="md:col-span-2">
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Status <span className="text-red-500">*</span>
                              </label>
                              <select
                                value={component.status_id || ''}
                                onChange={(e) => onComponentChange?.(component.id, 'status_id', e.target.value)}
                                required
                                className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="">Select status</option>
                                {(statusOptions || []).map((status) => {
                                  const value = status.id ?? status.value
                                  const label = status.name ?? status.label
                                  return (
                                    <option key={value} value={value}>
                                      {label}
                                    </option>
                                  )
                                })}
                              </select>
                            </div>

                            <div className="md:col-span-2">
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Remarks</label>
                              <textarea
                                value={component.remarks || ''}
                                onChange={(e) => onComponentChange?.(component.id, 'remarks', e.target.value)}
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
              </div>
            )}

            {!isDesktopPCCategory() && formData.asset_category_id && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Brand</label>
                <SearchableSelect
                  label=""
                  options={brandOptions}
                  value={formData.brand}
                  onChange={(value) => onInputChange({ target: { name: 'brand', value } })}
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
                  onChange={(value) => onInputChange({ target: { name: 'model', value } })}
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
              <div className="flex gap-2">
                <input
                  type="text"
                  name="serial_number"
                  value={formData.serial_number}
                  onChange={onInputChange}
                  className="flex-1 px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={isDesktopPCCategory() ? "Enter Desktop PC unit serial number or generate" : "Enter serial number or generate"}
                />
                {onGenerateSerial && (
                  <button
                    type="button"
                    onClick={onGenerateSerial}
                    className="px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm whitespace-nowrap flex items-center gap-2"
                    title="Generate Serial Number"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span className="hidden sm:inline">Generate</span>
                  </button>
                )}
              </div>
              {onGenerateSerial && formData.asset_category_id && !isDesktopPCCategory() && (
                <p className="mt-1.5 text-xs text-slate-500">
                  Click "Generate" to auto-create a unique serial number
                </p>
              )}
              {isDesktopPCCategory() && (
                <p className="mt-1.5 text-xs text-slate-500">
                  This is for the Desktop PC unit itself. Component serial numbers are managed separately above.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Financial Details */}
        <div className="border-b border-slate-200 pb-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 font-bold text-sm">2</span>
            </div>
            <div>
              <h4 className="text-base font-semibold text-slate-900">Financial Details</h4>
              <p className="text-xs text-slate-500">Costs, values, and financial information</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Purchase Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="purchase_date"
                value={formData.purchase_date}
                onChange={onInputChange}
                required
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Acquisition Cost
              </label>
              <input
                type="number"
                step="0.01"
                name="acq_cost"
                value={formData.acq_cost}
                onChange={onInputChange}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>

            {showBookValue && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Book Value (Auto-calculated)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="book_value"
                  value={formData.book_value}
                  disabled
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg bg-slate-50 text-slate-600 cursor-not-allowed"
                  title="Book value is automatically calculated based on depreciation"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Calculated using straight-line depreciation
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Estimated Life (years)
              </label>
              <input
                type="number"
                name="estimate_life"
                value={formData.estimate_life}
                onChange={onInputChange}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Warranty Expiration
              </label>
              <input
                type="date"
                name="warranty_expiration_date"
                value={formData.warranty_expiration_date}
                onChange={onInputChange}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Vendor</label>
              <select
                name="vendor_id"
                value={formData.vendor_id}
                onChange={(e) => {
                  if (e.target.value === 'ADD_NEW') {
                    onAddVendor?.()
                  } else {
                    onVendorChange(e.target.value)
                  }
                }}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select vendor</option>
                {onAddVendor && (
                  <option value="ADD_NEW" className="font-semibold text-green-600">
                    + Add New Vendor
                  </option>
                )}
                {vendorOptions?.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                name="status_id"
                value={formData.status_id}
                onChange={onInputChange}
                required
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select status</option>
                {(statusOptions || []).map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Remarks */}
        <div className="pb-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 font-bold text-sm">3</span>
            </div>
            <div>
              <h4 className="text-base font-semibold text-slate-900">Additional Information</h4>
              <p className="text-xs text-slate-500">Notes and remarks</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Remarks</label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={onInputChange}
              rows="3"
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter any additional remarks or notes"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default ReplenishmentFormModal
