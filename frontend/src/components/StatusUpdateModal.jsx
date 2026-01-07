import { useState } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import Modal from './Modal'
import { Activity, AlertCircle, RefreshCw } from 'lucide-react'
import Swal from 'sweetalert2'
import apiClient from '../services/apiClient'

function StatusUpdateModal({ isOpen, onClose, asset, onAfterUpdate }) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState(() => ({
    status_id: asset?.status_id || '',
    reason: '',
    remarks: '',
  }))
  const [errors, setErrors] = useState({})

  // Fetch statuses
  const { data: statusesData } = useQuery({
    queryKey: ['statuses'],
    queryFn: async () => (await apiClient.get('/statuses')).data,
    enabled: isOpen,
  })

  const statuses = Array.isArray(statusesData?.data)
    ? statusesData.data
    : Array.isArray(statusesData)
    ? statusesData
    : []

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: (data) => apiClient.post(`/assets/${asset?.id}/movements/update-status`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['asset', asset?.id])
      queryClient.invalidateQueries(['asset-movements', asset?.id])
      queryClient.invalidateQueries(['asset-assignments', asset?.id])
      queryClient.invalidateQueries(['asset-statistics', asset?.id])
      queryClient.invalidateQueries(['assets'])

      // Find the selected status to check if it's "Under Repair"
      const selectedStatus = statuses.find(s => s.id === parseInt(formData.status_id))

      Swal.fire({
        icon: 'success',
        title: 'Status Updated',
        text: 'Asset status has been successfully updated',
        timer: 2000,
        showConfirmButton: false,
      }).then(() => {
        // After SweetAlert closes, trigger callback if status is "Under Repair"
        if (onAfterUpdate && selectedStatus?.name === 'Under Repair') {
          onAfterUpdate(selectedStatus)
        }
      })

      handleClose()
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Failed to update status'
      const validationErrors = error.response?.data?.errors || {}

      setErrors(validationErrors)

      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: errorMessage,
      })
    },
  })

  const validateForm = () => {
    const newErrors = {}

    if (!formData.status_id) {
      newErrors.status_id = 'Please select a status'
    }

    // Check if status actually changed
    if (formData.status_id === asset?.status_id) {
      newErrors.status_id = 'Please select a different status'
    }

    if (!formData.reason || formData.reason.trim() === '') {
      newErrors.reason = 'Reason is required'
    } else if (formData.reason.trim().length < 10) {
      newErrors.reason = 'Reason must be at least 10 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validateForm()) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please fill in all required fields correctly',
      })
      return
    }

    updateStatusMutation.mutate(formData)
  }

  const handleReasonChange = (e) => {
    const value = e.target.value
    setFormData(prev => ({ ...prev, reason: value }))

    // Clear error when user starts typing
    if (errors.reason) {
      setErrors(prev => ({ ...prev, reason: undefined }))
    }
  }

  const handleStatusChange = (e) => {
    const value = e.target.value
    setFormData(prev => ({ ...prev, status_id: value }))

    // Clear error when user selects
    if (errors.status_id) {
      setErrors(prev => ({ ...prev, status_id: undefined }))
    }
  }

  const handleClose = () => {
    setFormData({
      status_id: asset?.status_id || '',
      reason: '',
      remarks: '',
    })
    setErrors({})
    onClose()
  }

  const currentStatus = asset?.status
  const selectedStatus = statuses.find(s => s.id === parseInt(formData.status_id))

  const footer = (
    <div className="flex gap-3 justify-end">
      <button
        type="button"
        onClick={handleClose}
        disabled={updateStatusMutation.isPending}
        className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Cancel
      </button>
      <button
        type="submit"
        onClick={handleSubmit}
        disabled={updateStatusMutation.isPending}
        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
      >
        {updateStatusMutation.isPending ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Updating...
          </>
        ) : (
          <>
            <RefreshCw className="w-4 h-4" />
            Update Status
          </>
        )}
      </button>
    </div>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Update Asset Status"
      size="md"
      footer={footer}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Asset Info */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <p className="text-sm font-medium text-slate-700 mb-2">Asset</p>
          <p className="font-semibold text-slate-900">{asset?.brand} {asset?.model}</p>
          <p className="text-sm text-slate-600">Serial: {asset?.serial_number}</p>
        </div>

        {/* Current Status */}
        {currentStatus && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900 mb-2">Current Status</p>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-900">{currentStatus.name}</span>
            </div>
          </div>
        )}

        {/* Status Selection */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            New Status <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.status_id}
            onChange={handleStatusChange}
            className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
              errors.status_id ? 'border-red-300' : 'border-slate-300'
            }`}
          >
            <option value="">Select a status</option>
            {statuses.map(status => (
              <option key={status.id} value={status.id}>
                {status.name}
              </option>
            ))}
          </select>
          {errors.status_id && (
            <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
              <AlertCircle className="w-4 h-4" />
              {errors.status_id}
            </div>
          )}
        </div>

        {/* Status Change Preview */}
        {selectedStatus && selectedStatus.id !== asset?.status_id && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 flex items-center gap-3">
            <Activity className="w-5 h-5 text-indigo-600 flex-shrink-0" />
            <div className="text-sm">
              <span className="font-medium text-indigo-900">{currentStatus?.name || 'Unknown'}</span>
              <span className="mx-2 text-indigo-600">→</span>
              <span className="font-semibold text-indigo-900">{selectedStatus.name}</span>
            </div>
          </div>
        )}

        {/* Reason */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Reason for Status Change <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.reason}
            onChange={handleReasonChange}
            placeholder="Explain why the status is being changed (minimum 10 characters)"
            rows={4}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none ${
              errors.reason ? 'border-red-300' : 'border-slate-300'
            }`}
          />
          <div className="flex items-center justify-between mt-1">
            <div>
              {errors.reason && (
                <div className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  {errors.reason}
                </div>
              )}
            </div>
            <span className={`text-sm ${
              formData.reason.length >= 10 ? 'text-green-600' : 'text-slate-500'
            }`}>
              {formData.reason.length} / 10 characters
            </span>
          </div>
        </div>

        {/* Remarks (Optional) */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Additional Remarks (Optional)
          </label>
          <textarea
            value={formData.remarks}
            onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
            placeholder="Any additional notes or comments about this status change"
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
          />
        </div>
      </form>
    </Modal>
  )
}

export default StatusUpdateModal
