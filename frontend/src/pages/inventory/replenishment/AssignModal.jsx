import { useState } from 'react'
import Modal from '../../../components/Modal'
import SearchableSelect from '../../../components/SearchableSelect'
import { UserPlus, Building2, X } from 'lucide-react'

const AssignModal = ({
  isOpen,
  onClose,
  replenishment,
  employeeOptions,
  branchOptions,
  onAssignEmployee,
  onAssignBranch,
  onRemoveAssignment,
  isAssigning,
}) => {
  const [assignType, setAssignType] = useState('employee') // 'employee' or 'branch'
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('')
  const [selectedBranchId, setSelectedBranchId] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (assignType === 'employee' && selectedEmployeeId) {
      onAssignEmployee(replenishment.id, selectedEmployeeId)
    } else if (assignType === 'branch' && selectedBranchId) {
      onAssignBranch(replenishment.id, selectedBranchId)
    }
  }

  const handleRemoveAssignment = () => {
    onRemoveAssignment(replenishment.id)
  }

  const hasAssignment = replenishment?.assigned_employee || replenishment?.assigned_branch

  const resetForm = () => {
    setSelectedEmployeeId('')
    setSelectedBranchId('')
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        resetForm()
        onClose()
      }}
      title="Assign Reserve Asset"
      size="md"
    >
      <div className="space-y-6">
        {/* Current Asset Info */}
        <div className="bg-slate-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-slate-700 mb-2">Asset Details</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-slate-500">Name:</span>
              <span className="ml-2 font-medium text-slate-900">{replenishment?.asset_name}</span>
            </div>
            <div>
              <span className="text-slate-500">Serial:</span>
              <span className="ml-2 font-mono text-slate-900">{replenishment?.serial_number || '—'}</span>
            </div>
          </div>
        </div>

        {/* Current Assignment */}
        {hasAssignment && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-amber-800 mb-1">Currently Assigned</h4>
                {replenishment?.assigned_employee && (
                  <div className="flex items-center gap-2 text-sm text-amber-700">
                    <UserPlus className="w-4 h-4" />
                    <span>{replenishment.assigned_employee.fullname}</span>
                    {replenishment.assigned_employee.branch && (
                      <span className="text-amber-600">
                        ({replenishment.assigned_employee.branch.branch_name})
                      </span>
                    )}
                  </div>
                )}
                {replenishment?.assigned_branch && (
                  <div className="flex items-center gap-2 text-sm text-amber-700">
                    <Building2 className="w-4 h-4" />
                    <span>{replenishment.assigned_branch.branch_name}</span>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleRemoveAssignment}
                disabled={isAssigning}
                className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                <X className="w-3.5 h-3.5 inline mr-1" />
                Remove
              </button>
            </div>
          </div>
        )}

        {/* Assignment Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Assignment Type Toggle */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Assign To
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setAssignType('employee')
                  setSelectedBranchId('')
                }}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                  assignType === 'employee'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <UserPlus className="w-5 h-5" />
                <span className="font-medium">Employee</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAssignType('branch')
                  setSelectedEmployeeId('')
                }}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                  assignType === 'branch'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <Building2 className="w-5 h-5" />
                <span className="font-medium">Branch</span>
              </button>
            </div>
          </div>

          {/* Employee Selection */}
          {assignType === 'employee' && (
            <div>
              <SearchableSelect
                label="Select Employee"
                options={employeeOptions}
                value={selectedEmployeeId}
                onChange={setSelectedEmployeeId}
                displayField="name"
                secondaryField="position"
                tertiaryField="branch"
                placeholder="Search for an employee..."
                emptyMessage="No employees found"
                required
              />
            </div>
          )}

          {/* Branch Selection */}
          {assignType === 'branch' && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Select Branch <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                required
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a branch</option>
                {branchOptions?.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.branch_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                resetForm()
                onClose()
              }}
              className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                isAssigning ||
                (assignType === 'employee' && !selectedEmployeeId) ||
                (assignType === 'branch' && !selectedBranchId)
              }
              className={`px-5 py-2.5 text-sm font-medium text-white rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                assignType === 'employee'
                  ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-offset-2`}
            >
              {isAssigning ? 'Assigning...' : 'Assign'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

export default AssignModal
