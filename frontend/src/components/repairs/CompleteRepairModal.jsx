import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { DollarSign, FileText, Download, AlertCircle, FileImage } from 'lucide-react'
import Modal from '../Modal'

function CompleteRepairModal({ isOpen, onClose, onSubmit, repair, isSubmitting }) {
  const [formData, setFormData] = useState({
    repair_cost: '',
    invoice_no: '',
    completion_description: '',
  })

  const [errors, setErrors] = useState({})
  const [previewUrl, setPreviewUrl] = useState(null)
  const [fileType, setFileType] = useState(null)

  // Load job order preview when modal opens
  useEffect(() => {
    const loadJobOrderPreview = async () => {
      if (isOpen && repair?.job_order_path) {
        try {
          const url = `${import.meta.env.VITE_API_BASE_URL}/api/repairs/${repair.id}/job-order`
          const token = localStorage.getItem('token')

          const response = await fetch(url, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          })

          if (response.ok) {
            const blob = await response.blob()
            const contentType = response.headers.get('content-type')

            // Only create preview for images
            if (contentType && contentType.startsWith('image/')) {
              const objectUrl = window.URL.createObjectURL(blob)
              setPreviewUrl(objectUrl)
              setFileType('image')
            } else {
              setFileType('pdf')
            }
          }
        } catch (error) {
          console.error('Error loading job order preview:', error)
        }
      }
    }

    loadJobOrderPreview()

    // Cleanup function to revoke object URL
    return () => {
      if (previewUrl) {
        window.URL.revokeObjectURL(previewUrl)
      }
    }
  }, [isOpen, repair?.id, repair?.job_order_path, previewUrl])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.repair_cost || parseFloat(formData.repair_cost) <= 0) {
      newErrors.repair_cost = 'Cost is required and must be greater than 0'
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

  const handleDownloadJobOrder = async () => {
    if (repair?.id) {
      try {
        const url = `${import.meta.env.VITE_API_BASE_URL}/api/repairs/${repair.id}/job-order`
        const token = localStorage.getItem('token')

        // Fetch with authentication
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to download file')
        }

        // Get the blob
        const blob = await response.blob()

        // Create download link
        const downloadUrl = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = downloadUrl

        // Extract filename from content-disposition header
        const contentDisposition = response.headers.get('content-disposition')
        let filename = null

        if (contentDisposition) {
          // Try to extract filename from content-disposition header
          const matches = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
          if (matches && matches[1]) {
            filename = matches[1].replace(/['"]/g, '')
          }
        }

        // Fallback: use original filename from job_order_path
        if (!filename && repair.job_order_path) {
          filename = repair.job_order_path.split('/').pop()
        }

        // Final fallback: generate filename based on file type
        if (!filename) {
          const extension = fileType === 'image' ? 'jpg' : 'pdf'
          filename = `job_order_${repair.id}.${extension}`
        }

        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // Clean up
        window.URL.revokeObjectURL(downloadUrl)
      } catch (error) {
        console.error('Error downloading job order:', error)
        alert('Failed to download job order. Please try again.')
      }
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Complete Repair" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Asset Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-blue-900 mb-1">
                Completing Repair for: {repair?.asset?.asset_name}
              </h4>
              <p className="text-xs text-blue-700">
                Please provide the final repair cost and any additional details.
              </p>
            </div>
          </div>
        </div>

        {/* Cost (Required) */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Repair Cost <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <DollarSign className="w-5 h-5 text-slate-400" />
            </div>
            <input
              type="number"
              name="repair_cost"
              value={formData.repair_cost}
              onChange={handleChange}
              step="0.01"
              min="0"
              placeholder="0.00"
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.repair_cost ? 'border-red-300' : 'border-slate-300'
              }`}
            />
          </div>
          {errors.repair_cost && (
            <p className="mt-1 text-sm text-red-600">{errors.repair_cost}</p>
          )}
        </div>

        {/* Invoice No (Optional) */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Invoice Number <span className="text-slate-400 text-xs">(Optional)</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FileText className="w-5 h-5 text-slate-400" />
            </div>
            <input
              type="text"
              name="invoice_no"
              value={formData.invoice_no}
              onChange={handleChange}
              placeholder="Enter invoice number"
              className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Description (Optional) */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Completion Description <span className="text-slate-400 text-xs">(Optional)</span>
          </label>
          <textarea
            name="completion_description"
            value={formData.completion_description}
            onChange={handleChange}
            rows={4}
            placeholder="Describe what was repaired or any important notes..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
        </div>

        {/* Job Order Section - Always Visible */}
        <div className={`border rounded-lg p-4 ${
          repair?.job_order_path
            ? 'bg-slate-50 border-slate-200'
            : 'bg-gray-50 border-gray-300'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Image Preview or Icon */}
              {repair?.job_order_path ? (
                previewUrl && fileType === 'image' ? (
                  <img
                    src={previewUrl}
                    alt="Job Order Preview"
                    className="w-16 h-16 object-cover rounded border border-slate-200"
                  />
                ) : (
                  <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                    {fileType === 'pdf' ? (
                      <FileText className="w-8 h-8 text-blue-600" />
                    ) : (
                      <FileImage className="w-8 h-8 text-blue-600" />
                    )}
                  </div>
                )
              ) : (
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  <FileImage className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <div>
                <p className={`text-sm font-medium ${
                  repair?.job_order_path ? 'text-slate-900' : 'text-gray-600'
                }`}>
                  {repair?.job_order_path ? 'Job Order Available' : 'Job Order Not Available'}
                </p>
                <p className="text-xs text-slate-500">
                  {repair?.job_order_path
                    ? `${fileType === 'image' ? 'Image file' : fileType === 'pdf' ? 'PDF document' : 'Document'} - Click to download`
                    : 'No job order was uploaded for this repair'
                  }
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDownloadJobOrder}
              disabled={!repair?.job_order_path}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                repair?.job_order_path
                  ? 'text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100'
                  : 'text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed opacity-50'
              }`}
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
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
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Completing...
              </>
            ) : (
              'Complete Repair'
            )}
          </button>
        </div>
      </form>
    </Modal>
  )
}

CompleteRepairModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  repair: PropTypes.object,
  isSubmitting: PropTypes.bool,
}

export default CompleteRepairModal
