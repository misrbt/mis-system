import { useMemo } from 'react'
import Modal from '../../../components/Modal'
import SearchableSelect from '../../../components/SearchableSelect'

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
  categories,
  subcategories = [],
  vendorOptions,
  statusOptions,
  isEditMode = false,
}) => {
  const safeCategories = useMemo(
    () => (Array.isArray(categories) ? categories : []),
    [categories]
  )

  const hasSubcategories = (subcategories?.length ?? 0) > 0
  const shouldShowSubcategory = isEditMode
    ? !!formData.subcategory_id
    : !!formData.asset_category_id && hasSubcategories

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
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
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Asset Name <span className="text-red-500">*</span>
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
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Category
              </label>
              <select
                name="asset_category_id"
                value={formData.asset_category_id}
                onChange={onInputChange}
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
                  Subcategory
                </label>
                <select
                  name="subcategory_id"
                  value={formData.subcategory_id || ''}
                  onChange={onInputChange}
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

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Brand</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={onInputChange}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter brand"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Model</label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={onInputChange}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter model"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Serial Number
              </label>
              <input
                type="text"
                name="serial_number"
                value={formData.serial_number}
                onChange={onInputChange}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter serial number"
              />
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
              <p className="text-xs text-slate-500">Costs and acquisition information</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Purchase Date
              </label>
              <input
                type="date"
                name="purchase_date"
                value={formData.purchase_date}
                onChange={onInputChange}
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

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Vendor</label>
              <select
                name="vendor_id"
                value={formData.vendor_id}
                onChange={(e) => onVendorChange(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select vendor</option>
                {vendorOptions?.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
              <select
                name="status_id"
                value={formData.status_id}
                onChange={onInputChange}
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
