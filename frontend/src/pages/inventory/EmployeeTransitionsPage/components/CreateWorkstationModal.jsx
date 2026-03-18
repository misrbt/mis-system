import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X, Plus, Building2, Briefcase } from 'lucide-react'
import Swal from 'sweetalert2'
import { createWorkstationRequest } from '../../../../services/workstationService'

export function CreateWorkstationModal({
  isOpen,
  onClose,
  branches,
  positions,
  defaultBranchId = null,
  defaultPositionId = null,
  onSuccess,
}) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    branch_id: defaultBranchId || '',
    position_id: defaultPositionId || '',
    name: '',
    description: '',
  })

  const createMutation = useMutation({
    mutationFn: createWorkstationRequest,
    onSuccess: async (response) => {
      await queryClient.invalidateQueries(['workstations'])
      const newWorkstation = response.data?.data

      Swal.fire({
        icon: 'success',
        title: 'Workstation Created!',
        text: `Successfully created workstation`,
        timer: 2000,
        showConfirmButton: false,
      })

      setFormData({ branch_id: '', position_id: '', name: '', description: '' })
      onClose()

      // Call onSuccess callback with the new workstation
      if (onSuccess && newWorkstation) {
        onSuccess(newWorkstation)
      }
    },
    onError: (error) => {
      Swal.fire({
        icon: 'error',
        title: 'Creation Failed',
        text: error.response?.data?.message || 'Failed to create workstation',
        confirmButtonColor: '#ef4444',
      })
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.branch_id || !formData.position_id) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Fields',
        text: 'Please select both branch and position',
        confirmButtonColor: '#f59e0b',
      })
      return
    }
    createMutation.mutate(formData)
  }

  const handleClose = () => {
    if (!createMutation.isPending) {
      setFormData({ branch_id: '', position_id: '', name: '', description: '' })
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Create Workstation</h3>
              <p className="text-xs text-slate-500">Add a new workstation to assign employees</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={createMutation.isPending}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Branch */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              Branch *
            </label>
            <select
              value={formData.branch_id}
              onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">-- Select Branch --</option>
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>
                  {branch.branch_name}
                </option>
              ))}
            </select>
          </div>

          {/* Position */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
              <Briefcase className="w-4 h-4 text-blue-600" />
              Position *
            </label>
            <select
              value={formData.position_id}
              onChange={(e) => setFormData({ ...formData, position_id: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">-- Select Position --</option>
              {positions.map(position => (
                <option key={position.id} value={position.id}>
                  {position.title}
                </option>
              ))}
            </select>
          </div>

          {/* Name (optional) */}
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">
              Custom Name <span className="text-xs text-slate-500 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Auto-generated from branch + position"
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-slate-500 mt-1">
              Leave empty to auto-generate name
            </p>
          </div>

          {/* Description (optional) */}
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">
              Description <span className="text-xs text-slate-500 font-normal">(optional)</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Additional details about this workstation"
              rows={3}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={createMutation.isPending}
              className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {createMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Workstation
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateWorkstationModal
