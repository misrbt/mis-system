import { useState, useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import Modal from './Modal'
import { Activity, AlertCircle, RefreshCw } from 'lucide-react'
import apiClient from '../services/apiClient'
import { useFormModal } from '../hooks/useFormModal'
import { useAssetQueryInvalidation } from '../hooks/useAssetQueryInvalidation'

function StatusUpdateModal({ isOpen, onClose, asset, onAfterUpdate }) {
  const { invalidateAssetQueries } = useAssetQueryInvalidation()
  const [draftStatusId, setDraftStatusId] = useState(null)

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

  const selectedStatusId = draftStatusId ?? (asset?.status_id ? String(asset.status_id) : '')

  // Custom validation for status change
  const validateStatusChange = useCallback((value) => {
    if (!value) {
      return 'Please select a status'
    }
    if (String(value) === String(asset?.status_id)) {
      return 'Please select a different status'
    }
    return null
  }, [asset?.status_id])

  const {
    formData,
    errors,
    isLoading,
    handleChange,
    handleSubmit: baseHandleSubmit,
    handleClose: baseHandleClose,
    getCharCount,
    setFormData,
  } = useFormModal({
    initialData: { reason: '', remarks: '' },
    validationRules: {
      reason: {
        required: true,
        minLength: 10,
        label: 'Reason',
      },
    },
    mutationFn: (data) => apiClient.post(`/assets/${asset?.id}/movements/update-status`, {
      ...data,
      status_id: Number(selectedStatusId),
    }),
    onSuccess: () => {
      invalidateAssetQueries(asset?.id)

      // Check if status is "Under Repair" and trigger callback
      const selectedStatus = statuses.find(s => s.id === parseInt(selectedStatusId))
      if (onAfterUpdate && selectedStatus?.name === 'Under Repair') {
        // Delay callback to let success alert close first
        setTimeout(() => {
          onAfterUpdate(selectedStatus)
        }, 2100)
      }
    },
    onClose: () => {
      setDraftStatusId(null)
      onClose()
    },
    successTitle: 'Status Updated',
    successMessage: 'Asset status has been successfully updated',
    errorTitle: 'Update Failed',
  })

  // Reset draft status when modal opens with new asset
  useEffect(() => {
    if (isOpen) {
      setDraftStatusId(null)
    }
  }, [isOpen, asset?.id])

  const handleClose = useCallback(() => {
    setDraftStatusId(null)
    baseHandleClose()
  }, [baseHandleClose])

  // Custom submit handler with status validation
  const handleSubmit = useCallback((e) => {
    e?.preventDefault()
    const statusError = validateStatusChange(selectedStatusId)
    if (statusError) {
      // Show status error
      return
    }
    baseHandleSubmit(e)
  }, [selectedStatusId, validateStatusChange, baseHandleSubmit])

  const handleStatusChange = (e) => {
    setDraftStatusId(e.target.value)
  }

  const currentStatus = asset?.status
  const selectedStatus = statuses.find(s => s.id === parseInt(selectedStatusId))
  const reasonCharCount = getCharCount('reason')
  const statusError = validateStatusChange(selectedStatusId)

  const footer = (
    <div className="flex gap-3 justify-end">
      <button
        type="button"
        onClick={handleClose}
        disabled={isLoading}
        className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Cancel
      </button>
      <button
        type="submit"
        onClick={handleSubmit}
        disabled={isLoading}
        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
      >
        {isLoading ? (
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
            value={selectedStatusId}
            onChange={handleStatusChange}
            className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
              statusError && draftStatusId !== null ? 'border-red-300' : 'border-slate-300'
            }`}
          >
            <option value="">Select a status</option>
            {statuses.map(status => (
              <option key={status.id} value={status.id}>
                {status.name}
              </option>
            ))}
          </select>
          {statusError && draftStatusId !== null && (
            <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
              <AlertCircle className="w-4 h-4" />
              {statusError}
            </div>
          )}
        </div>

        {/* Status Change Preview */}
        {selectedStatus && selectedStatus.id !== asset?.status_id && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 flex items-center gap-3">
            <Activity className="w-5 h-5 text-indigo-600 flex-shrink-0" />
            <div className="text-sm">
              <span className="font-medium text-indigo-900">{currentStatus?.name || 'Unknown'}</span>
              <span className="mx-2 text-indigo-600">&rarr;</span>
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
            onChange={handleChange('reason')}
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
            <span className={`text-sm ${reasonCharCount.isValid ? 'text-green-600' : 'text-slate-500'}`}>
              {reasonCharCount.current} / {reasonCharCount.min} characters
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
            onChange={handleChange('remarks')}
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
