import { useMemo } from 'react'
import { ArrowRight, Building2, MapPin, XCircle, Plus } from 'lucide-react'
import { getWorkstation } from '../../../hooks/useTransitionState'

export function DestinationStep({
  employees,
  modifications,
  transitionMode,
  branches,
  positions,
  workstations,
  onModify,
  onClear,
  onOpenCreateWorkstation,
}) {
  const colorClass = transitionMode === 'branch' ? 'teal' : 'blue'
  const isBranchMode = transitionMode === 'branch'

  return (
    <div>
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
        <h3 className="text-lg font-semibold text-slate-900">Choose Destinations</h3>
        <p className="text-sm text-slate-500 mt-0.5">
          Assign new {isBranchMode ? 'branch and' : ''} workstation for each employee
        </p>
      </div>

      {/* Employee destination list */}
      <div className="max-h-[400px] overflow-auto divide-y divide-slate-100">
        {employees.map(emp => (
          <EmployeeDestinationRow
            key={emp.id}
            employee={emp}
            modification={modifications[emp.id]}
            transitionMode={transitionMode}
            branches={branches}
            positions={positions}
            workstations={workstations}
            onModify={onModify}
            onClear={() => onClear(emp.id)}
            onOpenCreateWorkstation={onOpenCreateWorkstation}
          />
        ))}
      </div>

      {employees.length === 0 && (
        <div className="px-6 py-12 text-center">
          <p className="text-sm text-slate-500">No employees selected. Go back to select employees.</p>
        </div>
      )}
    </div>
  )
}

