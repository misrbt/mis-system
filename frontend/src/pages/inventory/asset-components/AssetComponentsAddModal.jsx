import React from 'react'
import { X } from 'lucide-react'
import SearchableSelect from '../../../components/SearchableSelect'
import SpecificationFields from '../../../components/specifications/SpecificationFields'

const AssetComponentsAddModal = ({
  isOpen,
  onClose,
  onSubmit,
  addFormData,
  updateAddFormField,
  setAddFormData,
  handleGenerateSerial,
  categories,
  subcategories,
  equipmentOptions,
  buildCategoryLabel,
  statuses,
  vendors,
  addComponentMutation,
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Add Component</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select
              value={addFormData.category_id}
              onChange={(e) => updateAddFormField('category_id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {addFormData.category_id && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
              <select
                value={addFormData.subcategory_id}
                onChange={(e) => updateAddFormField('subcategory_id', e.target.value)}
                disabled={!addFormData.category_id}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
              >
                <option value="">Select subcategory</option>
                {subcategories.map((subcategory) => (
                  <option key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {addFormData.category_id && (!subcategories.length || addFormData.subcategory_id) && (
            <SpecificationFields
              categoryName={categories.find(c => c.id === parseInt(addFormData.category_id))?.name || ''}
              subcategoryName={subcategories.find(s => s.id === parseInt(addFormData.subcategory_id))?.name || ''}
              specifications={addFormData.specifications}
              onChange={(specs) => updateAddFormField('specifications', specs)}
            />
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Component Name *</label>
            <input
              type="text"
              value={addFormData.component_name}
              onChange={(e) => updateAddFormField('component_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="e.g., Intel Core i7 CPU"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
              <SearchableSelect
                label=""
                options={(() => {
                  const categoryId = addFormData.category_id ? Number(addFormData.category_id) : null
                  const subcategoryId = addFormData.subcategory_id ? Number(addFormData.subcategory_id) : null
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
                value={addFormData.brand}
                onChange={(value) => updateAddFormField('brand', value)}
                displayField="name"
                secondaryField="categoryLabel"
                placeholder="Select brand..."
                emptyMessage="No brands found"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
              <SearchableSelect
                label=""
                options={(() => {
                  const categoryId = addFormData.category_id ? Number(addFormData.category_id) : null
                  const subcategoryId = addFormData.subcategory_id ? Number(addFormData.subcategory_id) : null
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
                value={addFormData.model}
                onChange={(value) => updateAddFormField('model', value)}
                displayField="name"
                secondaryField="categoryLabel"
                placeholder="Select model..."
                emptyMessage="No models found"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number <span className="text-red-500">*</span></label>
            <div className="flex gap-2">
              <input
                type="text"
                value={addFormData.serial_number}
                onChange={(e) => setAddFormData((prev) => ({ ...prev, serial_number: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Serial number"
                required
              />
              <button
                type="button"
                onClick={handleGenerateSerial}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Generate
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
            <select
              value={addFormData.status_id}
              onChange={(e) => setAddFormData((prev) => ({ ...prev, status_id: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
            <textarea
              value={addFormData.remarks}
              onChange={(e) => setAddFormData((prev) => ({ ...prev, remarks: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows="3"
              placeholder="Additional notes..."
            />
          </div>

          {/* Optional Fields Section */}
          <div className="border-t border-slate-200 pt-4 mt-2">
            <h4 className="text-sm font-semibold text-slate-700 mb-3">Optional Details</h4>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Purchase Date</label>
                  <input
                    type="date"
                    value={addFormData.purchase_date}
                    onChange={(e) => setAddFormData({ ...addFormData, purchase_date: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Acquisition Cost</label>
                  <input
                    type="number"
                    value={addFormData.acq_cost}
                    onChange={(e) => setAddFormData({ ...addFormData, acq_cost: e.target.value })}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Vendor</label>
                  <select
                    value={addFormData.vendor_id}
                    onChange={(e) => setAddFormData({ ...addFormData, vendor_id: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select vendor</option>
                    {vendors.map((vendor) => (
                      <option key={vendor.id} value={vendor.id}>
                        {vendor.company_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={addComponentMutation.isPending}
              className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
            >
              {addComponentMutation.isPending ? 'Adding...' : 'Add Component'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default React.memo(AssetComponentsAddModal)
