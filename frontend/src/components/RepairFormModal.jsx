import { useState } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import Modal from './Modal'
import { Wrench, AlertCircle } from 'lucide-react'
import Swal from 'sweetalert2'
import apiClient from '../services/apiClient'
import SearchableSelect from './SearchableSelect'

function RepairFormModal({ isOpen, onClose, asset }) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    vendor_id: '',
    description: '',
    repair_date: new Date().toISOString().split('T')[0],
    expected_return_date: '',
    repair_cost: '',
    status: 'Pending',
    remarks: '',
  })
  const [errors, setErrors] = useState({})

  // Fetch vendors
  const { data: vendorsData } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const response = await apiClient.get('/vendors')
      return response.data
    },
    enabled: isOpen,
  })

  const vendors = Array.isArray(vendorsData?.data)
    ? vendorsData.data
    : Array.isArray(vendorsData)
    ? vendorsData
    : []

  // Create repair mutation
  const createRepairMutation = useMutation({
    mutationFn: (data) => apiClient.post('/repairs', {
      ...data,
      asset_id: asset?.id,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['repairs'])
      queryClient.invalidateQueries(['asset', asset?.id])

      Swal.fire({
        icon: 'success',
        title: 'Repair Created',
        text: 'Repair record has been successfully created',
        timer: 2000,
        showConfirmButton: false,
      })

      handleClose()
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Failed to create repair'
      const validationErrors = error.response?.data?.errors || {}

      setErrors(validationErrors)

      Swal.fire({
        icon: 'error',
        title: 'Failed to Create Repair',
        text: errorMessage,
      })
    },
  })

  const validateForm = () => {
    const newErrors = {}

    if (!formData.vendor_id) {
      newErrors.vendor_id = 'Please select a vendor'
    }

    if (!formData.description || formData.description.trim() === '') {
      newErrors.description = 'Description is required'
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters'
    }

    if (!formData.repair_date) {
      newErrors.repair_date = 'Repair date is required'
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

    createRepairMutation.mutate(formData)
  }

  const handleClose = () => {
    setFormData({
      vendor_id: '',
      description: '',
      repair_date: new Date().toISOString().split('T')[0],
      expected_return_date: '',
      repair_cost: '',
      status: 'Pending',
      remarks: '',
    })
    setErrors({})
    onClose()
  }

  const footer = (
    <div className="flex gap-3 justify-end">
      <button
        type="button"
        onClick={handleClose}
        disabled={createRepairMutation.isPending}
        className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Cancel
      </button>
      <button
        type="submit"
        onClick={handleSubmit}
        disabled={createRepairMutation.isPending}
        className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
      >
        {createRepairMutation.isPending ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Creating...
          </>
        ) : (
          <>
            <Wrench className="w-4 h-4" />
            Create Repair
          </>
        )}
      </button>
    </div>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Repair Information"
      size="lg"
      footer={footer}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Asset Info */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Wrench className="w-5 h-5 text-orange-600" />
            <p className="text-sm font-medium text-orange-900">Asset Under Repair</p>
          </div>
          <p className="font-semibold text-slate-900">{asset?.brand} {asset?.model}</p>
          <p className="text-sm text-slate-600">Serial: {asset?.serial_number}</p>
        </div>

        {/* Vendor Selection */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Repair Vendor <span className="text-red-500">*</span>
          </label>
          <SearchableSelect
            options={vendors}
            value={formData.vendor_id}
            onChange={(value) => {
              setFormData(prev => ({ ...prev, vendor_id: value }))
              if (errors.vendor_id) setErrors(prev => ({ ...prev, vendor_id: undefined }))
            }}
            placeholder="Select vendor"
            displayField="company_name"
            secondaryField="contact_person"
            emptyMessage="No vendors found"
          />
          {errors.vendor_id && (
            <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
              <AlertCircle className="w-4 h-4" />
              {errors.vendor_id}
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Problem Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, description: e.target.value }))
              if (errors.description) setErrors(prev => ({ ...prev, description: undefined }))
            }}
            placeholder="Describe the problem and repair needed (minimum 10 characters)"
            rows={4}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none ${
              errors.description ? 'border-red-300' : 'border-slate-300'
            }`}
          />
          <div className="flex items-center justify-between mt-1">
            <div>
              {errors.description && (
                <div className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  {errors.description}
                </div>
              )}
            </div>
            <span className={`text-sm ${
              formData.description.length >= 10 ? 'text-green-600' : 'text-slate-500'
            }`}>
              {formData.description.length} / 10 characters
            </span>
          </div>
        </div>

        {/* Dates Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Repair Date */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Repair Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.repair_date}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, repair_date: e.target.value }))
                if (errors.repair_date) setErrors(prev => ({ ...prev, repair_date: undefined }))
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                errors.repair_date ? 'border-red-300' : 'border-slate-300'
              }`}
            />
            {errors.repair_date && (
              <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                {errors.repair_date}
              </div>
            )}
          </div>

          {/* Expected Return Date */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Expected Return Date
            </label>
            <input
              type="date"
              value={formData.expected_return_date}
              onChange={(e) => setFormData(prev => ({ ...prev, expected_return_date: e.target.value }))}
              min={formData.repair_date}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>

        {/* Repair Cost */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Repair Cost (Optional)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-500">₱</span>
            <input
              type="number"
              value={formData.repair_cost}
              onChange={(e) => setFormData(prev => ({ ...prev, repair_cost: e.target.value }))}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">Leave empty if cost is not yet determined</p>
        </div>

        {/* Remarks */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Additional Remarks
          </label>
          <textarea
            value={formData.remarks}
            onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
            placeholder="Any additional notes about this repair"
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
          />
        </div>
      </form>
    </Modal>
  )
}

export default RepairFormModal
