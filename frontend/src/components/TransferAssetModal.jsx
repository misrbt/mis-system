import { useState } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import Modal from './Modal'
import SearchableSelect from './SearchableSelect'
import { User, MapPin, ArrowRight, AlertCircle } from 'lucide-react'
import Swal from 'sweetalert2'
import apiClient from '../services/apiClient'
import { fetchEmployeesRequest } from '../services/employeeService'

function TransferAssetModal({ isOpen, onClose, asset }) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    to_employee_id: '',
    reason: '',
    remarks: '',
  })
  const [errors, setErrors] = useState({})

  // Fetch employees
  const { data: employeesData } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => (await fetchEmployeesRequest()).data,
    enabled: isOpen,
  })

  const employees = Array.isArray(employeesData?.data)
    ? employeesData.data
    : Array.isArray(employeesData)
    ? employeesData
    : []

  // Format employees for SearchableSelect
  const formattedEmployees = employees.map(emp => ({
    id: emp.id,
    fullname: emp.fullname,
    position_name: emp.position?.position_name,
    branch_name: emp.branch?.branch_name,
  }))

  // Transfer mutation
  const transferMutation = useMutation({
    mutationFn: (data) => apiClient.post(`/assets/${asset?.id}/movements/transfer`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['asset', asset?.id])
      queryClient.invalidateQueries(['asset-movements', asset?.id])
      queryClient.invalidateQueries(['asset-assignments', asset?.id])
      queryClient.invalidateQueries(['asset-statistics', asset?.id])
      queryClient.invalidateQueries(['assets'])

      Swal.fire({
        icon: 'success',
        title: 'Asset Transferred',
        text: 'Asset has been successfully transferred to the new employee',
        timer: 2000,
        showConfirmButton: false,
      })

      handleClose()
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Failed to transfer asset'
      const validationErrors = error.response?.data?.errors || {}

      setErrors(validationErrors)

      Swal.fire({
        icon: 'error',
        title: 'Transfer Failed',
        text: errorMessage,
      })
    },
  })

  const validateForm = () => {
    const newErrors = {}

    if (!formData.to_employee_id) {
      newErrors.to_employee_id = 'Please select an employee'
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

    transferMutation.mutate(formData)
  }

  const handleReasonChange = (e) => {
    const value = e.target.value
    setFormData(prev => ({ ...prev, reason: value }))

    // Clear error when user starts typing
    if (errors.reason) {
      setErrors(prev => ({ ...prev, reason: undefined }))
    }
  }

  const handleClose = () => {
    setFormData({
      to_employee_id: '',
      reason: '',
      remarks: '',
    })
    setErrors({})
    onClose()
  }

  const currentEmployee = asset?.assigned_employee
  const currentBranch = currentEmployee?.branch

  const footer = (
    <div className="flex gap-3 justify-end">
      <button
        type="button"
        onClick={handleClose}
        disabled={transferMutation.isPending}
        className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Cancel
      </button>
      <button
        type="submit"
        onClick={handleSubmit}
        disabled={transferMutation.isPending}
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
      >
        {transferMutation.isPending ? (
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
            onChange={(value) => {
              setFormData(prev => ({ ...prev, to_employee_id: value }))
              if (errors.to_employee_id) {
                setErrors(prev => ({ ...prev, to_employee_id: undefined }))
              }
            }}
            displayField="fullname"
            secondaryField="position_name"
            tertiaryField="branch_name"
            emptyMessage="No employees found"
            required
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
            onChange={handleReasonChange}
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
