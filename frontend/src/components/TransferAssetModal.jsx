import { useQuery } from '@tanstack/react-query'
import Modal from './Modal'
import SearchableSelect from './SearchableSelect'
import { User, MapPin, ArrowRight, AlertCircle } from 'lucide-react'
import apiClient from '../services/apiClient'
import { fetchEmployeesRequest } from '../services/employeeService'
import { useFormModal } from '../hooks/useFormModal'
import { useAssetQueryInvalidation } from '../hooks/useAssetQueryInvalidation'

function TransferAssetModal({ isOpen, onClose, asset }) {
  const { invalidateAssetQueries } = useAssetQueryInvalidation()

  const {
    formData,
    errors,
    isLoading,
    handleChange,
    setField,
    handleSubmit,
    handleClose,
    getCharCount,
  } = useFormModal({
    initialData: { to_employee_id: '', reason: '', remarks: '' },
    validationRules: {
      to_employee_id: {
        required: true,
        label: 'Employee',
      },
      reason: {
        required: true,
        minLength: 10,
        label: 'Reason',
      },
    },
    mutationFn: (data) => apiClient.post(`/assets/${asset?.id}/movements/transfer`, data),
    onSuccess: () => {
      invalidateAssetQueries(asset?.id)
    },
    onClose,
    successTitle: 'Asset Transferred',
    successMessage: 'Asset has been successfully transferred to the new employee',
    errorTitle: 'Transfer Failed',
  })

  // Fetch employees - cached for 5 minutes to avoid repeated fetches
  const { data: employeesData, isLoading: isLoadingEmployees } = useQuery({
    queryKey: ['employees', 'all'],
    queryFn: async () => {
      const response = await fetchEmployeesRequest({ all: true })
      return response.data
    },
    enabled: isOpen,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  })

  const employees = (() => {
    if (!employeesData) return []
    if (employeesData.success && Array.isArray(employeesData.data)) {
      return employeesData.data
    }
    if (Array.isArray(employeesData?.data)) {
      return employeesData.data
    }
    if (Array.isArray(employeesData)) {
      return employeesData
    }
    return []
  })()

  // Format employees for SearchableSelect
  const formattedEmployees = employees.map(emp => ({
    id: emp.id,
    fullname: emp.fullname,
    position_name: emp.position?.position_name,
    branch_name: emp.branch?.branch_name,
  }))

  const currentEmployee = asset?.assigned_employee
  const currentBranch = currentEmployee?.branch
  const reasonCharCount = getCharCount('reason')

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
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Transferring...
          </>
        ) : (
          <>
            <ArrowRight className="w-4 h-4" />
            Transfer Asset
          </>
        )}
      </button>
    </div>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Transfer Asset"
      size="md"
      footer={footer}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Current Assignment Info */}
        {currentEmployee && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <p className="text-sm font-medium text-slate-700 mb-3">Current Assignment</p>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-200 text-slate-600">
                <User className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900">{currentEmployee.fullname}</p>
                {currentEmployee.position && (
                  <p className="text-sm text-slate-600">{currentEmployee.position.position_name}</p>
                )}
                {currentBranch && (
                  <div className="flex items-center gap-1 mt-1 text-sm text-slate-500">
                    <MapPin className="w-3.5 h-3.5" />
                    {currentBranch.branch_name}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Asset Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-medium text-blue-900 mb-2">Asset to Transfer</p>
          <p className="font-semibold text-blue-900">{asset?.brand} {asset?.model}</p>
          <p className="text-sm text-blue-700">Serial: {asset?.serial_number}</p>
        </div>

        {/* New Employee Selection */}
        <div>
          <SearchableSelect
            label="Transfer To"
            placeholder="Select employee"
            options={formattedEmployees}
            value={formData.to_employee_id}
            onChange={(value) => setField('to_employee_id', value)}
            displayField="fullname"
            secondaryField="position_name"
            tertiaryField="branch_name"
            emptyMessage="No employees found"
            required
            isLoading={isLoadingEmployees}
          />
          {errors.to_employee_id && (
            <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
              <AlertCircle className="w-4 h-4" />
              {errors.to_employee_id}
            </div>
          )}
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Reason for Transfer <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.reason}
            onChange={handleChange('reason')}
            placeholder="Explain why this asset is being transferred (minimum 10 characters)"
            rows={4}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
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
            placeholder="Any additional notes or comments"
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
        </div>
      </form>
    </Modal>
  )
}

export default TransferAssetModal
