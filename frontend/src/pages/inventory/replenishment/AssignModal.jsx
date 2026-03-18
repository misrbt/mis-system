import { useState, useMemo } from 'react'
import Modal from '../../../components/Modal'
import SearchableSelect from '../../../components/SearchableSelect'
import { Monitor, X, Building2 } from 'lucide-react'

const AssignModal = ({
  isOpen,
  onClose,
  replenishment,
  workstationOptions,
  onAssignWorkstation,
  onRemoveAssignment,
  isAssigning,
}) => {
  const [selectedWorkstationId, setSelectedWorkstationId] = useState('')

  // Get selected workstation details to show branch info
  const selectedWorkstation = useMemo(() => {
    if (!selectedWorkstationId) return null
    return workstationOptions?.find((ws) => ws.id === parseInt(selectedWorkstationId))
  }, [selectedWorkstationId, workstationOptions])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (selectedWorkstationId) {
      onAssignWorkstation(replenishment.id, selectedWorkstationId)
    }
  }

  const handleRemoveAssignment = () => {
    onRemoveAssignment(replenishment.id)
  }

  const hasAssignment = replenishment?.assigned_workstation

  const resetForm = () => {
    setSelectedWorkstationId('')
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        resetForm()
        onClose()
      }}
      title="Deploy Reserve Asset to Workstation"
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
            form="assign-workstation-form"
            disabled={isAssigning || !selectedWorkstationId}
            className="p-2.5 text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            title={isAssigning ? 'Deploying...' : 'Deploy to Workstation'}
          >
            <Monitor className="w-5 h-5" />
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
                  <Monitor className="w-4 h-4" />
                  <span>{replenishment.assigned_workstation.name}</span>
                </div>
                {replenishment.assigned_workstation.employee && (
                  <div className="flex items-center gap-2 text-sm text-amber-600 mt-1 ml-6">
                    <span>{replenishment.assigned_workstation.employee.fullname}</span>
                  </div>
                )}
                {replenishment.assigned_workstation.branch && (
                  <div className="flex items-center gap-2 text-sm text-amber-600 mt-1">
                    <Building2 className="w-4 h-4" />
                    <span>{replenishment.assigned_workstation.branch.branch_name}</span>
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
        <form id="assign-workstation-form" onSubmit={handleSubmit} className="space-y-4">
          {/* Workstation Selection */}
          <div>
            <SearchableSelect
              label="Select Workstation"
              options={workstationOptions}
              value={selectedWorkstationId}
              onChange={setSelectedWorkstationId}
              displayField="name"
              secondaryField="workstation_name"
              tertiaryField="branch"
              placeholder="Search for a workstation..."
              emptyMessage="No workstations found"
              required
            />
          </div>

          {/* Show selected workstation details */}
          {selectedWorkstation && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-1.5">
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <Monitor className="w-4 h-4 shrink-0" />
                <span className="font-medium">{selectedWorkstation.workstation_name}</span>
              </div>
              {selectedWorkstation.branch && (
                <div className="flex items-center gap-2 text-sm text-blue-600 ml-6">
                  <Building2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{selectedWorkstation.branch}</span>
                </div>
              )}
              <p className="text-xs text-blue-500 mt-2 ml-6">
                This reserve asset will be deployed as an active asset at this workstation.
              </p>
            </div>
          )}
        </form>
      </div>
    </Modal>
  )
}

export default AssignModal
