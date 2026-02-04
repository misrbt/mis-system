import { useState, useMemo } from 'react'
import Modal from '../../../components/Modal'
import SearchableSelect from '../../../components/SearchableSelect'
import { UserPlus, X, Building2 } from 'lucide-react'

const AssignModal = ({
  isOpen,
  onClose,
  replenishment,
  employeeOptions,
  onAssignEmployee,
  onRemoveAssignment,
  isAssigning,
}) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('')

  // Get selected employee details to show branch info
  const selectedEmployee = useMemo(() => {
    if (!selectedEmployeeId) return null
    return employeeOptions?.find((emp) => emp.id === parseInt(selectedEmployeeId))
  }, [selectedEmployeeId, employeeOptions])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (selectedEmployeeId) {
      onAssignEmployee(replenishment.id, selectedEmployeeId)
    }
  }

  const handleRemoveAssignment = () => {
    onRemoveAssignment(replenishment.id)
  }

  const hasAssignment = replenishment?.assigned_employee

  const resetForm = () => {
    setSelectedEmployeeId('')
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        resetForm()
        onClose()
      }}
      title="Assign Reserve Asset"
      size="lg"
      footer={
        <div className="flex justify-end gap-3 w-full">
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
            form="assign-employee-form"
            disabled={isAssigning || !selectedEmployeeId}
            className="p-2.5 text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            title={isAssigning ? 'Assigning...' : 'Assign to Employee'}
          >
            <UserPlus className="w-5 h-5" />
          </button>
        </div>
      }
    >
      <div className="space-y-6 min-h-[400px]">
        {/* Current Assignment */}
        {hasAssignment && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-amber-800 mb-1">Currently Assigned</h4>
                <div className="flex items-center gap-2 text-sm text-amber-700">
                  <UserPlus className="w-4 h-4" />
                  <span>{replenishment.assigned_employee.fullname}</span>
                </div>
                {replenishment.assigned_employee.branch && (
                  <div className="flex items-center gap-2 text-sm text-amber-600 mt-1">
                    <Building2 className="w-4 h-4" />
                    <span>{replenishment.assigned_employee.branch.branch_name}</span>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleRemoveAssignment}
                disabled={isAssigning}
                className="p-2 text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                title="Remove assignment"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Assignment Form */}
        <form id="assign-employee-form" onSubmit={handleSubmit} className="space-y-4">
          {/* Employee Selection */}
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

          {/* Show selected employee's branch */}
          {selectedEmployee && selectedEmployee.branch && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <Building2 className="w-4 h-4" />
                <span className="font-medium">Branch:</span>
                <span>{selectedEmployee.branch}</span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                The asset will be assigned to this employee and their branch.
              </p>
            </div>
          )}
        </form>
      </div>
    </Modal>
  )
}

export default AssignModal
