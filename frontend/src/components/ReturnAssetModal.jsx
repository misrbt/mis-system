import { useEffect } from 'react'
import Modal from './Modal'
import { User, MapPin, CornerUpLeft, AlertCircle } from 'lucide-react'
import Swal from 'sweetalert2'
import apiClient from '../services/apiClient'
import { useFormModal } from '../hooks/useFormModal'
import { useAssetQueryInvalidation } from '../hooks/useAssetQueryInvalidation'

function ReturnAssetModal({ isOpen, onClose, asset }) {
  const { invalidateAssetQueries } = useAssetQueryInvalidation()

  const {
    formData,
    errors,
    isLoading,
    handleChange,
    handleSubmit,
    handleClose,
    getCharCount,
  } = useFormModal({
    initialData: { reason: '', remarks: '' },
    validationRules: {
      reason: {
        required: true,
        minLength: 10,
        label: 'Reason',
      },
    },
    mutationFn: (data) => apiClient.post(`/assets/${asset?.id}/movements/return`, data),
    onSuccess: () => {
      invalidateAssetQueries(asset?.id)
    },
    onClose,
    successTitle: 'Asset Returned',
    successMessage: 'Asset has been successfully returned to inventory',
    errorTitle: 'Return Failed',
  })

  const currentEmployee = asset?.workstation?.employee || asset?.assigned_employee
  const currentWorkstation = asset?.workstation
  const currentBranch = currentWorkstation?.branch || currentEmployee?.branch
  const reasonCharCount = getCharCount('reason')

  const isAssigned = !!(currentEmployee || currentWorkstation)

  // Check if asset is assigned when modal opens
  useEffect(() => {
    if (isOpen && !isAssigned) {
      Swal.fire({
        icon: 'warning',
        title: 'Not Assigned',
        text: 'This asset is not currently assigned to any workstation or employee',
      })
      handleClose()
    }
  }, [isOpen, isAssigned, handleClose])

  // Don't render if not assigned
  if (isOpen && !isAssigned) {
    return null
  }

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
        className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Returning...
          </>
        ) : (
          <>
            <CornerUpLeft className="w-4 h-4" />
            Return Asset
          </>
        )}
      </button>
    </div>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Return Asset to Inventory"
      size="md"
      footer={footer}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Currently Assigned To */}
        {isAssigned && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm font-medium text-orange-900 mb-3">Returning From</p>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 text-orange-600">
                <User className="w-5 h-5" />
              </div>
              <div className="flex-1">
                {currentEmployee && (
                  <p className="font-semibold text-orange-900">{currentEmployee.fullname}</p>
                )}
                {currentEmployee?.position && (
                  <p className="text-sm text-orange-700">{currentEmployee.position.position_name || currentEmployee.position.title}</p>
                )}
                {currentWorkstation && (
                  <p className="text-sm text-orange-700">{currentWorkstation.name}</p>
                )}
                {currentBranch && (
                  <div className="flex items-center gap-1 mt-1 text-sm text-orange-600">
                    <MapPin className="w-3.5 h-3.5" />
                    {currentBranch.branch_name}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Asset Info */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <p className="text-sm font-medium text-slate-700 mb-2">Asset to Return</p>
          <p className="font-semibold text-slate-900">{asset?.brand} {asset?.model}</p>
          <p className="text-sm text-slate-600">Serial: {asset?.serial_number}</p>
          {asset?.status && (
            <p className="text-sm text-slate-600 mt-1">
              Status: <span className="font-medium">{asset.status.name}</span>
            </p>
          )}
        </div>

        {/* Info Message */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium">This action will unassign the asset</p>
            <p className="text-blue-700 mt-1">
              The asset will be returned to inventory and will no longer be assigned to {currentEmployee?.fullname || currentWorkstation?.name || 'current assignment'}.
            </p>
          </div>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Reason for Return <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.reason}
            onChange={handleChange('reason')}
            placeholder="Explain why this asset is being returned (minimum 10 characters)"
            rows={4}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none ${
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
            placeholder="Any additional notes or comments (e.g., condition of asset, accessories returned, etc.)"
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
          />
        </div>
      </form>
    </Modal>
  )
}

export default ReturnAssetModal