function EmployeeDestinationRow({
  employee,
  modification,
  transitionMode,
  branches,
  positions,
  workstations,
  onModify,
  onClear,
  onOpenCreateWorkstation,
}) {
  const colorClass = transitionMode === 'branch' ? 'teal' : 'blue'
  const isBranchMode = transitionMode === 'branch'

  const { ws_branch_id, ws_position_id } = getWorkstation(employee)
  const currentWorkstation = employee.workstations?.[0]
  const currentWorkstationId = currentWorkstation?.id

  const selectedWorkstationId = modification?.to_workstation_id ?? currentWorkstationId ?? ''
  const isModified = !!modification

  // In employee mode, only show workstations in current branch
  const availableWorkstations = useMemo(() => {
    if (transitionMode === 'employee') {
      return workstations.filter(ws => ws.branch_id === ws_branch_id)
    }
    return workstations
  }, [workstations, transitionMode, ws_branch_id])

  // Handler for workstation change
  const handleWorkstationChange = (workstationId) => {
    const ws = workstations.find(w => w.id === parseInt(workstationId))
    if (ws) {
      // CRITICAL: Set workstation_id FIRST for unassigned employees
      onModify(employee.id, 'to_workstation_id', workstationId, employee)
      onModify(employee.id, 'to_branch_id', ws.branch_id, employee)
      onModify(employee.id, 'to_position_id', ws.position_id || ws_position_id, employee)
    } else {
      // Clear selection - order doesn't matter here since we're clearing
      onModify(employee.id, 'to_workstation_id', '', employee)
      onModify(employee.id, 'to_branch_id', ws_branch_id, employee)
      onModify(employee.id, 'to_position_id', ws_position_id, employee)
    }
  }

  return (
    <div className={`px-6 py-4 ${isModified ? `bg-${colorClass}-50/50` : ''}`}>
      <div className="flex items-start gap-4">
        {/* Employee info */}
        <div className="flex items-center gap-3 min-w-[200px]">
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold
            ${isModified ? `bg-${colorClass}-500` : 'bg-slate-400'}
          `}>
            {employee.fullname?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-slate-900">{employee.fullname}</div>
            <div className="text-xs text-slate-500">
              Currently: {employee.branch?.branch_name}
            </div>
          </div>
        </div>

        <ArrowRight className="w-5 h-5 text-slate-400 flex-shrink-0 mt-2.5" />

        {/* Workstation selector */}
        <div className="flex-1">
          <label className="flex items-center gap-1 text-xs font-medium text-slate-600 mb-2">
            <MapPin className="w-3 h-3" />
            Select New Workstation
          </label>
          <div className="flex gap-2">
            <select
              value={selectedWorkstationId}
              onChange={(e) => handleWorkstationChange(e.target.value)}
              className={`flex-1 px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:border-transparent focus:ring-${colorClass}-500`}
            >
            <option value="">-- Select Workstation --</option>

            {/* Current workstation */}
            {currentWorkstation && (
              <optgroup label="📍 Current Assignment">
                <option value={currentWorkstation.id}>
                  {branches.find(b => b.id === currentWorkstation.branch_id)?.branch_name} - {currentWorkstation.position?.title || 'General'} ({currentWorkstation.assets_count || 0} assets)
                </option>
              </optgroup>
            )}

            {/* Available workstations (empty) */}
            {availableWorkstations.filter(ws => !ws.employee && ws.id !== currentWorkstation?.id).length > 0 && (
              <optgroup label="✓ Available Workstations">
                {availableWorkstations
                  .filter(ws => !ws.employee && ws.id !== currentWorkstation?.id)
                  .map(ws => (
                    <option key={ws.id} value={ws.id}>
                      {branches.find(b => b.id === ws.branch_id)?.branch_name} - {ws.position?.title || 'General'} ({ws.assets_count || 0} assets)
                    </option>
                  ))
                }
              </optgroup>
            )}

            {/* Occupied workstations (can select for exchange) */}
            {availableWorkstations.filter(ws => ws.employee && ws.employee.id !== employee.id).length > 0 && (
              <optgroup label="⚠ Occupied (will create exchange)">
                {availableWorkstations
                  .filter(ws => ws.employee && ws.employee.id !== employee.id)
                  .map(ws => (
                    <option key={ws.id} value={ws.id}>
                      {branches.find(b => b.id === ws.branch_id)?.branch_name} - {ws.position?.title || 'General'} • Occupied by {ws.employee.fullname}
                    </option>
                  ))
                }
              </optgroup>
            )}
          </select>

          {onOpenCreateWorkstation && (
            <button
              onClick={onOpenCreateWorkstation}
              type="button"
              className="px-3 py-2.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg border border-blue-300 hover:border-blue-400 transition-colors flex items-center gap-1.5 whitespace-nowrap"
              title="Create new workstation"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>

          {/* Employee mode restriction notice */}
          {transitionMode === 'employee' && (
            <div className="mt-2 text-xs text-blue-600 flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              <span>Employee mode: showing workstations in {branches.find(b => b.id === ws_branch_id)?.branch_name} only</span>
            </div>
          )}

          {/* Show info if occupied workstation is selected */}
          {(() => {
            const selectedWs = availableWorkstations.find(ws => ws.id === parseInt(selectedWorkstationId))
            const isOccupiedSelection = selectedWs?.employee && selectedWs.employee.id !== employee.id
            const isCrossBranch = selectedWs && selectedWs.branch_id !== ws_branch_id

            if (isOccupiedSelection) {
              return (
                <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700 flex items-start gap-1.5">
                  <span>⚠</span>
                  <span>This workstation is occupied by <strong>{selectedWs.employee.fullname}</strong>. An exchange will be created.</span>
                </div>
              )
            } else if (isCrossBranch) {
              return (
                <div className="mt-2 text-xs text-teal-600 font-medium">
                  ✓ Moving to {branches.find(b => b.id === selectedWs.branch_id)?.branch_name}
                </div>
              )
            }
            return null
          })()}
        </div>

        {/* Clear button */}
        {isModified && (
          <button
            onClick={onClear}
            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Clear changes"
          >
            <XCircle className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  )
}

export default DestinationStep
