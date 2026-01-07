/**
 * Add Asset Modal Component
 * Modal form for adding new assets to employee
 */

import React from 'react'
import { X, RefreshCw } from 'lucide-react'

const AddAssetModal = ({
  isOpen,
  onClose,
  formData,
  onInputChange,
  categories,
  vendors,
  onGenerateSerial,
  onSubmit,
  isPending,
  onAddVendor,
}) => {
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
            </label>
            <input
              type="text"
              value={formData.asset_name}
              onChange={(e) => onInputChange('asset_name', e.target.value)}
              className="w-full px-4 py-3 sm:py-2.5 text-base sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter asset name"
            />
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

          {/* Brand & Model */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm sm:text-base font-medium text-slate-700 mb-2">Brand</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => onInputChange('brand', e.target.value)}
                className="w-full px-4 py-3 sm:py-2.5 text-base sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter brand"
              />
            </div>
            <div>
              <label className="block text-sm sm:text-base font-medium text-slate-700 mb-2">Model</label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => onInputChange('model', e.target.value)}
                className="w-full px-4 py-3 sm:py-2.5 text-base sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter model"
              />
            </div>
          </div>

          {/* Serial Number */}
          <div>
            <label className="block text-sm sm:text-base font-medium text-slate-700 mb-2">Serial Number</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.serial_number}
                onChange={(e) => onInputChange('serial_number', e.target.value)}
                className="flex-1 px-4 py-3 sm:py-2.5 text-base sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter serial number or generate"
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
            {formData.asset_category_id && (
              <p className="mt-1.5 text-xs text-slate-500">
                Click "Generate" to auto-create a unique serial number
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
