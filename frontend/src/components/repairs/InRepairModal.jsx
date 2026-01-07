import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { UserRound, Upload, X, FileImage, AlertCircle, Building2 } from 'lucide-react'
import Modal from '../Modal'
import { fetchBranchesRequest } from '../../services/branchService'

function InRepairModal({ isOpen, onClose, onSubmit, repair, isSubmitting }) {
  const [formData, setFormData] = useState({
    delivered_by_type: 'employee',
    delivered_by_employee_name: '',
    delivered_by_branch_id: '',
    job_order: null,
    remark: '',
  })

  const [branches, setBranches] = useState([])
  const [previewUrl, setPreviewUrl] = useState(null)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const loadData = async () => {
      try {
        const branchesResponse = await fetchBranchesRequest()
        const branchList = branchesResponse.data?.data || branchesResponse.data || []
        setBranches(branchList)
      } catch (error) {
        console.error('Failed to load branches:', error)
      }
    }

    if (isOpen) {
      loadData()
    }
  }, [isOpen])

  const handleTypeChange = (e) => {
    const type = e.target.value
    setFormData((prev) => ({
      ...prev,
      delivered_by_type: type,
      delivered_by_employee_name: '',
      delivered_by_branch_id: '',
    }))
    setErrors({})
  }

  const handleBranchChange = (value) => {
    setFormData((prev) => ({ ...prev, delivered_by_branch_id: value }))
    if (errors.delivered_by_branch_id) {
      setErrors((prev) => ({ ...prev, delivered_by_branch_id: '' }))
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
      if (!validTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          job_order: 'Please upload a valid image (JPEG, PNG) or PDF file',
        }))
        return
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          job_order: 'File size must be less than 5MB',
        }))
        return
      }

      setFormData((prev) => ({ ...prev, job_order: file }))
      setErrors((prev) => ({ ...prev, job_order: '' }))

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreviewUrl(reader.result)
        }
        reader.readAsDataURL(file)
      } else {
        setPreviewUrl(null)
      }
    }
  }

  const handleRemoveFile = () => {
    setFormData((prev) => ({ ...prev, job_order: null }))
    setPreviewUrl(null)
  }

  const validateForm = () => {
    const newErrors = {}

    if (formData.delivered_by_type === 'employee' && !formData.delivered_by_employee_name?.trim()) {
      newErrors.delivered_by_employee_name = 'Please enter personnel name'
    }

    if (formData.delivered_by_type === 'branch' && !formData.delivered_by_branch_id) {
      newErrors.delivered_by_branch_id = 'Please select a branch'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    onSubmit(formData)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Set to Under Repair" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Asset Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-blue-900 mb-1">
                Setting Repair Status for: {repair?.asset?.asset_name}
              </h4>
              <p className="text-xs text-blue-700">
                Please specify who delivered the asset for repair and optionally upload a job order.
              </p>
            </div>
          </div>
        </div>

        {/* Delivered By Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Delivered By <span className="text-red-500">*</span>
          </label>

          {/* Type Selection Radio Buttons */}
          <div className="flex gap-4 mb-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="delivered_by_type"
                value="employee"
                checked={formData.delivered_by_type === 'employee'}
                onChange={handleTypeChange}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex items-center gap-2">
                <UserRound className="w-4 h-4 text-slate-600" />
                <span className="text-sm text-slate-700">Employee/Personnel</span>
              </div>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="delivered_by_type"
                value="branch"
                checked={formData.delivered_by_type === 'branch'}
                onChange={handleTypeChange}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-600" />
                <span className="text-sm text-slate-700">Branch</span>
              </div>
            </label>
          </div>

          {/* Input Field - Changes based on selection */}
          {formData.delivered_by_type === 'employee' ? (
            <div>
              <input
                type="text"
                name="delivered_by_employee_name"
                value={formData.delivered_by_employee_name}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, delivered_by_employee_name: e.target.value }))
                  if (errors.delivered_by_employee_name) {
                    setErrors((prev) => ({ ...prev, delivered_by_employee_name: '' }))
                  }
                }}
                placeholder="Enter personnel name..."
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.delivered_by_employee_name ? 'border-red-300' : 'border-slate-300'
                }`}
              />
              {errors.delivered_by_employee_name && (
                <p className="mt-1 text-sm text-red-600">{errors.delivered_by_employee_name}</p>
              )}
            </div>
          ) : (
            <div>
              <select
                name="delivered_by_branch_id"
                value={formData.delivered_by_branch_id}
                onChange={(e) => {
                  handleBranchChange(e.target.value)
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.delivered_by_branch_id ? 'border-red-300' : 'border-slate-300'
                }`}
              >
                <option value="">Select a branch...</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.branch_name}
                  </option>
                ))}
              </select>
              {errors.delivered_by_branch_id && (
                <p className="mt-1 text-sm text-red-600">{errors.delivered_by_branch_id}</p>
              )}
            </div>
          )}
        </div>

        {/* Job Order Upload (Optional) */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload Job Order <span className="text-slate-400 text-xs">(Optional)</span>
            </div>
          </label>

          {!formData.job_order ? (
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                id="job-order-upload"
                accept="image/jpeg,image/jpg,image/png,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="job-order-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                  <Upload className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    Click to upload job order
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports JPEG, PNG, PDF (Max 5MB)
                  </p>
                </div>
              </label>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-16 h-16 object-cover rounded border border-slate-200"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-blue-100 rounded flex items-center justify-center">
                      <FileImage className="w-8 h-8 text-blue-600" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {formData.job_order.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {(formData.job_order.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {errors.job_order && (
            <p className="mt-1 text-sm text-red-600">{errors.job_order}</p>
          )}
        </div>

        {/* Remark */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Remark <span className="text-slate-400 text-xs">(Optional)</span>
          </label>
          <textarea
            name="remark"
            value={formData.remark}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, remark: e.target.value }))
              if (errors.remark) {
                setErrors((prev) => ({ ...prev, remark: '' }))
              }
            }}
            placeholder="Enter a remark about this status change (e.g., reason for repair, issues found, delivery notes)..."
            rows={4}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
          />
          <p className="mt-1 text-xs text-slate-500">
            This remark will be saved in the repair history for future reference.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Updating...
              </>
            ) : (
              'Set to Under Repair'
            )}
          </button>
        </div>
      </form>
    </Modal>
  )
}

InRepairModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  repair: PropTypes.object,
  isSubmitting: PropTypes.bool,
}

export default InRepairModal
