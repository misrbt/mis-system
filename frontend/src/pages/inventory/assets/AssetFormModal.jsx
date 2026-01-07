import Modal from '../../../components/Modal'
import SearchableSelect from '../../../components/SearchableSelect'
import { RefreshCw } from 'lucide-react'

const AssetFormModal = ({
  isOpen,
  onClose,
  title,
  onSubmit,
  submitLabel,
  isSubmitting,
  formData,
  onInputChange,
  onVendorChange,
  onEmployeeChange,
  categories,
  vendorOptions,
  employeeOptions,
  statusOptions,
  showStatus = false,
  showBookValue = false,
  assignmentTitle,
  assignmentSubtitle,
  usePlaceholders = false,
  onGenerateSerial,
  onAddVendor,
}) => {
  const placeholders = usePlaceholders
    ? {
        asset_name: 'Enter asset name',
        brand: 'Enter brand',
        model: 'Enter model',
        serial_number: 'Enter serial number',
        acq_cost: '0.00',
        estimate_life: '0',
        remarks: 'Enter any additional remarks or notes',
      }
    : {}

  const assignmentGridClass = showStatus
    ? 'grid grid-cols-1 md:grid-cols-2 gap-4'
    : 'grid grid-cols-1 gap-4'
  const remarksWrapperClass = showStatus ? 'md:col-span-2' : ''

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="xl">
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="border-b border-slate-200 pb-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 font-bold text-sm">1</span>
            </div>
            <div>
              <h4 className="text-base font-semibold text-slate-900">Basic Information</h4>
              <p className="text-xs text-slate-500">Asset identification and details</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
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
                placeholder={placeholders.asset_name}
              />
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
                {categories?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Brand</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={onInputChange}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={placeholders.brand}
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
                placeholder={placeholders.model}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Serial Number</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="serial_number"
                  value={formData.serial_number}
                  onChange={onInputChange}
                  className="flex-1 px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={placeholders.serial_number || 'Enter serial number or generate'}
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
              {onGenerateSerial && formData.asset_category_id && (
                <p className="mt-1.5 text-xs text-slate-500">
                  Click "Generate" to auto-create a unique serial number
                </p>
              )}
            </div>
          </div>
        </div>

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
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Acquisition Cost</label>
              <input
                type="number"
                step="0.01"
                name="acq_cost"
                value={formData.acq_cost}
                onChange={onInputChange}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={placeholders.acq_cost}
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
              <label className="block text-sm font-semibold text-slate-700 mb-2">Estimated Life (years)</label>
              <input
                type="number"
                name="estimate_life"
                value={formData.estimate_life}
                onChange={onInputChange}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={placeholders.estimate_life}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Warranty Expiration</label>
              <input
                type="date"
                name="waranty_expiration_date"
                value={formData.waranty_expiration_date}
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
          </div>
        </div>

        <div className="pb-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 font-bold text-sm">3</span>
            </div>
            <div>
              <h4 className="text-base font-semibold text-slate-900">{assignmentTitle}</h4>
              <p className="text-xs text-slate-500">{assignmentSubtitle}</p>
            </div>
          </div>
          <div className={assignmentGridClass}>
            {showStatus && (
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
            )}

            <div>
              <SearchableSelect
                label="Assigned To Employee"
                options={employeeOptions}
                value={formData.assigned_to_employee_id}
                onChange={onEmployeeChange}
                displayField="name"
                secondaryField="position"
                tertiaryField="branch"
                placeholder="Select employee or search..."
                emptyMessage="No employees found"
              />
            </div>

            <div className={remarksWrapperClass}>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Remarks</label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={onInputChange}
                rows="3"
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={placeholders.remarks}
              />
            </div>
          </div>
        </div>

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

export default AssetFormModal
