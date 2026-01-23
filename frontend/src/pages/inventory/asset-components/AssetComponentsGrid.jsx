import React from 'react'
import {
  Barcode,
  Edit,
  Plus,
  QrCode,
  Save,
  Trash2,
  X,
} from 'lucide-react'
import SearchableSelect from '../../../components/SearchableSelect'
import SpecificationFields from '../../../components/specifications/SpecificationFields'

const AssetComponentsGrid = ({
  components,
  editingComponent,
  isLoadingCategories,
  categoriesError,
  categories,
  editSubcategories,
  isLoadingEditSubcategories,
  equipmentOptions,
  buildCategoryLabel,
  statuses,
  updateEditField,
  setEditingComponent,
  handleEditSave,
  handleDelete,
  setShowTransferModal,
  setShowCodeModal,
  getStatusColor,
  getCategoryName,
  getSubcategoryName,
  onAdd,
}) => {
  if (components.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 text-gray-300 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M20 7H4" />
            <path d="M20 7v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7" />
            <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Components Yet</h3>
        <p className="text-gray-500 mb-4">Add components to track individual parts of this desktop PC</p>
        {onAdd ? (
          <button
            onClick={onAdd}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add First Component
          </button>
        ) : null}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
      {components.map((component) => (
        <div key={component.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-full flex flex-col">
          {editingComponent?.id === component.id ? (
            // Edit Mode
            <div className="space-y-3 flex-1 flex flex-col">
              <div className="space-y-3 flex-1">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Category 
                  </label>
                  <select
                    value={editingComponent.category_id || ''}
                    onChange={(e) => updateEditField('category_id', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={isLoadingCategories}
                  >
                    <option value="">
                      {isLoadingCategories ? 'Loading categories...' :
                       categoriesError ? `Error: ${categoriesError.message}` :
                       !categories ? 'Loading...' :
                       categories.length === 0 ? 'No categories available' :
                       'Select Category'}
                    </option>
                    {categories && categories.length > 0 ? (
                      categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name} 
                        </option>
                      ))
                    ) : null}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Subcategory</label>
                  <select
                    value={editingComponent.subcategory_id || ''}
                    onChange={(e) => updateEditField('subcategory_id', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={!editingComponent.category_id || isLoadingEditSubcategories}
                  >
                    <option value="">
                      {!editingComponent.category_id
                        ? 'Select category first'
                        : isLoadingEditSubcategories
                          ? 'Loading subcategories...'
                          : editSubcategories.length === 0
                            ? 'No subcategories available'
                            : 'Select Subcategory'}
                    </option>
                    {editSubcategories.map((subcategory) => (
                      <option key={subcategory.id} value={subcategory.id}>
                        {subcategory.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Component Name *</label>
                  <input
                    type="text"
                    value={editingComponent.component_name || ''}
                    onChange={(e) =>
                      updateEditField('component_name', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Component Name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Brand</label>
                  <SearchableSelect
                    label=""
                    options={(() => {
                      const categoryId = editingComponent.category_id ? Number(editingComponent.category_id) : null
                      const subcategoryId = editingComponent.subcategory_id ? Number(editingComponent.subcategory_id) : null
                      const filtered = equipmentOptions.filter((eq) => {
                        if (categoryId && Number(eq.asset_category_id) !== categoryId) return false
                        if (subcategoryId && Number(eq.subcategory_id) !== subcategoryId) return false
                        return true
                      })
                      const effective = subcategoryId
                        ? filtered
                        : categoryId
                          ? (filtered.length ? filtered : equipmentOptions)
                          : filtered
                      return Array.from(
                        new Map(
                          effective
                            .filter((eq) => eq.brand)
                            .map((eq) => [eq.brand, buildCategoryLabel(eq)])
                        ).entries()
                      ).map(([brand, categoryLabel]) => ({
                        id: brand,
                        name: brand,
                        categoryLabel,
                      }))
                    })()}
                    value={editingComponent.brand || ''}
                    onChange={(value) => updateEditField('brand', value)}
                    displayField="name"
                    secondaryField="categoryLabel"
                    placeholder="Select brand..."
                    emptyMessage="No brands found"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Model</label>
                  <SearchableSelect
                    label=""
                    options={(() => {
                      const categoryId = editingComponent.category_id ? Number(editingComponent.category_id) : null
                      const subcategoryId = editingComponent.subcategory_id ? Number(editingComponent.subcategory_id) : null
                      const filtered = equipmentOptions.filter((eq) => {
                        if (categoryId && Number(eq.asset_category_id) !== categoryId) return false
                        if (subcategoryId && Number(eq.subcategory_id) !== subcategoryId) return false
                        return true
                      })
                      const effective = subcategoryId
                        ? filtered
                        : categoryId
                          ? (filtered.length ? filtered : equipmentOptions)
                          : filtered
                      return Array.from(
                        new Map(
                          effective
                            .filter((eq) => eq.model)
                            .map((eq) => [eq.model, buildCategoryLabel(eq)])
                        ).entries()
                      ).map(([model, categoryLabel]) => ({
                        id: model,
                        name: model,
                        categoryLabel,
                      }))
                    })()}
                    value={editingComponent.model || ''}
                    onChange={(value) => updateEditField('model', value)}
                    displayField="name"
                    secondaryField="categoryLabel"
                    placeholder="Select model..."
                    emptyMessage="No models found"
                  />
                </div>
                {editingComponent.category_id && (!editSubcategories.length || editingComponent.subcategory_id) && (
                  <div className="sm:col-span-2">
                    <SpecificationFields
                      categoryName={getCategoryName(editingComponent.category_id)}
                      subcategoryName={getSubcategoryName(editingComponent.subcategory_id, editSubcategories)}
                      specifications={editingComponent.specifications || {}}
                      onChange={(specs) => updateEditField('specifications', specs)}
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Status *</label>
                  <select
                    value={editingComponent.status_id || ''}
                    onChange={(e) => setEditingComponent((prev) => ({ ...prev, status_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Status</option>
                    {statuses.map((status) => (
                      <option key={status.id} value={status.id}>
                        {status.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Serial Number</label>
                  <input
                    type="text"
                    value={editingComponent.serial_number || ''}
                    onChange={(e) => setEditingComponent((prev) => ({ ...prev, serial_number: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Serial Number"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Remarks</label>
                  <textarea
                    value={editingComponent.remarks || ''}
                    onChange={(e) => setEditingComponent((prev) => ({ ...prev, remarks: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Remarks"
                    rows="2"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-auto">
                <button
                  onClick={() => handleEditSave(component)}
                  className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
                <button
                  onClick={() => setEditingComponent(null)}
                  className="flex-1 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            // View Mode
            <div className="flex-1 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <span className="text-xs text-gray-500">{component.category?.name || 'Uncategorized'}</span>
                  <h3 className="text-lg font-semibold text-gray-900">{component.component_name}</h3>
                  <p className="text-sm text-gray-600">
                    {component.brand || ''} {component.model || ''}
                  </p>
                </div>
              </div>

              <div className="space-y-2 mb-4 flex-1">
                {/* Serial Number */}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Serial:</span>
                  <span className="font-medium text-gray-900">{component.serial_number || <span className="text-gray-400 italic">Not set</span>}</span>
                </div>

                {/* Status */}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded-md text-xs font-semibold border ${getStatusColor(component.status?.name)}`}>
                    {component.status?.name || 'N/A'}
                  </span>
                </div>

                {/* Subcategory */}
                {component.subcategory && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subcategory:</span>
                    <span className="font-medium text-gray-900">{component.subcategory.name}</span>
                  </div>
                )}

                {/* Purchase Date */}
                {component.purchase_date && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Purchase Date:</span>
                    <span className="font-medium text-gray-900">{new Date(component.purchase_date).toLocaleDateString()}</span>
                  </div>
                )}

                {/* Acquisition Cost */}
                {component.acq_cost && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Acq. Cost:</span>
                  <span className="font-medium text-green-700">₱{Number(component.acq_cost).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                )}

                {/* Vendor */}
                {component.vendor && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Vendor:</span>
                    <span className="font-medium text-gray-900 truncate max-w-[150px]" title={component.vendor.company_name}>{component.vendor.company_name}</span>
                  </div>
                )}

                {/* Specifications */}
                {component.specifications && Object.keys(component.specifications).length > 0 && (
                  <div className="pt-2 border-t border-gray-200">
                    <div className="text-xs font-semibold text-gray-700 mb-2">Specifications</div>
                    <div className="space-y-1">
                      {Object.entries(component.specifications).map(([key, value]) => (
                        value && (
                          <div key={key} className="flex justify-between text-xs">
                            <span className="text-gray-500 capitalize">{key.replace(/_/g, ' ')}:</span>
                            <span className="font-medium text-gray-900">{value}</span>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}

                {/* Remarks */}
                {component.remarks && (
                  <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                    <span className="text-gray-600">Remarks:</span>
                    <span className="font-medium text-gray-900">{component.remarks}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mt-auto">
                <button
                  onClick={() => setEditingComponent({
                    id: component.id,
                    category_id: component.category_id || '',
                    subcategory_id: component.subcategory_id || component.subcategory?.id || '',
                    component_name: component.component_name || '',
                    brand: component.brand || '',
                    model: component.model || '',
                    serial_number: component.serial_number || '',
                    status_id: component.status_id || '',
                    remarks: component.remarks || '',
                    specifications: component.specifications || {},
                  })}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(component)}
                  className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <button
                  onClick={() => setShowTransferModal(component)}
                  className="flex-1 px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
                >
                  <span className="inline-flex items-center justify-center w-4 h-4">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 3h5v5" />
                      <path d="M21 3l-7 7" />
                      <path d="M8 21H3v-5" />
                      <path d="M3 21l7-7" />
                    </svg>
                  </span>
                  Transfer
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowCodeModal({ component, type: 'qr' })
                  }}
                  className="flex-1 px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2"
                >
                  <QrCode className="w-4 h-4" />
                  QR
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowCodeModal({ component, type: 'barcode' })
                  }}
                  className="flex-1 px-3 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 flex items-center justify-center gap-2"
                >
                  <Barcode className="w-4 h-4" />
                  Barcode
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default React.memo(AssetComponentsGrid)
