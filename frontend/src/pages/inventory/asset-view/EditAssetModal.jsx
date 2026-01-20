import { createPortal } from 'react-dom'
import { Edit, X, RefreshCw, Save } from 'lucide-react'
import SpecificationFields from '../../../components/specifications/SpecificationFields'

function EditAssetModal({
  isOpen,
  data,
  categories,
  subcategories = [],
  statuses,
  vendors,
  formData,
  onClose,
  onChange,
  onSave,
  isPending,
}) {
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
                <label className="block text-sm font-semibold text-slate-700 mb-2">Subcategory</label>
                <select
                  value={formData.subcategory_id || ''}
                  onChange={(e) => onChange('subcategory_id', e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Subcategory (Optional)</option>
                  {subcategories?.map((subcat) => (
                    <option key={subcat.id} value={subcat.id}>{subcat.name}</option>
                  ))}
                </select>
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

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Brand</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => onChange('brand', e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter brand"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Model</label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => onChange('model', e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter model"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Serial Number</label>
              <input
                type="text"
                value={formData.serial_number}
                onChange={(e) => onChange('serial_number', e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter serial number"
              />
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

            <div className="md:col-span-2">
              <SpecificationFields
                categoryName={categories?.find(c => c.id == formData.asset_category_id)?.name}
                specifications={formData.specifications || {}}
                onChange={(specs) => onChange('specifications', specs)}
              />
            </div>

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
