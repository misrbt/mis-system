import Modal from '../../../components/Modal'
import SearchableSelect from '../../../components/SearchableSelect'
import { RefreshCw, Plus, X, Package } from 'lucide-react'

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
  onGenerateComponentSerial,
  components = [],
  onComponentAdd,
  onComponentRemove,
  onComponentChange,
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

  // Helper to check if selected category is Desktop PC
  const isDesktopPCCategory = () => {
    const category = categories?.find(c => c.id === parseInt(formData.asset_category_id))
    return category?.name?.toLowerCase().includes('desktop') ||
           category?.name?.toLowerCase().includes('pc')
  }

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

            {/* Desktop PC Components Section - Appears immediately after category selection */}
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

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Component Type <span className="text-red-500">*</span>
                              </label>
                              <select
                                value={component.component_type}
                                onChange={(e) => onComponentChange(component.id, 'component_type', e.target.value)}
                                required
                                className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="system_unit">System Unit</option>
                                <option value="monitor">Monitor</option>
                                <option value="keyboard_mouse">Keyboard & Mouse</option>
                                <option value="other">Other Accessories</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Component Name <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={component.component_name}
                                onChange={(e) => onComponentChange(component.id, 'component_name', e.target.value)}
                                required
                                placeholder="e.g., Dell OptiPlex 7090"
                                className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Brand</label>
                              <input
                                type="text"
                                value={component.brand}
                                onChange={(e) => onComponentChange(component.id, 'brand', e.target.value)}
                                placeholder="e.g., Dell"
                                className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Model</label>
                              <input
                                type="text"
                                value={component.model}
                                onChange={(e) => onComponentChange(component.id, 'model', e.target.value)}
                                placeholder="e.g., OptiPlex 7090"
                                className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>

                            <div className="md:col-span-2">
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Serial Number</label>
                              <div className="flex gap-1.5">
                                <input
                                  type="text"
                                  value={component.serial_number}
                                  onChange={(e) => onComponentChange(component.id, 'serial_number', e.target.value)}
                                  placeholder="Enter serial number or generate"
                                  className="flex-1 px-2 py-1.5 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

                            <div className="md:col-span-2">
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Status <span className="text-red-500">*</span>
                              </label>
                              <select
                                value={component.status_id || ''}
                                onChange={(e) => onComponentChange(component.id, 'status_id', e.target.value)}
                                required
                                className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="">Select status</option>
                                {statusOptions.map((status) => (
                                  <option key={status.value} value={status.value}>
                                    {status.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="md:col-span-2">
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Remarks</label>
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
              </div>
            )}

            {!isDesktopPCCategory() && (
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
            )}

            {!isDesktopPCCategory() && (
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
            )}

            {!isDesktopPCCategory() && (
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
            )}
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
              <SearchableSelect
                label="Vendor"
                options={vendorOptions}
                value={formData.vendor_id}
                onChange={onVendorChange}
                displayField="name"
                secondaryField="contact"
                placeholder="Select vendor or search..."
                emptyMessage="No vendors found"
                allowClear={true}
              />
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
